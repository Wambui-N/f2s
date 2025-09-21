// @ts-nocheck
import { googleSheetsService } from "@/lib/googleSheets";
import { supabase } from "@/lib/supabase";
import type { FormField } from "@/types/form";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const { connectionId } = await request.json();

    if (!connectionId) {
      return NextResponse.json(
        { error: "Connection ID is required" },
        { status: 400 },
      );
    }

    // Get the sheet connection
    const { data: connection, error: connectionError } = await supabase
      .from("sheet_connections")
      .select("*")
      .eq("id", connectionId)
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: "Sheet connection not found" },
        { status: 404 },
      );
    }

    // Get all forms that use this sheet connection to gather headers
    const { data: forms, error: formsError } = await supabase
      .from("forms")
      .select("form_data")
      .eq("default_sheet_connection_id", connectionId);

    if (formsError) {
      return NextResponse.json(
        { error: "Failed to fetch forms" },
        { status: 500 },
      );
    }

    // Extract all unique field labels from forms
    const allHeaders = new Set<string>();
    forms?.forEach((form) => {
      if (form.form_data?.fields) {
        form.form_data.fields.forEach((field: FormField) => {
          if (
            field.label &&
            field.type !== "divider" &&
            field.type !== "header"
          ) {
            allHeaders.add(field.label);
          }
        });
      }
    });

    // Sync headers with the sheet
    const success = await googleSheetsService.syncHeaders(
      connection,
      Array.from(allHeaders),
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to sync headers with Google Sheet" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Headers synced successfully",
      headerCount: allHeaders.size,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Header sync error:", error);
    return NextResponse.json(
      { error: errorMessage || "Failed to sync headers" },
      { status: 500 }
    );
  }
}
