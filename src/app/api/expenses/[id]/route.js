import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function DELETE(request, { params }) {
  console.log('Delete request received for expense ID:', params.id);
  
  try {
    const { id } = params;
    
    if (!id) {
      console.log('No ID provided in request');
      return NextResponse.json(
        { message: 'Expense ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    console.log('Connected to database');

    try {
      console.log('Attempting to delete expense with ID:', id);
      const result = await Expense.findByIdAndDelete(id);
      console.log('Delete result:', result);

      if (!result) {
        console.log('No expense found with ID:', id);
        return NextResponse.json(
          { message: 'Expense not found' },
          { status: 404 }
        );
      }

      console.log('Successfully deleted expense');
      return NextResponse.json(
        { message: 'Expense deleted successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error in delete operation:', error);
      return NextResponse.json(
        { message: 'Invalid expense ID format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json(
      { message: `Error deleting expense: ${error.message}` },
      { status: 500 }
    );
  }
} 