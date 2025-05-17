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

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Income ID is required' 
      }, { status: 400 });
    }

    const result = await Income.findByIdAndDelete(id);
    
    if (!result) {
      return NextResponse.json({ 
        success: false, 
        message: 'Income not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Income deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error deleting income',
      error: error.message 
    }, { status: 500 });
  }
} 