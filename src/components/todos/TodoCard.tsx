import { useState } from 'react';
import { 
  Tag, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  ArrowRight,
  Gauge,
  Link as LinkIcon,
  MoreHorizontal
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProjectStore, type Todo } from '@/store/projectStore';

interface TodoCardProps {
  todo: Todo;
  todos: Todo[];
  onRegenerate: (todoId: string) => void;
  onToggleComplete: (todoId: string) => void;
}

export default function TodoCard({ todo, todos, onRegenerate, onToggleComplete }: TodoCardProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const router = useRouter();
  const { activeProjectId } = useProjectStore();

  const handleRegenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRegenerating(true);
    await onRegenerate(todo.id);
    setIsRegenerating(false);
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleComplete(todo.id);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeProjectId) {
      console.error('No active project selected');
      return;
    }
    router.push(`/todo-detail/${todo.id}`);
  };

  const getDependencyNames = () => {
    return todo.dependencies
      .map(depId => todos.find(t => t.id === depId)?.task)
      .filter(Boolean);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'Medium':
        return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'Low':
        return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      default:
        return 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Hard':
        return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'Medium':
        return 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'Easy':
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="rounded-xl">
      <div className={`bg-white dark:bg-gray-800 rounded-xl border ${
        todo.completed 
          ? 'border-green-200 dark:border-green-800' 
          : 'border-gray-200 dark:border-gray-700'
      } p-6 transition-all`}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium flex items-center gap-1">
            <Tag className="w-4 h-4" />
            {todo.category}
          </span>

          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getPriorityColor(todo.priority)}`}>
            <CheckCircle2 className="w-4 h-4" />
            {todo.priority} Priority
          </span>

          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getDifficultyColor(todo.difficulty)}`}>
            <Gauge className="w-4 h-4" />
            {todo.difficulty}
          </span>

          <span className="px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {todo.time} minutes
          </span>
        </div>

        <div className="mb-3">
          <h3 className={`text-lg font-semibold ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
            {todo.task}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {todo.explanation}
          </p>
        </div>

        {todo.dependencies.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <LinkIcon className="w-4 h-4" />
              <span>Dependencies:</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {getDependencyNames().map((depName, index) => (
                <div
                  key={index}
                  className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-sm flex items-center gap-1"
                >
                  <ArrowRight className="w-3 h-3" />
                  {depName}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleToggleComplete}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
              todo.completed
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {todo.completed ? 'Completed' : 'Mark Complete'}
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>

          <button
            onClick={handleViewDetails}
            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors ml-auto"
          >
            <MoreHorizontal className="w-4 h-4" />
            More Options
          </button>
        </div>
      </div>
    </div>
  );
}
