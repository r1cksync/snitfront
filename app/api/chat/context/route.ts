import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import FlowSession from '../../../../models/FlowSession';
import UserSettings from '../../../../models/UserSettings';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Fetch user profile data
    const user = await User.findOne({ email: session.user.email }).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch flow sessions data
    const flowSessions = await FlowSession.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(100); // Get last 100 sessions

    // Fetch user settings
    const userSettings = await UserSettings.findOne({ userId: user._id });

    // Calculate analytics from real data
    const totalSessions = flowSessions.length;
    const totalFocusTime = flowSessions.reduce((acc, session) => acc + (session.duration / 60), 0); // Convert to minutes
    const avgFlowScore = totalSessions > 0 ? 
      Math.round(flowSessions.reduce((acc, session) => acc + (session.focusScore || session.qualityScore), 0) / totalSessions) : 0;
    const avgSessionDuration = totalSessions > 0 ? 
      Math.round(totalFocusTime / totalSessions) : 0;

    // Activity breakdown from real sessions
    const activityBreakdown: Record<string, number> = {};
    flowSessions.forEach(session => {
      const type = session.sessionType || 'other';
      activityBreakdown[type] = (activityBreakdown[type] || 0) + 1;
    });

    // Find favorite activity
    const favoriteActivity = Object.keys(activityBreakdown).reduce((a, b) => 
      activityBreakdown[a] > activityBreakdown[b] ? a : b, 'coding');

    // Recent sessions data (last 10)
    const recentSessionsData = flowSessions.slice(0, 10).map(session => ({
      date: session.createdAt,
      type: session.sessionType || 'other',
      duration: Math.round(session.duration / 60), // Convert to minutes
      flowScore: session.focusScore || session.qualityScore,
      distractions: session.distractions,
    }));

    // Calculate whiteboard insights
    const whiteboardSessions = flowSessions.filter(s => s.sessionType === 'whiteboard');
    const whiteboardInsights = {
      avgCreativityScore: whiteboardSessions.length > 0 ? 
        Math.round(whiteboardSessions.reduce((acc, s) => acc + (s.whiteboardMetrics?.creativityScore || 0), 0) / whiteboardSessions.length) : 0,
      totalStrokes: whiteboardSessions.reduce((acc, s) => acc + (s.whiteboardMetrics?.totalStrokes || 0), 0),
      avgColorsUsed: whiteboardSessions.length > 0 ? 
        Number((whiteboardSessions.reduce((acc, s) => acc + (s.whiteboardMetrics?.colorsUsed || 0), 0) / whiteboardSessions.length).toFixed(1)) : 0,
    };

    // Calculate weekly trends (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklySessions = flowSessions.filter(s => s.createdAt >= weekAgo);
    const weeklyAvgScore = weeklySessions.length > 0 ? 
      Math.round(weeklySessions.reduce((acc, s) => acc + (s.focusScore || s.qualityScore), 0) / weeklySessions.length) : 0;
    
    // Calculate improvement rate (compare last 7 days vs previous 7 days)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const previousWeekSessions = flowSessions.filter(s => s.createdAt >= twoWeeksAgo && s.createdAt < weekAgo);
    const previousWeekAvg = previousWeekSessions.length > 0 ? 
      Math.round(previousWeekSessions.reduce((acc, s) => acc + (s.focusScore || s.qualityScore), 0) / previousWeekSessions.length) : 0;
    
    const improvementRate = previousWeekAvg > 0 ? 
      `${weeklyAvgScore > previousWeekAvg ? '+' : ''}${Math.round(((weeklyAvgScore - previousWeekAvg) / previousWeekAvg) * 100)}%` : '0%';

    // Fetch Spotify data if available
    let spotifyGenres: string[] = [];
    try {
      if (user.spotifyAccessToken) {
        // Call Spotify API to get recent genres
        const spotifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/spotify/insights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // This would need to be implemented to fetch user's top tracks
          }),
        }).catch(() => null);
        
        if (spotifyResponse?.ok) {
          const spotifyData = await spotifyResponse.json();
          spotifyGenres = spotifyData.topGenres || [];
        }
      }
    } catch (error) {
      console.log('Could not fetch Spotify data:', error);
    }

    // Generate personalized insights based on real data
    const personalInsights = generatePersonalInsights(flowSessions, activityBreakdown, whiteboardInsights);
    const mentalHealthTips = generateMentalHealthTips(flowSessions, user, weeklyAvgScore);

    // Construct comprehensive user context from real data
    const userContext = {
      name: user.name,
      email: user.email,
      totalSessions,
      avgFlowScore,
      totalFocusTime: Math.round(totalFocusTime),
      avgSessionDuration,
      favoriteActivity,
      activityBreakdown,
      
      // User profile info
      age: user.age,
      occupation: user.occupation,
      company: user.company,
      primaryGoals: user.primaryGoals || [],
      focusAreas: user.focusAreas || [],
      productivityChallenges: user.productivityChallenges || [],
      
      // Wellness data (would be extended with real wellness tracking)
      stressLevel: calculateStressLevel(flowSessions),
      sleepQuality: 7, // This would come from wellness tracking
      currentMood: determineMood(recentSessionsData),
      
      recentSpotifyGenres: spotifyGenres.length > 0 ? spotifyGenres : ['focus', 'ambient', 'lo-fi'],
      whiteboardInsights,
      recentSessionsData,
      trends: {
        weeklyAvgScore,
        weeklySessionCount: weeklySessions.length,
        improvementRate,
      },
      personalInsights,
      mentalHealthTips,
      
      // Settings
      notifications: userSettings?.notifications || { enabled: true, interventions: true, dailySummary: true },
      flowDetection: userSettings?.flowDetection || { sensitivity: 'medium', minDuration: 300 },
    };

    return NextResponse.json(userContext);
  } catch (error) {
    console.error('Error fetching user context:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate personalized insights
function generatePersonalInsights(sessions: any[], activityBreakdown: Record<string, number>, whiteboardInsights: any): string[] {
  const insights: string[] = [];
  
  if (sessions.length === 0) {
    return ['Start your first flow session to get personalized insights!'];
  }

  // Find peak productivity hours
  const hourlyData: Record<number, { count: number, totalScore: number }> = {};
  sessions.forEach(session => {
    const hour = new Date(session.createdAt).getHours();
    if (!hourlyData[hour]) hourlyData[hour] = { count: 0, totalScore: 0 };
    hourlyData[hour].count++;
    hourlyData[hour].totalScore += session.focusScore || session.qualityScore;
  });
  
  const bestHour = Object.keys(hourlyData).reduce((best, hour) => {
    const avgScore = hourlyData[parseInt(hour)].totalScore / hourlyData[parseInt(hour)].count;
    const bestAvg = hourlyData[parseInt(best)].totalScore / hourlyData[parseInt(best)].count;
    return avgScore > bestAvg ? hour : best;
  });
  
  if (bestHour) {
    const hourDisplay = parseInt(bestHour) === 12 ? '12 PM' : 
                      parseInt(bestHour) > 12 ? `${parseInt(bestHour) - 12} PM` : 
                      parseInt(bestHour) === 0 ? '12 AM' : `${bestHour} AM`;
    insights.push(`Your productivity peaks around ${hourDisplay}`);
  }

  // Activity-based insights
  const topActivity = Object.keys(activityBreakdown).reduce((a, b) => 
    activityBreakdown[a] > activityBreakdown[b] ? a : b);
  
  if (topActivity && activityBreakdown[topActivity] > 1) {
    insights.push(`You excel most in ${topActivity} sessions`);
  }

  // Session duration insights
  const avgDuration = sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length / 60;
  if (avgDuration > 45) {
    insights.push('You maintain focus well in longer sessions');
  } else if (avgDuration < 25) {
    insights.push('Consider gradually increasing session length for deeper flow');
  }

  // Whiteboard creativity insight
  if (whiteboardInsights.avgCreativityScore > 70) {
    insights.push('Your creativity shines during whiteboard sessions');
  }

  // Distraction patterns
  const avgDistractions = sessions.reduce((acc, s) => acc + s.distractions, 0) / sessions.length;
  if (avgDistractions < 2) {
    insights.push('Excellent focus discipline - very few distractions!');
  }

  return insights.slice(0, 5); // Return top 5 insights
}

// Helper function to generate mental health tips
function generateMentalHealthTips(sessions: any[], user: any, weeklyAvgScore: number): string[] {
  const tips: string[] = [];
  
  if (sessions.length === 0) {
    return [
      'Start with short 15-minute focus sessions',
      'Create a dedicated workspace for better concentration',
      'Use the Pomodoro technique for structured work',
    ];
  }

  // Performance-based tips
  if (weeklyAvgScore < 60) {
    tips.push('Try breaking tasks into smaller, manageable chunks');
    tips.push('Consider environmental factors - lighting, noise, temperature');
  } else if (weeklyAvgScore > 80) {
    tips.push('Great momentum! Consider teaching others your focus techniques');
  }

  // Activity-based recommendations
  const codingSessions = sessions.filter(s => s.sessionType === 'coding').length;
  if (codingSessions > sessions.length * 0.7) {
    tips.push('Balance coding with creative whiteboard sessions');
    tips.push('Take regular eye breaks to prevent strain');
  }

  // Stress and productivity challenges
  if (user.productivityChallenges?.includes('stress')) {
    tips.push('Practice deep breathing before challenging tasks');
    tips.push('Your stress patterns suggest meditation could help');
  }

  if (user.productivityChallenges?.includes('distraction')) {
    tips.push('Try noise-canceling headphones or focus music');
    tips.push('Use website blockers during deep work sessions');
  }

  // Default helpful tips
  tips.push('Regular movement breaks boost cognitive performance');
  tips.push('Stay hydrated for optimal brain function');
  
  return tips.slice(0, 5);
}

// Helper function to calculate stress level based on session patterns
function calculateStressLevel(sessions: any[]): number {
  if (sessions.length === 0) return 5; // neutral
  
  const recentSessions = sessions.slice(0, 10); // last 10 sessions
  const avgScore = recentSessions.reduce((acc, s) => acc + (s.focusScore || s.qualityScore), 0) / recentSessions.length;
  const avgDistractions = recentSessions.reduce((acc, s) => acc + s.distractions, 0) / recentSessions.length;
  
  // Lower scores and more distractions suggest higher stress
  let stressLevel = 5;
  if (avgScore < 60 || avgDistractions > 5) stressLevel = 7;
  if (avgScore < 40 || avgDistractions > 8) stressLevel = 8;
  if (avgScore > 80 && avgDistractions < 2) stressLevel = 3;
  
  return Math.min(Math.max(stressLevel, 1), 10);
}

// Helper function to determine current mood based on recent sessions
function determineMood(recentSessions: any[]): string {
  if (recentSessions.length === 0) return 'neutral';
  
  const lastSession = recentSessions[0];
  const score = lastSession.flowScore;
  
  if (score >= 85) return 'excellent';
  if (score >= 75) return 'focused';
  if (score >= 60) return 'productive';
  if (score >= 45) return 'moderate';
  return 'challenging';
}