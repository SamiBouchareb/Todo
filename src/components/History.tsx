'use client';

import { useEffect, useState } from 'react';
import { getHistoryItems } from '@/lib/firebase/firebaseUtils';
import type { HistoryItem } from '@/lib/firebase/firebaseUtils';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjectStore, type Todo } from '@/store/projectStore';

export default function History() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        setError(null);
        const items = await getHistoryItems();
        console.log('Fetched history items:', items);
        setHistoryItems(items);
      } catch (error: any) {
        console.error('Error fetching history:', error);
        if (error.message.includes('requires an index')) {
          setError('Setting up history view... This may take a few minutes.');
        } else {
          setError('Failed to load history items');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const handleHistoryClick = (prompt: string, historyTodos: any[]) => {
    try {
      // First, update the prompt in the textarea
      const textarea = document.querySelector('[name="prompt"]') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = prompt;
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
      }

      // Convert history todos to the expected format
      const formattedTodos: Todo[] = historyTodos.map((todo, index) => ({
        id: `todo-${index}`,
        task: todo.task || todo.title,
        category: todo.category || 'General',
        priority: todo.priority || 'Medium',
        difficulty: todo.difficulty || 'Medium',
        time: todo.timeEstimate || todo.time || '1 hour',
        explanation: todo.description || todo.explanation || '',
        dependencies: todo.dependencies || [],
        completed: false,
        order: index,
        notes: '',
      }));

      // Update the todos state in the parent component
      if (window.todosStateUpdater) {
        window.todosStateUpdater(formattedTodos);
      }

      // Scroll the textarea into view
      textarea?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      console.error('Error restoring history item:', error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    if (timestamp.seconds) {
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

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="animate-pulse h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (historyItems.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500">No history items yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">History</h3>
      <div className="space-y-2">
        {historyItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            onClick={() => handleHistoryClick(item.prompt, item.todos)}
          >
            <Clock className="w-4 h-4 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.prompt}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(item.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
