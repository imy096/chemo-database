import { supabase } from '@/lib/supabase';

export async function getUpcomingSessionsForSchool(schoolId: string) {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('class_sessions')
    .select(`
      *,
      classes!inner(
        name,
        school_id
      )
    `)
    .eq('classes.school_id', schoolId)
    .gte('scheduled_date', today)
    .order('start_time', { ascending: true })
    .limit(20);

  if (error) throw error;
  return data || [];
}

export async function getEnrolledStudentsForClass(classId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      student_id,
      students!inner(
        id,
        user_profiles:user_id(full_name)
      )
    `)
    .eq('class_id', classId)
    .eq('status', 'active');

  if (error) throw error;
  return data || [];
}

export async function getAttendanceForSession(sessionId: string) {
  const { data, error } = await supabase.from('attendance').select('*').eq('session_id', sessionId);

  if (error) throw error;
  return data || [];
}

export async function markAttendance(data: {
  session_id: string;
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  existing_id?: string;
}) {
  const checkInTime =
    data.status === 'present' || data.status === 'late' ? new Date().toISOString() : null;

  if (data.existing_id) {
    const { data: updated, error } = await supabase
      .from('attendance')
      .update({
        status: data.status,
        notes: data.notes || '',
        check_in_time: checkInTime,
      } as any)
      .eq('id', data.existing_id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  } else {
    const { data: created, error } = await supabase
      .from('attendance')
      .insert({
        session_id: data.session_id,
        student_id: data.student_id,
        status: data.status,
        notes: data.notes || '',
        check_in_time: checkInTime,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return created;
  }
}

export async function markAllPresent(sessionId: string, studentIds: string[]) {
  const existingAttendance = await getAttendanceForSession(sessionId);
  const existingMap = new Map(existingAttendance.map((a) => [a.student_id, a]));

  const updates = [];
  const inserts = [];

  for (const studentId of studentIds) {
    const existing = existingMap.get(studentId);
    if (existing) {
      updates.push(
        supabase
          .from('attendance')
          .update({
            status: 'present',
            check_in_time: new Date().toISOString(),
          } as any)
          .eq('id', existing.id)
      );
    } else {
      inserts.push({
        session_id: sessionId,
        student_id: studentId,
        status: 'present',
        check_in_time: new Date().toISOString(),
        notes: '',
      });
    }
  }

  await Promise.all(updates);

  if (inserts.length > 0) {
    await supabase.from('attendance').insert(inserts as any);
  }
}

export function calculateAttendanceStats(attendance: any[]) {
  const present = attendance.filter((a) => a.status === 'present').length;
  const absent = attendance.filter((a) => a.status === 'absent').length;
  const late = attendance.filter((a) => a.status === 'late').length;
  const excused = attendance.filter((a) => a.status === 'excused').length;
  const total = attendance.length;
  const rate = total > 0 ? ((present + late) / total) * 100 : 0;

  return { present, absent, late, excused, total, rate };
}
