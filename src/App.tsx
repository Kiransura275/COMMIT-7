/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { useCommit7 } from './hooks/useCommit7';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { SmartCheckModal } from './components/SmartCheckModal';
import { GoalCheckModal } from './components/GoalCheckModal';
import { AlarmRingingModal, ActiveAlarmInfo } from './components/AlarmRingingModal';
import { HomeView } from './views/HomeView';
import { TimetableScreen } from './views/TimetableScreen';
import { GoalsScreen } from './views/GoalsScreen';
import { ReminderScreen } from './views/ReminderScreen';
import { ProfileScreen } from './views/ProfileScreen';
import { TimetableTask } from './types';
import { soundManager } from './utils/audio';
import { MOTIVATION_TEMPLATES, MOTIVATION_THEMES } from './utils/constants';

function normalizeTimeTo24h(timeStr: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim().toUpperCase();
  if (trimmed.includes('AM') || trimmed.includes('PM')) {
    const isPM = trimmed.includes('PM');
    const clean = trimmed.replace(/[^\d:]/g, '');
    const [hStr, mStr = '00'] = clean.split(':');
    let h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  const [hStr, mStr = '00'] = trimmed.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const {
    profile,
    tasks,
    reminders,
    motivation,
    goalSettings,
    soundSettings,
    getDayGoalStatus,
    addNotification,
    toggleTaskCompletion,
    completeReminder,
    todayDateObj,
    todayDateString,
    todayDayOfWeek,
  } = useCommit7();

  // Modal states for Interactive Check triggers
  const [smartCheckTask, setSmartCheckTask] = useState<TimetableTask | null>(null);
  const [isSmartCheckOpen, setIsSmartCheckOpen] = useState(false);
  const [isGoalCheckOpen, setIsGoalCheckOpen] = useState(false);
  const [goalCheckTargetDate, setGoalCheckTargetDate] = useState<string | undefined>(undefined);

  // Active Alarm state for ringing alarm popups (Timetable and Reminders)
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarmInfo | null>(null);

  // Track triggered notifications for current session/day to prevent duplicates
  const triggeredTimesRef = useRef<Set<string>>(new Set());

  // Sync theme with document element
  useEffect(() => {
    if (profile.themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.themeMode]);

  // Background Clock Monitor for Smart Check, Alarms, Goal Check, and Push Notifications
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayKey = `${todayDateString}_${currentTimeStr}`;

      const notifAudioUrl =
        soundSettings.notificationType === 'custom'
          ? soundSettings.notificationCustomUrl
          : undefined;
      const alarmAudioUrl =
        soundSettings.alarmType === 'custom' ? soundSettings.alarmCustomUrl : undefined;

      // 1. Check Smart Check for today's timetable tasks
      const todayTasks = tasks.filter((t) => t.dayOfWeek === todayDayOfWeek);

      todayTasks.forEach((task) => {
        // Periodic Work: Smart Check occurs at To Time. Instant Work: Smart Check occurs at From Time.
        const smartCheckTargetTime =
          task.workType === 'Periodic' ? task.toTime : task.fromTime;

        if (task.smartCheckEnabled && smartCheckTargetTime === currentTimeStr) {
          const triggerKey = `smart_check_${task.id}_${todayKey}`;
          if (!triggeredTimesRef.current.has(triggerKey)) {
            triggeredTimesRef.current.add(triggerKey);

            addNotification({
              type: 'smart_check',
              title: 'Did You Complete This Task?',
              message: `${task.purpose} (${task.fromTime}${task.toTime ? ' – ' + task.toTime : ''})`,
              referenceId: task.id,
              actionRequired: true,
            });

            soundManager.playNotificationSound(notifAudioUrl);

            // Prompt user with the interactive Smart Check modal
            setSmartCheckTask(task);
            setIsSmartCheckOpen(true);
          }
        }

        // Standard Alarm / Notification for task start time
        if (task.fromTime === currentTimeStr) {
          const alarmKey = `task_start_${task.id}_${todayKey}`;
          if (!triggeredTimesRef.current.has(alarmKey)) {
            triggeredTimesRef.current.add(alarmKey);

            // User Rule: When alarm is ON, notification sound is NOT sent (Alarm takes priority)
            if (task.alarmEnabled) {
              soundManager.playAlarmSound(alarmAudioUrl);
              setActiveAlarm({
                id: task.id,
                sourceType: 'timetable',
                title: task.purpose,
                category: task.category,
                time: task.fromTime,
                fromTime: task.fromTime,
                toTime: task.toTime,
              });
            } else if (task.notificationEnabled) {
              soundManager.playNotificationSound(notifAudioUrl);
            }

            if (task.notificationEnabled || task.alarmEnabled) {
              addNotification({
                type: 'general',
                title: task.alarmEnabled ? '⏰ Timetable Task Starting' : '🔔 Task Starting',
                message: `${task.purpose} [${task.category}]`,
                referenceId: task.id,
              });
            }
          }
        }
      });

      // 2. Check Standalone Reminders for today
      const activeReminders = reminders.filter((r) => !r.isCompleted);
      activeReminders.forEach((rem) => {
        if (rem.date === todayDateString && rem.time === currentTimeStr) {
          const reminderKey = `reminder_${rem.id}_${todayKey}`;
          if (!triggeredTimesRef.current.has(reminderKey)) {
            triggeredTimesRef.current.add(reminderKey);

            // User Rule: When alarm is ON, notification sound is NOT sent (Alarm takes priority)
            if (rem.alarmEnabled) {
              soundManager.playAlarmSound(alarmAudioUrl);
              setActiveAlarm({
                id: rem.id,
                sourceType: 'reminder',
                title: rem.title,
                time: rem.time,
                message: rem.message,
              });
            } else if (rem.notificationEnabled) {
              soundManager.playNotificationSound(notifAudioUrl);
            }

            if (rem.notificationEnabled || rem.alarmEnabled) {
              addNotification({
                type: 'reminder',
                title: rem.alarmEnabled ? `⏰ Reminder: ${rem.title}` : `🔔 Reminder: ${rem.title}`,
                message: rem.message || `Scheduled reminder for ${rem.time}`,
                referenceId: rem.id,
              });
            }

            // Once the reminder triggers, send it to the completed bar
            completeReminder(rem.id);
          }
        }
      });

      // 3. Check Daily Motivation Reminder
      if (motivation.reminderEnabled && motivation.goal?.trim() && motivation.reason?.trim()) {
        const targetTime24 = normalizeTimeTo24h(motivation.reminderTime || '08:00 PM');
        if (targetTime24 === currentTimeStr) {
          const motivationKey = `motivation_${todayDateString}_${currentTimeStr}`;
          if (!triggeredTimesRef.current.has(motivationKey)) {
            triggeredTimesRef.current.add(motivationKey);

            const theme = MOTIVATION_THEMES[todayDayOfWeek] || 'Daily Motivation';
            const template = MOTIVATION_TEMPLATES[todayDayOfWeek] || MOTIVATION_TEMPLATES[0];
            const msg = template
              .replace('[Goal]', motivation.goal)
              .replace('[Reason]', motivation.reason);

            soundManager.playNotificationSound(notifAudioUrl);

            addNotification({
              type: 'general',
              title: `✨ ${theme} • Daily Motivation`,
              message: msg,
            });
          }
        }
      }

      // 4. Goal Check Notification (Night Check when tracker is ON)
      if (goalSettings.trackerEnabled) {
        const goalCheckTime24 = normalizeTimeTo24h(goalSettings.nightCheckTime || '08:00 PM');
        if (goalCheckTime24 === currentTimeStr) {
          const goalCheckKey = `goal_check_${todayDateString}_${currentTimeStr}`;
          if (!triggeredTimesRef.current.has(goalCheckKey)) {
            triggeredTimesRef.current.add(goalCheckKey);

            soundManager.playNotificationSound(notifAudioUrl);

            addNotification({
              type: 'goal_check',
              title: '🎯 Are you completed your today commitments?',
              message: "Did you complete today's goals? Tap to record your goal check before midnight (12:00 AM).",
              referenceId: todayDateString,
              actionRequired: true,
            });

            setGoalCheckTargetDate(todayDateString);
            setIsGoalCheckOpen(true);
          }
        }
      }

      // 5. Report Progress Notification (Morning report if yesterday's goal was not completed)
      if (goalSettings.trackerEnabled) {
        const morningTarget24 = normalizeTimeTo24h(goalSettings.morningReminderTime || '08:00 AM');
        if (morningTarget24 === currentTimeStr) {
          const prevDateObj = new Date(todayDateObj);
          prevDateObj.setDate(prevDateObj.getDate() - 1);
          const prevDateStr = prevDateObj.toISOString().split('T')[0];

          const prevDayStatus = getDayGoalStatus(prevDateStr);
          const isYesterdayDone =
            prevDayStatus.nightCheckResult === 'all' ||
            prevDayStatus.nightCheckResult === 'partial';

          if (!isYesterdayDone) {
            const reportProgressKey = `report_progress_${prevDateStr}_${todayDateString}_${currentTimeStr}`;
            if (!triggeredTimesRef.current.has(reportProgressKey)) {
              triggeredTimesRef.current.add(reportProgressKey);

              soundManager.playNotificationSound(notifAudioUrl);

              addNotification({
                type: 'general',
                title: "📋 Yesterday's Progress Report",
                message:
                  "Yesterday's goal was not completed.\nDon't give up. Every successful person has missed a day before.\n\nFocus on today's goals and start again.",
              });
            }
          }
        }
      }
    };

    const interval = setInterval(checkSchedule, 5000);
    checkSchedule();

    return () => clearInterval(interval);
  }, [
    tasks,
    reminders,
    motivation,
    goalSettings,
    soundSettings,
    getDayGoalStatus,
    todayDayOfWeek,
    todayDateString,
    todayDateObj,
    addNotification,
    completeReminder,
  ]);

  const handleOpenSmartCheckByTaskId = (taskId: string) => {
    const foundTask = tasks.find((t) => t.id === taskId);
    if (foundTask) {
      setSmartCheckTask(foundTask);
      setIsSmartCheckOpen(true);
    }
  };

  const pendingRemindersCount = reminders.filter((r) => !r.isCompleted).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      {/* 1. Header with dynamic greeting, theme & notifications */}
      <Header
        onOpenSmartCheck={handleOpenSmartCheckByTaskId}
        onOpenGoalCheck={(targetDate) => {
          setGoalCheckTargetDate(targetDate || todayDateString);
          setIsGoalCheckOpen(true);
        }}
      />

      {/* 2. Main Content Views */}
      <main className="flex-1">
        {currentTab === 'home' && <HomeView />}
        {currentTab === 'timetable' && <TimetableScreen />}
        {currentTab === 'goals' && <GoalsScreen />}
        {currentTab === 'reminder' && <ReminderScreen />}
        {currentTab === 'profile' && <ProfileScreen />}
      </main>

      {/* 3. Fixed Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingRemindersCount={pendingRemindersCount}
      />

      {/* 4. Smart Check Modal (Notifier only, interactive YES/NO) */}
      <SmartCheckModal
        isOpen={isSmartCheckOpen}
        task={smartCheckTask}
        onClose={() => setIsSmartCheckOpen(false)}
        onConfirmSuccess={(taskId) => {
          toggleTaskCompletion(taskId, todayDateString);
        }}
      />

      {/* 5. Nightly Goal Check Modal */}
      <GoalCheckModal
        isOpen={isGoalCheckOpen}
        targetDateStr={goalCheckTargetDate || todayDateString}
        onClose={() => {
          setIsGoalCheckOpen(false);
          setGoalCheckTargetDate(undefined);
        }}
      />

      {/* 6. Alarm Ringing Modal with OK Button (for Timetable and Reminders) */}
      <AlarmRingingModal
        alarm={activeAlarm}
        onDismiss={() => {
          soundManager.stopAlarm();
          setActiveAlarm(null);
        }}
      />
    </div>
  );
}

export default App;
