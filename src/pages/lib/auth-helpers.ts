import { Database } from './database.types';

type UserRole = Database['public']['Tables']['user_profiles']['Row']['role'];
type MembershipRole = Database['public']['Tables']['school_memberships']['Row']['role'];

export function canAccessSuperAdmin(userRole: UserRole): boolean {
  return userRole === 'super_admin';
}

export function canAccessSchoolAdmin(membershipRole: MembershipRole): boolean {
  return membershipRole === 'school_admin';
}

export function canAccessTeacher(membershipRole: MembershipRole): boolean {
  return membershipRole === 'teacher' || membershipRole === 'school_admin';
}

export function canAccessStudent(membershipRole: MembershipRole): boolean {
  return membershipRole === 'student';
}

export function getRoleName(role: UserRole | MembershipRole): string {
  const roleNames: Record<string, string> = {
    super_admin: 'Super Admin',
    school_admin: 'School Admin',
    teacher: 'Teacher',
    student: 'Student',
  };
  return roleNames[role] || role;
}

export function getRoleColor(role: UserRole | MembershipRole): string {
  const roleColors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-800',
    school_admin: 'bg-blue-100 text-blue-800',
    teacher: 'bg-green-100 text-green-800',
    student: 'bg-gray-100 text-gray-800',
  };
  return roleColors[role] || 'bg-gray-100 text-gray-800';
}
