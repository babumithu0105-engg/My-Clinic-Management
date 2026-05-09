"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  business_ids: Array<{ id: string; role: string }>;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business_ids, setBusinessIds] = useState<Array<{ id: string; role: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // Try to get current user from /api/auth/me
      // This will fail if not authenticated, which is fine
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.email,
          created_at: new Date().toISOString(),
        });
        setBusinessIds(data.business_ids || []);
      }
    } catch (error) {
      // Not authenticated - that's fine
      console.debug("User not authenticated");
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      setUser(null);
      setBusinessIds([]);

      // Redirect to login
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }

  const value: AuthContextType = {
    user,
    business_ids,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 * Must be called from client component within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
