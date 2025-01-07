import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">404 - Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}
