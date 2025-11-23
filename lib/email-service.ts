import nodemailer from 'nodemailer';
import { pdfGenerator } from './pdf-generator';

interface EmailConfig {
  service?: string;
  host?: string;
  port?: number;
  user: string;
  pass: string;
  secure?: boolean;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(config: EmailConfig) {
    // Configure transporter based on service or custom SMTP
    if (config.service) {
      // Use predefined service (gmail, yahoo, hotmail, etc.)
      this.transporter = nodemailer.createTransport({
        service: config.service,
        auth: {
          user: config.user,
          pass: config.pass
        },
        // Gmail-specific optimizations
        ...(config.service === 'gmail' && {
          pool: true, // Use connection pooling
          maxConnections: 5,
          maxMessages: 100,
          rateDelta: 1000,
          rateLimit: 5
        })
      });
    } else {
      // Use custom SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port || 587,
        secure: config.secure || false, // true for 465, false for other ports
        auth: {
          user: config.user,
          pass: config.pass
        }
      });
    }

    // Verify connection configuration on startup
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      console.log('💡 Check your email credentials in .env file');
    }
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'NITS PS1 <noreply@nitsps1.com>',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        attachments: emailData.attachments
      });
      
      console.log(`✅ Email sent successfully to ${emailData.to}`);
      return true;
    } catch (error: any) {
      console.error('❌ Error sending email:', error);
      
      // Provide specific error messages for common Gmail issues
      if (error.code === 'EAUTH') {
        console.log('💡 Gmail Authentication Failed:');
        console.log('   1. Make sure 2-Factor Authentication is enabled on your Gmail account');
        console.log('   2. Generate an App Password at: https://myaccount.google.com/apppasswords');
        console.log('   3. Use the 16-character App Password in your .env file');
        console.log('   4. Make sure EMAIL_USER matches your Gmail address exactly');
      } else if (error.code === 'ECONNECTION') {
        console.log('💡 Connection Failed: Check your internet connection');
      } else if (error.code === 'EMESSAGE') {
        console.log('💡 Message Error: Check email format and content');
      }
      
      return false;
    }
  }

  async sendReportEmail(user: any, reportData: any): Promise<boolean> {
    try {
      // Generate PDF report
      const pdfBuffer = await pdfGenerator.generateUserReport(reportData);
      
      // Create email HTML content
      const emailHtml = this.generateReportEmailHtml(user, reportData.analytics);
      
      // Send email with PDF attachment
      const emailData: EmailData = {
        to: user.email,
        subject: `Your NITS PS1 Progress Report - ${new Date().toLocaleDateString()}`,
        html: emailHtml,
        attachments: [
          {
            filename: `NITS-PS1-Report-${new Date().toISOString().split('T')[0]}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };
      
      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending report email:', error);
      return false;
    }
  }

  private generateReportEmailHtml(user: any, analytics: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Your NITS PS1 Report</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 30px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 20px 0;
            }
            .stat-card {
              background: #f8f9ff;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #667eea;
              text-align: center;
            }
            .stat-number {
              font-size: 24px;
              font-weight: bold;
              color: #667eea;
              margin: 0;
            }
            .stat-label {
              color: #666;
              font-size: 14px;
              margin: 5px 0 0 0;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 25px;
              margin: 20px 0;
              font-weight: bold;
              transition: transform 0.2s;
            }
            .cta-button:hover {
              transform: translateY(-2px);
            }
            .footer {
              background: #f8f9ff;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .attachment-notice {
              background: #e8f5e8;
              border: 1px solid #4caf50;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }
            .attachment-icon {
              color: #4caf50;
              font-size: 18px;
              margin-right: 10px;
            }
            @media (max-width: 600px) {
              .stats-grid {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧠 Your Progress Report</h1>
              <p>Hello ${user.name}, here's your latest productivity insights!</p>
            </div>
            
            <div class="content">
              <div class="attachment-notice">
                <span class="attachment-icon">📎</span>
                <strong>Your detailed PDF report is attached to this email!</strong>
              </div>
              
              <h2>Quick Overview</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${analytics.totalSessions}</div>
                  <div class="stat-label">Total Sessions</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${Math.round(analytics.totalFocusTime / 3600)}</div>
                  <div class="stat-label">Hours Focused</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${analytics.productivityScore}</div>
                  <div class="stat-label">Productivity Score</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${analytics.streakDays}</div>
                  <div class="stat-label">Day Streak</div>
                </div>
              </div>
              
              <h3>🎯 Key Achievements</h3>
              <ul>
                <li><strong>Focus Sessions:</strong> ${analytics.focusSessionsCount} completed</li>
                <li><strong>Code Sessions:</strong> ${analytics.codeSessionsCount} coding sessions</li>
                <li><strong>Whiteboard Sessions:</strong> ${analytics.whiteboardSessionsCount} planning sessions</li>
                <li><strong>Wellness Score:</strong> ${analytics.wellnessScore}/100</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" class="cta-button">
                  View Full Dashboard →
                </a>
              </div>
              
              <h3>💡 Pro Tip</h3>
              <p>Your detailed PDF report contains personalized recommendations based on your activity patterns. Check it out for insights on how to optimize your productivity!</p>
            </div>
            
            <div class="footer">
              <p>Keep up the great work! 🚀</p>
              <p>Generated on ${new Date().toLocaleDateString()} by NITS PS1</p>
              <p style="font-size: 12px; margin-top: 15px;">
                To manage your email preferences, 
                <a href="${process.env.NEXTAUTH_URL}/settings">visit your settings</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendWeeklyReport(user: any, reportData: any): Promise<boolean> {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Weekly Progress Report</title>
          <style>
            /* Same styles as above */
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Weekly Progress Report</h1>
              <p>Your productivity summary for this week</p>
            </div>
            <div class="content">
              <h2>This Week's Highlights</h2>
              <p>Hi ${user.name}! Here's how your week went:</p>
              
              <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">📈 Progress Summary</h3>
                <ul>
                  <li>Sessions completed: ${reportData.analytics.totalSessions}</li>
                  <li>Total focus time: ${Math.round(reportData.analytics.totalFocusTime / 3600)} hours</li>
                  <li>Productivity score: ${reportData.analytics.productivityScore}/100</li>
                </ul>
              </div>
              
              <p style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" 
                   style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px;">
                  View Detailed Report
                </a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: `Weekly Progress Report - Week of ${new Date().toLocaleDateString()}`,
      html: emailHtml
    });
  }
}

// Create email service instance
export const emailService = new EmailService({
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : undefined,
  user: process.env.EMAIL_USER || '',
  pass: process.env.EMAIL_PASS || '',
  secure: process.env.EMAIL_SECURE === 'true'
});