import { useState } from 'react';
import { FastForward, Play, RefreshCw, Sliders, Volume2, Bell, CheckCircle } from 'lucide-react';
import { useCommit7 } from '../hooks/useCommit7';
import { soundManager } from '../utils/audio';

interface TimeSimulatorBarProps {
  onTriggerSmartCheck: () => void;
  onTriggerGoalCheck: () => void;
}

export function TimeSimulatorBar({
  onTriggerSmartCheck,
  onTriggerGoalCheck,
}: TimeSimulatorBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    todayDateObj,
    simulatedOffset,
    setSimulatedOffset,
    addNotification,
    resetAllData,
    goalSettings,
    motivation,
  } = useCommit7();

  const handleMorningReminderTest = () => {
    soundManager.playNotificationPing();
    addNotification({
      type: 'morning_reminder',
      title: '☀️ Morning Commitment Review',
      message: `Daily review (${goalSettings.morningReminderTime}): Focus on "${motivation.goal}". Check your schedule for today!`,
    });
  };

  const handleNightCheckTest = () => {
    soundManager.playNotificationPing();
    addNotification({
      type: 'night_check',
      title: '🌙 Nightly Goal Check',
      message: `Time for your daily retrospective (${goalSettings.nightCheckTime}). Confirm your completed commitments.`,
    });
    onTriggerGoalCheck();
  };

  const handleTestAlarmChime = () => {
    soundManager.playAlarmChime();
    addNotification({
      type: 'smart_check',
      title: '⏰ Timetable Alarm Alert',
      message: 'Embedded non-annoying crystal chime triggered for scheduled task.',
    });
  };

  const handleAdvanceDay = () => {
    setSimulatedOffset(simulatedOffset + 1);
    soundManager.playPop();
  };

  const handleResetDay = () => {
    setSimulatedOffset(0);
    soundManager.playPop();
  };

  return (
    <div className="bg-zinc-100/90 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700/60 text-xs px-3 py-1.5 transition-colors">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold text-zinc-700 dark:text-zinc-300">
            <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Commit7 Simulation Engine:</span>
            <span className="text-[11px] font-normal text-zinc-500">
              {todayDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              {simulatedOffset !== 0 && ` (+${simulatedOffset}d)`}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline px-2 py-0.5"
          >
            {isOpen ? 'Hide Controls' : 'Test Alarms / Days'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="max-w-3xl mx-auto mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          <button
            onClick={handleMorningReminderTest}
            className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-50 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center gap-1 text-[11px] font-medium shadow-xs"
          >
            <Bell className="w-3 h-3 text-amber-500" />
            8 AM Morning
          </button>

          <button
            onClick={handleNightCheckTest}
            className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-50 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center gap-1 text-[11px] font-medium shadow-xs"
          >
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            8 PM Night Check
          </button>

          <button
            onClick={handleTestAlarmChime}
            className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-50 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center gap-1 text-[11px] font-medium shadow-xs"
          >
            <Volume2 className="w-3 h-3 text-sky-500" />
            Test Alarm Chime
          </button>

          <button
            onClick={handleAdvanceDay}
            className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-50 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center gap-1 text-[11px] font-medium shadow-xs"
          >
            <FastForward className="w-3 h-3 text-violet-500" />
            +1 Day Next
          </button>

          <button
            onClick={handleResetDay}
            className="col-span-2 sm:col-span-1 p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1 text-[11px] font-semibold"
          >
            <RefreshCw className="w-3 h-3" />
            Real Today
          </button>
        </div>
      )}
    </div>
  );
}
