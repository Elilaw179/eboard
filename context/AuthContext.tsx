'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AdminUser, subscribeToAuth, loginWithEmail, logoutUser } from '@/lib/firebase/auth';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, pass: string, roleHint?: 'staff' | 'admin') => Promise<AdminUser>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ uid: '', email: null, displayName: null, role: 'admin' }),
  logout: async () => {},
  isAuthenticated: false,
  isAdmin: false,
  isStaff: false,
});

// Detect synchronous localStorage session so we never start in a loading state
function getInitialUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('eboard_demo_auth_session');
    if (raw) {
      const parsed = JSON.parse(raw) as AdminUser;
      if (!parsed.role) parsed.role = 'admin'; // back-compat for old sessions
      return parsed;
    }
  } catch {}
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialUser = useRef(getInitialUser());
  const [user, setUser] = useState<AdminUser | null>(initialUser.current);
  const [loading, setLoading] = useState(!initialUser.current);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (
    email: string,
    pass: string,
    roleHint?: 'staff' | 'admin'
  ): Promise<AdminUser> => {
    setLoading(true);
    try {
      const loggedUser = await loginWithEmail(email, pass, roleHint);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
