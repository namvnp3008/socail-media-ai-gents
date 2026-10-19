'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { insforge } from '@/lib/insforge';

export interface InsForgeUser {
  id: string;
  email: string;
  name?: string;
  profile?: {
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface DbUser {
  id: number;
  authId: string | null;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: InsForgeUser | null;
  dbUser: DbUser | null;
  loading: boolean;
  syncUserWithDb: (userData?: Partial<InsForgeUser>) => Promise<DbUser | null>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  loading: true,
  syncUserWithDb: async () => null,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<InsForgeUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserWithDb = useCallback(async (targetUser?: Partial<InsForgeUser>): Promise<DbUser | null> => {
    const u = targetUser || user;
    if (!u || !u.email) return null;

    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authId: u.id,
          email: u.email,
          name: u.name || u.profile?.name || u.email.split('@')[0],
          avatarUrl: u.profile?.avatar_url || null,
        }),
      });

      if (!res.ok) {
        console.error('Failed to sync user with DB:', await res.text());
        return null;
      }

      const data = await res.json();
      if (data.user) {
        setDbUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.error('Error syncing user with DB:', err);
    }
    return null;
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error || !data?.user) {
        setUser(null);
        setDbUser(null);
      } else {
        const currentUser = data.user as InsForgeUser;
        setUser(currentUser);
        await syncUserWithDb(currentUser);
      }
    } catch (err) {
      console.error('Error getting current user:', err);
      setUser(null);
      setDbUser(null);
    } finally {
      setLoading(false);
    }
  }, [syncUserWithDb]);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (isMounted) {
          if (!error && data?.user) {
            const currentUser = data.user as InsForgeUser;
            setUser(currentUser);
            // Sync user to database
            await syncUserWithDb(currentUser);
          } else {
            setUser(null);
            setDbUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setUser(null);
          setDbUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void initAuth();

    return () => {
      isMounted = false;
    };
  }, [syncUserWithDb]);

  const signOut = useCallback(async () => {
    try {
      await insforge.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setUser(null);
      setDbUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        loading,
        syncUserWithDb,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
