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

    const calendars = await googleClient.listCalendars();

    return NextResponse.json({
      success: true,
      calendars: calendars.map(calendar => ({
        id: calendar.id,
        name: calendar.summary,
        description: calendar.description,
        primary: calendar.primary,
      })),
    });
  } catch (error) {
    console.error('Error fetching calendars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendars' },
      { status: 500 }
    );
  }
}