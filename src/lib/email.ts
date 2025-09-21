import { supabase } from './supabase';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailParams {
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

export interface NotificationData {
  formId: string;
  submissionId: string;
  submissionData: Record<string, any>;
  formTitle: string;
}

/**
 * Send email using Resend API
 * You'll need to set up a Resend account and add the API key to your environment
 */
export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
  // TEMPORARY: Use mock for testing - remove this block when ready for production
  if (process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY) {
    console.log('📧 MOCK EMAIL (no RESEND_API_KEY found):');
    console.log('To:', params.to);
    console.log('Subject:', params.subject);
    console.log('HTML Preview:', params.html.substring(0, 200) + '...');
    return { success: true, messageId: `mock_${Date.now()}` };
  }
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'FormToSheets <notifications@formtosheets.com>',
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text || params.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Email sending failed:', result);
      return { success: false, error: result.message || 'Email sending failed' };
    }

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Email sending failed' };
  }
}

/**
 * Generate email template from form submission
 */
export function generateSubmissionEmailTemplate(
  formTitle: string,
  submissionData: Record<string, any>,
  customTemplate?: string,
  includeSubmissionData: boolean = true
): EmailTemplate {
  const defaultTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">New Form Submission</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">{{form_title}}</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          You have received a new submission from your form "<strong>{{form_title}}</strong>".
        </p>
        
        ${includeSubmissionData ? `
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
          <h3 style="margin-top: 0; color: #333;">Submission Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            {{submission_table}}
          </table>
        </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            This email was sent automatically by FormToSheets
          </p>
        </div>
      </div>
    </div>
  `;

  let template = customTemplate || defaultTemplate;
  
  // Replace form title
  template = template.replace(/\{\{form_title\}\}/g, formTitle);
  
  // Replace submission data variables
  Object.entries(submissionData).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    const stringValue = Array.isArray(value) ? value.join(', ') : String(value || '');
    template = template.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), stringValue);
  });

  // Generate submission table if needed
  if (includeSubmissionData && template.includes('{{submission_table}}')) {
    const submissionTable = Object.entries(submissionData)
      .map(([key, value]) => {
        const displayValue = Array.isArray(value) ? value.join(', ') : String(value || '');
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #555; width: 30%;">
              ${key.charAt(0).toUpperCase() + key.slice(1)}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e9ecef; color: #333;">
              ${displayValue}
            </td>
          </tr>
        `;
      })
      .join('');
    
    template = template.replace('{{submission_table}}', submissionTable);
  }

  // Generate plain text version
  const textVersion = template
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return {
    subject: `New submission from ${formTitle}`,
    html: template,
    text: textVersion
  };
}

/**
 * Send notification email for form submission
 */
export async function sendSubmissionNotification(data: NotificationData): Promise<{ success: boolean; error?: string }> {
  try {
    // Get form email settings
    const { data: emailSettings, error: settingsError } = await supabase
      .rpc('get_form_email_settings', { p_form_id: data.formId });

    if (settingsError || !emailSettings || emailSettings.length === 0) {
      console.error('Failed to get email settings:', settingsError);
      return { success: false, error: 'Email settings not found' };
    }

    const settings = emailSettings[0];

    // Check if notifications are enabled
    if (!settings.is_enabled) {
      return { success: true }; // Not an error, just disabled
    }

    // Generate email template
    const emailTemplate = generateSubmissionEmailTemplate(
      settings.form_title,
      data.submissionData,
      settings.email_template,
      settings.include_submission_data
    );

    // Interpolate subject template
    let subject = settings.subject_template;
    subject = subject.replace(/\{\{form_title\}\}/g, settings.form_title);
    Object.entries(data.submissionData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const stringValue = Array.isArray(value) ? value.join(', ') : String(value || '');
      subject = subject.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), stringValue);
    });

    // Send email
    const emailResult = await sendEmail({
      to: settings.recipient_emails,
      subject: subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    // Log the email attempt
    const logData = {
      form_id: data.formId,
      submission_id: data.submissionId,
      recipient_emails: settings.recipient_emails,
      subject: subject,
      email_content: emailTemplate.html,
      status: emailResult.success ? 'sent' : 'failed',
      error_message: emailResult.error || null,
      sent_at: emailResult.success ? new Date().toISOString() : null
    };

    await supabase.from('email_notifications_log').insert(logData);

    return emailResult;
  } catch (error) {
    console.error('Notification sending error:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(formId: string): Promise<{ success: boolean; error?: string }> {
  const testData: NotificationData = {
    formId,
    submissionId: 'test-submission',
    submissionData: {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test submission to verify email notifications are working correctly.'
    },
    formTitle: 'Test Form'
  };

  return sendSubmissionNotification(testData);
}
