import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { googleSheetsService } from '@/lib/googleSheets';

interface SubmissionRequest {
  formData: Record<string, any>;
  fieldMappings?: Record<string, string>;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): Promise<number> {
  // Exponential backoff with jitter
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 0.1 * exponentialDelay;
  return exponentialDelay + jitter;
}

async function writeToSheetWithRetry(
  sheetConnection: any,
  submissionData: Record<string, any>,
  fieldMappings: Record<string, string>,
  submissionId: string
): Promise<{ success: boolean; rowNumber?: number; error?: string }> {
  
  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const result = await googleSheetsService.writeSubmission(
        sheetConnection,
        submissionData,
        fieldMappings
      );

      if (result.success) {
        // Update submission record as synced
        await supabase
          .from('form_submissions')
          .update({
            synced_to_sheet: true,
            sheet_row_number: result.rowNumber,
            sync_error: null,
          })
          .eq('id', submissionId);

        return result;
      }

      // If not retryable, break the loop
      if (!result.retryable) {
        await supabase
          .from('form_submissions')
          .update({
            sync_error: result.error,
            retry_count: attempt + 1,
            last_retry_at: new Date().toISOString(),
          })
          .eq('id', submissionId);

        return result;
      }

      // Wait before retry (except on last attempt)
      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        const delay = await calculateDelay(attempt, RETRY_CONFIG.baseDelay, RETRY_CONFIG.maxDelay);
        await sleep(delay);
      }

    } catch (error: any) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      // Update retry count
      await supabase
        .from('form_submissions')
        .update({
          sync_error: error.message,
          retry_count: attempt + 1,
          last_retry_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      // If this is the last attempt, return failure
      if (attempt === RETRY_CONFIG.maxRetries - 1) {
        return {
          success: false,
          error: `Failed after ${RETRY_CONFIG.maxRetries} attempts: ${error.message}`,
        };
      }

      // Wait before retry
      const delay = await calculateDelay(attempt, RETRY_CONFIG.baseDelay, RETRY_CONFIG.maxDelay);
      await sleep(delay);
    }
  }

  return {
    success: false,
    error: 'Max retries exceeded',
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const { formId } = params;
    const body: SubmissionRequest = await request.json();
    const { formData, fieldMappings = {} } = body;

    // Get form details and verify it exists
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select(`
        *,
        default_sheet_connection_id,
        sheet_connections!forms_default_sheet_connection_id_fkey (*)
      `)
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Create submission record first
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        form_id: formId,
        user_id: form.user_id,
        submission_data: formData,
        sheet_connection_id: form.default_sheet_connection_id,
      })
      .select()
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    // If no sheet connection, return success but note that it's not synced
    if (!form.default_sheet_connection_id) {
      return NextResponse.json({
        success: true,
        message: 'Submission saved successfully. No Google Sheet connected.',
        submissionId: submission.id,
        synced: false,
      });
    }

    // Get sheet connection details
    const { data: sheetConnection, error: connectionError } = await supabase
      .from('sheet_connections')
      .select('*')
      .eq('id', form.default_sheet_connection_id)
      .eq('is_active', true)
      .single();

    if (connectionError || !sheetConnection) {
      await supabase
        .from('form_submissions')
        .update({
          sync_error: 'Sheet connection not found or inactive',
        })
        .eq('id', submission.id);

      return NextResponse.json({
        success: true,
        message: 'Submission saved but could not sync to Google Sheets. Sheet connection not found.',
        submissionId: submission.id,
        synced: false,
        error: 'Sheet connection not found',
      });
    }

    // Sync headers first (ensure sheet has all necessary columns)
    const formFieldHeaders = Object.values(fieldMappings);
    if (formFieldHeaders.length > 0) {
      await googleSheetsService.syncHeaders(sheetConnection, formFieldHeaders);
    }

    // Write to Google Sheets with retry logic
    const writeResult = await writeToSheetWithRetry(
      sheetConnection,
      formData,
      fieldMappings,
      submission.id
    );

    if (writeResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Submission saved and synced to Google Sheets successfully!',
        submissionId: submission.id,
        rowNumber: writeResult.rowNumber,
        synced: true,
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Submission saved but failed to sync to Google Sheets.',
        submissionId: submission.id,
        synced: false,
        error: writeResult.error,
      }, { status: 207 }); // 207 Multi-Status (partial success)
    }

  } catch (error: any) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve form submissions
export async function GET(
  request: NextRequest,
  context: { params: { formId: string } }
) {
  try {
    const { formId } = context.params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify form exists and user has access
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('user_id')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Get submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('form_submissions')
      .select(`
        *,
        sheet_connections (sheet_name, sheet_url)
      `)
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (submissionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('form_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId);

    return NextResponse.json({
      submissions: submissions || [],
      total: count || 0,
      limit,
      offset,
    });

  } catch (error: any) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
