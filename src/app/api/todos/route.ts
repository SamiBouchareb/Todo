import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = "sk-1de793547f1f43cc8ab17b8a28106fa1";
const API_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

interface RequestBody {
  prompt: string;
  maxTodos?: number;
  regenerateIds?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { prompt, maxTodos = 10, regenerateIds } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let systemPrompt = `You are a task breakdown assistant. Create a detailed, actionable todo list based on the following goal. For each todo item, provide:
1. A specific category (e.g., Setup, Development, Testing)
2. Priority level (High/Medium/Low)
3. Difficulty level (Easy/Medium/Hard)
4. Estimated time in minutes (realistic estimates)
5. Clear, actionable task description
6. Brief explanation of why this task is important
7. Dependencies (numbers of tasks that must be completed first)

Format each todo exactly like this example (one per line):
Development|High|Medium|30|Set up basic project structure|Create the foundation for the project by initializing necessary files and folders|1,2

Rules:
- Create exactly ${maxTodos} todos
- Make tasks specific and actionable
- Ensure logical task dependencies
- Vary difficulty and priority levels
- Keep time estimates realistic (in minutes)
- Use clear, professional language
- Number tasks implicitly by their order (1-based)
- ALWAYS use the exact format shown above`;

    if (regenerateIds) {
      systemPrompt += '\nRegenerate alternatives for the specified tasks while maintaining their dependencies.';
    }

    const response = await axios.post(
      API_ENDPOINT,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Break down this project into ${maxTodos} specific tasks: ${prompt}${
              regenerateIds ? `\nRegenerate tasks with numbers: ${regenerateIds.join(', ')}` : ''
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      console.error('Invalid API response:', response.data);
      throw new Error('Invalid response from API');
    }

    const content = response.data.choices[0].message.content;
    const todoLines = content
      .split('\n')
      .filter((line: string) => line.trim() && line.includes('|'));

    if (todoLines.length === 0) {
      console.error('No valid todos in response:', content);
      throw new Error('No valid todos generated');
    }

    const todos = todoLines.map((line: string, index: number) => {
      const [category, priority, difficulty, time, title, description, deps = ''] = line.split('|').map(s => s.trim());
      
      // Convert dependency numbers to todo IDs
      const dependencies = deps
        ? deps.split(',')
            .map(d => d.trim())
            .filter(d => !isNaN(parseInt(d)))
            .map(d => `todo-${parseInt(d) - 1}`)
        : [];

      return {
        id: `todo-${index}`,
        title,
        description,
        category,
        priority,
        difficulty,
        timeEstimate: `${time} minutes`,
        dependencies
      };
    });

    return NextResponse.json({ todos });
  } catch (error: any) {
    console.error('Error generating todos:', error.response?.data || error);
    
    let errorMessage = 'Failed to generate todos';
    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
}
