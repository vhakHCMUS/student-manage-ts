import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Define a type for the data structure used in sorting
type StudentForSorting = {
  id: string;
  registrationNumber: string;
  math: number | null;
  physics: number | null;
  chemistry: number | null;
};

// Helper function to calculate the sum of Group A scores
const calculateGroupASum = (student: { math: number | null, physics: number | null, chemistry: number | null }): number => {
  return (student.math ?? 0) + (student.physics ?? 0) + (student.chemistry ?? 0);
};

export async function GET() {
  try {
    // Fetch ALL students with non-null Group A scores
    const allRelevantStudents: StudentForSorting[] = await prisma.student.findMany({
      where: {
        AND: [
          { math: { not: null } },
          { physics: { not: null } },
          { chemistry: { not: null } },
        ],
      },
      // Remove `take` limit to fetch all candidates
      // Remove `orderBy` from here; sorting by sum happens in code
      // Optionally select only needed fields:
      select: { id: true, registrationNumber: true, math: true, physics: true, chemistry: true }
    });

    // Sort ALL fetched students in JavaScript based on the sum of scores
    const sortedStudents = allRelevantStudents.sort((a: StudentForSorting, b: StudentForSorting) => {
      const sumA = calculateGroupASum(a);
      const sumB = calculateGroupASum(b);
      return sumB - sumA; // Sort descending by sum
    });

    // Take the actual top 10 from the fully sorted list
    const top10Students = sortedStudents.slice(0, 10);

    return NextResponse.json(top10Students);
  } catch (error) {
    console.error('Error fetching top students:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 