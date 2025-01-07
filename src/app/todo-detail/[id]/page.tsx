'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  FileText,
  Brain,
  Target,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  List,
  MessageSquare,
  Share2,
  Timer,
  Wand2,
  ChevronRight,
  CheckCircle,
  Circle,
  Clock4,
  ArrowRight,
  Flag,
  Milestone,
  ListTodo,
} from 'lucide-react';
import type { Todo } from '@/store/projectStore';
import { useProjectStore } from '@/store/projectStore';
import AIChatbot from '@/components/AIChatbot';

interface MasterplanStep {
  title: string;
  description: string;
  estimatedTime: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed';
  subTasks?: string[];
  milestones?: string[];
  resources?: string[];
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors = {
    High: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    Low: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors]}`}>
      {priority} Priority
    </span>
  );
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'Completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'In Progress':
      return <Clock4 className="w-5 h-5 text-yellow-500" />;
    default:
      return <Circle className="w-5 h-5 text-gray-400" />;
  }
};

export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [masterplan, setMasterplan] = useState<MasterplanStep[]>([]);
  const [isGeneratingMasterplan, setIsGeneratingMasterplan] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get todo from Zustand store
  const { getTodoById, updateTodoNotes } = useProjectStore();
  const todo = getTodoById(params.id as string);

  useEffect(() => {
    if (todo) {
      setNotes(todo.notes || '');
      setError(null);
    } else {
      setError('Todo not found');
    }
  }, [todo]);

  const handleGenerateMasterplan = async () => {
    if (!todo) return;

    setIsGeneratingMasterplan(true);
    setError(null);

    try {
      const response = await fetch('/api/masterplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: todo.task,
          description: todo.explanation,
          category: todo.category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate masterplan');
      }

      const data = await response.json();
      setMasterplan(data.steps);
      setIsChatbotOpen(true); // Open chatbot after masterplan is generated
    } catch (err) {
      console.error('Error generating masterplan:', err);
      setError('Failed to generate masterplan');
    } finally {
      setIsGeneratingMasterplan(false);
    }
  };

  const handleUpdateNotes = (newNotes: string) => {
    setNotes(newNotes);
    if (todo) {
      updateTodoNotes(todo.id, newNotes);
    }
  };

  const parseMasterplanSteps = (content: any) => {
    if (typeof content === 'string') {
      try {
        // Remove any "json" prefix and backticks if present
        const cleanContent = content.replace(/^```json/, '').replace(/```$/, '').trim();
        return JSON.parse(cleanContent).steps;
      } catch (error) {
        console.error('Error parsing masterplan:', error);
        return [];
      }
    }
    return content;
  };

  const renderMasterplanContent = () => {
    const steps = parseMasterplanSteps(masterplan);

    return (
      <div className="space-y-8 px-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Masterplan</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              A detailed step-by-step plan to accomplish your task
            </p>
          </div>
          <button
            onClick={handleGenerateMasterplan}
            disabled={isGeneratingMasterplan}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isGeneratingMasterplan ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Create Masterplan
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {Array.isArray(steps) && steps.map((step: MasterplanStep, index: number) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              {/* Step Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 font-semibold">{index + 1}</span>
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                </div>
                <PriorityBadge priority={step.priority} />
              </div>

              {/* Step Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-4 pl-12">
                {step.description}
              </p>

              {/* Step Details */}
              <div className="pl-12 space-y-4">
                {/* Time and Status */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {step.estimatedTime}
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Circle className="w-4 h-4 mr-1" />
                    {step.status}
                  </div>
                </div>

                {/* Sub-tasks */}
                {step.subTasks && step.subTasks.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Sub-tasks:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {step.subTasks.map((task: string, i: number) => (
                        <li key={i} className="text-gray-600 dark:text-gray-300 text-sm">{task}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Milestones */}
                {step.milestones && step.milestones.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Milestones:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {step.milestones.map((milestone: string, i: number) => (
                        <li key={i} className="text-gray-600 dark:text-gray-300 text-sm">{milestone}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resources */}
                {step.resources && step.resources.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Resources:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {step.resources.map((resource: string, i: number) => (
                        <li key={i} className="text-gray-600 dark:text-gray-300 text-sm">{resource}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Todo Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The todo you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{todo.task}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {todo.explanation}
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                  {todo.category}
                </span>
                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium">
                  {todo.priority} Priority
                </span>
                <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                  {todo.difficulty}
                </span>
                <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium">
                  {todo.time} minutes
                </span>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'masterplan', label: 'Masterplan', icon: Brain },
            { id: 'progress', label: 'Progress', icon: BarChart2 },
            { id: 'notes', label: 'Notes', icon: MessageSquare },
            { id: 'share', label: 'Share', icon: Share2 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedTab === id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-8">
            {selectedTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold mb-4">Task Overview</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Target className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Objective</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {todo.explanation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Timer className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Time Management</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Estimated time: {todo.time} minutes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <List className="w-5 h-5 text-purple-500 mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Dependencies</h3>
                      {todo.dependencies.length > 0 ? (
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                          {todo.dependencies.map((dep: string, index: number) => (
                            <li key={index}>{dep}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">
                          No dependencies
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'masterplan' && renderMasterplanContent()}

            {selectedTab === 'notes' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold mb-4">Notes & Thoughts</h2>
                <textarea
                  value={notes}
                  onChange={(e) => handleUpdateNotes(e.target.value)}
                  placeholder="Add your notes here..."
                  className="w-full h-64 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </motion.div>
            )}
          </div>

          {/* Right Column - Progress & Stats */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-4">Progress</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    todo.completed
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {todo.completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Priority</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {todo.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Difficulty</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {todo.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Time Estimate</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {todo.time} minutes
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button (only shows when chatbot is closed and masterplan exists) */}
      {!isChatbotOpen && masterplan.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}

      {/* AI Chatbot */}
      <AIChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        masterplanContext={JSON.stringify(masterplan, null, 2)}
      />
    </div>
  );
}
