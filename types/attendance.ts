
export interface Worker {
  id: string;
  name: string;
}

export interface AttendanceRecord {
  workerId: string;
  workerName: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface WeeklyReport {
  weekStartDate: string;
  weekEndDate: string;
  attendance: AttendanceRecord[];
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
