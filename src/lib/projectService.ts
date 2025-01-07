import fs from 'fs';
import path from 'path';

interface ProjectData {
  name: string;
  description: string;
  createReadme: boolean;
  todos: Array<{
    category: string;
    priority: string;
    time: string;
    task: string;
    explanation: string;
  }>;
}

export async function createProjectStructure(projectData: ProjectData, basePath: string) {
  const projectPath = path.join(basePath, projectData.name);

  // Create main project directory
  if (fs.existsSync(projectPath)) {
    throw new Error('Project directory already exists');
  }

  // Create the main directory structure
  const directories = [
    '',
    'tasks',
    'tasks/high-priority',
    'tasks/medium-priority',
    'tasks/low-priority',
    'resources',
    'notes'
  ];

  for (const dir of directories) {
    fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
  }

  // Create README.md if requested
  if (projectData.createReadme) {
    const readmeContent = generateReadmeContent(projectData);
    fs.writeFileSync(path.join(projectPath, 'README.md'), readmeContent);
  }

  // Create task files
  const tasksByPriority: Record<string, Array<{
    category: string;
    priority: string;
    time: string;
    task: string;
    explanation: string;
  }>> = {
    'High': [],
    'Medium': [],
    'Low': []
  };

  projectData.todos.forEach(todo => {
    if (todo.priority in tasksByPriority) {
      tasksByPriority[todo.priority].push(todo);
    }
  });

  // Create task files for each priority
  Object.entries(tasksByPriority).forEach(([priority, todos]) => {
    if (todos.length > 0) {
      const content = generateTasksContent(todos);
      const fileName = `${priority.toLowerCase()}-priority-tasks.md`;
      fs.writeFileSync(
        path.join(projectPath, 'tasks', `${priority.toLowerCase()}-priority`, fileName),
        content
      );
    }
  });

  // Create progress tracking file
  const progressContent = generateProgressTrackingContent(projectData.todos);
  fs.writeFileSync(path.join(projectPath, 'progress-tracking.md'), progressContent);

  return projectPath;
}

function generateReadmeContent(projectData: ProjectData): string {
  return `# ${projectData.name}

${projectData.description}

## Project Overview
This project was generated using AI Todo Generator. It contains a structured set of tasks and resources to help achieve the project goals.

## Project Structure
- \`tasks/\`: Contains prioritized task lists
  - \`high-priority/\`: Critical tasks that need immediate attention
  - \`medium-priority/\`: Important tasks that should be completed after high-priority tasks
  - \`low-priority/\`: Tasks that can be completed when resources are available
- \`resources/\`: Store project-related resources and references
- \`notes/\`: Keep project notes and documentation

## Getting Started
1. Review the tasks in the \`tasks/\` directory, starting with high-priority tasks
2. Track your progress in \`progress-tracking.md\`
3. Store relevant resources in the \`resources/\` directory
4. Keep notes and documentation in the \`notes/\` directory

## Tasks Overview
Total Tasks: ${projectData.todos.length}
${Object.entries(
  projectData.todos.reduce((acc, todo) => {
    acc[todo.priority] = (acc[todo.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).map(([priority, count]) => `- ${priority} Priority: ${count} tasks`).join('\n')}
`;
}

function generateTasksContent(todos: ProjectData['todos']): string {
  return `# ${todos[0].priority} Priority Tasks

${todos.map((todo, index) => `
## ${index + 1}. ${todo.task}
- Category: ${todo.category}
- Estimated Time: ${todo.time}
- Description: ${todo.explanation}
- Status: [ ] Not Started
`).join('\n')}
`;
}

function generateProgressTrackingContent(todos: ProjectData['todos']): string {
  return `# Project Progress Tracking

## Task Completion Status
${todos.map((todo, index) => `
### ${index + 1}. ${todo.task}
- [ ] Not Started
- Priority: ${todo.priority}
- Category: ${todo.category}
- Estimated Time: ${todo.time}
`).join('\n')}

## Progress Notes
Add your progress notes and updates here:

### Updates
- Project created: ${new Date().toISOString().split('T')[0]}
`;
}
