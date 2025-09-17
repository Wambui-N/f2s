import { googleSheetsService } from "@/lib/googleSheets";
import { supabase } from "@/lib/supabase";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { sheetUrl, accessToken, refreshToken } = await request.json();

    // Get user from authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid authorization" },
        { status: 401 },
      );
    }

    // Connect to existing sheet
    const connection = await googleSheetsService.connectExistingSheet(
      user.id,
      sheetUrl,
      accessToken,
      refreshToken,
    );

    if (!connection) {
      return NextResponse.json(
        {
          error:
            "Failed to connect to Google Sheet. Please check the URL and permissions.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      connection,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Sheet connection error:", error);
    return NextResponse.json(
      { error: errorMessage || "Failed to connect sheet" },
      { status: 500 }
    );
  }
}
