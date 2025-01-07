import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = "sk-0e6c2c50a36c41c8b016121998819ed8";
const API_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    const systemPrompt = `You are an AI assistant helping the user understand and implement their masterplan. 
Here is the context of their masterplan:
${context}

IMPORTANT FORMATTING INSTRUCTIONS:
1. Use clear hierarchical structure with headings (###) for main sections
2. Use bullet points (-) for lists and steps
3. Format important terms in **bold**
4. Use \`code\` for metrics, tools, or technical terms
5. Use > for key insights or important notes
6. Break down complex information into digestible chunks

When providing explanations:
1. Start with a brief overview
2. Break down into clear sections using headings
3. List steps or points using bullet points
4. Highlight key terms in **bold**
5. Add relevant examples or resources
6. End with a key insight using > blockquote

Example format:
### Overview
Brief explanation of the topic

### Key Points
- **Point 1**: Explanation
- **Point 2**: Explanation with \`technical term\`

### Steps to Implement
1. First step with **important terms**
2. Second step using \`tools\` or metrics

> Key Insight: Important takeaway or tip

Keep responses focused on their masterplan. If their question isn't related, politely redirect them to focus on the plan.`;

    const response = await axios.post(
      API_ENDPOINT,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error('Chat API error:', error.response?.data || error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
