"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string } | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Define protected routes that require authentication
  const protectedRoutes = ['/admin'];
  const isProtectedRoute = protectedRoutes.includes(pathname);

  useEffect(() => {
    // Check authentication status on mount
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    if (authStatus) {
      setUser({ email: 'demo@example.com' });
    } else {
      setUser(null);
    }

    // Only redirect to login if trying to access a protected route while not authenticated
    if (!authStatus && isProtectedRoute) {
      router.push('/login');
    }
  }, [pathname, router, isProtectedRoute]);

  const login = () => {
    setIsAuthenticated(true);
    setUser({ email: 'demo@example.com' });
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 