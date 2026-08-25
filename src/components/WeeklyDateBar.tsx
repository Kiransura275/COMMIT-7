import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../utils/constants';

interface WeeklyDateBarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  realTodayDate: Date;
  hasTasksOnDate?: (dateStr: string, dayOfWeek: DayOfWeek) => boolean;
  hasGoalsCompletedOnDate?: (dateStr: string) => boolean;
}

// Local date key helper to prevent UTC offset shifting
export function toLocalDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function WeeklyDateBar({
  selectedDate,
  onSelectDate,
  realTodayDate,
  hasTasksOnDate,
  hasGoalsCompletedOnDate,
}: WeeklyDateBarProps) {
  // Compute Sunday of the week for the selected date
  const currentSunday = new Date(selectedDate);
  const dayIndex = currentSunday.getDay(); // 0 is Sunday
  currentSunday.setDate(currentSunday.getDate() - dayIndex);
  currentSunday.setHours(0, 0, 0, 0);

  // Generate 7 days (Sunday to Saturday)
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentSunday);
    d.setDate(currentSunday.getDate() + i);
    return d;
  });

  const realTodayStr = toLocalDateKey(realTodayDate);
  const selectedStr = toLocalDateKey(selectedDate);

  const handlePrevWeek = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 7);
    onSelectDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    onSelectDate(next);
  };

  const handleJumpToToday = () => {
    onSelectDate(new Date(realTodayDate));
  };

  const monthYearLabel = currentSunday.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
      {/* Header controls */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {monthYearLabel}
          </span>
          {selectedStr === realTodayStr && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Today
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleJumpToToday}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              selectedStr === realTodayStr
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
            }`}
          >
            Today
          </button>
          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={handlePrevWeek}
              aria-label="Previous week"
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextWeek}
              aria-label="Next week"
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 7 Days Bar (Sunday -> Saturday) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {weekDays.map((date, idx) => {
          const dateStr = toLocalDateKey(date);
          const isSelected = dateStr === selectedStr;
          const isRealToday = dateStr === realTodayStr;
          const dayInfo = DAYS_OF_WEEK[idx as DayOfWeek];
          const hasTasks = hasTasksOnDate ? hasTasksOnDate(dateStr, idx as DayOfWeek) : false;
          const hasGoalsCompleted = hasGoalsCompletedOnDate ? hasGoalsCompletedOnDate(dateStr) : false;

          return (
            <button
              key={dateStr}
              id={`date-bar-day-${idx}`}
              onClick={() => onSelectDate(date)}
              className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-bold ring-2 ring-emerald-500 dark:ring-emerald-400 scale-[1.02]'
                  : isRealToday
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-2 border-emerald-500/80 dark:border-emerald-600 font-semibold'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 font-medium border border-transparent'
              }`}
            >
              {/* Day Name (e.g. SUN, MON, TUE) */}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isSelected
                    ? 'text-emerald-100'
                    : isRealToday
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {dayInfo.short}
              </span>

              {/* Day Number */}
              <span className="text-sm sm:text-base font-extrabold mt-0.5">
                {date.getDate()}
              </span>

              {/* Micro badge / dots */}
              <div className="flex items-center gap-1 mt-1 h-1.5">
                {isRealToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-amber-300' : 'bg-emerald-600 dark:bg-emerald-400'
                    }`}
                    title="Current Today"
                  />
                )}
                {hasTasks && !isRealToday && (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white/90' : 'bg-sky-500 dark:bg-sky-400'
                    }`}
                    title="Scheduled Tasks"
                  />
                )}
                {hasGoalsCompleted && (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? 'bg-emerald-200' : 'bg-emerald-500'
                    }`}
                    title="Goal Achieved"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
