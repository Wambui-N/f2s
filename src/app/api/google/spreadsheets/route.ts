import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GoogleAPIClient } from '@/lib/google';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Google tokens
    const { data: tokens } = await supabase
      .from('user_google_tokens')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!tokens) {
      return NextResponse.json({ error: 'Google account not connected' }, { status: 400 });
    }

    const googleClient = new GoogleAPIClient({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(tokens.expires_at).getTime(),
    });

    const spreadsheets = await googleClient.listSpreadsheets();

    return NextResponse.json({
      success: true,
      spreadsheets: spreadsheets.map(sheet => ({
        id: sheet.id,
        name: sheet.name,
        createdTime: sheet.createdTime,
        modifiedTime: sheet.modifiedTime,
      })),
    });
  } catch (error) {
    console.error('Error fetching spreadsheets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spreadsheets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get user's Google tokens
    const { data: tokens } = await supabase
      .from('user_google_tokens')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!tokens) {
      return NextResponse.json({ error: 'Google account not connected' }, { status: 400 });
    }

    const googleClient = new GoogleAPIClient({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(tokens.expires_at).getTime(),
    });

    const spreadsheet = await googleClient.createSpreadsheet(name);

    return NextResponse.json({
      success: true,
      spreadsheet,
    });
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    return NextResponse.json(
      { error: 'Failed to create spreadsheet' },
      { status: 500 }
    );
  }
}