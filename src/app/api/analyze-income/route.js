import { NextResponse } from 'next/server';

// Function to generate an embed token from your Power BI service
async function getPowerBIToken() {
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

  const data = await response.json();
  return data.token;
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
    const headers = rows[0].map(h => h.trim());
    const data = rows.slice(1).filter(row => row.length === headers.length);

    // Format data for Power BI
    const formattedData = data.map(row => {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header.trim()] = row[index].trim();
      });
      return rowData;
    });

    // Calculate summary statistics
    const summary = {
      totalIncome: formattedData.reduce((sum, row) => sum + parseFloat(row.Amount || 0), 0),
      sourceBreakdown: formattedData.reduce((acc, row) => {
        const source = row.Source || 'Other';
        acc[source] = (acc[source] || 0) + parseFloat(row.Amount || 0);
        return acc;
      }, {}),
      monthlyTrend: formattedData.reduce((acc, row) => {
        const date = new Date(row.Date);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        acc[monthYear] = (acc[monthYear] || 0) + parseFloat(row.Amount || 0);
        return acc;
      }, {})
    };

    // Get fresh Power BI embed token
    const embedToken = await getPowerBIToken();

    return NextResponse.json({
      message: 'File processed successfully',
      status: 'success',
      summary,
      powerbi: {
        embedToken,
        reportId: process.env.POWERBI_INCOME_REPORT_ID,
        embedUrl: process.env.POWERBI_INCOME_EMBED_URL
      },
      datasetId: process.env.POWERBI_INCOME_DATASET_ID
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { message: 'Error processing file: ' + error.message },
      { status: 500 }
    );
  }
} 