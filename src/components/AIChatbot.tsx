'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Maximize2, Minimize2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as Accordion from '@radix-ui/react-accordion';
import * as Separator from '@radix-ui/react-separator';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  masterplanContext?: string;
  onMinimize?: () => void;
}

const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
        h4: ({ children }) => <h4 className="text-base font-bold mb-2">{children}</h4>,
        p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic bg-blue-50 dark:bg-blue-900/20 py-2 rounded">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono">
            {children}
          </code>
        ),
        strong: ({ children }) => <strong className="font-bold text-blue-600 dark:text-blue-400">{children}</strong>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default function AIChatbot({ isOpen, onClose, masterplanContext, onMinimize }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestions] = useState([
    "How can I break down this step further?",
    "What resources do I need for this task?",
    "How long should this step take?",
    "What are the potential challenges?",
  ]);

  useEffect(() => {
    if (masterplanContext && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I\'m your AI assistant for this masterplan. I can help you understand the steps, provide additional details, or answer any questions you have. Feel free to ask about specific steps or the overall plan!',
          timestamp: new Date(),
        }
      ]);
    }
  }, [masterplanContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: masterplanContext
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`fixed right-4 ${isMinimized ? 'bottom-4' : 'top-4 bottom-4'} w-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
            {messages.map((message, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[90%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Bot className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div
                      className={`rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="leading-relaxed">{message.content}</p>
                      ) : (
                        <MarkdownContent content={message.content} />
                      )}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 px-2">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </>
      )}
    </motion.div>
  );
}
