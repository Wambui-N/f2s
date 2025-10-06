import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { GoogleSheetsService } from "@/lib/googleSheets";

export async function POST(request: NextRequest) {
  try {
    // 1. Get the authorization token from headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }

    // Create admin client
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify the token
    const token = authHeader.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Get form details from request
    const { 
      title,
      description = "",
      fields = [],
      googleTokens  // { accessToken, refreshToken }
    } = await request.json();

    if (!title || !googleTokens?.accessToken || !googleTokens?.refreshToken) {
      return NextResponse.json(
        { error: "Title and Google tokens are required" },
        { status: 400 }
      );
    }

    // 4. Create the form first
    const { data: form, error: formError } = await supabaseAdmin
      .from("forms")
      .insert({
        user_id: user.id,
        title,
        description,
        fields,
        status: "draft"
      })
      .select()
      .single();

    if (formError || !form) {
      console.error("Failed to create form:", formError);
      return NextResponse.json(
        { error: "Failed to create form" },
        { status: 500 }
      );
    }

    // 5. Create Google Sheet with headers from form fields
    const sheetName = `${title} - Submissions`;
    const headers = ["Timestamp", ...fields.map((f: any) => f.label)];
    
    const googleSheetsService = new GoogleSheetsService(supabaseAdmin);
    const connection = await googleSheetsService.createSheet(
      user.id,
      sheetName,
      googleTokens.accessToken,
      googleTokens.refreshToken,
      headers  // Pass headers to be set in the sheet
    );

    if (!connection) {
      // Cleanup: Delete the form since sheet creation failed
      await supabaseAdmin.from("forms").delete().eq("id", form.id);
      return NextResponse.json(
        { error: "Failed to create Google Sheet" },
        { status: 500 }
      );
    }

    // 6. Link the form to the sheet
    const { error: updateError } = await supabaseAdmin
      .from("forms")
      .update({ default_sheet_connection_id: connection.id })
      .eq("id", form.id);

    if (updateError) {
      console.error("Failed to link form to sheet:", updateError);
      // Don't return error - the link can be fixed later
    }

    // 7. Return success with form and sheet details
    return NextResponse.json({
      success: true,
      form,
      sheet: {
        id: connection.sheet_id,
        url: connection.sheet_url
      }
    });

  } catch (error) {
    console.error("Error in form creation:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
