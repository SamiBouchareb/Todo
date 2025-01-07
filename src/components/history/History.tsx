'use client';

import { useEffect, useState, useCallback } from 'react';
import { getHistoryItems, deleteHistoryItem, type HistoryItem } from '@/lib/firebase/firebaseUtils';
import { AnimatePresence } from 'framer-motion';
import HistoryItemComponent from './HistoryItem';
import HistorySearch from './HistorySearch';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

function isFirestoreTimestamp(timestamp: any): timestamp is FirestoreTimestamp | Timestamp {
  return timestamp && 
    (timestamp instanceof Timestamp || 
    (typeof timestamp === 'object' && 'seconds' in timestamp && 'nanoseconds' in timestamp));
}

export default function History() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const items = await getHistoryItems();
      console.log('Fetched history items:', items);
      
      // Sort items by timestamp
      const sortedItems = items.sort((a, b) => {
        const timeA = isFirestoreTimestamp(a.timestamp) ? 
          a.timestamp.seconds : 
          new Date(a.timestamp as string).getTime() / 1000;
        const timeB = isFirestoreTimestamp(b.timestamp) ? 
          b.timestamp.seconds : 
          new Date(b.timestamp as string).getTime() / 1000;
        return timeB - timeA;
      });

      setHistoryItems(sortedItems);
      setFilteredItems(sortedItems);
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
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredItems(historyItems);
      return;
    }

    const filtered = historyItems.filter(item => {
      const searchStr = `${item.prompt} ${item.todos.map(t => `${t.task} ${t.category}`).join(' ')}`.toLowerCase();
      return searchStr.includes(query.toLowerCase());
    });
    setFilteredItems(filtered);
  }, [historyItems]);

  const handleDelete = async (id: string) => {
    try {
      await deleteHistoryItem(id);
      setHistoryItems(prev => prev.filter(item => item.id !== id));
      setFilteredItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const handleRestore = (prompt: string, todos: any[]) => {
    try {
      // Update the prompt in the textarea
      const textarea = document.querySelector('[name="prompt"]') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = prompt;
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
      }

      // Convert todos to match the dashboard format
      const formattedTodos = todos.map(todo => ({
        ...todo,
        priority: todo.priority || 'Medium',
        difficulty: todo.difficulty || 'Medium',
        category: todo.category || 'General',
        timeEstimate: todo.timeEstimate || todo.time || '30 minutes',
        dependencies: todo.dependencies || [],
        completed: false
      }));

      // Update todos state in the parent component
      if (window.todosStateUpdater) {
        window.todosStateUpdater(formattedTodos);
      }

      // Scroll the textarea into view
      textarea?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      console.error('Error restoring history item:', error);
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500">Sign in to view history</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">History</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        >
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4 space-y-4">
          <HistorySearch onSearch={handleSearch} />

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {searchQuery ? 'No matching history items' : 'No history items yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {filteredItems.map((item) => (
                  <HistoryItemComponent
                    key={item.id}
                    item={item}
                    onRestore={handleRestore}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
