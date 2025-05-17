import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import connectDB from '@/lib/mongodb';
import Income from '@/models/Income';
import Expense from '@/models/Expense';
import TaxSummary from '@/models/TaxSummary';

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
});

export async function POST() {
  try {
    await connectDB();
    // Fetch all income and expense data
    const incomes = await Income.find();
    const expenses = await Expense.find();

    // Format data for Dashscope
    const formattedData = [
      ...incomes.map((inc) => ({
        type: 'income',
        amount: inc.amount,
        description: inc.description || inc.source || '',
        category: inc.category || '',
        date: inc.date ? inc.date.toISOString().split('T')[0] : '',
      })),
      ...expenses.map((exp) => ({
        type: 'deduction',
        amount: exp.amount,
        description: exp.description,
        category: exp.category,
        date: exp.date ? exp.date.toISOString().split('T')[0] : '',
      })),
    ];

    // Create the prompt for Qwen
    const prompt = `According to Malaysia taxation law, analyze the following income and expenses data and provide:\n1. Which expenses need to be declared\n2. Which expenses can be used for tax relief\n3. Calculate the total taxable income and estimated tax\n\nHere is the data:\n${JSON.stringify(formattedData, null, 2)}\n\nPlease provide a detailed analysis in JSON format with the following structure:\n{\n  "declarableExpenses": [],\n  "taxReliefExpenses": [],\n  "totalIncome": 0,\n  "totalDeductions": 0,\n  "taxableIncome": 0,\n  "estimatedTax": 0,\n  "analysis": ""\n}`;

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
      analysis = JSON.parse(completion.choices[0].message.content);
    } catch (parseErr) {
      const match = completion.choices[0].message.content.match(/```json[\s\S]*?({[\s\S]*})[\s\S]*?```/i) || completion.choices[0].message.content.match(/({[\s\S]*})/);
      if (match && match[1]) {
        try {
          analysis = JSON.parse(match[1]);
        } catch (e) {
          return NextResponse.json({
            message: 'Model response is not valid JSON. See server logs for details.',
            raw: completion.choices[0].message.content,
            success: false
          }, { status: 500 });
        }
      } else {
        return NextResponse.json({
          message: 'Model response is not valid JSON. See server logs for details.',
          raw: completion.choices[0].message.content,
          success: false
        }, { status: 500 });
      }
    }

    // Save tax summary to MongoDB
    try {
      await TaxSummary.create({
        totalIncome: analysis.totalIncome,
        totalDeductions: analysis.totalDeductions,
        taxableIncome: analysis.taxableIncome,
        estimatedTax: analysis.estimatedTax,
        declarableExpenses: analysis.declarableExpenses,
        taxReliefExpenses: analysis.taxReliefExpenses,
        analysis: analysis.analysis,
      });
    } catch (dbError) {
      console.error('Error saving tax summary to MongoDB:', dbError);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing data from MongoDB:', error);
    return NextResponse.json({
      message: 'Error analyzing data from MongoDB',
      details: error.message,
      success: false
    }, { status: 500 });
  }
} 