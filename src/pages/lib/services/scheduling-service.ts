import { supabase } from '@/lib/supabase';

export interface ScheduleConflict {
  type: 'teacher' | 'classroom' | 'capacity';
  message: string;
}

export async function checkTeacherConflict(
  teacherId: string,
  startTime: Date,
  endTime: Date,
  excludeClassId?: string
): Promise<ScheduleConflict | null> {
  const { data: conflictingSessions } = await supabase
    .from('class_sessions')
    .select(`
      id,
      start_time,
      end_time,
      classes!inner(teacher_id)
    `)
    .eq('classes.teacher_id', teacherId)
    .or(`start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()}`);

  if (conflictingSessions && conflictingSessions.length > 0) {
    const hasConflict = conflictingSessions.some((session: any) => {
      if (excludeClassId && session.class_id === excludeClassId) return false;
      const sessionStart = new Date(session.start_time);
      const sessionEnd = new Date(session.end_time);
      return sessionStart < endTime && sessionEnd > startTime;
    });

    if (hasConflict) {
      return {
        type: 'teacher',
        message: 'Teacher has a conflicting class at this time',
      };
    }
  }

  return null;
}

export async function checkClassroomConflict(
  classroomId: string,
  startTime: Date,
  endTime: Date,
  excludeSessionId?: string
): Promise<ScheduleConflict | null> {
  const { data: conflictingSessions } = await supabase
    .from('class_sessions')
    .select('id, start_time, end_time')
    .eq('classroom_id', classroomId)
    .or(`start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()}`);

  if (conflictingSessions && conflictingSessions.length > 0) {
    const hasConflict = conflictingSessions.some((session) => {
      if (excludeSessionId && session.id === excludeSessionId) return false;
      const sessionStart = new Date(session.start_time);
      const sessionEnd = new Date(session.end_time);
      return sessionStart < endTime && sessionEnd > startTime;
    });

    if (hasConflict) {
      return {
        type: 'classroom',
        message: 'Classroom is already booked at this time',
      };
    }
  }

  return null;
}

export async function checkClassCapacity(classId: string): Promise<ScheduleConflict | null> {
  const [enrollmentResult, classResult] = await Promise.all([
    supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId)
      .eq('status', 'active'),
    supabase.from('classes').select('capacity').eq('id', classId).single(),
  ]);

  const current = enrollmentResult.count || 0;
  const capacity = classResult.data?.capacity || 0;

  if (current >= capacity) {
    return {
      type: 'capacity',
      message: `Class is at full capacity (${current}/${capacity})`,
    };
  }

  return null;
}

export async function validateSchedule(data: {
  teacher_id: string;
  classroom_id?: string;
  start_time: Date;
  end_time: Date;
  class_id?: string;
  exclude_session_id?: string;
}): Promise<ScheduleConflict[]> {
  const conflicts: ScheduleConflict[] = [];

  const teacherConflict = await checkTeacherConflict(
    data.teacher_id,
    data.start_time,
    data.end_time,
    data.class_id
  );
  if (teacherConflict) conflicts.push(teacherConflict);

  if (data.classroom_id) {
    const classroomConflict = await checkClassroomConflict(
      data.classroom_id,
      data.start_time,
      data.end_time,
      data.exclude_session_id
    );
    if (classroomConflict) conflicts.push(classroomConflict);
  }

  if (data.class_id) {
    const capacityConflict = await checkClassCapacity(data.class_id);
    if (capacityConflict) conflicts.push(capacityConflict);
  }

  return conflicts;
}

export async function createClassSession(data: {
  class_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  classroom_id?: string;
  topic?: string;
  notes?: string;
}) {
  const { data: classData } = await supabase
    .from('classes')
    .select('teacher_id')
    .eq('id', data.class_id)
    .single();

  if (!classData) throw new Error('Class not found');

  const startTime = new Date(`${data.scheduled_date}T${data.start_time}`);
  const endTime = new Date(`${data.scheduled_date}T${data.end_time}`);

  const conflicts = await validateSchedule({
    teacher_id: classData.teacher_id,
    classroom_id: data.classroom_id,
    start_time: startTime,
    end_time: endTime,
    class_id: data.class_id,
  });

  if (conflicts.length > 0) {
    throw new Error(conflicts.map((c) => c.message).join('; '));
  }

  const { data: session, error } = await supabase
    .from('class_sessions')
    .insert({
      class_id: data.class_id,
      scheduled_date: data.scheduled_date,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      classroom_id: data.classroom_id || null,
      topic: data.topic || '',
      notes: data.notes || '',
      status: 'scheduled',
    } as any)
    .select()
    .single();

  if (error) throw error;
  return session;
}

export async function rescheduleSession(
  sessionId: string,
  newDate: string,
  newStartTime: string,
  newEndTime: string
) {
  const { data: session } = await supabase
    .from('class_sessions')
    .select('class_id, classroom_id')
    .eq('id', sessionId)
    .single();

  if (!session) throw new Error('Session not found');

  const { data: classData } = await supabase
    .from('classes')
    .select('teacher_id')
    .eq('id', session.class_id)
    .single();

  if (!classData) throw new Error('Class not found');

  const startTime = new Date(`${newDate}T${newStartTime}`);
  const endTime = new Date(`${newDate}T${newEndTime}`);

  const conflicts = await validateSchedule({
    teacher_id: classData.teacher_id,
    classroom_id: session.classroom_id || undefined,
    start_time: startTime,
    end_time: endTime,
    exclude_session_id: sessionId,
  });

  if (conflicts.length > 0) {
    throw new Error(conflicts.map((c) => c.message).join('; '));
  }

  const { data: updated, error } = await supabase
    .from('class_sessions')
    .update({
      scheduled_date: newDate,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return updated;
}
