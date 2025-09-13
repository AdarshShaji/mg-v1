// src/context/AuthContext.tsx (Final, Definitive Version)

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '../lib/types'; // Your custom, detailed User type

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (authUser: SupabaseUser): Promise<User | null> => {
    // Check Admins
    const { data: adminData } = await supabase
      .from('admins')
      .select(`
        id, auth_id, school_id, name, email,
        schools (
          school_unlocked_modules ( module_id )
        )
      `)
      .eq('auth_id', authUser.id)
      .maybeSingle();
      
    if (adminData) {
      const unlocked_modules = adminData.schools?.school_unlocked_modules?.map((m: any) => m.module_id) || [];
      return {
        id: adminData.id,
        auth_id: adminData.auth_id,
        school_id: adminData.school_id,
        name: adminData.name,
        email: adminData.email,
        role: 'admin',
        unlocked_modules
      };
    }

    // Check Teachers
    const { data: teacherData } = await supabase
      .from('teachers')
      .select('id, auth_id, school_id, name, email, status')
      .eq('auth_id', authUser.id)
      .limit(1);

    if (teacherData && teacherData.length > 0) {
      // Logic to fetch unlocked modules for the teacher's school
      const { data: schoolData } = await supabase.from('schools').select('school_unlocked_modules(module_id)').eq('id', teacherData[0].school_id).single();
      const unlocked_modules = schoolData?.school_unlocked_modules?.map((m: any) => m.module_id) || [];
      
      return {
        id: teacherData[0].id,
        auth_id: teacherData[0].auth_id,
        school_id: teacherData[0].school_id,
        name: teacherData[0].name,
        email: teacherData[0].email,
        role: 'teacher',
        status: teacherData[0].status,
        unlocked_modules
      };
    }

    // Check Parents
    const { data: parentData } = await supabase
      .from('parents')
      .select('id, auth_id, name, email')
      .eq('auth_id', authUser.id)
      .limit(1);

    if (parentData && parentData.length > 0) {
      // Parents might not have a single school or modules, or logic can be added here
      return {
        id: parentData[0].id,
        auth_id: parentData[0].auth_id,
        school_id: '',
        name: parentData[0].name,
        email: parentData[0].email,
        role: 'parent',
        unlocked_modules: []
      };
    }

    console.warn("Authenticated user not found in any role table:", authUser.id);
    return null; // User exists in Supabase Auth, but not in our system
  };

  const login = async (email: string, password: string) => {
    // The onAuthStateChange listener will handle setting the user state
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const userData = await fetchUserData(authUser);
      setUser(userData);
    }
  };

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const authUser = session?.user;
        if (authUser) {
          const userData = await fetchUserData(authUser);
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};