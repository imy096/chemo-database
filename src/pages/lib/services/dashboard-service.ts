import { supabase } from '@/lib/supabase';

export async function getStudentDashboardData(studentId: string) {
  const [enrollments, submissions, attendance, invoices] = await Promise.all([
    supabase
      .from('enrollments')
      .select(`
        id,
        classes!inner(
          id,
          name,
          assignments(id, title, due_date, max_points, assignment_type)
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'active'),
    supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignments(id, title, max_points, due_date)
      `)
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false })
      .limit(10),
    supabase
      .from('attendance')
      .select('status, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('invoices')
      .select('id, invoice_number, total_amount, status, due_date')
      .eq('student_id', studentId)
      .in('status', ['sent', 'overdue', 'pending'])
      .order('due_date', { ascending: true }),
  ]);

  const assignments: any[] = [];
  enrollments.data?.forEach((enrollment: any) => {
    enrollment.classes?.assignments?.forEach((assignment: any) => {
      assignments.push(assignment);
    });
  });

  const submissionMap = new Map(submissions.data?.map((s) => [s.assignment_id, s]) || []);

  const upcomingAssignments = assignments
    .filter((a) => new Date(a.due_date) >= new Date())
    .filter((a) => !submissionMap.has(a.id) || submissionMap.get(a.id)?.status !== 'graded')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  const recentGrades = submissions.data?.filter((s) => s.status === 'graded').slice(0, 5) || [];

  const attendanceRecords = attendance.data || [];
  const presentCount = attendanceRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = attendanceRecords.length > 0 ? (presentCount / attendanceRecords.length) * 100 : 0;

  const overdueInvoices = invoices.data?.filter((inv) => inv.status === 'overdue') || [];
  const unpaidInvoices = invoices.data || [];

  return {
    upcomingAssignments,
    recentGrades,
    attendanceRate,
    overdueInvoices,
    unpaidInvoices,
  };
}

export async function getTeacherDashboardData(teacherId: string) {
  const today = new Date().toISOString().split('T')[0];

  const [classes, sessions, submissions] = await Promise.all([
    supabase
      .from('classes')
      .select(`
        id,
        name,
        capacity,
        enrollments(id, status),
        assignments(id)
      `)
      .eq('teacher_id', teacherId)
      .in('status', ['scheduled', 'in_progress']),
    supabase
      .from('class_sessions')
      .select(`
        id,
        start_time,
        end_time,
        scheduled_date,
        classes!inner(name, teacher_id)
      `)
      .eq('classes.teacher_id', teacherId)
      .eq('scheduled_date', today)
      .order('start_time', { ascending: true }),
    supabase
      .from('assignment_submissions')
      .select(`
        id,
        submitted_at,
        assignments!inner(
          id,
          class_id,
          classes!inner(teacher_id)
        ),
        students!inner(
          user_profiles:user_id(full_name)
        )
      `)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: true }),
  ]);

  const teacherSubmissions =
    submissions.data?.filter((s: any) => s.assignments?.classes?.teacher_id === teacherId) || [];

  const classStats = classes.data?.map((cls: any) => ({
    id: cls.id,
    name: cls.name,
    enrolled: cls.enrollments?.filter((e: any) => e.status === 'active').length || 0,
    capacity: cls.capacity,
    assignments: cls.assignments?.length || 0,
  }));

  return {
    todaySessions: sessions.data || [],
    pendingGrading: teacherSubmissions.slice(0, 10),
    classStats: classStats || [],
  };
}

export async function getSchoolAdminDashboardData(schoolId: string) {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const futureDate = thirtyDaysFromNow.toISOString().split('T')[0];

  const [invoices, classes, enrollments, riskFlags] = await Promise.all([
    supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        total_amount,
        status,
        due_date,
        students!inner(
          id,
          user_profiles:user_id(full_name)
        )
      `)
      .eq('school_id', schoolId)
      .eq('status', 'overdue')
      .order('due_date', { ascending: true }),
    supabase
      .from('classes')
      .select(`
        id,
        name,
        capacity,
        end_date,
        enrollments!inner(id, status)
      `)
      .eq('school_id', schoolId)
      .in('status', ['scheduled', 'in_progress']),
    supabase
      .from('enrollments')
      .select(`
        id,
        students!inner(
          id,
          user_profiles:user_id(full_name)
        ),
        classes!inner(
          id,
          name,
          end_date
        )
      `)
      .eq('status', 'active')
      .lte('classes.end_date', futureDate),
    supabase
      .from('risk_flags')
      .select(`
        id,
        flag_type,
        severity,
        students!inner(
          id,
          school_id,
          user_profiles:user_id(full_name)
        )
      `)
      .eq('students.school_id', schoolId)
      .eq('resolved', false)
      .order('created_at', { ascending: false }),
  ]);

  const underfilledClasses =
    classes.data
      ?.map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        enrolled: cls.enrollments?.filter((e: any) => e.status === 'active').length || 0,
        capacity: cls.capacity,
      }))
      .filter((cls) => cls.enrolled < cls.capacity * 0.5)
      .sort((a, b) => a.enrolled / a.capacity - b.enrolled / b.capacity) || [];

  return {
    overdueInvoices: invoices.data || [],
    atRiskStudents: riskFlags.data || [],
    underfilledClasses: underfilledClasses.slice(0, 5),
    renewalOpportunities: enrollments.data || [],
  };
}
