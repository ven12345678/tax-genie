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

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Create the prompt for document analysis
    const prompt = `Please analyze this document and extract the following information in JSON format:
    1. Amount (if present)
    2. Source/Company name
    3. Date
    4. Description or purpose
    5. Any additional relevant details

    Please return the data in this format:
    {
      "amount": "numeric value",
      "source": "string",
      "date": "YYYY-MM-DD",
      "description": "string",
      "category": "string",
      "additionalDetails": {}
    }`;

    // Call Qwen model with the image
    const completion = await client.chat.completions.create({
      model: "qwen-vl-plus",
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing financial documents and extracting relevant information.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    let extractedData;
    try {
      // Try to parse the JSON response
      const jsonMatch = completion.choices[0].message.content.match(/({[\s\S]*})/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing model response:', parseError);
      return NextResponse.json(
        { 
          message: 'Error parsing document analysis results',
          raw: completion.choices[0].message.content
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: extractedData
    });

  } catch (error) {
    console.error('Error analyzing document:', error);
    return NextResponse.json(
      { 
        message: 'Error analyzing document',
        error: error.message
      },
      { status: 500 }
    );
  }
} 