import { useState, FormEvent } from 'react';
import {
  Target,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  AlertTriangle,
  Layers,
  Edit3,
  Bell,
  X,
  Lock,
} from 'lucide-react';
import { useCommit7 } from '../hooks/useCommit7';
import { DAYS_OF_WEEK, CATEGORIES, MOTIVATION_TEMPLATES, MOTIVATION_THEMES } from '../utils/constants';
import { GoalItem, GoalMode, DayOfWeek, TaskCategory } from '../types';
import { soundManager } from '../utils/audio';

export function GoalsScreen() {
  const {
    todayDayOfWeek,
    goalSettings,
    updateGoalSettings,
    goals,
    saveGoals,
    motivation,
    updateMotivation,
    deleteMotivation,
    profile,
  } = useCommit7();

  const [mode, setMode] = useState<GoalMode>(goalSettings.mode);
  const [selectedWeeklyDay, setSelectedWeeklyDay] = useState<DayOfWeek>(todayDayOfWeek);

  // Local draft goals
  const [localGoals, setLocalGoals] = useState<GoalItem[]>(goals);

  // Tracker timings
  const [trackerEnabled, setTrackerEnabled] = useState(goalSettings.trackerEnabled);
  const [morningTime, setMorningTime] = useState(goalSettings.morningReminderTime || '08:00 AM');
  const [nightTime, setNightTime] = useState(goalSettings.nightCheckTime || '08:00 PM');

  // Confirmation modal for Mode switch
  const [pendingModeChange, setPendingModeChange] = useState<GoalMode | null>(null);

  // Alert Dialog state
  const [alertDialogMsg, setAlertDialogMsg] = useState<string | null>(null);
  const [alertDialogTitle, setAlertDialogTitle] = useState<string>('Notification');

  // Add / Edit Commitment Modal State
  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [draftGoalText, setDraftGoalText] = useState('');
  const [draftGoalCategory, setDraftGoalCategory] = useState<TaskCategory | null>(null);

  // Motivation Settings Modal State
  const [isMotivationModalOpen, setIsMotivationModalOpen] = useState(false);
  const [isDeleteMotivationModalOpen, setIsDeleteMotivationModalOpen] = useState(false);
  const [draftMotivationGoal, setDraftMotivationGoal] = useState('');
  const [draftMotivationReason, setDraftMotivationReason] = useState('');
  const [draftMotivationReminderEnabled, setDraftMotivationReminderEnabled] = useState(true);
  const [draftMotivationReminderTime, setDraftMotivationReminderTime] = useState('08:00 PM');

  const hasSavedMotivation = Boolean(motivation.goal?.trim() && motivation.reason?.trim());

  // Compute Today's Message using 7-day loop
  const todayTemplate = MOTIVATION_TEMPLATES[todayDayOfWeek] || MOTIVATION_TEMPLATES[0];
  const todayTheme = MOTIVATION_THEMES[todayDayOfWeek] || 'Purpose Day';
  const todayMessage = hasSavedMotivation
    ? todayTemplate
        .replace('[Goal]', motivation.goal)
        .replace('[Reason]', motivation.reason)
    : '';

  // Validation helper: Can tracker be ON?
  const canTrackerBeEnabled = (currentGoals: GoalItem[], currentMode: GoalMode): boolean => {
    if (currentMode === 'Daily') {
      return currentGoals.length >= 1;
    }
    // Weekly Mode: all 7 days (0..6) must each have at least 1 goal
    return [0, 1, 2, 3, 4, 5, 6].every((day) =>
      currentGoals.some((g) => g.dayOfWeek === day)
    );
  };

  // Handle Mode Change Request
  const handleRequestModeChange = (targetMode: GoalMode) => {
    if (targetMode === mode) return;
    setPendingModeChange(targetMode);
  };

  const confirmModeChange = () => {
    if (pendingModeChange) {
      const newMode = pendingModeChange;
      setMode(newMode);
      setLocalGoals([]);
      // When goals are reset, tracker cannot remain on
      setTrackerEnabled(false);
      setMorningTime('');
      setNightTime('');
      saveGoals([], newMode);
      updateGoalSettings({
        mode: newMode,
        trackerEnabled: false,
        morningReminderTime: '',
        nightCheckTime: '',
      });
      setPendingModeChange(null);
      if (profile.soundEnabled) soundManager.playPop();
    }
  };

  const cancelModeChange = () => {
    setPendingModeChange(null);
  };

  // Handle Tracker Switch Toggle
  const handleToggleTracker = (newChecked: boolean) => {
    if (newChecked) {
      // Validate conditions
      if (!canTrackerBeEnabled(localGoals, mode)) {
        setAlertDialogTitle('Cannot Enable Goal Tracker');
        setAlertDialogMsg(
          mode === 'Daily'
            ? 'To turn ON Goal Tracker, you must add at least one daily commitment.'
            : 'To turn ON Goal Tracker, you must add at least one commitment for each of the 7 days (Sunday through Saturday).'
        );
        if (profile.soundEnabled) soundManager.playPop();
        return;
      }

      // Valid: turn on with defaults if empty
      const nextMorning = morningTime.trim() || '08:00 AM';
      const nextNight = nightTime.trim() || '08:00 PM';
      setTrackerEnabled(true);
      setMorningTime(nextMorning);
      setNightTime(nextNight);
      updateGoalSettings({
        trackerEnabled: true,
        morningReminderTime: nextMorning,
        nightCheckTime: nextNight,
      });
      if (profile.soundEnabled) soundManager.playPop();
    } else {
      // Turn off: erase custom timing data as per specification
      setTrackerEnabled(false);
      setMorningTime('');
      setNightTime('');
      updateGoalSettings({
        trackerEnabled: false,
        morningReminderTime: '',
        nightCheckTime: '',
      });
      if (profile.soundEnabled) soundManager.playPop();
    }
  };

  // Handle Time Change
  const handleTimeChange = (type: 'morning' | 'night', value: string) => {
    if (!trackerEnabled) return;
    if (type === 'morning') {
      setMorningTime(value);
      updateGoalSettings({ morningReminderTime: value.trim() || '08:00 AM' });
    } else {
      setNightTime(value);
      updateGoalSettings({ nightCheckTime: value.trim() || '08:00 PM' });
    }
  };

  // Open Add Commitment Modal
  const openAddCommitmentModal = () => {
    setEditingGoalId(null);
    setDraftGoalText('');
    setDraftGoalCategory(null);
    setIsCommitmentModalOpen(true);
  };

  // Open Edit Commitment Modal
  const openEditCommitmentModal = (goal: GoalItem) => {
    setEditingGoalId(goal.id);
    setDraftGoalText(goal.text);
    setDraftGoalCategory(goal.category || 'Other');
    setIsCommitmentModalOpen(true);
  };

  // Save Commitment (Add or Edit)
  const handleSaveCommitment = (e: FormEvent) => {
    e.preventDefault();
    const cleanText = draftGoalText.trim();
    if (!cleanText || !draftGoalCategory) {
      setAlertDialogTitle('Required Fields Missing');
      setAlertDialogMsg('Both Commitment / Goal text and Category are necessary. Please fill in both before saving.');
      if (profile.soundEnabled) soundManager.playPop();
      return;
    }

    let updatedList: GoalItem[];
    if (editingGoalId) {
      updatedList = localGoals.map((g) =>
        g.id === editingGoalId
          ? { ...g, text: cleanText, category: draftGoalCategory }
          : g
      );
    } else {
      const newItem: GoalItem = {
        id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        dayOfWeek: mode === 'Weekly' ? selectedWeeklyDay : undefined,
        text: cleanText,
        category: draftGoalCategory,
        createdAt: new Date().toISOString(),
      };
      updatedList = [...localGoals, newItem];
    }

    setLocalGoals(updatedList);
    saveGoals(updatedList, mode);
    setIsCommitmentModalOpen(false);
    if (profile.soundEnabled) soundManager.playPop();
  };

  // Remove Commitment
  const handleRemoveCommitment = (id: string) => {
    const updatedList = localGoals.filter((g) => g.id !== id);
    setLocalGoals(updatedList);
    saveGoals(updatedList, mode);

    // If tracker was ON and removing this goal breaks the required conditions, automatically turn OFF & erase timings
    if (trackerEnabled && !canTrackerBeEnabled(updatedList, mode)) {
      setTrackerEnabled(false);
      setMorningTime('');
      setNightTime('');
      updateGoalSettings({
        trackerEnabled: false,
        morningReminderTime: '',
        nightCheckTime: '',
      });
    }

    if (profile.soundEnabled) soundManager.playPop();
  };

  // Open Motivation Settings Modal (5.2)
  const openMotivationSettings = () => {
    setDraftMotivationGoal(motivation.goal || '');
    setDraftMotivationReason(motivation.reason || '');
    setDraftMotivationReminderEnabled(motivation.reminderEnabled ?? true);
    setDraftMotivationReminderTime(motivation.reminderTime || '08:00 PM');
    setIsMotivationModalOpen(true);
  };

  // Save Motivation Settings with strict validation (5.2)
  const handleSaveMotivation = (e: FormEvent) => {
    e.preventDefault();
    const cleanGoal = draftMotivationGoal.trim();
    const cleanReason = draftMotivationReason.trim();

    if (!cleanGoal || !cleanReason) {
      setAlertDialogTitle('Required Fields Missing');
      setAlertDialogMsg('Goal and Reason are both required. Please fill in both fields before saving.');
      if (profile.soundEnabled) soundManager.playPop();
      return;
    }

    updateMotivation({
      goal: cleanGoal,
      reason: cleanReason,
      reminderEnabled: draftMotivationReminderEnabled,
      reminderTime: draftMotivationReminderTime.trim() || '08:00 PM',
    });

    if (profile.soundEnabled) soundManager.playPop();
    setIsMotivationModalOpen(false);
  };

  // Delete Motivation
  const handleDeleteMotivation = () => {
    deleteMotivation();
    setIsDeleteMotivationModalOpen(false);
    if (profile.soundEnabled) soundManager.playPop();
  };

  // Filter goals for current mode & selected day
  const displayedGoals =
    mode === 'Daily'
      ? localGoals
      : localGoals.filter((g) => g.dayOfWeek === selectedWeeklyDay);

  const categoryEntries = Object.entries(CATEGORIES) as [TaskCategory, (typeof CATEGORIES)[TaskCategory]][];

  return (
    <div className="space-y-4 pb-24 max-w-3xl mx-auto px-4 pt-3">
      {/* 1. Header (No Save Button on top) */}
      <div>
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Goals & Commitments
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Configure daily or weekly target commitments, tracker alerts, and daily motivation.
        </p>
      </div>

      {/* 2. Mode Switch & Goal Tracker Switch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Mode Switch Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Goal Mode
              </h2>
            </div>
            <span className="text-[10px] font-semibold text-zinc-400">
              {mode} Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              id="mode-daily-btn"
              onClick={() => handleRequestModeChange('Daily')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                mode === 'Daily'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-750'
              }`}
            >
              Daily Mode
            </button>
            <button
              type="button"
              id="mode-weekly-btn"
              onClick={() => handleRequestModeChange('Weekly')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                mode === 'Weekly'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-750'
              }`}
            >
              Weekly Mode (7 Days)
            </button>
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
            {mode === 'Daily'
              ? 'Daily Mode repeats the same target commitments across all 7 days.'
              : 'Weekly Mode assigns specific commitments for each day of the week.'}
          </p>
        </div>

        {/* Goal Tracker Switch Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Goals Tracker
              </h2>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                trackerEnabled
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {trackerEnabled ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 mb-2.5">
            <div className="flex-1 pr-2">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                Enable Goal Tracker
              </span>
              <span className="text-[10px] text-zinc-500">
                {trackerEnabled
                  ? 'Active: Prompts Goal Check & Reports Progress'
                  : 'Disabled: Requires commitments to be filled first'}
              </span>
            </div>
            <input
              type="checkbox"
              id="goals-tracker-toggle"
              checked={trackerEnabled}
              onChange={(e) => handleToggleTracker(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer shrink-0"
            />
          </div>

          {/* Timings: Disabled/Locked until tracker is ON */}
          <div className="grid grid-cols-2 gap-2 text-xs relative">
            {!trackerEnabled && (
              <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[1px] rounded-lg z-10 flex items-center justify-center pointer-events-none">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 shadow-2xs">
                  <Lock className="w-3 h-3" /> Turn Tracker ON to edit
                </span>
              </div>
            )}

            {/* Goal Check Input */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                Goal Check Time
              </label>
              <input
                type="text"
                id="goal-check-time-input"
                disabled={!trackerEnabled}
                value={trackerEnabled ? nightTime : ''}
                onChange={(e) => handleTimeChange('night', e.target.value)}
                placeholder="08:00 PM"
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-[9px] text-zinc-400 block mt-0.5">
                Asks if today's goal completed
              </span>
            </div>

            {/* Report Progress Input */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                Report Progress Time
              </label>
              <input
                type="text"
                id="report-progress-time-input"
                disabled={!trackerEnabled}
                value={trackerEnabled ? morningTime : ''}
                onChange={(e) => handleTimeChange('morning', e.target.value)}
                placeholder="08:00 AM"
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-[9px] text-zinc-400 block mt-0.5">
                Reminds next day if missed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Weekly Day Selector (If Weekly Mode) */}
      {mode === 'Weekly' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-2 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-1 overflow-x-auto">
          {DAYS_OF_WEEK.map((d) => {
            const isSelected = d.index === selectedWeeklyDay;
            const dayGoalsCount = localGoals.filter((g) => g.dayOfWeek === d.index).length;

            return (
              <button
                key={d.index}
                onClick={() => setSelectedWeeklyDay(d.index)}
                className={`flex-1 min-w-[42px] py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium'
                }`}
              >
                <div className="text-[10px] uppercase">{d.short}</div>
                <div className="text-xs font-bold mt-0.5">{dayGoalsCount}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Commitment Section with Add Button & Popup Modal */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {mode === 'Daily'
                ? 'Daily Commitments'
                : `${DAYS_OF_WEEK[selectedWeeklyDay].name}'s Commitments`}
            </h2>
            <p className="text-[11px] text-zinc-500">
              {displayedGoals.length} {displayedGoals.length === 1 ? 'commitment' : 'commitments'} saved
            </p>
          </div>

          <button
            type="button"
            id="add-commitment-btn"
            onClick={openAddCommitmentModal}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Commitment
          </button>
        </div>

        {/* Goals List with Category Symbol and Edit/Delete Buttons */}
        {displayedGoals.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs space-y-2">
            <Target className="w-8 h-8 mx-auto opacity-40 text-emerald-500" />
            <p className="font-semibold">No commitments added yet.</p>
            <p className="text-[11px]">
              Tap <b className="text-emerald-600 dark:text-emerald-400">"+ Add Commitment"</b> to select a category symbol and set your goal.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedGoals.map((goal) => {
              const cat = CATEGORIES[goal.category] || CATEGORIES.Other;
              return (
                <div
                  key={goal.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/80 border border-zinc-200 dark:border-zinc-750 flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl shrink-0" role="img" aria-label={goal.category}>
                      {cat.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cat.bgColor} ${cat.color} border ${cat.borderColor} inline-block mb-0.5`}
                      >
                        {goal.category}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-words">
                        {goal.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditCommitmentModal(goal)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                      title="Edit Commitment"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCommitment(goal.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                      title="Delete Commitment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Motivation Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Motivation
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {hasSavedMotivation && (
              <button
                type="button"
                id="delete-motivation-btn"
                onClick={() => setIsDeleteMotivationModalOpen(true)}
                className="px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}

            <button
              type="button"
              id="edit-motivation-btn"
              onClick={openMotivationSettings}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {hasSavedMotivation ? 'EDIT' : 'Set Motivation'}
            </button>
          </div>
        </div>

        {hasSavedMotivation ? (
          <div className="space-y-3">
            {/* Goal Row */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-750">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Goal
              </span>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 break-words">
                {motivation.goal}
              </p>
            </div>

            {/* Today's Message Row */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Today's Message ({todayTheme})
                </span>
                <span className="text-[10px] font-semibold text-zinc-400">
                  7-Day Loop
                </span>
              </div>
              <blockquote className="text-xs sm:text-sm font-serif italic text-zinc-800 dark:text-zinc-200 leading-relaxed border-l-2 border-emerald-500 pl-2.5">
                "{todayMessage}"
              </blockquote>
            </div>

            {/* Why It Matters (Reason) Row */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-750">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Why It Matters
              </span>
              <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 break-words leading-relaxed">
                {motivation.reason}
              </p>
            </div>

            {/* Motivation Notification Status / Time Row */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-750 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Motivation Notification
                </span>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                  {motivation.reminderEnabled
                    ? `Active daily alert at ${motivation.reminderTime || '08:00 PM'}`
                    : 'Notification disabled (No alerts scheduled)'}
                </p>
              </div>

              <div>
                {motivation.reminderEnabled ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ON ({motivation.reminderTime || '08:00 PM'})
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                    OFF
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 space-y-2">
            <div className="font-mono text-base font-bold text-zinc-500 dark:text-zinc-400">
              Motivation: --
            </div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              No saved motivation. Tap "Set Motivation" to configure your Goal, Reason, and daily 7-Day loop.
            </p>
          </div>
        )}
      </div>

      {/* --- POPUP MODAL: Add / Edit Commitment --- */}
      {isCommitmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                {editingGoalId ? 'Edit Commitment' : 'Add Commitment'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCommitmentModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCommitment} className="space-y-4">
              {/* Commitment / Goal Text Field */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Commitment / Goal <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Read 20 pages of high-yield literature or workout 45 mins"
                  value={draftGoalText}
                  onChange={(e) => setDraftGoalText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category Selector (Provides symbol/emoji) */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Category (Symbol) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categoryEntries.map(([catName, info]) => {
                    const isSelected = draftGoalCategory === catName;
                    return (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => setDraftGoalCategory(catName)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30'
                            : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-750'
                        }`}
                      >
                        <span className="text-2xl" role="img" aria-label={catName}>
                          {info.emoji}
                        </span>
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                          {catName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCommitmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-commitment-btn"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
                >
                  Save Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL: Motivation Settings (5.2) --- */}
      {isMotivationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Motivation Settings
              </h2>
              <button
                type="button"
                onClick={() => setIsMotivationModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMotivation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Goal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Full-Stack Architecture & Build Life-Changing Software"
                  value={draftMotivationGoal}
                  onChange={(e) => setDraftMotivationGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Reason (Why It Matters) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. To attain creative freedom and empower people with delightful digital tools"
                  value={draftMotivationReason}
                  onChange={(e) => setDraftMotivationReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-750 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Motivation Reminder
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Daily notification push with today's 7-day loop message
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftMotivationReminderEnabled}
                    onChange={(e) => setDraftMotivationReminderEnabled(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    Reminder Time
                  </label>
                  <input
                    type="text"
                    value={draftMotivationReminderTime}
                    onChange={(e) => setDraftMotivationReminderTime(e.target.value)}
                    placeholder="08:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsMotivationModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  id="motivation-save-btn"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
                >
                  SAVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL: Alert Dialog for Missing Fields / Tracker Error --- */}
      {alertDialogMsg && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-amber-200 dark:border-amber-900 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {alertDialogTitle}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
              {alertDialogMsg}
            </p>

            <button
              type="button"
              onClick={() => setAlertDialogMsg(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs transition-colors cursor-pointer"
            >
              OK, Got It
            </button>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL: Delete Motivation Confirmation --- */}
      {isDeleteMotivationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-200 dark:border-rose-800">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Delete Saved Motivation?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
              This will remove your saved motivation information. Motivation will become <b className="text-zinc-800 dark:text-zinc-200">--</b> and the Home page will reflect this deletion.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteMotivationModalOpen(false)}
                className="py-2.5 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-motivation-btn"
                onClick={handleDeleteMotivation}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL: Confirmation Dialog for Mode Switch --- */}
      {pendingModeChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Change to {pendingModeChange} Mode?
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              Changing mode will remove all existing goals and commitments. Are you sure you want to switch to {pendingModeChange} Mode?
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={cancelModeChange}
                className="py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-mode-change-btn"
                onClick={confirmModeChange}
                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Yes, Change Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
