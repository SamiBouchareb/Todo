import { db, auth, storage } from './firebase';
import {
  signOut,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential
} from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Auth functions
export const signInWithEmailPassword = async (email: string, password: string): Promise<UserCredential> => {
  console.log('Attempting to sign in with:', email);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Sign in successful:', result.user.email);
    return result;
  } catch (error: any) {
    console.error('Error signing in:', error.code, error.message);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  console.log('Attempting to sign out');
  try {
    await signOut(auth);
    console.log('Sign out successful');
  } catch (error: any) {
    console.error('Error signing out:', error.code, error.message);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error logging in with Google:', error);
    throw error;
  }
};

// Firestore functions
export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateDocument = (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

// Project Types
export interface Project {
  id?: string;
  name: string;
  description: string;
  createdAt: any;
  todos: Todo[];
  completed: boolean;
}

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

// Project Functions
export const addProject = async (projectData: Omit<Project, 'id'>) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const projectsRef = collection(db, 'users', userId, 'projects');
    const newProject = {
      ...projectData,
      createdAt: serverTimestamp(),
      todos: projectData.todos || [],
      completed: false,
    };

    const docRef = await addDoc(projectsRef, newProject);
    return docRef.id;
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
};

export const getProjects = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const projectsRef = collection(db, 'users', userId, 'projects');
    const snapshot = await getDocs(projectsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
};

export const getProject = async (projectId: string) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error('Project not found');
    }

    return {
      id: projectDoc.id,
      ...projectDoc.data()
    } as Project;
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
};

export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    await updateDoc(projectRef, updates);
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Todo Functions
export const addTodoToProject = async (projectId: string, todo: Omit<Todo, 'id'>) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const project = await getProject(projectId);
    const newTodo = {
      ...todo,
      id: Math.random().toString(36).substr(2, 9), // Generate a random ID
      completed: false,
    };

    const updatedTodos = [...project.todos, newTodo];
    await updateProject(projectId, { todos: updatedTodos });
    return newTodo;
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
};

export const updateTodoInProject = async (projectId: string, todoId: string, updates: Partial<Todo>) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const project = await getProject(projectId);
    const updatedTodos = project.todos.map(todo => 
      todo.id === todoId ? { ...todo, ...updates } : todo
    );

    await updateProject(projectId, { todos: updatedTodos });
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const deleteTodoFromProject = async (projectId: string, todoId: string) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const project = await getProject(projectId);
    const updatedTodos = project.todos.filter(todo => todo.id !== todoId);

    await updateProject(projectId, { todos: updatedTodos });
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

// History Types
export interface HistoryItem {
  id?: string;
  prompt: string;
  todos: Todo[];
  timestamp: string | { seconds: number; nanoseconds: number } | Timestamp;
  userId: string;
  name: string;
  description: string;
  tags: string[];
}

// History Functions
export const addHistoryItem = async (item: HistoryItem) => {
  const { currentUser } = auth;
  if (!currentUser) throw new Error('User not authenticated');

  const historyCollection = collection(db, 'history');
  const docRef = await addDoc(historyCollection, {
    ...item,
    timestamp: serverTimestamp(),
    userId: currentUser.uid
  });
  return docRef.id;
};

export const getHistoryItems = async () => {
  const { currentUser } = auth;
  if (!currentUser) throw new Error('User not authenticated');

  const historyCollection = collection(db, 'history');
  const q = query(
    historyCollection,
    where('userId', '==', currentUser.uid),
    orderBy('timestamp', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as HistoryItem[];
};

export const updateHistoryItem = async (historyId: string, updates: Partial<HistoryItem>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const historyRef = doc(db, 'history', historyId);
    await updateDoc(historyRef, updates);
  } catch (error) {
    console.error('Error updating history item:', error);
    throw error;
  }
};

export const deleteHistoryItem = async (historyId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const historyRef = doc(db, 'history', historyId);
    await deleteDoc(historyRef);
  } catch (error) {
    console.error('Error deleting history item:', error);
    throw error;
  }
};

// File Storage Functions
export const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
