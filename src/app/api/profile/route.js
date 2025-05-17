import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const profile = await Profile.findOne({ userId });
    return NextResponse.json(profile || {});
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const profile = await Profile.findOneAndUpdate(
      { userId: body.userId },
      body,
      { upsert: true, new: true }
    );
    
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 