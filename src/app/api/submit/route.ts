import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { GoogleSheetsService } from "@/lib/googleSheets";

export async function POST(request: NextRequest) {
  try {
    // 1. Get form submission data
    const { formId, data } = await request.json();

    if (!formId || !data) {
      return NextResponse.json(
        { error: "Form ID and submission data are required" },
        { status: 400 }
      );
    }

    // 2. Create admin client for database operations
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 3. Get form details and sheet connection
    const { data: form, error: formError } = await supabaseAdmin
      .from("forms")
      .select(`
        *,
        sheet_connections!forms_default_sheet_connection_id_fkey (
          id,
          sheet_id,
          sheet_url,
          access_token,
          refresh_token
        )
      `)
      .eq("id", formId)
      .single();

    if (formError || !form) {
      console.error("Failed to get form:", formError);
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    // 4. Store submission in database first
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from("submissions")
      .insert({
        form_id: formId,
        data: data,
        metadata: {
          user_agent: request.headers.get("user-agent"),
          ip_address: request.headers.get("x-forwarded-for") || request.ip,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Failed to store submission:", submissionError);
      return NextResponse.json(
        { error: "Failed to store submission" },
        { status: 500 }
      );
    }

    // 5. If form has a sheet connection, sync to Google Sheets
    const sheetConnection = form.sheet_connections;
    if (sheetConnection) {
      try {
        const googleSheetsService = new GoogleSheetsService(supabaseAdmin);
        
        // Get form fields to ensure correct order
        const fields = form.fields || [];
        const headers = ["Timestamp", ...fields.map((f: any) => f.label)];
        
        // Prepare row data in same order as headers
        const rowData = [
          new Date().toISOString(), // Timestamp
          ...fields.map((field: any) => {
            const value = data[field.id];
            if (Array.isArray(value)) {
              return value.join(", "); // Handle multi-select fields
            }
            return value?.toString() || "";
          })
        ];

        // Append to sheet
        const sheets = await googleSheetsService.getSheets(
          sheetConnection.access_token,
          sheetConnection.refresh_token
        );

        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetConnection.sheet_id,
          range: "Form Submissions!A:Z",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [rowData]
          }
        });

        // Mark submission as synced
        await supabaseAdmin
          .from("submissions")
          .update({ 
            synced_to_sheet: true,
            metadata: {
              ...submission.metadata,
              synced_at: new Date().toISOString()
            }
          })
          .eq("id", submission.id);

      } catch (syncError: any) {
        console.error("Failed to sync to sheet:", syncError);
        
        // Update submission with sync error
        await supabaseAdmin
          .from("submissions")
          .update({ 
            synced_to_sheet: false,
            sync_error: syncError.message,
            metadata: {
              ...submission.metadata,
              sync_error_at: new Date().toISOString(),
              sync_error_details: syncError.toString()
            }
          })
          .eq("id", submission.id);

        // Don't fail the submission just because sync failed
        // The data is safely stored in our database
      }
    }

    // 6. Return success with submission ID
    return NextResponse.json({ 
      success: true, 
      submissionId: submission.id,
      message: "Submission received" + (sheetConnection ? " and synced to sheet" : "")
    });

  } catch (error: any) {
    console.error("Error processing submission:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process submission",
        details: error.message 
      },
      { status: 500 }
    );
  }
}