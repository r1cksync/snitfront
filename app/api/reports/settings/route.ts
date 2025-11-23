import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      emailReportsEnabled: user.emailReportsEnabled || false,
      emailReportsFrequency: user.emailReportsFrequency || 'weekly',
      phoneNumber: user.phoneNumber || '',
      smsReportsEnabled: user.smsReportsEnabled || false,
      smsReportsFrequency: user.smsReportsFrequency || 'weekly'
    });

  } catch (error) {
    console.error('Error fetching report settings:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { emailReportsEnabled, emailReportsFrequency, phoneNumber, smsReportsEnabled, smsReportsFrequency } = body;

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user settings
    const updateData: any = {};
    
    if (emailReportsEnabled !== undefined) {
      updateData.emailReportsEnabled = emailReportsEnabled;
    }
    
    if (emailReportsFrequency !== undefined) {
      updateData.emailReportsFrequency = emailReportsFrequency;
    }
    
    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber;
    }
    
    if (smsReportsEnabled !== undefined) {
      updateData.smsReportsEnabled = smsReportsEnabled;
    }
    
    if (smsReportsFrequency !== undefined) {
      updateData.smsReportsFrequency = smsReportsFrequency;
    }

    await User.findByIdAndUpdate(user._id, updateData);

    return NextResponse.json({ 
      success: true, 
      message: 'Report settings updated successfully' 
    });

  } catch (error) {
    console.error('Error updating report settings:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}