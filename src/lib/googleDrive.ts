import { supabase } from './supabase';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  webViewLink?: string;
  webContentLink?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  path: string;
}

export interface FileUploadData {
  formId: string;
  submissionId: string;
  submissionData: Record<string, any>;
  formTitle: string;
  files: Array<{
    fieldName: string;
    file: File;
  }>;
}

/**
 * Create folder in Google Drive
 */
export async function createDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<{ success: boolean; folderId?: string; error?: string }> {
  try {
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Drive folder creation failed:', result);
      return { 
        success: false, 
        error: result.error?.message || `HTTP ${response.status}: ${response.statusText}` 
      };
    }

    return { 
      success: true, 
      folderId: result.id 
    };
  } catch (error) {
    console.error('Drive folder creation error:', error);
    return { 
      success: false, 
      error: 'Failed to create Drive folder' 
    };
  }
}

/**
 * Upload file to Google Drive
 */
export async function uploadFileToDrive(
  accessToken: string,
  file: File,
  fileName: string,
  folderId?: string
): Promise<{ success: boolean; fileId?: string; webViewLink?: string; error?: string }> {
  try {
    // Create file metadata
    const metadata = {
      name: fileName,
      parents: folderId ? [folderId] : undefined,
    };

    // Create form data for multipart upload
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Drive file upload failed:', result);
      return { 
        success: false, 
        error: result.error?.message || `HTTP ${response.status}: ${response.statusText}` 
      };
    }

    return { 
      success: true, 
      fileId: result.id,
      webViewLink: result.webViewLink
    };
  } catch (error) {
    console.error('Drive file upload error:', error);
    return { 
      success: false, 
      error: 'Failed to upload file to Drive' 
    };
  }
}

/**
 * Get or create folder structure
 */
export async function getOrCreateFolderStructure(
  accessToken: string,
  folderPath: string,
  baseFolderId?: string
): Promise<{ success: boolean; folderId?: string; error?: string }> {
  try {
    const pathParts = folderPath.split('/').filter(part => part.trim() !== '');
    let currentFolderId = baseFolderId;

    for (const folderName of pathParts) {
      // Check if folder exists
      const searchQuery = currentFolderId 
        ? `name='${folderName}' and '${currentFolderId}' in parents and mimeType='application/vnd.google-apps.folder'`
        : `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`;

      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const searchResult = await searchResponse.json();

      if (searchResult.files && searchResult.files.length > 0) {
        // Folder exists, use it
        currentFolderId = searchResult.files[0].id;
      } else {
        // Create new folder
        const createResult = await createDriveFolder(accessToken, folderName, currentFolderId);
        if (!createResult.success) {
          return createResult;
        }
        currentFolderId = createResult.folderId;
      }
    }

    return { success: true, folderId: currentFolderId };
  } catch (error) {
    console.error('Error creating folder structure:', error);
    return { success: false, error: 'Failed to create folder structure' };
  }
}

/**
 * Set file permissions in Google Drive
 */
export async function setFilePermissions(
  accessToken: string,
  fileId: string,
  permissions: 'private' | 'anyone_with_link' | 'public',
  userEmail?: string,
  userRole: 'reader' | 'writer' | 'commenter' = 'reader'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (permissions === 'anyone_with_link') {
      // Make file accessible to anyone with link
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error?.message || 'Failed to set permissions' };
      }
    }

    // Add specific user permission if provided
    if (userEmail) {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: userRole,
          type: 'user',
          emailAddress: userEmail,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to add user permission:', error);
        // Don't fail the entire operation for this
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error setting file permissions:', error);
    return { success: false, error: 'Failed to set file permissions' };
  }
}

/**
 * Process file uploads from form submission
 */
export async function processFileUploads(data: FileUploadData): Promise<{ success: boolean; uploadedFiles?: any[]; error?: string }> {
  try {
    // Get file handling settings
    const { data: fileSettings, error: settingsError } = await supabase
      .rpc('get_form_file_settings', { p_form_id: data.formId });

    if (settingsError || !fileSettings || fileSettings.length === 0) {
      console.error('Failed to get file settings:', settingsError);
      return { success: false, error: 'File settings not found' };
    }

    const settings = fileSettings[0];

    // Check if file handling is enabled
    if (!settings.is_enabled) {
      return { success: true, uploadedFiles: [] }; // Not an error, just disabled
    }

    // Get Google access token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.provider_token) {
      return { success: false, error: 'Google access token not available' };
    }

    const uploadedFiles = [];

    // Process each file
    for (const fileData of data.files) {
      try {
        // Log file upload start
        const { data: fileLog, error: logError } = await supabase
          .from('uploaded_files_log')
          .insert({
            form_id: data.formId,
            submission_id: data.submissionId,
            original_filename: fileData.file.name,
            original_size_bytes: fileData.file.size,
            mime_type: fileData.file.type,
            field_name: fileData.fieldName,
            status: 'uploading',
            upload_started_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (logError) {
          console.error('Failed to log file upload:', logError);
          continue;
        }

        // Generate folder path
        const folderPath = await supabase
          .rpc('generate_folder_path', {
            template: settings.folder_structure_template,
            form_title: settings.form_title,
            submission_data: data.submissionData,
            organize_by_date: settings.organize_by_date,
            date_format: settings.date_format
          });

        // Create or get folder
        let targetFolderId = settings.base_folder_id;
        if (settings.create_subfolders && folderPath.data) {
          const folderResult = await getOrCreateFolderStructure(
            session.provider_token,
            folderPath.data,
            settings.base_folder_id
          );
          
          if (folderResult.success) {
            targetFolderId = folderResult.folderId;
          }
        }

        // Generate filename
        const fileName = await supabase
          .rpc('generate_filename', {
            template: settings.file_naming_template,
            original_filename: fileData.file.name,
            form_title: settings.form_title,
            submission_data: data.submissionData
          });

        // Upload file
        const uploadResult = await uploadFileToDrive(
          session.provider_token,
          fileData.file,
          fileName.data || fileData.file.name,
          targetFolderId
        );

        if (uploadResult.success && uploadResult.fileId) {
          // Set file permissions
          const submitterEmail = settings.share_with_submitter 
            ? data.submissionData.email || data.submissionData.email_address
            : undefined;

          await setFilePermissions(
            session.provider_token,
            uploadResult.fileId,
            settings.file_permissions,
            submitterEmail,
            settings.submitter_permission
          );

          // Update file log with success
          await supabase
            .from('uploaded_files_log')
            .update({
              google_drive_file_id: uploadResult.fileId,
              google_drive_folder_id: targetFolderId,
              drive_file_name: fileName.data || fileData.file.name,
              drive_folder_path: folderPath.data || '/',
              drive_file_url: uploadResult.webViewLink,
              status: 'uploaded',
              upload_completed_at: new Date().toISOString()
            })
            .eq('id', fileLog.id);

          uploadedFiles.push({
            fieldName: fileData.fieldName,
            originalName: fileData.file.name,
            driveFileId: uploadResult.fileId,
            driveUrl: uploadResult.webViewLink,
            folderPath: folderPath.data
          });
        } else {
          // Update file log with error
          await supabase
            .from('uploaded_files_log')
            .update({
              status: 'failed',
              error_message: uploadResult.error
            })
            .eq('id', fileLog.id);
        }
      } catch (fileError) {
        console.error('Error processing file:', fileData.file.name, fileError);
      }
    }

    return { success: true, uploadedFiles };
  } catch (error) {
    console.error('File upload processing error:', error);
    return { success: false, error: 'Failed to process file uploads' };
  }
}

/**
 * Get user's Google Drive folders
 */
export async function getUserDriveFolders(): Promise<{ success: boolean; folders?: DriveFolder[]; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.provider_token) {
      return { success: false, error: 'Google access token not available' };
    }

    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.folder"&fields=files(id,name,parents)',
      {
        headers: {
          'Authorization': `Bearer ${session.provider_token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: result.error?.message || 'Failed to fetch folders' 
      };
    }

    const folders: DriveFolder[] = result.files?.map((folder: any) => ({
      id: folder.id,
      name: folder.name,
      path: folder.name // Simplified path for now
    })) || [];

    return { 
      success: true, 
      folders 
    };
  } catch (error) {
    console.error('Error fetching Drive folders:', error);
    return { 
      success: false, 
      error: 'Failed to fetch Drive folders' 
    };
  }
}

/**
 * Test file upload configuration
 */
export async function testFileUploadConfiguration(formId: string): Promise<{ success: boolean; error?: string }> {
  // Create a small test file
  const testFileContent = 'This is a test file created by FormToSheets to verify Google Drive integration.';
  const testFile = new File([testFileContent], 'test-file.txt', { type: 'text/plain' });

  const testData: FileUploadData = {
    formId,
    submissionId: 'test-submission',
    submissionData: {
      name: 'Test Client',
      email: 'test@example.com',
      company: 'Test Company'
    },
    formTitle: 'Test Form',
    files: [{
      fieldName: 'test_file',
      file: testFile
    }]
  };

  return processFileUploads(testData);
}

















