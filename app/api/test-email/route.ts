import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, message } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields: to, subject, message' 
      }, { status: 400 });
    }

    const emailData = {
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email from NITS PS1</h2>
          <p>${message}</p>
          <p>This is a test email to verify the email service is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    };

    const success = await emailService.sendEmail(emailData);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully!' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send test email' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in test email endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}