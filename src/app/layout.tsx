import './globals.css';
import { Inter } from 'next/font/google';
import SidebarWrapper from '@/components/SidebarWrapper';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Todo Projects',
  description: 'Generate and manage your todo lists with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <SidebarWrapper />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
