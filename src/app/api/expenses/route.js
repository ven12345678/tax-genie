import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const expense = await Expense.create(body);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 