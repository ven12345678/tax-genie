import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Income from '@/models/Income';

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    const income = await Income.create(data);
    
    return NextResponse.json({ 
      success: true, 
      data: income 
    });
  } catch (error) {
    console.error('Error saving income:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error saving income',
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const incomes = await Income.find().sort({ date: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: incomes 
    });
  } catch (error) {
    console.error('Error fetching incomes:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching incomes',
      error: error.message 
    }, { status: 500 });
  }
} 