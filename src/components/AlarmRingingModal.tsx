import React, { useEffect, useState } from 'react';
import { Clock, BellRing, Check, Flame, Tag } from 'lucide-react';
import { soundManager } from '../utils/audio';

export interface ActiveAlarmInfo {
  id: string;
  sourceType: 'timetable' | 'reminder';
  title: string;
  category?: string;
  time: string;
  fromTime?: string;
  toTime?: string;
  message?: string;
}

interface AlarmRingingModalProps {
  alarm: ActiveAlarmInfo | null;
  onDismiss: () => void;
}

export function AlarmRingingModal({ alarm, onDismiss }: AlarmRingingModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  useEffect(() => {
    if (!alarm) return;

    setSecondsRemaining(30);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [alarm, onDismiss]);

  if (!alarm) return null;

  const handleStopAndConfirm = () => {
    soundManager.stopAlarm();
    onDismiss();
  };

  const progressPercent = Math.round((secondsRemaining / 30) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-amber-400 dark:border-amber-600 text-center relative overflow-hidden">
        {/* Pulsing Header Background */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl animate-pulse" />

        {/* Animated Ringing Bell */}
        <div className="relative mx-auto mb-4 w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 animate-bounce">
          <BellRing className="w-10 h-10 animate-spin-slow" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
          </span>
        </div>

        {/* Alarm Banner & Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 mb-2">
          <Clock className="w-3.5 h-3.5" />
          <span>{alarm.sourceType === 'timetable' ? 'Timetable Task Alarm' : 'Reminder Alarm'}</span>
        </div>

        <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-50 leading-snug mb-1">
          {alarm.title}
        </h2>

        {alarm.category && (
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg mb-2">
            <Tag className="w-3 h-3" />
            {alarm.category}
          </div>
        )}

        {alarm.fromTime && (
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
            Time: <span className="font-bold text-zinc-800 dark:text-zinc-200">{alarm.fromTime}{alarm.toTime ? ` – ${alarm.toTime}` : ''}</span>
          </p>
        )}

        {alarm.message && (
          <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-850 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 mb-4 line-clamp-3">
            {alarm.message}
          </p>
        )}

        {/* 30-Second Countdown Bar */}
        <div className="mb-5 mt-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 mb-1">
            <span>Ringing active...</span>
            <span>{secondsRemaining}s remaining</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Prominent OK Button to Stop Alarm */}
        <button
          id="alarm-modal-ok-button"
          type="button"
          onClick={handleStopAndConfirm}
          className="w-full py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          OK (Turn Off Alarm)
        </button>
      </div>
    </div>
  );
}
