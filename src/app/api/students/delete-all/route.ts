import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE() {
  try {
    const { count } = await prisma.student.deleteMany({});
    console.log(`Deleted ${count} student records.`);
    return NextResponse.json({ message: `Successfully deleted ${count} students.`, deletedCount: count });
  } catch (error) {
    console.error('Error deleting students:', error);
    return NextResponse.json(
      { message: 'Internal server error during deletion' },
      { status: 500 }
    );
  }
} 