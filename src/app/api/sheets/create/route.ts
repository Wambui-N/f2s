import { NextRequest, NextResponse } from "next/server";
import {
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { GoogleSheetsService } from "@/lib/googleSheets";

export async function POST(request: NextRequest) {
  try {
    // Get and verify the user using the correct cookie handling
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    // 2. Create a Supabase admin client to bypass RLS
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      throw new Error("Missing Supabase URL or service role key");
    }
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const { sheetName, accessToken, refreshToken } = await request.json();

    if (!sheetName || !accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Sheet name, access token, and refresh token are required" },
        { status: 400 },
      );
    }

    // 3. Pass the admin client to the Google Sheets service
    const googleSheetsService = new GoogleSheetsService(supabaseAdmin);

    // Create the Google Sheet
    console.log("Creating Google Sheet with:", {
      userId: user.id,
      sheetName,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });

    const connection = await googleSheetsService.createSheet(
      user.id,
      sheetName,
      accessToken,
      refreshToken
    );

    console.log("Google Sheet creation result:", connection);

    if (!connection) {
      console.error("Google Sheets service returned null - check the service logs above for details");
      return NextResponse.json(
        { success: false, error: "Failed to create Google Sheet - check your Google Sheets permissions and try reconnecting your account" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sheetId: connection.sheet_id,
      sheetUrl: connection.sheet_url,
      connection,
    });
  } catch (error) {
    console.error("Error creating sheet:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

