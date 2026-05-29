import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Assignment = Database['public']['Tables']['assignments']['Row'];
type AssignmentSubmission = Database['public']['Tables']['assignment_submissions']['Row'];

export async function getAssignmentsByClasses(classIds: string[]) {
  if (classIds.length === 0) return [];

  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      classes!inner(name, school_id)
    `)
    .in('class_id', classIds)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getSubmissionsForStudent(studentId: string) {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select(`
      *,
      assignments(id, title, max_points, due_date, class_id)
    `)
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSubmissionsForAssignment(assignmentId: string) {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select(`
      *,
      students!inner(
        id,
        user_profiles:user_id(full_name)
      )
    `)
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPendingSubmissionsForTeacher(classIds: string[]) {
  if (classIds.length === 0) return [];

  const { data: assignments } = await supabase
    .from('assignments')
    .select('id')
    .in('class_id', classIds);

  if (!assignments) return [];

  const assignmentIds = assignments.map((a) => a.id);
  if (assignmentIds.length === 0) return [];

  const { data, error } = await supabase
    .from('assignment_submissions')
    .select(`
      *,
      students!inner(
        id,
        user_profiles:user_id(full_name)
      ),
      assignments(title, max_points)
    `)
    .in('assignment_id', assignmentIds)
    .eq('status', 'submitted');

  if (error) throw error;
  return data || [];
}

export async function createAssignment(data: {
  class_id: string;
  title: string;
  description: string;
  assignment_type: string;
  due_date: string;
  max_points: number;
  instructions: string;
  created_by: string;
}) {
  const { data: assignment, error } = await supabase
    .from('assignments')
    .insert(data as any)
    .select()
    .single();

  if (error) throw error;
  return assignment;
}

export async function submitAssignment(data: {
  assignment_id: string;
  student_id: string;
  submission_text?: string;
  submission_file_url?: string;
  submission_audio_url?: string;
}) {
  const existingSubmission = await supabase
    .from('assignment_submissions')
    .select('id')
    .eq('assignment_id', data.assignment_id)
    .eq('student_id', data.student_id)
    .maybeSingle();

  if (existingSubmission.data) {
    const { data: updated, error } = await supabase
      .from('assignment_submissions')
      .update({
        submission_text: data.submission_text,
        submission_file_url: data.submission_file_url,
        submission_audio_url: data.submission_audio_url,
        submitted_at: new Date().toISOString(),
        status: 'submitted',
      } as any)
      .eq('id', existingSubmission.data.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  } else {
    const { data: created, error } = await supabase
      .from('assignment_submissions')
      .insert({
        assignment_id: data.assignment_id,
        student_id: data.student_id,
        submission_text: data.submission_text,
        submission_file_url: data.submission_file_url,
        submission_audio_url: data.submission_audio_url,
        submitted_at: new Date().toISOString(),
        status: 'submitted',
      } as any)
      .select()
      .single();

    if (error) throw error;
    return created;
  }
}

export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string,
  gradedBy: string
) {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .update({
      grade,
      feedback,
      graded_by: gradedBy,
      graded_at: new Date().toISOString(),
      status: 'graded',
    } as any)
    .eq('id', submissionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function isAssignmentOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

export function getSubmissionStatus(
  assignment: Assignment,
  submissions: AssignmentSubmission[]
): 'submitted' | 'graded' | 'missing' | 'pending' {
  const submission = submissions.find((s) => s.assignment_id === assignment.id);

  if (!submission) {
    return isAssignmentOverdue(assignment.due_date) ? 'missing' : 'pending';
  }

  return submission.status as 'submitted' | 'graded' | 'missing' | 'pending';
}
