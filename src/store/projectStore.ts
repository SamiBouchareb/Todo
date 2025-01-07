import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Todo {
  id: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time: string;
  task: string;
  explanation: string;
  dependencies: string[];
  completed: boolean;
  order: number;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  todos: Todo[];
  completed: boolean;
  prompt?: string;
}

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Omit<Project, 'id'>>) => void;
  setActiveProject: (projectId: string) => void;
  toggleTodoCompleted: (todoId: string) => void;
  getProject: (projectId: string) => Project | undefined;
  getTodoById: (todoId: string) => Todo | undefined;
  updateTodoNotes: (todoId: string, notes: string) => void;
  regenerateTodo: (todoId: string, newTodoData: Partial<Todo>) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      addProject: (project) => set((state) => {
        const existingIndex = state.projects.findIndex(p => p.id === project.id);
        if (existingIndex >= 0) {
          // Update existing project
          const updatedProjects = [...state.projects];
          updatedProjects[existingIndex] = project;
          return { projects: updatedProjects };
        }
        // Add new project
        return { projects: [...state.projects, project] };
      }),
      updateProject: (projectId, updates) => set((state) => ({
        projects: state.projects.map(p => 
          p.id === projectId ? { ...p, ...updates } : p
        ),
      })),
      setActiveProject: (projectId) => set({ activeProjectId: projectId }),
      toggleTodoCompleted: (todoId) =>
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            todos: project.todos.map((todo) =>
              todo.id === todoId
                ? { ...todo, completed: !todo.completed }
                : todo
            ),
          })),
        })),
      getProject: (projectId) => get().projects.find((p) => p.id === projectId),
      getTodoById: (todoId) => {
        for (const project of get().projects) {
          const todo = project.todos.find((t) => t.id === todoId);
          if (todo) return todo;
        }
        return undefined;
      },
      updateTodoNotes: (todoId, notes) => set((state) => ({
        projects: state.projects.map((project) => ({
          ...project,
          todos: project.todos.map((todo) =>
            todo.id === todoId ? { ...todo, notes } : todo
          ),
        })),
      })),
      regenerateTodo: (todoId, newTodoData) => set((state) => ({
        projects: state.projects.map((project) => ({
          ...project,
          todos: project.todos.map((todo) =>
            todo.id === todoId
              ? { ...todo, ...newTodoData }
              : todo
          ),
        })),
      })),
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
