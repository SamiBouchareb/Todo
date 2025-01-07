'use client';

import { useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { motion } from 'framer-motion';
import { FolderOpen, Clock, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { projects, setActiveProject } = useProjectStore();
  const project = projects.find((p) => p.id === params.id);

  useEffect(() => {
    setActiveProject(params.id);
  }, [params.id, setActiveProject]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">
            The project you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Project Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <FolderOpen className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Created on {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="font-medium mb-2">Original Prompt:</h3>
            <p className="text-gray-600 dark:text-gray-400">{project.prompt}</p>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          {project.todos.map((todo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow ${
                todo.completed ? 'border-l-4 border-green-500' : ''
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {todo.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                    todo.priority === 'High'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : todo.priority === 'Medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {todo.priority}
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {todo.time} minutes
                </span>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{todo.task}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {todo.explanation}
                  </p>
                </div>
                <button
                  onClick={() => useProjectStore.getState().toggleTodoCompleted(project.id, index)}
                  className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    todo.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {todo.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
