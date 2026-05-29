type DaySchedule = {
  enabled: boolean;
  start: string;
  end: string;
};

type GenerateSessionsParams = {
  classId: string;
  tenantId?: string | null;
  schoolId?: string | null;
  teacherId?: string | null;
  className: string;
  startDate: string;
  endDate: string;
  timezone?: string;
  daySchedules: Record<string, DaySchedule>;
};

const dayMap: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export function generateClassSessions({
  classId,
  tenantId,
  schoolId,
  teacherId,
  className,
  startDate,
  endDate,
  timezone = 'UTC',
  daySchedules,
}: GenerateSessionsParams) {
  const sessions: any[] = [];

  if (!startDate || !endDate) return sessions;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  let sessionNumber = 1;
  const current = new Date(start);

  while (current <= end) {
    const currentDay = current.getDay();

    const activeDay = Object.entries(daySchedules).find(([day, config]) => {
      return config.enabled && dayMap[day] === currentDay;
    });

    if (activeDay) {
      const [day, config] = activeDay;
      const dateOnly = current.toISOString().split('T')[0];

      sessions.push({
        class_id: classId,
        tenant_id: tenantId || null,
        school_id: schoolId || null,
        teacher_id: teacherId || null,
        title: `${className} Session ${sessionNumber}`,
        session_number: sessionNumber,
        scheduled_date: dateOnly,
        start_time: `${dateOnly}T${config.start}:00`,
        end_time: `${dateOnly}T${config.end}:00`,
        timezone,
        status: 'scheduled',
      });

      sessionNumber++;
    }

    current.setDate(current.getDate() + 1);
  }

  return sessions;
}