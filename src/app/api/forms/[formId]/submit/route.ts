import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendSubmissionNotification } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const { formId } = params;
    const body = await request.json();
    const { formData } = body;

    if (!formData) {
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
        submission_data: formData,
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

    // Send email notification (non-blocking)
    sendSubmissionNotification({
      formId: formId,
      submissionId: submission.id,
      submissionData: formData,
      formTitle: form.title
    }).catch(error => {
      console.error('Email notification failed:', error);
      // Update submission processing status to indicate email failure
      supabase
        .from('form_submissions')
        .update({ 
          processing_status: 'completed',
          error_message: 'Email notification failed'
        })
        .eq('id', submission.id)
        .then(() => {});
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