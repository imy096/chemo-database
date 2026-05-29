import { supabase } from '@/lib/supabase';

export async function getEnrollmentsForSchool(schoolId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      students!inner(
        id,
        user_profiles:user_id(full_name)
      ),
      classes!inner(
        name,
        start_date,
        end_date
      )
    `)
    .eq('students.school_id', schoolId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getActiveStudentsForSchool(schoolId: string) {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      user_profiles:user_id(full_name, email)
    `)
    .eq('school_id', schoolId)
    .eq('status', 'active');

  if (error) throw error;
  return data || [];
}

export async function getAvailableClassesForSchool(schoolId: string) {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('school_id', schoolId)
    .in('status', ['scheduled', 'in_progress']);

  if (error) throw error;
  return data || [];
}

export async function checkClassCapacity(classId: string): Promise<{ current: number; capacity: number }> {
  const [enrollmentResult, classResult] = await Promise.all([
    supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId)
      .eq('status', 'active'),
    supabase.from('classes').select('capacity').eq('id', classId).single(),
  ]);

  return {
    current: enrollmentResult.count || 0,
    capacity: classResult.data?.capacity || 0,
  };
}

export async function createEnrollment(data: {
  student_id: string;
  class_id: string;
  payment_status: string;
  notes: string;
}) {
  const capacity = await checkClassCapacity(data.class_id);

  if (capacity.current >= capacity.capacity) {
    throw new Error('Class is at full capacity');
  }

  const { data: enrollment, error } = await supabase
    .from('enrollments')
    .insert({
      student_id: data.student_id,
      class_id: data.class_id,
      payment_status: data.payment_status,
      notes: data.notes,
      status: 'active',
      enrollment_date: new Date().toISOString().split('T')[0],
    } as any)
    .select()
    .single();

  if (error) throw error;
  return enrollment;
}

export async function moveEnrollment(enrollmentId: string, newClassId: string, reason: string) {
  const capacity = await checkClassCapacity(newClassId);

  if (capacity.current >= capacity.capacity) {
    throw new Error('New class is at full capacity');
  }

  const { data: existing } = await supabase
    .from('enrollments')
    .select('notes')
    .eq('id', enrollmentId)
    .single();

  const timestamp = new Date().toLocaleDateString();
  const updatedNotes = `${existing?.notes || ''}\n\nMoved on ${timestamp}: ${reason}`.trim();

  const { data, error } = await supabase
    .from('enrollments')
    .update({
      class_id: newClassId,
      notes: updatedNotes,
    })
    .eq('id', enrollmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function withdrawEnrollment(enrollmentId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .update({
      status: 'withdrawn',
      completion_date: new Date().toISOString().split('T')[0],
    })
    .eq('id', enrollmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
