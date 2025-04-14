import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { prisma } from '@/lib/db';

const CSV_FILE_PATH = path.join(process.cwd(), 'diem_thi_thpt_2024.csv');
let cachedRecords: any[] | null = null; // Cache records in memory

async function readCsvRecords() {
  if (cachedRecords) {
    return cachedRecords;
  }
  try {
    if (!fs.existsSync(CSV_FILE_PATH)) {
       throw new Error(`CSV file not found at ${CSV_FILE_PATH}`);
    }
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    cachedRecords = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true, // Trim whitespace from values
    });
    console.log(`Read and cached ${cachedRecords?.length} records from CSV.`);
    return cachedRecords;
  } catch (error) {
    console.error('Error reading or parsing CSV:', error);
    cachedRecords = null; // Clear cache on error
    throw new Error('Could not read or parse CSV file.');
  }
}

// Helper to safely parse float
function safeParseFloat(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.trim() === '') {
    return null;
  }
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

export async function POST(request: Request) {
  try {
    const { batchIndex, batchSize } = await request.json();

    if (typeof batchIndex !== 'number' || typeof batchSize !== 'number' || batchIndex < 0 || batchSize <= 0) {
      return NextResponse.json({ message: 'Invalid batch parameters.' }, { status: 400 });
    }

    const records = await readCsvRecords();
    if (!records) {
       return NextResponse.json({ message: 'Could not load records.' }, { status: 500 });
    }
    const totalRecords = records.length;

    const startIndex = batchIndex * batchSize;
    const endIndex = Math.min(startIndex + batchSize, totalRecords);
    const batchRecords = records.slice(startIndex, endIndex);

    if (startIndex >= totalRecords || batchRecords.length === 0) {
      console.log('Import process completed or no more records.');
      // Clear cache after successful import completion
      if (startIndex >= totalRecords) cachedRecords = null; 
      return NextResponse.json({
        message: 'No more records to import.',
        progress: 100,
        completed: true,
        importedCount: startIndex // Return the count up to the start of this (empty) batch
      });
    }

    console.log(`Processing batch ${batchIndex + 1}: records ${startIndex + 1} to ${endIndex}`);

    const operations = batchRecords.map((record: any) => {
       if (!record.sbd) {
          console.warn('Skipping record with missing sbd:', record);
          return null; // Skip records without registration number
       }
       return prisma.student.upsert({
         where: { registrationNumber: record.sbd.trim() }, // Ensure sbd is trimmed
         update: {
           math: safeParseFloat(record.toan),
           literature: safeParseFloat(record.ngu_van),
           foreignLanguage: safeParseFloat(record.ngoai_ngu),
           physics: safeParseFloat(record.vat_li),
           chemistry: safeParseFloat(record.hoa_hoc),
           biology: safeParseFloat(record.sinh_hoc),
           history: safeParseFloat(record.lich_su),
           geography: safeParseFloat(record.dia_li),
           civicEducation: safeParseFloat(record.gdcd),
           foreignLanguageCode: record.ma_ngoai_ngu?.trim() || null,
         },
         create: {
           registrationNumber: record.sbd.trim(),
           math: safeParseFloat(record.toan),
           literature: safeParseFloat(record.ngu_van),
           foreignLanguage: safeParseFloat(record.ngoai_ngu),
           physics: safeParseFloat(record.vat_li),
           chemistry: safeParseFloat(record.hoa_hoc),
           biology: safeParseFloat(record.sinh_hoc),
           history: safeParseFloat(record.lich_su),
           geography: safeParseFloat(record.dia_li),
           civicEducation: safeParseFloat(record.gdcd),
           foreignLanguageCode: record.ma_ngoai_ngu?.trim() || null,
         },
       });
     }).filter(op => op !== null); // Filter out skipped operations

    // Execute valid operations in a transaction for better performance
    if (operations.length > 0) {
       await prisma.$transaction(operations as any); // Cast needed because filter doesn't narrow type sufficiently for $transaction
    }
    
    const importedCount = endIndex;
    const progress = Math.min(100, Math.round((importedCount / totalRecords) * 100));
    const completed = endIndex >= totalRecords;

    console.log(`Batch ${batchIndex + 1} processed. Imported up to record ${importedCount}. Progress: ${progress}%. Completed: ${completed}`);

    // Clear cache after successful import completion
    if (completed) cachedRecords = null; 

    return NextResponse.json({
      message: `Imported ${importedCount} of ${totalRecords} records.`, 
      progress: progress,
      completed: completed,
      importedCount: importedCount,
      totalRecords: totalRecords, // Include total for UI
    });

  } catch (error: any) {
    console.error(`Error importing batch ${error.batchIndex || 'unknown'}:`, error);
    // Clear cache on error during import
    cachedRecords = null; 
    return NextResponse.json(
      { 
         message: 'Error importing batch', 
         error: error.message || 'An unknown error occurred',
         details: error.stack // Include stack trace for debugging 
      },
      { status: 500 }
    );
  }
} 