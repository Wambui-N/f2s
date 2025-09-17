import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { googleSheetsService } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const { sheetUrl, accessToken, refreshToken } = await request.json();
    
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid authorization' }, { status: 401 });
    }

    // Connect to existing sheet
    const connection = await googleSheetsService.connectExistingSheet(
      user.id,
      sheetUrl,
      accessToken,
      refreshToken
    );

    if (!connection) {
      return NextResponse.json(
        { error: 'Failed to connect to Google Sheet. Please check the URL and permissions.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      connection,
    });

  } catch (error: any) {
    console.error('Sheet connection error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect sheet' },
      { status: 500 }
    );
  }
}
