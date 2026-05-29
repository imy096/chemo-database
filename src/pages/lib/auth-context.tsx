'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Database } from './database.types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

type AppRole =
  | 'platform_admin'
  | 'school_admin'
  | 'secretariat'
  | 'teacher'
  | 'solo_teacher'
  | 'student'
  | string
  | null;

type AppMembership = {
  id: string;
  tenant_id?: string | null;
  school_id?: string | null;
  user_id: string;
  role: AppRole;
  status: string;
  tenant?: any;
  school?: any;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  memberships: AppMembership[];
  currentSchool: AppMembership | null;
  currentTenant: AppMembership | null;
  userRole: AppRole;
  isPlatformAdmin: boolean;
  isSchoolAdmin: boolean;
  isSecretariat: boolean;
  isTeacher: boolean;
  isSoloTeacher: boolean;
  isStudent: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: string, accountType?: string, workspaceName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  setCurrentSchool: (membership: AppMembership) => void;
  setCurrentTenant: (membership: AppMembership) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getMembershipRole(membership: AppMembership | null, profile: UserProfile | null): AppRole {
  if (membership?.role) return membership.role;
  return ((profile as any)?.role || null) as AppRole;
}

export function getDashboardPathByRole(role: AppRole) {
  switch (role) {
    case 'platform_admin':
      return '/dashboard/platform-admin';
    case 'school_admin':
      return '/dashboard/admin';
    case 'secretariat':
      return '/dashboard/secretariat';
    case 'teacher':
    case 'solo_teacher':
      return '/dashboard';
    case 'student':
      return '/dashboard/student';
    default:
      return '/dashboard';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memberships, setMemberships] = useState<AppMembership[]>([]);
  const [currentTenant, setCurrentTenant] = useState<AppMembership | null>(null);
  const [currentSchool, setCurrentSchool] = useState<AppMembership | null>(null);
  const [loading, setLoading] = useState(true);

  const loadedUserIdRef = useRef<string | null>(null);

  const userRole = getMembershipRole(currentTenant || currentSchool, profile);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const currentSession = data.session;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await loadUserData(currentSession.user.id);
      } else {
        clearAuthState();
        setLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (!currentSession?.user) {
        loadedUserIdRef.current = null;
        clearAuthState();
        setLoading(false);
        return;
      }

      if (
        event === 'SIGNED_IN' ||
        event === 'USER_UPDATED' ||
        loadedUserIdRef.current !== currentSession.user.id
      ) {
        await loadUserData(currentSession.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearAuthState = () => {
    setProfile(null);
    setMemberships([]);
    setCurrentTenant(null);
    setCurrentSchool(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentTenantId');
      localStorage.removeItem('currentSchoolId');
    }
  };

  const loadUserData = async (userId: string) => {
    if (loadedUserIdRef.current === userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      setProfile(profileData || null);

      const { data: tenantMembershipData, error: tenantMembershipError } = await supabase
        .from('tenant_memberships')
        .select(`
          id,
          tenant_id,
          user_id,
          role,
          status,
          tenant:tenants (
            id,
            name,
            slug,
            tenant_type,
            subscription_plan,
            subscription_status,
            owner_user_id
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (tenantMembershipError) throw tenantMembershipError;

      let rows = ((tenantMembershipData || []) as any[]) as AppMembership[];

      if (rows.length === 0) {
        const { data: schoolMembershipData, error: schoolMembershipError } = await supabase
          .from('school_memberships')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active');

        if (schoolMembershipError) throw schoolMembershipError;

        rows = ((schoolMembershipData || []) as any[]) as AppMembership[];
      }

      setMemberships(rows);

      if (rows.length > 0) {
        const savedTenantId =
          typeof window !== 'undefined' ? localStorage.getItem('currentTenantId') : null;

        const savedSchoolId =
          typeof window !== 'undefined' ? localStorage.getItem('currentSchoolId') : null;

        const current =
          rows.find((m) => m.tenant_id && m.tenant_id === savedTenantId) ||
          rows.find((m) => m.school_id && m.school_id === savedSchoolId) ||
          rows[0];

        setCurrentTenant(current);
        setCurrentSchool(current);
      } else {
        setCurrentTenant(null);
        setCurrentSchool(null);
      }

      loadedUserIdRef.current = userId;
    } catch (error) {
      console.error('Error loading user data:', error);
      setMemberships([]);
      setCurrentTenant(null);
      setCurrentSchool(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role = 'student',
    accountType = 'student',
    workspaceName = ''
  ) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          account_type: accountType,
          workspace_name: workspaceName,
          needs_onboarding: role !== 'student',
        },
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    loadedUserIdRef.current = null;
    await supabase.auth.signOut();
    clearAuthState();
  };

  const handleSetCurrentTenant = (membership: AppMembership) => {
    setCurrentTenant(membership);
    setCurrentSchool(membership);

    if (typeof window !== 'undefined') {
      if (membership.tenant_id) {
        localStorage.setItem('currentTenantId', membership.tenant_id);
      }

      if (membership.school_id) {
        localStorage.setItem('currentSchoolId', membership.school_id);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        memberships,
        currentSchool,
        currentTenant,
        userRole,
        isPlatformAdmin: userRole === 'platform_admin',
        isSchoolAdmin: userRole === 'school_admin',
        isSecretariat: userRole === 'secretariat',
        isTeacher: userRole === 'teacher' || userRole === 'solo_teacher',
        isSoloTeacher: userRole === 'solo_teacher',
        isStudent: userRole === 'student',
        loading,
        signIn,
        signUp,
        signOut,
        setCurrentSchool: handleSetCurrentTenant,
        setCurrentTenant: handleSetCurrentTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}