import { useState } from 'react';
import {
  Clock,
  Target,
  Sparkles,
  Volume2,
  Bell,
} from 'lucide-react';
import { useCommit7 } from '../hooks/useCommit7';
import { WeeklyDateBar, toLocalDateKey } from '../components/WeeklyDateBar';
import { CATEGORIES, MOTIVATION_TEMPLATES, MOTIVATION_THEMES, DAYS_OF_WEEK } from '../utils/constants';
import { DayOfWeek } from '../types';

export function HomeView() {
  const {
    todayDateObj,
    getTasksForDay,
    getGoalsForDay,
    getDayGoalStatus,
    goalSettings,
    motivation,
  } = useCommit7();

  // Selected date defaults to current day (today)
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(todayDateObj));

  const selectedDateStr = toLocalDateKey(selectedDate);
  const realTodayDateStr = toLocalDateKey(todayDateObj);
  const isSelectedToday = selectedDateStr === realTodayDateStr;

  const selectedDayOfWeek = selectedDate.getDay() as DayOfWeek;

  // Retrieve database records strictly for the selected date
  const tasksForSelectedDay = getTasksForDay(selectedDayOfWeek);
  const goalsForSelectedDay = getGoalsForDay(selectedDayOfWeek);
  const dayGoalStatus = getDayGoalStatus(selectedDateStr);

  // Dynamic 7-day motivation loop from database for selected day
  const hasMotivation = Boolean(motivation.goal?.trim() && motivation.reason?.trim());
  const motivationTemplate = MOTIVATION_TEMPLATES[selectedDayOfWeek] || MOTIVATION_TEMPLATES[0];
  const renderedMotivation = hasMotivation
    ? motivationTemplate
        .replace('[Goal]', motivation.goal)
        .replace('[Reason]', motivation.reason)
    : '';

  const dayTheme = MOTIVATION_THEMES[selectedDayOfWeek] || 'Daily Motivation';

  const selectedDayName = DAYS_OF_WEEK[selectedDayOfWeek].name;
  const dayHeaderLabel = isSelectedToday ? `${selectedDayName} (Today)` : selectedDayName;

  return (
    <div className="space-y-4 pb-20 max-w-3xl mx-auto px-4 pt-3">
      {/* 1. Weekly Date Bar with today highlighted and selected by default */}
      <WeeklyDateBar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        realTodayDate={todayDateObj}
        hasTasksOnDate={(_dateStr, dayOfWeek) => getTasksForDay(dayOfWeek).length > 0}
        hasGoalsCompletedOnDate={(dateStr) => {
          const st = getDayGoalStatus(dateStr);
          return (
            st.completedGoalIds.length > 0 ||
            st.nightCheckResult === 'all' ||
            st.nightCheckResult === 'partial'
          );
        }}
      />

      {/* 2. Timetable Schedule Summary (Clean details without pending/done status tags) */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Timetable Schedule • {dayHeaderLabel}
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
            {tasksForSelectedDay.length} {tasksForSelectedDay.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {tasksForSelectedDay.length === 0 ? (
          <div className="py-6 text-center text-zinc-400 dark:text-zinc-500 font-mono text-sm space-y-1">
            <div>---</div>
            <div>---</div>
            <p className="text-xs font-sans text-zinc-400 dark:text-zinc-500 mt-2">
              No tasks scheduled in database for {selectedDayName}.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasksForSelectedDay.map((task) => {
              const category = CATEGORIES[task.category] || CATEGORIES.Other;

              return (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700/70 bg-white dark:bg-zinc-850 shadow-2xs transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0 mt-0.5" role="img" aria-label={task.category}>
                      {category.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${category.bgColor} ${category.color} border ${category.borderColor}`}
                        >
                          {task.category}
                        </span>
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                          {task.fromTime} {task.toTime ? `– ${task.toTime}` : '(Instant)'}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {task.workType}
                        </span>
                        {task.alarmEnabled && (
                          <span
                            className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5"
                            title="Alarm Enabled"
                          >
                            <Volume2 className="w-3 h-3" />
                          </span>
                        )}
                        {task.notificationEnabled && (
                          <span
                            className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-0.5"
                            title="Notification Enabled"
                          >
                            <Bell className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold mt-1 break-words text-zinc-900 dark:text-zinc-100">
                        {task.purpose}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Commitments & Goals Summary (Only Symbol and Goal Text as requested) */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Commitments & Goals • {dayHeaderLabel}
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
            {goalsForSelectedDay.length} {goalsForSelectedDay.length === 1 ? 'commitment' : 'commitments'}
          </span>
        </div>

        {goalsForSelectedDay.length === 0 ? (
          <div className="py-6 text-center text-zinc-400 dark:text-zinc-500 font-mono text-sm space-y-1">
            <div>---</div>
            <div>---</div>
            <p className="text-xs font-sans text-zinc-400 dark:text-zinc-500 mt-2">
              No commitments scheduled for {selectedDayName}.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {goalsForSelectedDay.map((goal) => {
              const cat = CATEGORIES[goal.category] || CATEGORIES.Other;
              return (
                <div
                  key={goal.id}
                  className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700/70 bg-white dark:bg-zinc-850 flex items-center gap-3 shadow-2xs transition-all"
                >
                  <span className="text-2xl shrink-0" role="img" aria-label={goal.category || 'Goal'}>
                    {cat.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-words">
                      {goal.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Daily Motivation Loop Summary (Read-Only) */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Daily Motivation Anchor • {dayHeaderLabel}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {hasMotivation && motivation.reminderEnabled && (
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                <Bell className="w-3 h-3" />
                {motivation.reminderTime || '08:00 PM'}
              </span>
            )}
            <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
              7-Day Loop
            </span>
          </div>
        </div>

        {hasMotivation ? (
          <>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 mb-1">
              Theme: {dayTheme}
            </div>
            <blockquote className="text-sm sm:text-base font-serif italic text-zinc-800 dark:text-zinc-200 leading-relaxed my-2 pl-3 border-l-2 border-emerald-500">
              "{renderedMotivation}"
            </blockquote>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 mt-3 gap-1">
              <span className="truncate"><b>Goal:</b> {motivation.goal}</span>
              <span className="truncate"><b>Why It Matters:</b> {motivation.reason}</span>
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-zinc-400 dark:text-zinc-500 font-mono text-sm space-y-1">
            <div>---</div>
            <div>---</div>
            <p className="text-xs font-sans text-zinc-400 dark:text-zinc-500 mt-2">
              No saved motivation configured. Set your Goal & Reason in Goals page.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
