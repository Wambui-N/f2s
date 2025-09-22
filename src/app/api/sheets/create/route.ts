import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { googleSheetsService } from "@/lib/googleSheets";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the session from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the session using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sheetName, accessToken, refreshToken } = await request.json();

    if (!sheetName || !accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Sheet name, access token, and refresh token are required" },
        { status: 400 }
      );
    }

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

