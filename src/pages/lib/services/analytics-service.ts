import { supabase } from '@/lib/supabase';

export interface AnalyticsData {
  students: any[];
  classes: any[];
  enrollments: any[];
  invoices: any[];
  payments: any[];
  attendance: any[];
}

export interface AnalyticsMetrics {
  totalStudents: number;
  activeStudents: number;
  totalClasses: number;
  averageUtilization: number;
  totalRevenue: number;
  overdueAmount: number;
  attendanceRate: number;
  enrollmentGrowth: number;
}

export async function fetchAnalyticsData(schoolId: string): Promise<AnalyticsData> {
  const [studentsResult, classesResult, enrollmentsResult, invoicesResult, paymentsResult, attendanceResult] =
    await Promise.all([
      supabase.from('students').select('id, status').eq('school_id', schoolId),
      supabase
        .from('classes')
        .select('id, name, capacity, status')
        .eq('school_id', schoolId)
        .in('status', ['scheduled', 'in_progress']),
      supabase
        .from('enrollments')
        .select('id, class_id, student_id, status, enrollment_date')
        .eq('status', 'active'),
      supabase
        .from('invoices')
        .select('id, total_amount, status, due_date, paid_date, student_id')
        .eq('school_id', schoolId),
      supabase.from('payments').select('id, amount, status, payment_date').eq('school_id', schoolId),
      supabase.from('attendance').select('id, status, created_at'),
    ]);

  return {
    students: studentsResult.data || [],
    classes: classesResult.data || [],
    enrollments: enrollmentsResult.data || [],
    invoices: invoicesResult.data || [],
    payments: paymentsResult.data || [],
    attendance: attendanceResult.data || [],
  };
}

export function calculateMetrics(data: AnalyticsData): AnalyticsMetrics {
  const activeStudents = data.students.filter((s) => s.status === 'active').length;

  const classUtilization = data.classes.map((cls) => {
    const enrolled = data.enrollments.filter((e) => e.class_id === cls.id).length;
    return cls.capacity > 0 ? (enrolled / cls.capacity) * 100 : 0;
  });
  const averageUtilization =
    classUtilization.length > 0 ? classUtilization.reduce((sum, u) => sum + u, 0) / classUtilization.length : 0;

  const totalRevenue = data.payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueAmount = data.invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const presentCount = data.attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = data.attendance.length > 0 ? (presentCount / data.attendance.length) * 100 : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentEnrollments = data.enrollments.filter((e) => new Date(e.enrollment_date) >= thirtyDaysAgo).length;
  const enrollmentGrowth = activeStudents > 0 ? (recentEnrollments / activeStudents) * 100 : 0;

  return {
    totalStudents: data.students.length,
    activeStudents,
    totalClasses: data.classes.length,
    averageUtilization,
    totalRevenue,
    overdueAmount,
    attendanceRate,
    enrollmentGrowth,
  };
}

export async function getClassesEndingSoon(schoolId: string, days: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('classes')
    .select(`
      id,
      name,
      end_date,
      enrollments!inner(
        student_id,
        students(
          user_profiles:user_id(full_name)
        )
      )
    `)
    .eq('school_id', schoolId)
    .lte('end_date', futureDateStr)
    .eq('status', 'in_progress');

  if (error) throw error;
  return data || [];
}

export function getMonthlyRevenue(payments: any[]) {
  const monthlyData: { [key: string]: number } = {};

  payments
    .filter((p) => p.status === 'completed')
    .forEach((payment) => {
      const month = new Date(payment.payment_date).toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + payment.amount;
    });

  return Object.entries(monthlyData)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);
}

export function getEnrollmentTrends(enrollments: any[]) {
  const monthlyData: { [key: string]: number } = {};

  enrollments.forEach((enrollment) => {
    const month = new Date(enrollment.enrollment_date).toISOString().slice(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  return Object.entries(monthlyData)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);
}
