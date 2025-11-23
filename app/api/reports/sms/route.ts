import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import FlowSession from '@/models/FlowSession';
import { smsService } from '@/lib/sms-service';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user data
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has a phone number
    if (!user.phoneNumber) {
      return NextResponse.json({ 
        error: 'Phone number not found. Please add your phone number in settings.' 
      }, { status: 400 });
    }

    // Get user's flow sessions for analytics
    const sessions = await FlowSession.find({ userId: user._id })
      .sort({ startTime: -1 })
      .limit(30);

    // Calculate analytics (reuse from email service)
    const analytics = await calculateUserAnalytics(user._id.toString(), sessions);

    // Send SMS report
    const smsSent = await smsService.sendReportSMS(user, analytics);

    if (smsSent) {
      // Update user's last SMS sent timestamp
      await User.findByIdAndUpdate(user._id, {
        lastSMSSent: new Date()
      });

      return NextResponse.json({ 
        success: true, 
        message: 'SMS report sent successfully to your phone!' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send SMS report' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending instant SMS report:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function for analytics (shared with email service)
async function calculateUserAnalytics(userId: string, sessions: any[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const recentSessions = sessions.filter(session => 
    new Date(session.startTime) > oneWeekAgo
  );

  const totalSessions = sessions.length;
  const totalFocusTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const averageSessionDuration = totalSessions > 0 ? totalFocusTime / totalSessions : 0;
  
  const completedSessions = sessions.filter(session => session.completed);
  const productivityScore = Math.round(
    totalSessions > 0 ? (completedSessions.length / totalSessions) * 100 : 0
  );

  const streakDays = calculateStreak(sessions);
  const codeSessionsCount = sessions.filter(s => s.sessionType === 'code').length;
  const whiteboardSessionsCount = sessions.filter(s => s.sessionType === 'whiteboard').length;
  const focusSessionsCount = sessions.filter(s => s.sessionType === 'focus').length;
  const wellnessScore = Math.min(100, Math.round((recentSessions.length / 7) * 20 + productivityScore * 0.3));

  return {
    totalSessions,
    totalFocusTime,
    averageSessionDuration,
    productivityScore,
    streakDays,
    codeSessionsCount,
    whiteboardSessionsCount,
    focusSessionsCount,
    wellnessScore
  };
}

function calculateStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;

  const sortedSessions = sessions
    .map(session => new Date(session.startTime).toDateString())
    .filter((date, index, array) => array.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  let currentDate = new Date();

  for (const sessionDate of sortedSessions) {
    const checkDate = currentDate.toDateString();
    
    if (sessionDate === checkDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (sessionDate === new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 2);
    } else {
      break;
    }
  }

  return streak;
}