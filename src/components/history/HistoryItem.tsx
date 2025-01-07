'use client';

import { motion } from 'framer-motion';
import { Clock, Trash2, RefreshCw, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { HistoryItem as HistoryItemType } from '@/lib/firebase/firebaseUtils';
import TodoCard from '@/components/todos/TodoCard';
import { Timestamp } from 'firebase/firestore';

interface HistoryItemProps {
  item: HistoryItemType;
  onRestore: (prompt: string, todos: any[]) => void;
  onDelete: (id: string) => void;
}

export default function HistoryItem({ item, onRestore, onDelete }: HistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      const date = new Date(timestamp.seconds * 1000);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }
    return new Date(timestamp).toLocaleString();
  };

  const handleRestore = () => {
    onRestore(item.prompt, item.todos);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {item.name || item.prompt}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRestore();
              }}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500 transition-colors"
              title="Restore this prompt"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id!);
              }}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete from history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{formatDate(item.timestamp)}</span>
          <span>•</span>
          <span>{item.todos.length} todos</span>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        className="overflow-hidden bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="p-4 space-y-3">
          {item.todos.map((todo, index) => (
            <TodoCard
              key={todo.id || index}
              todo={todo}
              todos={item.todos}
              onRegenerate={() => {}}
              onToggleComplete={() => {}}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
