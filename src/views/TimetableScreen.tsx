import { useState, FormEvent } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  Volume2,
  Bell,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { useCommit7 } from '../hooks/useCommit7';
import { CATEGORIES, DAYS_OF_WEEK } from '../utils/constants';
import { TimetableTask, DayOfWeek, TaskCategory, WorkType } from '../types';
import { soundManager } from '../utils/audio';

export function TimetableScreen() {
  const {
    todayDayOfWeek,
    getTasksForDay,
    addTask,
    updateTask,
    deleteTask,
    profile,
  } = useCommit7();

  const [activeDay, setActiveDay] = useState<DayOfWeek>(todayDayOfWeek);
  const [editingTask, setEditingTask] = useState<TimetableTask | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TimetableTask | null>(null);

  // Form State
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Study');
  const [workType, setWorkType] = useState<WorkType>('Periodic');
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('10:30');
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [smartCheckEnabled, setSmartCheckEnabled] = useState(true);
  const [formError, setFormError] = useState('');

  const tasksForDay = getTasksForDay(activeDay);

  const openCreateModal = () => {
    setEditingTask(null);
    setPurpose('');
    setCategory('Study');
    setWorkType('Periodic');
    setFromTime('09:00');
    setToTime('10:30');
    setAlarmEnabled(false);
    setNotificationEnabled(true);
    setSmartCheckEnabled(true);
    setFormError('');
    setIsCreatingNew(true);
  };

  const openEditModal = (task: TimetableTask) => {
    setEditingTask(task);
    setPurpose(task.purpose);
    setCategory(task.category);
    setWorkType(task.workType);
    setFromTime(task.fromTime);
    setToTime(task.toTime || '10:30');
    setAlarmEnabled(task.alarmEnabled);
    setNotificationEnabled(task.alarmEnabled ? true : task.notificationEnabled);
    setSmartCheckEnabled(task.smartCheckEnabled);
    setFormError('');
    setIsCreatingNew(false);
  };

  const closeModal = () => {
    setEditingTask(null);
    setIsCreatingNew(false);
    setFormError('');
  };

  // Spec 4.6 handler: When Alarm is toggled ON, Notification is automatically ON and locked
  const handleAlarmToggle = (enabled: boolean) => {
    setAlarmEnabled(enabled);
    if (enabled) {
      setNotificationEnabled(true);
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) {
      setFormError('Task purpose is required.');
      return;
    }

    if (workType === 'Periodic' && fromTime >= toTime) {
      setFormError('Start time must be earlier than End time.');
      return;
    }

    if (editingTask) {
      updateTask({
        ...editingTask,
        purpose: purpose.trim(),
        category,
        workType,
        fromTime,
        toTime: workType === 'Periodic' ? toTime : undefined,
        alarmEnabled,
        notificationEnabled: alarmEnabled ? true : notificationEnabled,
        smartCheckEnabled,
      });
    } else {
      addTask({
        dayOfWeek: activeDay,
        purpose: purpose.trim(),
        category,
        workType,
        fromTime,
        toTime: workType === 'Periodic' ? toTime : undefined,
        alarmEnabled,
        notificationEnabled: alarmEnabled ? true : notificationEnabled,
        smartCheckEnabled,
      });
    }

    if (profile.soundEnabled) soundManager.playPop();
    closeModal();
  };

  const confirmDelete = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    if (profile.soundEnabled) soundManager.playPop();
    setTaskToDelete(null);
    if (editingTask && editingTask.id === taskToDelete.id) {
      closeModal();
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-3xl mx-auto px-4 pt-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Weekly Timetable
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Organize periodic focus blocks and scheduled instant commitments.
          </p>
        </div>

        <button
          id="timetable-add-task-btn"
          onClick={openCreateModal}
          className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* 7 Days Selector Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-2 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-1 overflow-x-auto">
        {DAYS_OF_WEEK.map((d) => {
          const isSelected = d.index === activeDay;
          const isToday = d.index === todayDayOfWeek;
          const count = getTasksForDay(d.index).length;

          return (
            <button
              key={d.index}
              id={`timetable-day-${d.index}`}
              onClick={() => setActiveDay(d.index)}
              className={`flex-1 min-w-[42px] py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium'
              }`}
            >
              <div className="text-[10px] uppercase">{d.short}</div>
              <div className="text-xs font-bold mt-0.5">{count}</div>
              {isToday && (
                <div
                  className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${
                    isSelected ? 'bg-amber-300' : 'bg-emerald-500'
                  }`}
                  title="Current Day"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {DAYS_OF_WEEK[activeDay].name}'s Schedule
          </h2>
          <span className="text-xs text-zinc-500 font-medium">
            {tasksForDay.length} {tasksForDay.length === 1 ? 'task' : 'tasks'} configured
          </span>
        </div>

        {tasksForDay.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 dark:text-zinc-500">
            <Clock className="w-10 h-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">
              No tasks for {DAYS_OF_WEEK[activeDay].name}
            </p>
            <p className="text-xs mt-1 text-zinc-500 max-w-xs mx-auto">
              Tap "Add Task" above to schedule study blocks, workouts, or work commitments for this day.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasksForDay.map((task) => {
              const categoryInfo = CATEGORIES[task.category] || CATEGORIES.Other;

              return (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="text-2xl mt-0.5 shrink-0" role="img" aria-label={task.category}>
                      {categoryInfo.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${categoryInfo.bgColor} ${categoryInfo.color} border ${categoryInfo.borderColor}`}
                        >
                          {task.category}
                        </span>
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                          {task.fromTime} {task.toTime ? `– ${task.toTime}` : '(Instant)'}
                        </span>
                        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                          [{task.workType}]
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 break-words">
                        {task.purpose}
                      </h3>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className={`flex items-center gap-1 ${task.alarmEnabled ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''}`}>
                          <Volume2 className="w-3 h-3" />
                          {task.alarmEnabled ? 'Alarm On' : 'Alarm Off'}
                        </span>
                        <span className={`flex items-center gap-1 ${task.notificationEnabled ? 'text-sky-600 dark:text-sky-400 font-semibold' : ''}`}>
                          <Bell className="w-3 h-3" />
                          {task.notificationEnabled ? 'Notify On' : 'Notify Off'}
                        </span>
                        {task.smartCheckEnabled && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Smart Check
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditModal(task)}
                      aria-label="Edit task"
                      title="Edit task"
                      className="p-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTaskToDelete(task)}
                      aria-label="Delete task"
                      title="Delete task"
                      className="p-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* In-App Delete Confirmation Modal (Rock-solid replacement for window.confirm) */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Delete Timetable Task?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Are you sure you want to remove <b className="text-zinc-800 dark:text-zinc-200">"{taskToDelete.purpose}"</b> from {DAYS_OF_WEEK[activeDay].name}'s schedule?
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="py-2.5 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="timetable-confirm-delete-btn"
                onClick={confirmDelete}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Editor Modal (Section 4.3) */}
      {(isCreatingNew || editingTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {editingTask ? 'Edit Timetable Task' : `Add Task for ${DAYS_OF_WEEK[activeDay].name}`}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Purpose */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Purpose / Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Study - React & Kotlin"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category Picker */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CATEGORIES) as TaskCategory[]).map((catKey) => {
                    const cat = CATEGORIES[catKey];
                    const isCatSelected = category === catKey;
                    return (
                      <button
                        type="button"
                        key={catKey}
                        onClick={() => setCategory(catKey)}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          isCatSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Work Type: Periodic vs Instant */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Work Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkType('Periodic')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      workType === 'Periodic'
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    Periodic (Range)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkType('Instant')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      workType === 'Instant'
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    Instant (Point)
                  </button>
                </div>
              </div>

              {/* Time Configuration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    {workType === 'Periodic' ? 'From Time' : 'Time'}
                  </label>
                  <input
                    type="time"
                    required
                    value={fromTime}
                    onChange={(e) => setFromTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {workType === 'Periodic' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      To Time
                    </label>
                    <input
                      type="time"
                      required
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Toggles (Section 4.6 Logic) */}
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {/* Alarm Switch */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Alarm Chime
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Enabling alarm automatically locks Notification ON
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={alarmEnabled}
                    onChange={(e) => handleAlarmToggle(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Notification Switch */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-sky-500" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        Push Notification
                        {alarmEnabled && <Lock className="w-3 h-3 text-amber-500" />}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {alarmEnabled ? 'Locked ON because Alarm is active' : 'Visual notification alert'}
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    disabled={alarmEnabled}
                    checked={notificationEnabled}
                    onChange={(e) => setNotificationEnabled(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 disabled:opacity-50 cursor-pointer"
                  />
                </div>

                {/* Smart Check Switch (Independent) */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Smart Check
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Prompts completion query when task window completes
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smartCheckEnabled}
                    onChange={(e) => setSmartCheckEnabled(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                {editingTask && (
                  <button
                    type="button"
                    onClick={() => setTaskToDelete(editingTask)}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="timetable-save-btn"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
