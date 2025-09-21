// @ts-nocheck
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendSubmissionNotification } from '@/lib/email';
import { createCalendarEventFromSubmission } from '@/lib/googleCalendar';
import { processFileUploads } from '@/lib/googleDrive';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let formDataObj: Record<string, any>;
    let files: Array<{ fieldName: string; file: File }> = [];
    let formId: string;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const formDataStr = formData.get('formData') as string;
      if (!formDataStr) {
        return Response.json({ error: 'Form data is required' }, { status: 400 });
      }
      
      const parsedData = JSON.parse(formDataStr);
      formDataObj = parsedData.formData;
      formId = parsedData.formId;

      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          files.push({ fieldName: key, file: value });
        }
      }
    } else {
      const body = await request.json();
      formDataObj = body.formData;
      formId = body.formId;
    }

    if (!formId) {
      return Response.json({ error: 'formId is required' }, { status: 400 });
    }
    if (!formDataObj) {
      return Response.json({ error: 'Form data is required' }, { status: 400 });
    }

    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, title, status, user_id')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return Response.json({ error: 'Form not found' }, { status: 404 });
    }

    if (form.status !== 'published') {
      return Response.json({ error: 'Form is not published' }, { status: 400 });
    }

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
      return Response.json({ error: 'Failed to save submission' }, { status: 500 });
    }

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

    sendSubmissionNotification({
      formId: formId,
      submissionId: submission.id,
      submissionData: formDataObj,
      formTitle: form.title
    }).catch(error => {
      console.error('Email notification failed:', error);
    });

    createCalendarEventFromSubmission({
      formId: formId,
      submissionId: submission.id,
      submissionData: formDataObj,
      formTitle: form.title
    }).catch(error => {
      console.error('Calendar event creation failed:', error);
    });

    await supabase
      .from('form_submissions')
      .update({ processing_status: 'completed' })
      .eq('id', submission.id);

    return Response.json({
      success: true,
      submissionId: submission.id,
      message: 'Form submitted successfully'
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
