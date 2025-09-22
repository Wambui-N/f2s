import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { google } from "googleapis";

export async function POST(request: NextRequest) {
  try {
    console.log("=== TESTING GOOGLE AUTH ===");
    
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the session from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Google tokens from database
    console.log("Looking for tokens for user:", user.id);
    
    // First, let's see what's in the table
    const { data: allUserTokens, error: allTokensError } = await supabase
      .from("user_google_tokens")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    console.log("All tokens for user:", {
      count: allUserTokens?.length || 0,
      error: allTokensError?.message,
      tokens: allUserTokens
    });

    if (allTokensError) {
      return NextResponse.json({ 
        error: "Database query failed", 
        details: allTokensError.message 
      }, { status: 400 });
    }

    if (!allUserTokens || allUserTokens.length === 0) {
      return NextResponse.json({ 
        error: "No Google tokens found for this user",
        userId: user.id
      }, { status: 400 });
    }

    // Get the most recent token
    const tokens = allUserTokens[0];

    console.log("Using most recent token:", {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresAt: tokens.expires_at,
      createdAt: tokens.created_at
    });

    console.log("Found tokens:", {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresAt: tokens.expires_at,
      isExpired: tokens.expires_at ? new Date(tokens.expires_at) < new Date() : 'unknown'
    });

    // Test environment variables
    console.log("Environment variables:", {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
      clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0
    });

    // Test Google API authentication
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`
    );

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expires_at ? new Date(tokens.expires_at).getTime() : undefined,
    });

    console.log("OAuth2 client created");

    // Test token refresh if needed
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      console.log("Token refresh successful");
      oauth2Client.setCredentials(credentials);
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
      return NextResponse.json({ 
        error: "Token refresh failed - please reconnect your Google account",
        details: refreshError.message 
      }, { status: 400 });
    }

    // Test Google Sheets API
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    console.log("Sheets API client created");

    // Try to list spreadsheets to test permissions
    const response = await sheets.spreadsheets.list({
      pageSize: 1
    });

    console.log("Google Sheets API test successful:", {
      hasSpreadsheets: !!response.data.spreadsheets,
      count: response.data.spreadsheets?.length || 0
    });

    return NextResponse.json({
      success: true,
      message: "Google authentication and API access working correctly",
      tokenInfo: {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        isExpired: tokens.expires_at ? new Date(tokens.expires_at) < new Date() : 'unknown'
      },
      envInfo: {
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET
      }
    });

  } catch (error) {
    console.error("Google auth test error:", error);
    return NextResponse.json({
      error: "Google authentication test failed",
      details: error.message,
      type: error.constructor.name
    }, { status: 500 });
  }
}
