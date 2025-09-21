import { NextRequest, NextResponse } from 'next/server';
import { processFileUploads } from '@/lib/googleDrive';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const formId = formData.get('formId') as string;
    const submissionId = formData.get('submissionId') as string;
    const submissionDataStr = formData.get('submissionData') as string;
    const formTitle = formData.get('formTitle') as string;

    if (!formId || !submissionId || !submissionDataStr || !formTitle) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let submissionData: Record<string, any>;
    try {
      submissionData = JSON.parse(submissionDataStr);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid submission data format' },
        { status: 400 }
      );
    }

    // Extract files from form data
    const files: Array<{ fieldName: string; file: File }> = [];
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        files.push({
          fieldName: key,
          file: value
        });
      }
    }

    if (files.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No files to upload',
        uploadedFiles: []
      });
    }

    // Process file uploads
    const result = await processFileUploads({
      formId,
      submissionId,
      submissionData,
      formTitle,
      files
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        uploadedFiles: result.uploadedFiles || [],
        message: `Successfully uploaded ${files.length} file(s)`
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'File upload failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('File upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}