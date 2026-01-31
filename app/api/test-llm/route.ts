import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, message } = await request.json();

    if (!provider || !apiKey || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let response: string;

    switch (provider) {
      case 'openai':
        const openai = new OpenAI({ apiKey });
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
          max_tokens: 150,
        });
        response = openaiResponse.choices[0]?.message?.content || 'No response';
        break;

      case 'claude':
        const anthropic = new Anthropic({ apiKey });
        const claudeResponse = await anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 150,
          messages: [{ role: 'user', content: message }],
        });
        response = claudeResponse.content[0]?.type === 'text' 
          ? claudeResponse.content[0].text 
          : 'No response';
        break;

      case 'gemini':
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const geminiResponse = await model.generateContent(message);
        response = geminiResponse.response.text();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid provider' },
          { status: 400 }
        );
    }

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('LLM test error:', error);
    
    // Handle specific error types
    if (error.status === 401 || error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your credentials.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to test LLM connection' },
      { status: 500 }
    );
  }
}
