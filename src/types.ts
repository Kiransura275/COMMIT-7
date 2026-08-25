export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun, 1=Mon, ..., 6=Sat

export type TaskCategory = 'Study' | 'Sports' | 'Health' | 'Personal' | 'Work' | 'Other';

export interface CategoryInfo {
  name: TaskCategory;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export type WorkType = 'Periodic' | 'Instant';

export interface TimetableTask {
  id: string;
  dayOfWeek: DayOfWeek; // 0 to 6 (Sun to Sat)
  purpose: string;
  category: TaskCategory;
  workType: WorkType;
  fromTime: string; // HH:mm format, e.g. "09:00"
  toTime?: string; // HH:mm format, e.g. "10:30" (for Periodic)
  alarmEnabled: boolean;
  notificationEnabled: boolean;
  smartCheckEnabled: boolean;
  completedDates: string[]; // ISO date strings 'YYYY-MM-DD' when checked
}

export type GoalMode = 'Daily' | 'Weekly';

export interface GoalItem {
  id: string;
  dayOfWeek?: DayOfWeek; // undefined if Daily mode, 0-6 if Weekly mode
  text: string;
  category: TaskCategory;
  createdAt: string;
}

export interface GoalSettings {
  mode: GoalMode;
  trackerEnabled: boolean;
  morningReminderTime: string; // e.g. "08:00 AM" or "08:00"
  nightCheckTime: string; // e.g. "08:00 PM" or "20:00"
  lastUpdated: number;
}

export interface DayGoalStatus {
  date: string; // 'YYYY-MM-DD'
  completedGoalIds: string[];
  checkedAtNight: boolean;
  nightCheckResult?: 'all' | 'partial' | 'none';
}

export interface StandaloneReminder {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  message?: string;
  notificationEnabled: boolean;
  alarmEnabled: boolean;
  isCompleted: boolean;
  completedAt?: string;
}

export interface MotivationData {
  goal: string;
  reason: string;
  reminderEnabled: boolean;
  reminderTime: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  category: 'streak' | 'goals' | 'tasks' | 'special';
}

export interface SoundSettings {
  alarmType: 'default' | 'custom';
  alarmCustomUrl?: string;
  alarmCustomName?: string;
  notificationType: 'default' | 'custom';
  notificationCustomUrl?: string;
  notificationCustomName?: string;
}

export interface ProfileData {
  id: string;
  name: string;
  avatarUrl: string;
  currentStreak: number;
  bestStreak: number;
  currentBadge: string;
  bestBadge: string;
  totalGoalsCompleted: number;
  totalTasksCompleted: number;
  totalRemindersCompleted: number;
  themeMode: 'light' | 'dark';
  soundEnabled: boolean;
  streakHistory: { date: string; status: 'completed' | 'missed' | 'off' }[];
}

export interface WeeklyReportSummary {
  weekStart: string; // 'YYYY-MM-DD' (Sunday)
  weekEnd: string; // 'YYYY-MM-DD' (Saturday)
  daysTracked: number;
  goalsCompletedCount: number;
  tasksCompletedCount: number;
  successRate: number; // 0 to 100
  dailyBreakdown: {
    dayIndex: number;
    dayName: string;
    date: string;
    goalCompleted: boolean;
    tasksCount: number;
  }[];
}

export interface AppNotification {
  id: string;
  type: 'smart_check' | 'goal_check' | 'morning_reminder' | 'night_check' | 'reminder' | 'streak_award' | 'general';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  referenceId?: string;
  actionRequired?: boolean;
}
