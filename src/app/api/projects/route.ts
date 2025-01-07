import { NextResponse } from 'next/server';
import { createProjectStructure } from '@/lib/projectService';
import path from 'path';
import os from 'os';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Use the downloads folder as the base path for project creation
    const downloadsPath = path.join(os.homedir(), 'Downloads', 'AI-Generated-Projects');
    
    const projectPath = await createProjectStructure(data, downloadsPath);
    
    return NextResponse.json({ 
      success: true, 
      projectPath,
      message: 'Project created successfully' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create project' 
      },
      { status: 500 }
    );
  }
}
