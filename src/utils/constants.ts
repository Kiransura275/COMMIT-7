import { CategoryInfo, TaskCategory, DayOfWeek } from '../types';

export const DAYS_OF_WEEK = [
  { index: 0 as DayOfWeek, name: 'Sunday', short: 'Sun', letter: 'S' },
  { index: 1 as DayOfWeek, name: 'Monday', short: 'Mon', letter: 'M' },
  { index: 2 as DayOfWeek, name: 'Tuesday', short: 'Tue', letter: 'T' },
  { index: 3 as DayOfWeek, name: 'Wednesday', short: 'Wed', letter: 'W' },
  { index: 4 as DayOfWeek, name: 'Thursday', short: 'Thu', letter: 'T' },
  { index: 5 as DayOfWeek, name: 'Friday', short: 'Fri', letter: 'F' },
  { index: 6 as DayOfWeek, name: 'Saturday', short: 'Sat', letter: 'S' },
];

export const CATEGORIES: Record<TaskCategory, CategoryInfo> = {
  Study: {
    name: 'Study',
    emoji: '📖',
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    borderColor: 'border-sky-200 dark:border-sky-800/60',
  },
  Sports: {
    name: 'Sports',
    emoji: '🏋️',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800/60',
  },
  Health: {
    name: 'Health',
    emoji: '🍎',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800/60',
  },
  Personal: {
    name: 'Personal',
    emoji: '👤',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderColor: 'border-indigo-200 dark:border-indigo-800/60',
  },
  Work: {
    name: 'Work',
    emoji: '💼',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/40',
    borderColor: 'border-violet-200 dark:border-violet-800/60',
  },
  Other: {
    name: 'Other',
    emoji: '📎',
    color: 'text-zinc-600 dark:text-zinc-400',
    bgColor: 'bg-zinc-100 dark:bg-zinc-800/60',
    borderColor: 'border-zinc-200 dark:border-zinc-700',
  },
};

export const MOTIVATION_THEMES: Record<DayOfWeek, string> = {
  0: 'Vision Day',
  1: 'Purpose Day',
  2: 'Discipline Day',
  3: 'Progress Day',
  4: 'Confidence Day',
  5: 'Persistence Day',
  6: 'Reflection Day',
};

export const MOTIVATION_TEMPLATES: Record<DayOfWeek, string> = {
  0: "A new week begins tomorrow. Remember why [Goal] matters: [Reason].",
  1: "You are working toward [Goal] because [Reason]. Never forget why you started.",
  2: "Great achievements are built through consistent effort. Stay committed to [Goal] today.",
  3: "Every small step toward [Goal] matters. Keep moving forward.",
  4: "Believe in yourself. You are capable of achieving [Goal].",
  5: "Success comes from continuing when others stop. Stay focused on [Goal].",
  6: "Look at the effort you've invested so far. Keep building toward [Goal].",
};

export const STREAK_BADGES_CONFIG = [
  {
    id: 'streak_100',
    title: 'Legend',
    days: 100,
    icon: '👑',
    tier: 'Platinum' as const,
    description: 'Achieve an unbroken 100-day Goal Tracker streak of legendary mastery.',
  },
  {
    id: 'streak_50',
    title: 'Champion',
    days: 50,
    icon: '💎',
    tier: 'Platinum' as const,
    description: 'Maintain an elite 50-day Goal Tracker commitment streak.',
  },
  {
    id: 'streak_30',
    title: 'Achiever',
    days: 30,
    icon: '🏆',
    tier: 'Gold' as const,
    description: 'Sustain a formidable 30-day streak of relentless consistency.',
  },
  {
    id: 'streak_15',
    title: 'Dedicated',
    days: 15,
    icon: '🛡️',
    tier: 'Silver' as const,
    description: 'Demonstrate steadfast dedication with an unbroken 15-day streak.',
  },
  {
    id: 'streak_7',
    title: 'Consistent',
    days: 7,
    icon: '⚡',
    tier: 'Bronze' as const,
    description: 'Conquer all 7 days of the weekly cycle with an active streak.',
  },
  {
    id: 'streak_3',
    title: 'Beginner',
    days: 3,
    icon: '🌱',
    tier: 'Bronze' as const,
    description: 'Ignite your momentum with a 3-day consecutive goal streak.',
  },
];

export function getBadgeForStreak(streak: number): string {
  if (streak >= 100) return 'Legend';
  if (streak >= 50) return 'Champion';
  if (streak >= 30) return 'Achiever';
  if (streak >= 15) return 'Dedicated';
  if (streak >= 7) return 'Consistent';
  if (streak >= 3) return 'Beginner';
  return '--';
}

export const INITIAL_BADGES = STREAK_BADGES_CONFIG.map((b) => ({
  id: b.id,
  title: b.title,
  description: b.description,
  icon: b.icon,
  tier: b.tier,
  unlocked: false,
  progress: 0,
  maxProgress: b.days,
  category: 'streak' as const,
}));

