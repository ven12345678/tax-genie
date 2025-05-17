import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TaxSummary from '@/models/TaxSummary';

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all tax summaries, sorted by creation date (newest first)
    const taxHistory = await TaxSummary.find()
      .sort({ createdAt: -1 })
      .select('totalIncome totalDeductions taxableIncome estimatedTax createdAt')
      .limit(10); // Limit to last 10 reports
    
    return NextResponse.json({
      success: true,
      data: taxHistory
    });
  } catch (error) {
    console.error('Error fetching tax history:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching tax history',
        details: error.message
      },
      { status: 500 }
    );
  }
} 