import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const scoreRanges = [
  { min: 8, max: 10, label: '>= 8 points' },
  { min: 6, max: 8, label: '6-8 points' },
  { min: 4, max: 6, label: '4-6 points' },
  { min: 0, max: 4, label: '< 4 points' },
];

const subjects = [
  'math',
  'literature',
  'foreignLanguage',
  'physics',
  'chemistry',
  'biology',
  'history',
  'geography',
  'civicEducation',
];

export async function GET() {
  try {
    const students = await prisma.student.findMany();
    
    const distribution: Record<string, Record<string, number>> = {};
    subjects.forEach(subject => {
      distribution[subject] = {};
      scoreRanges.forEach(range => {
        distribution[subject][range.label] = 0;
      });
    });

    students.forEach(student => {
      subjects.forEach(subject => {
        const score = student[subject as keyof typeof student];
        if (typeof score === 'number') {
          const range = scoreRanges.find(
            r => score >= r.min && score < r.max
          );
          if (range) {
            distribution[subject][range.label]++;
          }
        }
      });
    });

    return NextResponse.json({
      subjects,
      distribution,
    });
  } catch (error) {
    console.error('Error calculating statistics:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 