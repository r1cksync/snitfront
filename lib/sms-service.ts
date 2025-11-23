import twilio from 'twilio';

interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface SMSData {
  to: string;
  message: string;
}

export class SMSService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor(config: SMSConfig) {
    this.client = twilio(config.accountSid, config.authToken);
    this.fromNumber = config.fromNumber;
    
    this.verifyCredentials();
  }

  private async verifyCredentials(): Promise<void> {
    try {
      await this.client.api.accounts.list({ limit: 1 });
      console.log('✅ SMS service (Twilio) connected successfully');
    } catch (error) {
      console.error('❌ SMS service connection failed:', error);
      console.log('💡 Check your Twilio credentials in .env file');
    }
  }

  async sendSMS(smsData: SMSData): Promise<boolean> {
    try {
      // Format phone number (ensure it starts with + for international format)
      const formattedTo = this.formatPhoneNumber(smsData.to);
      
      console.log(`📱 Attempting to send SMS to: ${formattedTo}`);
      console.log(`📝 Message content: ${smsData.message.substring(0, 50)}...`);
      
      const message = await this.client.messages.create({
        body: smsData.message,
        from: this.fromNumber,
        to: formattedTo
      });

      console.log(`✅ SMS sent successfully to ${formattedTo}`);
      console.log(`📋 Message SID: ${message.sid}`);
      console.log(`📊 Message Status: ${message.status}`);
      console.log(`💰 Price: ${message.price || 'N/A'} ${message.priceUnit || ''}`);
      
      return true;
    } catch (error: any) {
      console.error('❌ Error sending SMS:', error);
      
      // Provide specific error messages for common Twilio issues
      if (error.code === 21211) {
        console.log('💡 Invalid phone number format. Use international format: +1234567890');
      } else if (error.code === 21408) {
        console.log('💡 Permission denied. Check if your Twilio account has SMS permissions.');
      } else if (error.code === 21614) {
        console.log('💡 Invalid phone number. The number cannot receive SMS messages.');
      } else if (error.code === 20003) {
        console.log('💡 Authentication failed. Check your Twilio Account SID and Auth Token.');
      } else if (error.code === 21606) {
        console.log('💡 The phone number is not verified. In trial mode, you can only send to verified numbers.');
        console.log('🔧 To fix: Verify your phone number in Twilio Console → Phone Numbers → Verified Numbers');
      } else if (error.code === 21612) {
        console.log('💡 The "To" phone number is not a valid SMS-capable inbound phone number.');
      }
      
      return false;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // If it starts with country code, keep as is
    if (digits.length > 10 && digits.startsWith('1')) {
      return '+' + digits;
    }
    
    // If it's a 10-digit US number, add +1
    if (digits.length === 10) {
      return '+1' + digits;
    }
    
    // If it's already formatted correctly
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // Default: assume it needs +1 (US/Canada)
    return '+1' + digits;
  }

  async sendReportSMS(user: any, analytics: any): Promise<boolean> {
    const message = this.generateReportSMSText(user, analytics);
    
    return await this.sendSMS({
      to: user.phoneNumber,
      message
    });
  }

  private generateReportSMSText(user: any, analytics: any): string {
    return `🧠 NITS PS1 Report for ${user.name}

📊 This Week:
• ${analytics.totalSessions} sessions completed
• ${Math.round(analytics.totalFocusTime / 3600)}h total focus time
• ${analytics.productivityScore}/100 productivity score
• ${analytics.streakDays} day streak

🎯 Keep it up! View full report: ${process.env.NEXTAUTH_URL}/dashboard

-NITS PS1 Team`;
  }

  async sendWeeklySMS(user: any, analytics: any): Promise<boolean> {
    const message = `🚀 Weekly Update: You completed ${analytics.totalSessions} sessions this week with ${Math.round(analytics.totalFocusTime / 3600)}h focus time. Productivity score: ${analytics.productivityScore}/100. Great progress! 

View details: ${process.env.NEXTAUTH_URL}/dashboard`;

    return await this.sendSMS({
      to: user.phoneNumber,
      message
    });
  }

  async sendMotivationalSMS(user: any): Promise<boolean> {
    const motivationalMessages = [
      `Hi ${user.name}! 💪 Ready for a productive session? Your brain is warmed up and waiting for you!`,
      `🎯 ${user.name}, time to enter flow state! Your focus session is calling.`,
      `🧠 Hey ${user.name}! Transform your potential into progress. Start your session now!`,
      `⚡ ${user.name}, your productivity streak is waiting to continue! Let's go!`,
      `🌟 ${user.name}, every session counts. Ready to make this one count?`
    ];

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    return await this.sendSMS({
      to: user.phoneNumber,
      message: randomMessage
    });
  }
}

// Create SMS service instance
export const smsService = new SMSService({
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  fromNumber: process.env.TWILIO_PHONE_NUMBER || ''
});