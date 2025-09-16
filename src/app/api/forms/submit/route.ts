import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GoogleAPIClient } from '@/lib/google';

export async function POST(request: NextRequest) {
  try {
    const { formId, formData, userSettings } = await request.json();

    if (!formId || !formData) {
      return NextResponse.json({ error: 'Form ID and data are required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get form configuration
    const { data: form } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Get form owner's Google tokens
    const { data: tokens } = await supabase
      .from('user_google_tokens')
      .select('*')
      .eq('user_id', form.user_id)
      .single();

    if (!tokens) {
      // If no Google integration, just store the submission
      const { error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formId,
          submission_data: formData,
          submitted_at: new Date().toISOString(),
        });

      if (submissionError) {
        throw submissionError;
      }

      return NextResponse.json({
        success: true,
        message: 'Form submitted successfully',
      });
    }

    const googleClient = new GoogleAPIClient({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(tokens.expires_at).getTime(),
    });

    // Write to Google Sheets if configured
    if (userSettings?.selectedSpreadsheet) {
      try {
        // Get form field mappings
        const formFields = form.form_data.fields;
        const headers = formFields.map((field: any) => field.label);
        const values = formFields.map((field: any) => formData[field.id] || '');

        await googleClient.writeToSheet(
          userSettings.selectedSpreadsheet,
          'Sheet1!A:Z',
          [values]
        );
      } catch (sheetError) {
        console.error('Error writing to sheet:', sheetError);
        // Continue with other operations even if sheet write fails
      }
    }

    // Handle file uploads to Google Drive if configured
    if (userSettings?.selectedFolder && formData.files) {
      try {
        for (const file of formData.files) {
          await googleClient.uploadFile(
            file.name,
            Buffer.from(file.data, 'base64'),
            file.type,
            userSettings.selectedFolder
          );
        }
      } catch (driveError) {
        console.error('Error uploading to Drive:', driveError);
        // Continue with other operations even if file upload fails
      }
    }

    // Create calendar event if configured and form has date fields
    if (userSettings?.selectedCalendar && formData.appointmentDate) {
      try {
        const eventStart = new Date(formData.appointmentDate);
        const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000); // 1 hour later

        await googleClient.createCalendarEvent(
          userSettings.selectedCalendar,
          {
            summary: `Form Submission: ${form.title}`,
            description: `New form submission received.\n\nDetails:\n${Object.entries(formData)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n')}`,
            start: {
              dateTime: eventStart.toISOString(),
              timeZone: 'UTC',
            },
            end: {
              dateTime: eventEnd.toISOString(),
              timeZone: 'UTC',
            },
            attendees: formData.email ? [{ email: formData.email }] : [],
          }
        );
      } catch (calendarError) {
        console.error('Error creating calendar event:', calendarError);
        // Continue with other operations even if calendar creation fails
      }
    }

    // Store submission in database
    const { error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        form_id: formId,
        submission_data: formData,
        submitted_at: new Date().toISOString(),
        google_sheet_written: !!userSettings?.selectedSpreadsheet,
        drive_files_uploaded: !!(userSettings?.selectedFolder && formData.files),
        calendar_event_created: !!(userSettings?.selectedCalendar && formData.appointmentDate),
      });

    if (submissionError) {
      throw submissionError;
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully and data synced to Google services',
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json(
      { error: 'Failed to process form submission' },
      { status: 500 }
    );
  }
}