// Mock email service for testing without external dependencies
import { SendEmailParams } from './email';

export async function sendEmailMock(params: SendEmailParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
  // Log the email that would be sent
  console.log('📧 MOCK EMAIL SENT:');
  console.log('To:', params.to);
  console.log('Subject:', params.subject);
  console.log('HTML:', params.html);
  console.log('Text:', params.text);
  console.log('---');
  
  // Simulate success (you can change this to test error handling)
  return { 
    success: true, 
    messageId: `mock_${Date.now()}` 
  };
}

// Replace the real sendEmail function with this mock for testing
// Just import this in email.ts and use sendEmailMock instead of sendEmail

