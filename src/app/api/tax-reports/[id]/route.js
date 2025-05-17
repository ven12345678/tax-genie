import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { db } = await connectToDatabase();

    const result = await db.collection('taxReports').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Tax report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Tax report deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting tax report:', error);
    return NextResponse.json(
      { message: 'Error deleting tax report' },
      { status: 500 }
    );
  }
} 