import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendSubmissionNotification } from '@/lib/email';
import { createCalendarEventFromSubmission } from '@/lib/googleCalendar';
import { processFileUploads } from '@/lib/googleDrive';

export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const { formId } = params;
    const contentType = request.headers.get('content-type') || '';
    
    let formDataObj: Record<string, any>;
    let files: Array<{ fieldName: string; file: File }> = [];

    // Handle both JSON and FormData submissions
    if (contentType.includes('multipart/form-data')) {
      // Handle file uploads
      const formData = await request.formData();
      
      // Extract regular form fields
      const formDataStr = formData.get('formData') as string;
      if (!formDataStr) {
        return NextResponse.json(
          { error: 'Form data is required' },
          { status: 400 }
        );
      }
      
      formDataObj = JSON.parse(formDataStr);
      
      // Extract files
      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          files.push({
            fieldName: key,
            file: value
          });
        }
      }
    } else {
      // Handle regular JSON submission
      const body = await request.json();
      formDataObj = body.formData;
    }

    if (!formDataObj) {
      return NextResponse.json(
        { error: 'Form data is required' },
        { status: 400 }
      );
    }

    // Verify form exists and is published
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, title, status, user_id')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    if (form.status !== 'published') {
      return NextResponse.json(
        { error: 'Form is not published' },
        { status: 400 }
      );
    }

    // Insert form submission
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        form_id: formId,
        submission_data: formDataObj,
        processing_status: 'pending'
      })
      .select('id')
      .single();

    if (submissionError || !submission) {
      console.error('Error creating submission:', submissionError);
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    // Process file uploads (non-blocking)
    if (files.length > 0) {
      processFileUploads({
        formId: formId,
        submissionId: submission.id,
        submissionData: formDataObj,
        formTitle: form.title,
        files
      }).catch(error => {
        console.error('File upload processing failed:', error);
      });
    }

    // Send email notification (non-blocking)
    sendSubmissionNotification({
      formId: formId,
      submissionId: submission.id,
      submissionData: formDataObj,
      formTitle: form.title
    }).catch(error => {
      console.error('Email notification failed:', error);
    });

    // Create calendar event (non-blocking)
    createCalendarEventFromSubmission({
      formId: formId,
      submissionId: submission.id,
      submissionData: formDataObj,
      formTitle: form.title
    }).catch(error => {
      console.error('Calendar event creation failed:', error);
    });

    // Update processing status to completed
    await supabase
      .from('form_submissions')
      .update({ processing_status: 'completed' })
      .eq('id', submission.id);

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Form submitted successfully'
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}