import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = "sk-0e6c2c50a36c41c8b016121998819ed8";
const API_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { task, description, category } = await req.json();

    if (!task) {
      return NextResponse.json(
        { error: 'Task is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert AI project planner. Create a detailed, actionable master plan for completing the given task.
The plan should be broken down into clear, manageable steps. For each step, provide:
1. A clear, actionable title
2. A detailed description explaining what needs to be done
3. Priority level (High/Medium/Low)
4. Estimated time to complete
5. Current status (default to "Not Started")
6. A list of specific sub-tasks that break down the step further
7. Key milestones to track progress
8. Helpful resources or tools needed

Make the steps practical and achievable. Consider:
- Breaking down complex tasks into smaller parts
- Including preparation and research phases
- Adding verification steps
- Specifying clear milestones
- Ordering steps by dependency and priority

Format your response as a JSON object with a 'steps' array, where each step has the following structure:
{
  "steps": [
    {
      "title": "string",
      "description": "string",
      "priority": "High" | "Medium" | "Low",
      "estimatedTime": "string (e.g., '30 minutes', '2 hours')",
      "status": "Not Started",
      "subTasks": ["string"],
      "milestones": ["string"],
      "resources": ["string"]
    }
  ]
}

Make sure to return ONLY the JSON object, no additional text or explanation.`;

    const userPrompt = `Create a master plan for the following task:
Task: ${task}
${description ? `Description: ${description}` : ''}
${category ? `Category: ${category}` : ''}

Break this down into 5-7 detailed steps that will help achieve this task efficiently.`;

    console.log('Making request to DeepSeek API...');
    console.log('Task:', task);

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
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('DeepSeek API Response:', response.data);

    try {
      const content = response.data.choices[0].message.content;
      console.log('Raw content:', content);
      
      // Clean up the content and parse it
      const cleanContent = content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsedResponse = JSON.parse(cleanContent);
      
      if (!parsedResponse.steps || !Array.isArray(parsedResponse.steps)) {
        throw new Error('Invalid response format');
      }

      return NextResponse.json({ steps: parsedResponse.steps });
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return NextResponse.json(
        { error: 'Failed to parse masterplan response' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error generating master plan:', error.response?.data || error);
    // Log more detailed error information
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }

    return NextResponse.json(
      { error: error.response?.data?.error || error.message || 'Failed to generate master plan' },
      { status: error.response?.status || 500 }
    );
  }
}
