import * as dotenv from 'dotenv';
dotenv.config();

import connectDB from '../lib/mongodb';
import User from '../models/User';
import FlowSession from '../models/FlowSession';
import bcrypt from 'bcryptjs';

async function createSampleData() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Create a sample user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    let user = await User.findOne({ email: 'demo@example.com' });
    
    if (!user) {
      user = await User.create({
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword,
        age: 28,
        occupation: 'Software Developer',
        company: 'Tech Corp',
        primaryGoals: ['improve focus', 'reduce stress', 'increase productivity'],
        focusAreas: ['coding', 'reading', 'whiteboard sessions'],
        productivityChallenges: ['distractions', 'context switching'],
        timezone: 'America/New_York',
        country: 'USA',
        city: 'New York'
      });
      console.log('Created sample user:', user.email);
    }

    // Create sample flow sessions
    const existingSessions = await FlowSession.countDocuments({ userId: user._id });
    
    if (existingSessions === 0) {
      const sampleSessions = [];
      
      // Create 30 sample sessions over the last month
      for (let i = 0; i < 30; i++) {
        const daysAgo = Math.floor(i / 2); // 2 sessions per day on average
        const sessionDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        
        const sessionTypes = ['code', 'reading', 'whiteboard', 'writing'];
        const sessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
        
        const baseScore = 60 + Math.random() * 30; // 60-90
        const duration = 15 + Math.random() * 60; // 15-75 minutes
        const distractions = Math.floor(Math.random() * 8); // 0-7 distractions
        
        const session: any = {
          userId: user._id,
          startTime: sessionDate,
          endTime: new Date(sessionDate.getTime() + duration * 60 * 1000),
          duration: duration * 60, // in seconds
          qualityScore: Math.round(baseScore),
          focusScore: Math.round(baseScore + (Math.random() - 0.5) * 10),
          sessionType,
          distractions,
          triggers: ['music', 'quiet environment'],
          breakers: distractions > 3 ? ['notifications', 'noise'] : [],
          metrics: {
            avgTypingSpeed: 45 + Math.random() * 20,
            tabSwitches: Math.floor(Math.random() * 15),
            mouseActivity: Math.random() * 100,
            fatigueLevel: Math.random() * 50
          },
          createdAt: sessionDate,
          updatedAt: sessionDate
        };

        if (sessionType === 'code') {
          session.codeMetrics = {
            linesOfCode: Math.floor(50 + Math.random() * 200),
            charactersTyped: Math.floor(1000 + Math.random() * 3000),
            complexityScore: Math.floor(20 + Math.random() * 60),
            errorsFixed: Math.floor(Math.random() * 10)
          };
        }

        if (sessionType === 'whiteboard') {
          session.whiteboardMetrics = {
            totalStrokes: Math.floor(100 + Math.random() * 500),
            shapesDrawn: Math.floor(5 + Math.random() * 20),
            colorsUsed: Math.floor(2 + Math.random() * 8),
            canvasCoverage: Math.floor(30 + Math.random() * 50),
            eraserUses: Math.floor(Math.random() * 10),
            toolSwitches: Math.floor(5 + Math.random() * 25),
            averageStrokeSpeed: 20 + Math.random() * 40,
            creativityScore: Math.floor(50 + Math.random() * 40)
          };
        }

        sampleSessions.push(session);
      }

      await FlowSession.insertMany(sampleSessions);
      console.log(`Created ${sampleSessions.length} sample flow sessions`);
    }

    console.log('Sample data setup complete!');
    console.log('You can now sign in with:');
    console.log('Email: demo@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error setting up sample data:', error);
  } finally {
    process.exit(0);
  }
}

createSampleData();