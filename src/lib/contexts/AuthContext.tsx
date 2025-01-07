"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user?.email || 'No user');
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}
