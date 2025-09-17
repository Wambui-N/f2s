import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { googleSheetsService } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const { sheetName, accessToken, refreshToken } = await request.json();
    
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

    // Create new sheet
    const result = await googleSheetsService.createSheet(
      user.id,
      sheetName,
      accessToken,
      refreshToken
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create Google Sheet. Please check your permissions.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      connection: result,
    });

  } catch (error: any) {
    console.error('Sheet creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create sheet' },
      { status: 500 }
    );
  }
}
