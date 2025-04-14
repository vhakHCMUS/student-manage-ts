const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importCSV() {
  try {
    // Read the CSV file
    const filePath = path.join(process.cwd(), 'diem_thi_thpt_2024.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse CSV data
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Found ${records.length} records to import`);
    
    // Import each record
    for (const record of records) {
      await prisma.student.create({
        data: {
          registrationNumber: record.sbd,
          math: record.toan ? parseFloat(record.toan) : null,
          literature: record.ngu_van ? parseFloat(record.ngu_van) : null,
          foreignLanguage: record.ngoai_ngu ? parseFloat(record.ngoai_ngu) : null,
          physics: record.vat_li ? parseFloat(record.vat_li) : null,
          chemistry: record.hoa_hoc ? parseFloat(record.hoa_hoc) : null,
          biology: record.sinh_hoc ? parseFloat(record.sinh_hoc) : null,
          history: record.lich_su ? parseFloat(record.lich_su) : null,
          geography: record.dia_li ? parseFloat(record.dia_li) : null,
          civicEducation: record.gdcd ? parseFloat(record.gdcd) : null,
          foreignLanguageCode: record.ma_ngoai_ngu || null,
        },
      });
    }
    
    console.log('Import completed successfully');
  } catch (error) {
    console.error('Error importing CSV:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importCSV(); 