import { useState, useEffect, useCallback } from 'react';
import { commit7Store } from '../utils/storage';
import {
  TimetableTask,
  GoalSettings,
  GoalItem,
  StandaloneReminder,
  MotivationData,
  Badge,
  ProfileData,
  AppNotification,
  DayOfWeek,
  GoalMode,
  SoundSettings,
} from '../types';

export function useCommit7() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = commit7Store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const todayDateObj = commit7Store.getTodayDateObj();
  const todayDateString = commit7Store.getTodayDateString();
  const todayDayOfWeek = commit7Store.getTodayDayOfWeek();

  const tasks = commit7Store.getTasks();
  const goalSettings = commit7Store.getGoalSettings();
  const goals = commit7Store.getGoals();
  const reminders = commit7Store.getReminders();
  const motivation = commit7Store.getMotivation();
  const badges = commit7Store.getBadges();
  const profile = commit7Store.getProfile();
  const notifications = commit7Store.getNotifications();
  const soundSettings = commit7Store.getSoundSettings();
  const simulatedOffset = commit7Store.getSimulatedOffset();

  const getTasksForDay = useCallback((day: DayOfWeek) => {
    return commit7Store.getTasksForDay(day);
  }, []);

  const getGoalsForDay = useCallback((day: DayOfWeek) => {
    return commit7Store.getGoalsForDay(day);
  }, []);

  const getDayGoalStatus = useCallback((date: string) => {
    return commit7Store.getDayGoalStatus(date);
  }, []);

  const addTask = useCallback((task: Omit<TimetableTask, 'id' | 'completedDates'>) => {
    return commit7Store.addTask(task);
  }, []);

  const updateTask = useCallback((task: TimetableTask) => {
    commit7Store.updateTask(task);
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    commit7Store.deleteTask(taskId);
  }, []);

  const toggleTaskCompletion = useCallback((taskId: string, date: string) => {
    return commit7Store.toggleTaskCompletion(taskId, date);
  }, []);

  const updateGoalSettings = useCallback((settings: Partial<GoalSettings>) => {
    commit7Store.updateGoalSettings(settings);
  }, []);

  const saveGoals = useCallback((newGoals: GoalItem[], mode?: GoalMode) => {
    commit7Store.saveGoals(newGoals, mode);
  }, []);

  const toggleGoalCompletion = useCallback((goalId: string, date: string) => {
    return commit7Store.toggleGoalCompletion(goalId, date);
  }, []);

  const processNightCheck = useCallback((result: 'all' | 'partial' | 'none', targetDate?: string) => {
    commit7Store.processNightCheck(result, targetDate);
  }, []);

  const addReminder = useCallback((rem: Omit<StandaloneReminder, 'id' | 'isCompleted'>) => {
    return commit7Store.addReminder(rem);
  }, []);

  const updateReminder = useCallback((rem: StandaloneReminder) => {
    commit7Store.updateReminder(rem);
  }, []);

  const deleteReminder = useCallback((id: string) => {
    commit7Store.deleteReminder(id);
  }, []);

  const toggleReminder = useCallback((id: string) => {
    return commit7Store.toggleReminder(id);
  }, []);

  const completeReminder = useCallback((id: string) => {
    commit7Store.completeReminder(id);
  }, []);

  const updateMotivation = useCallback((data: Partial<MotivationData>) => {
    commit7Store.updateMotivation(data);
  }, []);

  const deleteMotivation = useCallback(() => {
    commit7Store.deleteMotivation();
  }, []);

  const updateProfile = useCallback((data: Partial<ProfileData>) => {
    commit7Store.updateProfile(data);
  }, []);

  const setSimulatedOffset = useCallback((days: number) => {
    commit7Store.setSimulatedOffset(days);
  }, []);

  const getWeeklyReport = useCallback((weekStartDate: string) => {
    return commit7Store.getWeeklyReport(weekStartDate);
  }, []);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    return commit7Store.addNotification(notif);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    commit7Store.markNotificationAsRead(id);
  }, []);

  const clearAllNotifications = useCallback(() => {
    commit7Store.clearAllNotifications();
  }, []);

  const updateSoundSettings = useCallback((data: Partial<SoundSettings>) => {
    commit7Store.updateSoundSettings(data);
  }, []);

  const resetAllData = useCallback(() => {
    commit7Store.resetAllData();
  }, []);

  return {
    todayDateObj,
    todayDateString,
    todayDayOfWeek,
    simulatedOffset,
    tasks,
    goalSettings,
    goals,
    reminders,
    motivation,
    badges,
    profile,
    notifications,
    soundSettings,
    getTasksForDay,
    getGoalsForDay,
    getDayGoalStatus,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    updateGoalSettings,
    saveGoals,
    toggleGoalCompletion,
    processNightCheck,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    completeReminder,
    updateMotivation,
    deleteMotivation,
    updateProfile,
    updateSoundSettings,
    setSimulatedOffset,
    getWeeklyReport,
    addNotification,
    markNotificationAsRead,
    clearAllNotifications,
    resetAllData,
  };
}
