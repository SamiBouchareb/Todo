'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { auth } from '@/lib/firebase/firebase';
import { addHistoryItem } from '@/lib/firebase/firebaseUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History as HistoryIcon, 
  X,
  Search,
  Plus,
  Minus,
  Command,
  Clock,
  Sparkles,
  FolderPlus
} from 'lucide-react';
import History from '@/components/history/History';
import ProjectCreationModal from '@/components/modals/ProjectCreationModal';
import { useProjectStore, type Todo, type Project } from '@/store/projectStore';
import TodoCard from '@/components/todos/TodoCard';
import { v4 as uuidv4 } from 'uuid';

interface GeneratedTodo {
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeEstimate: string;
  description: string;
  dependencies: string[];
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [maxTodos, setMaxTodos] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const { user } = useAuth();
  
  const { projects, activeProjectId, addProject, setActiveProject } = useProjectStore();
  const currentProject = projects.find(p => p.id === activeProjectId);
  const todos = currentProject?.todos || [];

  useEffect(() => {
    // Create a default project if none exists
    if (projects.length === 0) {
      const defaultProject: Project = {
        id: uuidv4(),
        name: 'My First Project',
        description: 'Default project for your todos',
        createdAt: new Date().toISOString(),
        todos: [],
        completed: false,
        prompt: 'Default project'
      };
      addProject(defaultProject);
      setActiveProject(defaultProject.id);
    }
  }, [projects, addProject, setActiveProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (!currentProject) {
      setError('Please select or create a project first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTodos }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate todos');
      }

      const data = await response.json();
      const generatedTodos: Todo[] = data.todos.map((todo: GeneratedTodo) => ({
        id: uuidv4(),
        task: todo.title,
        category: todo.category || 'General',
        priority: todo.priority || 'Medium',
        difficulty: todo.difficulty || 'Medium',
        time: todo.timeEstimate || '30',
        explanation: todo.description || '',
        dependencies: todo.dependencies || [],
        completed: false,
        order: todos.length + 1,
      }));

      if (!currentProject) {
        const newProject: Project = {
          id: uuidv4(),
          name: 'Generated Project',
          description: 'Project generated from prompt',
          createdAt: new Date().toISOString(),
          todos: generatedTodos,
          completed: false,
          prompt: prompt
        };
        addProject(newProject);
        setActiveProject(newProject.id);
      } else {
        // Add todos to the current project
        const updatedProject: Project = {
          id: currentProject.id,
          name: currentProject.name,
          description: currentProject.description,
          createdAt: currentProject.createdAt,
          completed: currentProject.completed,
          prompt: currentProject.prompt || prompt,
          todos: [...currentProject.todos, ...generatedTodos]
        };
        addProject(updatedProject);
      }

      if (auth.currentUser) {
        try {
          const promptWords = prompt.split(' ').slice(0, 5).join(' ');
          const timestamp = new Date().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          const historyItem = {
            prompt,
            todos: generatedTodos,
            timestamp: new Date().toISOString(),
            userId: auth.currentUser.uid,
            name: `${promptWords}... (${timestamp})`,
            description: `Generated ${generatedTodos.length} todos for: ${prompt}`,
            tags: generatedTodos
              .map((todo: Todo) => todo.category)
              .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
          };
          
          await addHistoryItem(historyItem);
        } catch (err) {
          console.error('Failed to save to history:', err);
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to generate todos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="flex-none px-6 py-4 bg-white dark:bg-gray-800 shadow-sm">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What project would you like help breaking down?"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-xs text-gray-400">
                <Command className="w-4 h-4 mr-1" /> + Enter
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
              <button
                type="button"
                onClick={() => setMaxTodos(Math.max(5, maxTodos - 5))}
                className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex items-center gap-1 px-2 py-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{maxTodos}</span>
              </span>
              <button
                type="button"
                onClick={() => setMaxTodos(Math.min(20, maxTodos + 5))}
                className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              {loading ? 'Generating...' : 'Generate'}
            </button>

            {user && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className={`p-3 rounded-xl transition-colors ${
                  showHistory
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <HistoryIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          {error && (
            <div className="mt-3 text-sm text-red-500 flex items-center gap-2">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Todos Section */}
          <div className={`flex-1 p-6 overflow-y-auto transition-all ${showHistory ? 'w-2/3' : 'w-full'}`}>
            <div className="max-w-5xl mx-auto space-y-4">
              <AnimatePresence mode="popLayout">
                {todos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 gap-4"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Generated Todos</h2>
                    </div>
                    {todos.map((todo, index) => (
                      <motion.div
                        key={todo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <TodoCard
                          todo={todo}
                          todos={todos}
                          onRegenerate={async (todoId) => {
                            try {
                              const todoToRegenerate = todos.find(t => t.id === todoId);
                              if (!todoToRegenerate || !currentProject) return;

                              // Call API to regenerate todo
                              const response = await fetch('/api/todos', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ prompt: todoToRegenerate.task, maxTodos: 1 }),
                              });
                              
                              if (!response.ok) throw new Error('Failed to regenerate todo');
                              
                              const data = await response.json();
                              const newTodo = data.todos[0];
                              
                              if (!currentProject) {
                                console.error('No active project found');
                                return;
                              }

                              const updatedProject: Project = {
                                id: currentProject.id,
                                name: currentProject.name,
                                description: currentProject.description,
                                createdAt: currentProject.createdAt,
                                completed: currentProject.completed,
                                prompt: currentProject.prompt || '',
                                todos: todos.map(t => 
                                  t.id === todoId ? {
                                    ...t,
                                    task: newTodo.title || t.task,
                                    category: newTodo.category || t.category,
                                    priority: newTodo.priority || t.priority,
                                    difficulty: newTodo.difficulty || t.difficulty,
                                    time: newTodo.timeEstimate || t.time,
                                    explanation: newTodo.description || t.explanation,
                                  } : t
                                )
                              };
                              addProject(updatedProject);
                            } catch (error) {
                              console.error('Error regenerating todo:', error);
                            }
                          }}
                          onToggleComplete={(todoId) => {
                            if (!currentProject) {
                              console.error('No active project found');
                              return;
                            }

                            const updatedProject: Project = {
                              id: currentProject.id,
                              name: currentProject.name,
                              description: currentProject.description,
                              createdAt: currentProject.createdAt,
                              completed: currentProject.completed,
                              prompt: currentProject.prompt || '',
                              todos: todos.map(t => 
                                t.id === todoId ? { ...t, completed: !t.completed } : t
                              )
                            };
                            addProject(updatedProject);
                          }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {!todos.length && !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
                      <Sparkles className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-medium mb-2">Start Your Project</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      Enter your project idea above and let AI help you break it down into manageable tasks.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* History Panel */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '33.333333%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex-none border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-medium">History</h2>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <History />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Project Creation Modal */}
      <ProjectCreationModal
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        prompt={prompt}
        todos={todos}
      />
    </div>
  );
}
