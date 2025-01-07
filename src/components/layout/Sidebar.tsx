import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderOpen, History, Settings, Home, LucideIcon } from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/' },
  { label: 'History', icon: History, href: '/history' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { projects, activeProjectId, setActiveProject } = useProjectStore();

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">AI</span>
          </div>
          <span className="font-semibold text-xl">Todo Projects</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-6">
          {/* Main Nav Items */}
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Main</div>
            <ul className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Projects */}
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Projects</div>
            <div className="space-y-1">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    project.id === activeProjectId
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setActiveProject(project.id)}
                >
                  <FolderOpen className={`w-5 h-5 ${
                    project.id === activeProjectId ? 'text-blue-600 dark:text-blue-400' : ''
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{project.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Dark Mode Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => document.documentElement.classList.toggle('dark')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>Toggle Theme</span>
        </button>
      </div>
    </div>
  );
}
