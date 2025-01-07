'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useProjectStore, type Todo } from '@/store/projectStore';
import { addProject } from '@/lib/firebase/firebaseUtils';
import { auth } from '@/lib/firebase/firebase';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  todos: Partial<Todo>[];
}

export default function ProjectCreationModal({ isOpen, onClose, prompt, todos }: ProjectCreationModalProps) {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addProjectToStore = useProjectStore((state) => state.addProject);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error('Please sign in to create a project');
      }

      // Create project in Firebase
      const formattedTodos: Todo[] = todos.map((todo, index) => ({
        id: todo.id || `todo-${index}`,
        category: todo.category || 'General',
        priority: todo.priority || 'Medium',
        difficulty: todo.difficulty || 'Medium',
        time: todo.time || '30',
        task: todo.task || '',
        explanation: todo.explanation || '',
        dependencies: todo.dependencies || [],
        completed: false,
        order: index,
        notes: todo.notes || ''
      }));

      const projectData = {
        name: projectName || prompt || 'Untitled Project',
        description: description || `Generated from prompt: ${prompt}`,
        todos: formattedTodos,
        completed: false,
        createdAt: new Date().toISOString()
      };

      // Add to Firebase and get the project ID
      const projectId = await addProject(projectData);

      // Add to local store
      addProjectToStore({
        ...projectData,
        id: projectId,
      });

      // Reset form and close modal
      setProjectName('');
      setDescription('');
      onClose();

      // Navigate to the project page
      window.location.href = `/project/${projectId}`;
    } catch (error) {
      console.error('Error creating project:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Create Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="projectName" className="block text-sm font-medium">
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder={prompt || "Enter project name"}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-lg h-24 resize-none dark:bg-gray-700 dark:border-gray-600"
              placeholder={`Generated from prompt: ${prompt}`}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
