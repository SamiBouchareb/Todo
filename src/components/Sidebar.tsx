'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, LogIn, LogOut, User as UserIcon, History as HistoryIcon } from 'lucide-react';
import { signInWithEmailPassword, logoutUser } from '@/lib/firebase/firebaseUtils';
import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path;

  const handleLogin = async () => {
    setError(null);
    try {
      console.log('Starting login process...');
      setIsLoggingIn(true);
      // Using test account credentials
      const email = 'test@gmail.com';
      const password = '123456789';
      console.log('Attempting to sign in with:', email);
      await signInWithEmailPassword(email, password);
    } catch (error: any) {
      console.error('Login error:', error.code, error.message);
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(error.message || 'Failed to login');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      console.log('Starting logout process...');
      await logoutUser();
    } catch (error: any) {
      console.error('Logout error:', error.code, error.message);
      setError(error.message || 'Failed to logout');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-64">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
          <h1 className="text-xl font-bold">Todo Projects</h1>
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        {loading ? (
          <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-800 rounded" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <UserIcon className="w-8 h-8 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.email}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
            {error && (
              <p className="text-xs text-red-500 text-center">
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-none p-4 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            isActive('/') 
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Home className="w-5 h-5" />
          Dashboard
        </Link>

        <Link
          href="/settings"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            isActive('/settings')
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </nav>
    </div>
  );
}
