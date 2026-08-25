import {
  TimetableTask,
  GoalSettings,
  GoalItem,
  DayGoalStatus,
  StandaloneReminder,
  MotivationData,
  Badge,
  ProfileData,
  WeeklyReportSummary,
  AppNotification,
  DayOfWeek,
  GoalMode,
  SoundSettings,
} from '../types';
import { INITIAL_BADGES, getBadgeForStreak } from './constants';
import { soundManager } from './audio';

const STORAGE_KEYS = {
  TASKS: 'commit7_tasks_v1',
  GOAL_SETTINGS: 'commit7_goal_settings_v1',
  GOALS: 'commit7_goals_v1',
  DAY_GOAL_STATUS: 'commit7_day_goal_status_v1',
  REMINDERS: 'commit7_reminders_v1',
  MOTIVATION: 'commit7_motivation_v1',
  BADGES: 'commit7_badges_v1',
  PROFILE: 'commit7_profile_v1',
  NOTIFICATIONS: 'commit7_notifications_v1',
  SOUND_SETTINGS: 'commit7_sound_settings_v1',
  SIMULATED_OFFSET_DAYS: 'commit7_simulated_offset_v1',
};

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  alarmType: 'default',
  alarmCustomUrl: '',
  alarmCustomName: '',
  notificationType: 'default',
  notificationCustomUrl: '',
  notificationCustomName: '',
};

// Default seed data
const DEFAULT_TASKS: TimetableTask[] = [
  {
    id: 'task_1',
    dayOfWeek: 1, // Mon
    purpose: 'Deep Study - Data Structures & Algorithms',
    category: 'Study',
    workType: 'Periodic',
    fromTime: '08:30',
    toTime: '10:30',
    alarmEnabled: true,
    notificationEnabled: true,
    smartCheckEnabled: true,
    completedDates: ['2026-08-17'],
  },
  {
    id: 'task_2',
    dayOfWeek: 1, // Mon
    purpose: 'Strength & Core Workout',
    category: 'Sports',
    workType: 'Periodic',
    fromTime: '17:30',
    toTime: '18:45',
    alarmEnabled: false,
    notificationEnabled: true,
    smartCheckEnabled: true,
    completedDates: ['2026-08-17'],
  },
  {
    id: 'task_3',
    dayOfWeek: 2, // Tue
    purpose: 'Architect Commit7 Core Module',
    category: 'Work',
    workType: 'Periodic',
    fromTime: '09:00',
    toTime: '12:00',
    alarmEnabled: true,
    notificationEnabled: true,
    smartCheckEnabled: true,
    completedDates: ['2026-08-18'],
  },
  {
    id: 'task_4',
    dayOfWeek: 3, // Wed
    purpose: 'Mindful Meditation & Mobility',
    category: 'Health',
    workType: 'Instant',
    fromTime: '07:00',
    alarmEnabled: false,
    notificationEnabled: true,
    smartCheckEnabled: false,
    completedDates: ['2026-08-19'],
  },
  {
    id: 'task_5',
    dayOfWeek: 4, // Thu
    purpose: 'Product Feature Review & Polish',
    category: 'Work',
    workType: 'Periodic',
    fromTime: '14:00',
    toTime: '16:00',
    alarmEnabled: true,
    notificationEnabled: true,
    smartCheckEnabled: true,
    completedDates: ['2026-08-20'],
  },
  {
    id: 'task_6',
    dayOfWeek: 5, // Fri
    purpose: 'Personal Reading & Weekly Retrospective',
    category: 'Personal',
    workType: 'Periodic',
    fromTime: '19:00',
    toTime: '20:30',
    alarmEnabled: false,
    notificationEnabled: true,
    smartCheckEnabled: true,
    completedDates: [],
  },
  {
    id: 'task_7',
    dayOfWeek: 6, // Sat
    purpose: 'Outdoor Trail Run & Hydration',
    category: 'Sports',
    workType: 'Periodic',
    fromTime: '08:00',
    toTime: '09:30',
    alarmEnabled: true,
    notificationEnabled: true,
    smartCheckEnabled: true,
    completedDates: [],
  },
  {
    id: 'task_8',
    dayOfWeek: 0, // Sun
    purpose: 'Weekly Roadmap Planning & Goal Setting',
    category: 'Personal',
    workType: 'Periodic',
    fromTime: '10:00',
    toTime: '11:30',
    alarmEnabled: false,
    notificationEnabled: true,
    smartCheckEnabled: true,
    completedDates: ['2026-08-16'],
  },
];

const DEFAULT_GOAL_SETTINGS: GoalSettings = {
  mode: 'Daily',
  trackerEnabled: false,
  morningReminderTime: '08:00 AM',
  nightCheckTime: '08:00 PM',
  lastUpdated: Date.now(),
};

const DEFAULT_DAILY_GOALS: GoalItem[] = [
  { id: 'goal_1', text: 'Read 20 pages of high-yield literature', category: 'Study', createdAt: '2026-08-15' },
  { id: 'goal_2', text: 'Drink 3L pure water & maintain posture', category: 'Health', createdAt: '2026-08-15' },
  { id: 'goal_3', text: 'Complete at least 1 critical focus block', category: 'Work', createdAt: '2026-08-15' },
];

const DEFAULT_REMINDERS: StandaloneReminder[] = [
  {
    id: 'rem_1',
    title: 'Weekly Mentorship Sync & Demo',
    date: '2026-08-21',
    time: '15:00',
    message: 'Present Commit7 architecture, room schema, and reactive flow overview.',
    notificationEnabled: true,
    alarmEnabled: true,
    isCompleted: false,
  },
  {
    id: 'rem_2',
    title: 'Hydration & Posture Break',
    date: '2026-08-20',
    time: '16:30',
    message: 'Refill glass bottle and do 3-minute spinal decompression stretch.',
    notificationEnabled: true,
    alarmEnabled: false,
    isCompleted: true,
    completedAt: '2026-08-20T16:30:00',
  },
  {
    id: 'rem_3',
    title: 'Review Monthly Savings & Budget',
    date: '2026-08-24',
    time: '19:00',
    message: 'Audit subscriptions and transfer scheduled investment reserve.',
    notificationEnabled: true,
    alarmEnabled: false,
    isCompleted: false,
  },
];

const DEFAULT_MOTIVATION: MotivationData = {
  goal: 'Master Full-Stack Architecture & Build Life-Changing Software',
  reason: 'To attain creative freedom and empower people with delightful digital tools',
  reminderEnabled: true,
  reminderTime: '08:00 PM',
};

const DEFAULT_PROFILE: ProfileData = {
  id: 'profile_1',
  name: '---',
  avatarUrl: '',
  currentStreak: 0,
  bestStreak: 0,
  currentBadge: '--',
  bestBadge: '--',
  totalGoalsCompleted: 0,
  totalTasksCompleted: 0,
  totalRemindersCompleted: 0,
  themeMode: 'light',
  soundEnabled: true,
  streakHistory: [],
};

type Listener = () => void;

class Commit7Storage {
  private listeners: Set<Listener> = new Set();
  private simulatedOffsetDays = 0;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      this.save(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GOAL_SETTINGS)) {
      this.save(STORAGE_KEYS.GOAL_SETTINGS, DEFAULT_GOAL_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
      this.save(STORAGE_KEYS.GOALS, DEFAULT_DAILY_GOALS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REMINDERS)) {
      this.save(STORAGE_KEYS.REMINDERS, DEFAULT_REMINDERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MOTIVATION)) {
      this.save(STORAGE_KEYS.MOTIVATION, DEFAULT_MOTIVATION);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BADGES)) {
      this.save(STORAGE_KEYS.BADGES, INITIAL_BADGES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      this.save(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SOUND_SETTINGS)) {
      this.save(STORAGE_KEYS.SOUND_SETTINGS, DEFAULT_SOUND_SETTINGS);
    }

    const savedOffset = localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFSET_DAYS);
    if (savedOffset) {
      this.simulatedOffsetDays = parseInt(savedOffset, 10) || 0;
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private load<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private save<T>(key: string, data: T) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage error', e);
    }
  }

  // --- Date Handling with Simulation Support ---
  public getTodayDateObj(): Date {
    const d = new Date();
    if (this.simulatedOffsetDays !== 0) {
      d.setDate(d.getDate() + this.simulatedOffsetDays);
    }
    return d;
  }

  public getTodayDateString(): string {
    const d = this.getTodayDateObj();
    return d.toISOString().split('T')[0];
  }

  public getTodayDayOfWeek(): DayOfWeek {
    return this.getTodayDateObj().getDay() as DayOfWeek;
  }

  public setSimulatedOffset(days: number) {
    this.simulatedOffsetDays = days;
    localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFSET_DAYS, days.toString());
    this.notify();
  }

  public getSimulatedOffset(): number {
    return this.simulatedOffsetDays;
  }

  // --- Tasks API ---
  public getTasks(): TimetableTask[] {
    return this.load<TimetableTask[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
  }

  public getTasksForDay(day: DayOfWeek): TimetableTask[] {
    const all = this.getTasks();
    return all
      .filter((t) => t.dayOfWeek === day)
      .sort((a, b) => a.fromTime.localeCompare(b.fromTime));
  }

  public addTask(task: Omit<TimetableTask, 'id' | 'completedDates'>): TimetableTask {
    const tasks = this.getTasks();
    // Enforce Spec 4.6: If alarm is true, notification MUST be true
    const newTask: TimetableTask = {
      ...task,
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      notificationEnabled: task.alarmEnabled ? true : task.notificationEnabled,
      completedDates: [],
    };
    tasks.push(newTask);
    this.save(STORAGE_KEYS.TASKS, tasks);
    this.notify();
    return newTask;
  }

  public updateTask(task: TimetableTask): void {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx !== -1) {
      // Spec 4.6 enforcement
      tasks[idx] = {
        ...task,
        notificationEnabled: task.alarmEnabled ? true : task.notificationEnabled,
      };
      this.save(STORAGE_KEYS.TASKS, tasks);
      this.notify();
    }
  }

  public deleteTask(taskId: string): void {
    const tasks = this.getTasks().filter((t) => t.id !== taskId);
    this.save(STORAGE_KEYS.TASKS, tasks);
    this.notify();
  }

  public toggleTaskCompletion(taskId: string, date: string): boolean {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;

    const exists = task.completedDates.includes(date);
    if (exists) {
      task.completedDates = task.completedDates.filter((d) => d !== date);
    } else {
      task.completedDates.push(date);
      // Smart Check / Timetable tasks are pure schedule records and do NOT affect streaks, badges, or goal trackers
    }

    this.save(STORAGE_KEYS.TASKS, tasks);
    this.notify();
    return !exists;
  }

  // --- Goals API ---
  public getGoalSettings(): GoalSettings {
    return this.load<GoalSettings>(STORAGE_KEYS.GOAL_SETTINGS, DEFAULT_GOAL_SETTINGS);
  }

  public updateGoalSettings(settings: Partial<GoalSettings>): void {
    const current = this.getGoalSettings();
    const updated = { ...current, ...settings, lastUpdated: Date.now() };
    this.save(STORAGE_KEYS.GOAL_SETTINGS, updated);
    this.notify();
  }

  public getGoals(): GoalItem[] {
    return this.load<GoalItem[]>(STORAGE_KEYS.GOALS, DEFAULT_DAILY_GOALS);
  }

  public getGoalsForDay(day: DayOfWeek): GoalItem[] {
    const settings = this.getGoalSettings();
    const goals = this.getGoals();
    if (settings.mode === 'Daily') {
      return goals;
    }
    return goals.filter((g) => g.dayOfWeek === day);
  }

  public saveGoals(goals: GoalItem[], mode?: GoalMode): void {
    this.save(STORAGE_KEYS.GOALS, goals);
    if (mode) {
      this.updateGoalSettings({ mode });
    } else {
      this.notify();
    }
  }

  public getDayGoalStatus(date: string): DayGoalStatus {
    const all = this.load<Record<string, DayGoalStatus>>(STORAGE_KEYS.DAY_GOAL_STATUS, {});
    return (
      all[date] || {
        date,
        completedGoalIds: [],
        checkedAtNight: false,
      }
    );
  }

  public toggleGoalCompletion(goalId: string, date: string): boolean {
    const all = this.load<Record<string, DayGoalStatus>>(STORAGE_KEYS.DAY_GOAL_STATUS, {});
    const current = all[date] || {
      date,
      completedGoalIds: [],
      checkedAtNight: false,
    };

    const isCompleted = current.completedGoalIds.includes(goalId);
    if (isCompleted) {
      current.completedGoalIds = current.completedGoalIds.filter((id) => id !== goalId);
    } else {
      current.completedGoalIds.push(goalId);
      const profile = this.getProfile();
      profile.totalGoalsCompleted += 1;
      this.save(STORAGE_KEYS.PROFILE, profile);
      this.checkBadgeProgression();
      if (profile.soundEnabled) soundManager.playPop();
    }

    all[date] = current;
    this.save(STORAGE_KEYS.DAY_GOAL_STATUS, all);
    this.notify();
    return !isCompleted;
  }

  // --- Midnight & Goal Check Processing ---
  public processNightCheck(result: 'all' | 'partial' | 'none', targetDate?: string): void {
    const date = targetDate || this.getTodayDateString();
    const allStatuses = this.load<Record<string, DayGoalStatus>>(STORAGE_KEYS.DAY_GOAL_STATUS, {});
    const previousResult = allStatuses[date]?.nightCheckResult;

    const dayStatus = allStatuses[date] || {
      date,
      completedGoalIds: [],
      checkedAtNight: true,
      nightCheckResult: result,
    };

    dayStatus.checkedAtNight = true;
    dayStatus.nightCheckResult = result;
    allStatuses[date] = dayStatus;
    this.save(STORAGE_KEYS.DAY_GOAL_STATUS, allStatuses);

    const profile = this.getProfile();
    const settings = this.getGoalSettings();

    if (settings.trackerEnabled) {
      if (result === 'all' || result === 'partial') {
        if (previousResult !== 'all' && previousResult !== 'partial') {
          profile.currentStreak += 1;
          profile.totalGoalsCompleted += 1;
          if (profile.currentStreak > profile.bestStreak) {
            profile.bestStreak = profile.currentStreak;
          }
        }
        profile.streakHistory = profile.streakHistory.filter((s) => s.date !== date);
        profile.streakHistory.push({ date, status: 'completed' });
        if (profile.soundEnabled) soundManager.playSuccessFanfare();
      } else {
        // Missed / No
        if (previousResult === 'all' || previousResult === 'partial') {
          profile.currentStreak = Math.max(0, profile.currentStreak - 1);
          profile.totalGoalsCompleted = Math.max(0, profile.totalGoalsCompleted - 1);
        }
        profile.currentStreak = 0;
        profile.streakHistory = profile.streakHistory.filter((s) => s.date !== date);
        profile.streakHistory.push({ date, status: 'missed' });
      }
    }

    this.save(STORAGE_KEYS.PROFILE, profile);
    this.checkBadgeProgression();
    this.notify();
  }

  // --- Reminders API ---
  public getReminders(): StandaloneReminder[] {
    const reminders = this.load<StandaloneReminder[]>(STORAGE_KEYS.REMINDERS, DEFAULT_REMINDERS);
    return reminders.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.time.localeCompare(b.time);
    });
  }

  public addReminder(rem: Omit<StandaloneReminder, 'id' | 'isCompleted'>): StandaloneReminder {
    const reminders = this.getReminders();
    const newRem: StandaloneReminder = {
      ...rem,
      id: 'rem_' + Date.now(),
      notificationEnabled: rem.alarmEnabled ? true : rem.notificationEnabled,
      isCompleted: false,
    };
    reminders.push(newRem);
    this.save(STORAGE_KEYS.REMINDERS, reminders);
    this.notify();
    return newRem;
  }

  public updateReminder(reminder: StandaloneReminder): void {
    const reminders = this.getReminders();
    const idx = reminders.findIndex((r) => r.id === reminder.id);
    if (idx !== -1) {
      reminders[idx] = {
        ...reminder,
        notificationEnabled: reminder.alarmEnabled ? true : reminder.notificationEnabled,
      };
      this.save(STORAGE_KEYS.REMINDERS, reminders);
      this.notify();
    }
  }

  public deleteReminder(id: string): void {
    const reminders = this.getReminders().filter((r) => r.id !== id);
    this.save(STORAGE_KEYS.REMINDERS, reminders);
    this.notify();
  }

  public completeReminder(id: string): void {
    const reminders = this.getReminders();
    const rem = reminders.find((r) => r.id === id);
    if (!rem || rem.isCompleted) return;

    rem.isCompleted = true;
    rem.completedAt = new Date().toISOString();

    const profile = this.getProfile();
    profile.totalRemindersCompleted += 1;
    this.save(STORAGE_KEYS.PROFILE, profile);
    this.save(STORAGE_KEYS.REMINDERS, reminders);
    this.notify();
  }

  public toggleReminder(id: string): boolean {
    const reminders = this.getReminders();
    const rem = reminders.find((r) => r.id === id);
    if (!rem) return false;

    rem.isCompleted = !rem.isCompleted;
    rem.completedAt = rem.isCompleted ? new Date().toISOString() : undefined;

    if (rem.isCompleted) {
      const profile = this.getProfile();
      profile.totalRemindersCompleted += 1;
      this.save(STORAGE_KEYS.PROFILE, profile);
      if (profile.soundEnabled) soundManager.playPop();
    }

    this.save(STORAGE_KEYS.REMINDERS, reminders);
    this.notify();
    return rem.isCompleted;
  }

  // --- Motivation API ---
  public getMotivation(): MotivationData {
    return this.load<MotivationData>(STORAGE_KEYS.MOTIVATION, DEFAULT_MOTIVATION);
  }

  public updateMotivation(data: Partial<MotivationData>): void {
    const current = this.getMotivation();
    const updated = { ...current, ...data };
    this.save(STORAGE_KEYS.MOTIVATION, updated);
    this.notify();
  }

  public deleteMotivation(): void {
    const current = this.getMotivation();
    const updated: MotivationData = {
      ...current,
      goal: '',
      reason: '',
    };
    this.save(STORAGE_KEYS.MOTIVATION, updated);
    this.notify();
  }

  // --- Profile & Badges API ---
  public getProfile(): ProfileData {
    const p = this.load<ProfileData>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    return {
      ...DEFAULT_PROFILE,
      ...p,
      name: p.name !== undefined && p.name !== '' ? p.name : '---',
      bestBadge: p.bestBadge || getBadgeForStreak(p.bestStreak || 0),
      currentBadge: p.currentBadge || getBadgeForStreak(p.currentStreak || 0),
    };
  }

  public updateProfile(data: Partial<ProfileData>): void {
    const current = this.getProfile();
    const updated = { ...current, ...data };
    this.save(STORAGE_KEYS.PROFILE, updated);
    this.notify();
  }

  public getBadges(): Badge[] {
    return this.load<Badge[]>(STORAGE_KEYS.BADGES, INITIAL_BADGES);
  }

  public checkBadgeProgression(): void {
    const profile = this.getProfile();
    const badges = this.getBadges();
    const todayStr = this.getTodayDateString();
    let updated = false;

    // Badges unlock and maintain progress based on highest streak achieved (bestStreak)
    const effectiveStreak = Math.max(profile.bestStreak || 0, profile.currentStreak || 0);

    badges.forEach((b) => {
      b.progress = Math.min(effectiveStreak, b.maxProgress);
      if (!b.unlocked && effectiveStreak >= b.maxProgress) {
        b.unlocked = true;
        b.unlockedAt = todayStr;
        updated = true;
      }
    });

    const bestBadgeName = getBadgeForStreak(profile.bestStreak || 0);
    profile.bestBadge = bestBadgeName;

    const currentBadgeName = getBadgeForStreak(profile.currentStreak || 0);
    profile.currentBadge = currentBadgeName;

    this.save(STORAGE_KEYS.BADGES, badges);
    this.save(STORAGE_KEYS.PROFILE, profile);
    if (updated) {
      this.notify();
    }
  }

  // --- Weekly Report Summary ---
  public getWeeklyReport(weekStartDate: string): WeeklyReportSummary {
    const startDate = new Date(weekStartDate + 'T00:00:00');
    const daysBreakdown = [];
    let daysTracked = 0;
    let goalsCompletedCount = 0;
    let tasksCompletedCount = 0;

    const allTasks = this.getTasks();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayIndex = d.getDay() as DayOfWeek;

      const dayStatus = this.getDayGoalStatus(dateStr);
      const isGoalCompleted =
        dayStatus.completedGoalIds.length > 0 ||
        dayStatus.nightCheckResult === 'all' ||
        dayStatus.nightCheckResult === 'partial';

      if (isGoalCompleted) {
        goalsCompletedCount += 1;
      }

      const tasksCompletedOnDay = allTasks.filter(
        (t) => t.dayOfWeek === dayIndex && t.completedDates.includes(dateStr)
      ).length;

      tasksCompletedCount += tasksCompletedOnDay;
      if (dayStatus.checkedAtNight || isGoalCompleted) {
        daysTracked += 1;
      }

      daysBreakdown.push({
        dayIndex,
        dayName: dayNames[dayIndex],
        date: dateStr,
        goalCompleted: isGoalCompleted,
        tasksCount: tasksCompletedOnDay,
      });
    }

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const weekEnd = endDate.toISOString().split('T')[0];

    const successRate = Math.round((goalsCompletedCount / 7) * 100);

    return {
      weekStart: weekStartDate,
      weekEnd,
      daysTracked,
      goalsCompletedCount,
      tasksCompletedCount,
      successRate,
      dailyBreakdown: daysBreakdown,
    };
  }

  // --- Notifications API ---
  public getNotifications(): AppNotification[] {
    return this.load<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const notifs = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif_' + Date.now(),
      timestamp: Date.now(),
      read: false,
    };
    notifs.unshift(newNotif);
    this.save(STORAGE_KEYS.NOTIFICATIONS, notifs.slice(0, 30));
    this.notify();
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications();
    const target = notifs.find((n) => n.id === id);
    if (target) {
      target.read = true;
      this.save(STORAGE_KEYS.NOTIFICATIONS, notifs);
      this.notify();
    }
  }

  public clearAllNotifications(): void {
    this.save(STORAGE_KEYS.NOTIFICATIONS, []);
    this.notify();
  }

  // --- Sound Settings API ---
  public getSoundSettings(): SoundSettings {
    return this.load<SoundSettings>(STORAGE_KEYS.SOUND_SETTINGS, DEFAULT_SOUND_SETTINGS);
  }

  public updateSoundSettings(data: Partial<SoundSettings>): void {
    const current = this.getSoundSettings();
    const updated = { ...current, ...data };
    this.save(STORAGE_KEYS.SOUND_SETTINGS, updated);
    this.notify();
  }

  public resetAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
    this.simulatedOffsetDays = 0;
    // Wipe all user items so it becomes fresh like a brand new app
    this.save(STORAGE_KEYS.TASKS, []);
    this.save(STORAGE_KEYS.GOAL_SETTINGS, DEFAULT_GOAL_SETTINGS);
    this.save(STORAGE_KEYS.GOALS, []);
    this.save(STORAGE_KEYS.DAY_GOAL_STATUS, {});
    this.save(STORAGE_KEYS.REMINDERS, []);
    this.save(STORAGE_KEYS.MOTIVATION, {
      goal: '',
      reason: '',
      reminderEnabled: false,
      reminderTime: '08:00 PM',
    });
    this.save(
      STORAGE_KEYS.BADGES,
      INITIAL_BADGES.map((b) => ({ ...b, unlocked: false, progress: 0 }))
    );
    this.save(STORAGE_KEYS.PROFILE, {
      ...DEFAULT_PROFILE,
      name: '---',
      avatarUrl: '',
      currentStreak: 0,
      bestStreak: 0,
      currentBadge: '--',
      bestBadge: '--',
      totalGoalsCompleted: 0,
      totalTasksCompleted: 0,
      totalRemindersCompleted: 0,
      streakHistory: [],
    });
    this.save(STORAGE_KEYS.NOTIFICATIONS, []);
    this.save(STORAGE_KEYS.SOUND_SETTINGS, DEFAULT_SOUND_SETTINGS);
    this.notify();
  }
}

export const commit7Store = new Commit7Storage();
