import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import FlowSession from '@/models/FlowSession';
import { emailService } from '@/lib/email-service';

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

    // Get user's flow sessions
    const sessions = await FlowSession.find({ userId: user._id })
      .sort({ startTime: -1 })
      .limit(50);

    // Calculate analytics
    const analytics = await calculateUserAnalytics(user._id.toString(), sessions);

    // Get code reports and whiteboard analytics (placeholder data for now)
    const codeReports = await getCodeReports(user._id.toString());
    const whiteboardAnalytics = await getWhiteboardAnalytics(user._id.toString());

    const reportData = {
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      sessions,
      analytics,
      codeReports,
      whiteboardAnalytics
    };

    // Send email report
    const emailSent = await emailService.sendReportEmail(user, reportData);

    if (emailSent) {
      // Update user's last report sent timestamp
      await User.findByIdAndUpdate(user._id, {
        lastReportSent: new Date()
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Report sent successfully to your email!' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send email report' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending instant report:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function calculateUserAnalytics(userId: string, sessions: any[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Filter recent sessions
  const recentSessions = sessions.filter(session => 
    new Date(session.startTime) > oneWeekAgo
  );

  // Calculate metrics
  const totalSessions = sessions.length;
  const totalFocusTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const averageSessionDuration = totalSessions > 0 ? totalFocusTime / totalSessions : 0;
  
  // Calculate productivity score (based on session completion and focus scores)
  const completedSessions = sessions.filter(session => session.completed);
  const productivityScore = Math.round(
    totalSessions > 0 ? (completedSessions.length / totalSessions) * 100 : 0
  );

  // Calculate streak (consecutive days with sessions)
  const streakDays = calculateStreak(sessions);

  // Count different session types
  const codeSessionsCount = sessions.filter(s => s.sessionType === 'code').length;
  const whiteboardSessionsCount = sessions.filter(s => s.sessionType === 'whiteboard').length;
  const focusSessionsCount = sessions.filter(s => s.sessionType === 'focus').length;

  // Calculate wellness score (based on session frequency and breaks)
  const wellnessScore = Math.min(100, Math.round((recentSessions.length / 7) * 20 + productivityScore * 0.3));

  // Weekly progress (last 7 days)
  const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });
    
    return Math.min(100, daySessions.length * 25); // Each session adds 25% to daily progress
  }).reverse();

  return {
    totalSessions,
    totalFocusTime,
    averageSessionDuration,
    productivityScore,
    streakDays,
    codeSessionsCount,
    whiteboardSessionsCount,
    focusSessionsCount,
    wellnessScore,
    weeklyProgress
  };
}

function calculateStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;

  const sortedSessions = sessions
    .map(session => new Date(session.startTime).toDateString())
    .filter((date, index, array) => array.indexOf(date) === index) // Remove duplicates
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date().toDateString();
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

async function getCodeReports(userId: string) {
  // For now, return sample data. This would be replaced with actual code analytics
  return [
    {
      date: new Date(),
      linesWritten: 245,
      commits: 3,
      language: 'TypeScript',
      efficiency: 85,
      duration: 1800
    },
    {
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      linesWritten: 189,
      commits: 2,
      language: 'JavaScript',
      efficiency: 78,
      duration: 2100
    }
  ];
}

async function getWhiteboardAnalytics(userId: string) {
  // For now, return sample data. This would be replaced with actual whiteboard analytics
  return [
    {
      date: new Date(),
      duration: 1200,
      complexity: 'Medium',
      elementsCreated: 15,
      sessionType: 'brainstorming'
    },
    {
      date: new Date(Date.now() - 48 * 60 * 60 * 1000),
      duration: 900,
      complexity: 'Low',
      elementsCreated: 8,
      sessionType: 'planning'
    }
  ];
}