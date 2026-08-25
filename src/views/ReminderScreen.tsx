import { useState, FormEvent } from 'react';
import {
  Bell,
  Plus,
  Clock,
  Calendar,
  Volume2,
  Trash2,
  Edit2,
  X,
  Lock,
  Search,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useCommit7 } from '../hooks/useCommit7';
import { StandaloneReminder } from '../types';
import { soundManager } from '../utils/audio';

export function ReminderScreen() {
  const {
    todayDateString,
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    profile,
  } = useCommit7();

  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isCreating, setIsCreating] = useState(false);
  const [editingReminder, setEditingReminder] = useState<StandaloneReminder | null>(null);
  const [reminderToDelete, setReminderToDelete] = useState<StandaloneReminder | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayDateString);
  const [time, setTime] = useState('12:00');
  const [message, setMessage] = useState('');
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [formError, setFormError] = useState('');

  // Get current time string HH:mm for default future time (+15 mins)
  const getNextDefaultTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const openCreateModal = () => {
    setEditingReminder(null);
    setTitle('');
    setDate(todayDateString);
    setTime(getNextDefaultTime());
    setMessage('');
    setAlarmEnabled(false);
    setNotificationEnabled(true);
    setFormError('');
    setIsCreating(true);
  };

  const openEditModal = (rem: StandaloneReminder) => {
    setEditingReminder(rem);
    setTitle(rem.title);
    setDate(rem.date);
    setTime(rem.time);
    setMessage(rem.message || '');
    setAlarmEnabled(rem.alarmEnabled);
    setNotificationEnabled(rem.alarmEnabled ? true : rem.notificationEnabled);
    setFormError('');
    setIsCreating(false);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingReminder(null);
    setFormError('');
  };

  // Alarm ON forces Notification ON and locks it
  const handleAlarmToggle = (enabled: boolean) => {
    setAlarmEnabled(enabled);
    if (enabled) {
      setNotificationEnabled(true);
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Reminder title is required.');
      return;
    }
    if (!date) {
      setFormError('Date is required.');
      return;
    }
    if (!time) {
      setFormError('Time is required.');
      return;
    }

    // Past time validation (Do not allow creating or updating to a past time)
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    if (date < todayDateString) {
      setFormError('Cannot schedule a reminder for a past date.');
      return;
    }

    if (date === todayDateString && time <= currentTimeStr) {
      setFormError('Cannot schedule a reminder in the past. Please select a future time.');
      return;
    }

    if (editingReminder) {
      updateReminder({
        ...editingReminder,
        title: title.trim(),
        date,
        time,
        message: message.trim() || undefined,
        alarmEnabled,
        notificationEnabled: alarmEnabled ? true : notificationEnabled,
      });
    } else {
      addReminder({
        title: title.trim(),
        date,
        time,
        message: message.trim() || undefined,
        alarmEnabled,
        notificationEnabled: alarmEnabled ? true : notificationEnabled,
      });
    }

    if (profile.soundEnabled) soundManager.playPop();
    closeModal();
  };

  const confirmDelete = () => {
    if (!reminderToDelete) return;
    deleteReminder(reminderToDelete.id);
    if (profile.soundEnabled) soundManager.playPop();
    setReminderToDelete(null);
    if (editingReminder && editingReminder.id === reminderToDelete.id) {
      closeModal();
    }
  };

  // Chronological sort comparator (date ascending, then time ascending)
  const sortChronological = (a: StandaloneReminder, b: StandaloneReminder) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.time.localeCompare(b.time);
  };

  // Filter with search query
  const queryMatched = reminders.filter((r) => {
    if (!searchQuery.trim()) return true;
    return (
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.message && r.message.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const activeReminders = queryMatched.filter((r) => !r.isCompleted).sort(sortChronological);
  const completedReminders = queryMatched.filter((r) => r.isCompleted).sort(sortChronological);

  const totalVisibleCount =
    activeFilter === 'active'
      ? activeReminders.length
      : activeFilter === 'completed'
      ? completedReminders.length
      : activeReminders.length + completedReminders.length;

  return (
    <div className="space-y-4 pb-24 max-w-3xl mx-auto px-4 pt-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Standalone Reminders
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Chronological date and time alerts with automated alarm chimes and push alerts.
          </p>
        </div>

        <button
          type="button"
          id="reminder-add-btn"
          onClick={openCreateModal}
          className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          {(['all', 'active', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {filter === 'all' && `All (${activeReminders.length + completedReminders.length})`}
              {filter === 'active' && `Active (${activeReminders.length})`}
              {filter === 'completed' && `Completed (${completedReminders.length})`}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reminders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Reminders Main Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Timeline ({totalVisibleCount})
          </h2>
          <span className="text-[11px] text-zinc-500 font-medium">
            Chronologically Ordered
          </span>
        </div>

        {totalVisibleCount === 0 ? (
          <div className="py-12 text-center text-zinc-400 dark:text-zinc-500">
            <Bell className="w-10 h-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">
              No Reminders Found
            </p>
            <p className="text-xs mt-1 text-zinc-500 max-w-xs mx-auto">
              Tap "Add Reminder" to schedule customized date and time reminders.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. Active Reminders Section (Shown on 'all' and 'active') */}
            {(activeFilter === 'all' || activeFilter === 'active') && activeReminders.length > 0 && (
              <div className="space-y-2.5">
                {activeFilter === 'all' && completedReminders.length > 0 && (
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    Active Reminders ({activeReminders.length})
                  </div>
                )}

                {activeReminders.map((rem) => {
                  const isToday = rem.date === todayDateString;

                  return (
                    <div
                      key={rem.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isToday
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 shadow-2xs'
                          : 'bg-white dark:bg-zinc-850 border-zinc-200 dark:border-zinc-750'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isToday
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                              }`}
                            >
                              <Calendar className="w-2.5 h-2.5 inline mr-1" />
                              {rem.date} {isToday && '(Today)'}
                            </span>

                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {rem.time}
                            </span>

                            {rem.alarmEnabled && (
                              <span
                                className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5"
                                title="Alarm Enabled"
                              >
                                <Volume2 className="w-3 h-3" />
                                Alarm
                              </span>
                            )}

                            {rem.notificationEnabled && (
                              <span
                                className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-0.5"
                                title="Notification Enabled"
                              >
                                <Bell className="w-3 h-3" />
                                Alert
                              </span>
                            )}

                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              Active
                            </span>
                          </div>

                          <h3 className="text-sm font-bold mt-1.5 break-words text-zinc-900 dark:text-zinc-100">
                            {rem.title}
                          </h3>

                          {rem.message && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed break-words">
                              {rem.message}
                            </p>
                          )}
                        </div>

                        {/* Actions (Edit and Delete) */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditModal(rem)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            aria-label="Edit reminder"
                            title="Edit reminder"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setReminderToDelete(rem)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                            aria-label="Delete reminder"
                            title="Delete reminder"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Completed Reminders Section (Shown at the bottom on 'all' after active, and on 'completed') */}
            {(activeFilter === 'all' || activeFilter === 'completed') && completedReminders.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 pb-0.5 border-b border-zinc-100 dark:border-zinc-800">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Completed Reminders ({completedReminders.length})
                </div>

                {completedReminders.map((rem) => {
                  return (
                    <div
                      key={rem.id}
                      className="p-3.5 rounded-xl border bg-zinc-50/80 dark:bg-zinc-850/40 border-zinc-200 dark:border-zinc-800 opacity-80 hover:opacity-100 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                              <Calendar className="w-2.5 h-2.5 inline mr-1" />
                              {rem.date}
                            </span>

                            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {rem.time}
                            </span>

                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                              Completed
                            </span>
                          </div>

                          <h3 className="text-sm font-semibold mt-1.5 break-words line-through text-zinc-400 dark:text-zinc-500">
                            {rem.title}
                          </h3>

                          {rem.message && (
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed break-words">
                              {rem.message}
                            </p>
                          )}
                        </div>

                        {/* Actions (Edit and Delete) */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditModal(rem)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            aria-label="Edit reminder"
                            title="Edit reminder"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setReminderToDelete(rem)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                            aria-label="Delete reminder"
                            title="Delete reminder"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* In-App Delete Confirmation Modal (Rock-solid replacement for window.confirm) */}
      {reminderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Delete Reminder?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Are you sure you want to remove <b className="text-zinc-800 dark:text-zinc-200">"{reminderToDelete.title}"</b>?
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setReminderToDelete(null)}
                className="py-2.5 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="reminder-confirm-delete-btn"
                onClick={confirmDelete}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Reminder Modal */}
      {(isCreating || editingReminder) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {editingReminder ? 'Edit Reminder' : 'Add Standalone Reminder'}
              </h2>
              <button
                type="button"
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
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doctor Checkup & Prescriptions"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayDateString}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Message / Context Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Additional context or checklist items..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Toggles (Alarm & Notification) */}
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Alarm Audio
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Enabling alarm automatically forces Notification ON
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
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                {editingReminder && (
                  <button
                    type="button"
                    onClick={() => setReminderToDelete(editingReminder)}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 font-semibold text-xs transition-colors cursor-pointer"
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
                  id="reminder-save-btn"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
