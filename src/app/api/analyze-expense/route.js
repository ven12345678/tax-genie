import { NextResponse } from 'next/server';

// Function to validate CSV headers
function validateHeaders(headers) {
  const requiredHeaders = ['Date', 'Category', 'Amount'];
  const optionalHeaders = ['Description'];
  const missingHeaders = requiredHeaders.filter(
    header => !headers.map(h => h.trim().toLowerCase()).includes(header.toLowerCase())
  );
  return missingHeaders;
}

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

// Function to generate an embed token from your Power BI service
async function getPowerBIToken() {
  try {
    // This should be replaced with your actual Power BI authentication logic
    const response = await fetch('https://api.powerbi.com/v1.0/myorg/groups/{groupId}/reports/{reportId}/GenerateToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.POWERBI_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        accessLevel: 'View'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate Power BI token');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error generating Power BI token:', error);
    throw new Error('Failed to generate Power BI token');
  }
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
    const headerIndexes = {
      date: headers.findIndex(h => h.toLowerCase() === 'date'),
      category: headers.findIndex(h => h.toLowerCase() === 'category'),
      amount: headers.findIndex(h => h.toLowerCase() === 'amount'),
      description: headers.findIndex(h => h.toLowerCase() === 'description')
    };

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length >= Math.min(...Object.values(headerIndexes).filter(i => i !== -1))) {
        const amount = parseFloat(row[headerIndexes.amount]);
        if (!isNaN(amount)) {
          formattedData.push({
            date: row[headerIndexes.date].trim(),
            category: row[headerIndexes.category].trim(),
            amount: amount,
            description: headerIndexes.description !== -1 ? row[headerIndexes.description]?.trim() || '' : ''
          });
        }
      }
    }

    // Calculate summary statistics
    const summary = {
      totalExpenses: formattedData.reduce((sum, row) => sum + row.amount, 0),
      categoryBreakdown: formattedData.reduce((acc, row) => {
        const category = row.category || 'Other';
        acc[category] = (acc[category] || 0) + row.amount;
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

    return NextResponse.json({
      message: 'File processed successfully',
      status: 'success',
      summary
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { message: 'Error processing file: ' + error.message },
      { status: 500 }
    );
  }
} 