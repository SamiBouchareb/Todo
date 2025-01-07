import type { Todo } from '@/store/projectStore';

declare global {
  interface Window {
    todosStateUpdater: (todos: Todo[]) => void;
  }
}
