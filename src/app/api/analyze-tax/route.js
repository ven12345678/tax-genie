import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
});

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

    // Detect user's format
    const isUserFormat = headers.includes('Date') && headers.includes('Income/Ex') && headers.includes('Amount');

    let formattedData = [];
    if (isUserFormat) {
      // Map user's format to expected format
      formattedData = data.map(row => {
        const rowObj = {};
        headers.forEach((header, idx) => {
          rowObj[header] = row[idx].trim();
        });
        return {
          type: rowObj['Income/Ex'].toLowerCase().includes('income') ? 'income' : 'deduction',
          amount: rowObj['Amount'],
          description: rowObj['Category'] || rowObj['Note'] || '',
          date: rowObj['Date']
        };
      });
    } else {
      // Fallback to previous expected format
      const requiredHeaders = ['Date', 'Account', 'Category', 'Note','Income/Expense' ,'Amount'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        return NextResponse.json(
          { message: `Missing required headers: ${missingHeaders.join(', ')}` },
          { status: 400 }
        );
      }
      formattedData = data.map(row => {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header.trim()] = row[index].trim();
        });
        return rowData;
      });
    }

    // Create the prompt for Qwen
    const prompt = `According to Malaysia taxation law, analyze the following income and expenses data and provide:\n1. Which expenses need to be declared\n2. Which expenses can be used for tax relief\n3. Calculate the total taxable income and estimated tax\n\nHere is the data:\n${JSON.stringify(formattedData, null, 2)}\n\nPlease provide a detailed analysis in JSON format with the following structure:\n{\n  "declarableExpenses": [],\n  "taxReliefExpenses": [],\n  "totalIncome": 0,\n  "totalDeductions": 0,\n  "taxableIncome": 0,\n  "estimatedTax": 0,\n  "analysis": ""\n}`;

    try {
      // Call Qwen model
      const completion = await client.chat.completions.create({
        model: "qwen-plus",
        messages: [
          {
            role: 'system',
            content: 'You are a tax expert specializing in Malaysian taxation laws. Provide detailed analysis of income and expenses for tax purposes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      let analysis;
      try {
        // Try direct JSON parse first
        analysis = JSON.parse(completion.choices[0].message.content);
      } catch (parseErr) {
        // Try to extract JSON from markdown code block
        const match = completion.choices[0].message.content.match(/```json[\s\S]*?({[\s\S]*})[\s\S]*?```/i) || completion.choices[0].message.content.match(/({[\s\S]*})/);
        if (match && match[1]) {
          try {
            analysis = JSON.parse(match[1]);
          } catch (e) {
            console.error('Raw model response:', completion.choices[0].message.content);
            return NextResponse.json({
              message: 'Model response is not valid JSON. See server logs for details.',
              raw: completion.choices[0].message.content
            }, { status: 500 });
          }
        } else {
          console.error('Raw model response:', completion.choices[0].message.content);
          return NextResponse.json({
            message: 'Model response is not valid JSON. See server logs for details.',
            raw: completion.choices[0].message.content
          }, { status: 500 });
        }
      }
      return NextResponse.json(analysis);
    } catch (modelError) {
      console.error('Model API Error:', modelError);
      if (modelError.response) {
        const text = await modelError.response.text();
        console.error('Model API raw error response:', text);
      }
      return NextResponse.json(
        { 
          message: 'Error calling the model API',
          details: modelError.message,
          code: modelError.code || 'UNKNOWN_ERROR'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { 
        message: 'Error processing file',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 