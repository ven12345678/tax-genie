import { NextResponse } from 'next/server';

// Function to validate CSV headersfunction validateHeaders(headers) {  const requiredHeaders = ['Date', 'Amount'];  const sourceHeaders = ['Source', 'Category']; // Accept either Source or Category  const optionalHeaders = ['Description'];    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());    // Check required headers  const missingRequired = requiredHeaders.filter(    header => !normalizedHeaders.includes(header.toLowerCase())  );    // Check if at least one of Source or Category is present  const hasSourceColumn = sourceHeaders.some(    header => normalizedHeaders.includes(header.toLowerCase())  );    if (!hasSourceColumn) {    missingRequired.push('Source/Category');  }    return missingRequired;}

// Function to validate row data
function validateRow(row, headers) {
  const errors = [];
  
  // Validate Date
  const dateIndex = headers.findIndex(h => h.trim().toLowerCase() === 'date');
  if (dateIndex !== -1) {
    const date = new Date(row[dateIndex]);
    if (isNaN(date.getTime())) {
      errors.push(`Invalid date format: ${row[dateIndex]}. Use YYYY-MM-DD format.`);
    }
  }

  // Validate Amount
  const amountIndex = headers.findIndex(h => h.trim().toLowerCase() === 'amount');
  if (amountIndex !== -1) {
    const amount = parseFloat(row[amountIndex]);
    if (isNaN(amount)) {
      errors.push(`Invalid amount: ${row[amountIndex]}. Must be a number.`);
    }
  }

  return errors;
}



export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Read the file content
    const fileContent = await file.text();
    if (!fileContent.trim()) {
      return NextResponse.json(
        { message: 'File is empty' },
        { status: 400 }
      );
    }

    // Parse CSV content
    const rows = fileContent.split('\n').map(row => row.split(','));
    
    if (rows.length < 2) {
      return NextResponse.json(
        { message: 'File contains no data rows' },
        { status: 400 }
      );
    }

    const headers = rows[0].map(h => h.trim());

    // Validate headers
    const missingHeaders = validateHeaders(headers);
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { message: `Missing required columns: ${missingHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    // Process data rows
    const formattedData = [];
        const headerIndexes = {      date: headers.findIndex(h => h.toLowerCase() === 'date'),      source: headers.findIndex(h => h.toLowerCase() === 'source') !== -1         ? headers.findIndex(h => h.toLowerCase() === 'source')        : headers.findIndex(h => h.toLowerCase() === 'category'),      amount: headers.findIndex(h => h.toLowerCase() === 'amount'),      description: headers.findIndex(h => h.toLowerCase() === 'description')    };

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length >= Math.min(...Object.values(headerIndexes).filter(i => i !== -1))) {
        const amount = parseFloat(row[headerIndexes.amount]);
        if (!isNaN(amount)) {
          formattedData.push({
            date: row[headerIndexes.date].trim(),
            source: row[headerIndexes.source].trim(),
            amount: amount,
            description: headerIndexes.description !== -1 ? row[headerIndexes.description]?.trim() || '' : ''
          });
        }
      }
    }

    // Calculate summary statistics
    const summary = {
      totalIncome: formattedData.reduce((sum, row) => sum + row.amount, 0),
      sourceBreakdown: formattedData.reduce((acc, row) => {
        const source = row.source || 'Other';
        acc[source] = (acc[source] || 0) + row.amount;
        return acc;
      }, {}),
      monthlyTrend: formattedData.reduce((acc, row) => {
        const date = new Date(row.date);
        if (!isNaN(date.getTime())) {
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          acc[monthYear] = (acc[monthYear] || 0) + row.amount;
        }
        return acc;
      }, {})
    };

        return NextResponse.json({      message: 'File processed successfully',      status: 'success',      summary    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { message: 'Error processing file: ' + error.message },
      { status: 500 }
    );
  }
} 