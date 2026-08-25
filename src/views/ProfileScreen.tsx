import React, { useState } from 'react';
import {
  User,
  Flame,
  Award,
  Calendar,
  CheckCircle,
  Edit2,
  Bell,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Camera,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { useCommit7 } from '../hooks/useCommit7';
import { BadgeHistoryModal } from './BadgeHistoryModal';
import { ChoosePhotoModal } from '../components/ChoosePhotoModal';
import { SoundSettingsModal } from '../components/SoundSettingsModal';
import { ResetConfirmModal } from '../components/ResetConfirmModal';
import { soundManager } from '../utils/audio';

export function ProfileScreen() {
  const {
    todayDateObj,
    profile,
    updateProfile,
    goalSettings,
    badges,
    soundSettings,
    updateSoundSettings,
    getWeeklyReport,
    resetAllData,
  } = useCommit7();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name || '---');
  const [showBadgeHistory, setShowBadgeHistory] = useState(false);
  const [showChoosePhoto, setShowChoosePhoto] = useState(false);
  const [activeSoundModal, setActiveSoundModal] = useState<'notification' | 'alarm' | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Compute Sunday of the current week for weekly report (Sunday Day 1 -> Saturday Day 7)
  const sundayDate = new Date(todayDateObj);
  sundayDate.setDate(sundayDate.getDate() - sundayDate.getDay());
  const sundayStr = sundayDate.toISOString().split('T')[0];

  const weeklyReport = getWeeklyReport(sundayStr);

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    updateProfile({ name: trimmed || '---' });
    setIsEditingName(false);
    soundManager.playPop();
  };

  const handleSelectPhoto = (url: string) => {
    updateProfile({ avatarUrl: url });
  };

  const isTrackerOn = goalSettings.trackerEnabled;

  // Display streak and badge values according to 8.5 (Tracker ON) and 8.6 (Tracker OFF)
  const displayCurrentStreak = isTrackerOn ? `${profile.currentStreak} Days` : '--';
  const displayBestStreak = `${profile.bestStreak} Days`;
  const displayCurrentBadge =
    isTrackerOn && profile.currentBadge && profile.currentBadge !== '--'
      ? profile.currentBadge
      : '--';
  const displayBestBadge =
    profile.bestBadge && profile.bestBadge !== '--' ? profile.bestBadge : '--';

  // Render profile photo avatar
  const renderAvatar = () => {
    if (profile.avatarUrl && profile.avatarUrl.startsWith('preset:')) {
      const parts = profile.avatarUrl.replace('preset:', '').split('|');
      const emoji = parts[0] || '🦁';
      const bg = parts[1] || 'from-emerald-500 to-teal-600';
      return (
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${bg} flex items-center justify-center text-3xl shadow-md cursor-pointer hover:scale-105 transition-all relative group border-2 border-white/20`}
        >
          <span>{emoji}</span>
          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[9px] font-bold">
            <Camera className="w-3.5 h-3.5 mb-0.5" />
            Edit
          </div>
        </div>
      );
    }
    if (
      profile.avatarUrl &&
      (profile.avatarUrl.startsWith('data:image') || profile.avatarUrl.startsWith('http'))
    ) {
      return (
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md cursor-pointer hover:scale-105 transition-all relative group border-2 border-emerald-500/40">
          <img
            src={profile.avatarUrl}
            alt="Profile avatar"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[9px] font-bold">
            <Camera className="w-3.5 h-3.5 mb-0.5" />
            Edit
          </div>
        </div>
      );
    }
    // Default profile photo
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-emerald-500/20 cursor-pointer hover:scale-105 transition-all relative group border-2 border-white/20">
        <User className="w-8 h-8 text-white" />
        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[9px] font-bold">
          <Camera className="w-3.5 h-3.5 mb-0.5" />
          Edit
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-24 max-w-3xl mx-auto px-4 pt-3">
      {/* 8.0 Profile Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Tapping photo opens Choose Photo */}
            <div onClick={() => setShowChoosePhoto(true)} title="Choose Photo">
              {renderAvatar()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
                  {profile.name || '---'}
                </h1>
                <button
                  onClick={() => {
                    setTempName(profile.name === '---' ? '' : profile.name);
                    setIsEditingName(true);
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Edit name"
                  title="Edit Name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  ★ Current: {displayCurrentBadge}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  🏆 Best: {displayBestBadge}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  • {goalSettings.mode} Mode
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Name Inline Input */}
        {isEditingName && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 animate-in fade-in duration-100">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
              className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex-1 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') setIsEditingName(false);
              }}
            />
            <button
              onClick={handleSaveName}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
            <button
              onClick={() => setIsEditingName(false)}
              className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* 8.5 & 8.6 & 8.8 Streak Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-1">
            <Flame className="w-4 h-4" />
            Current Streak
          </div>
          <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            {displayCurrentStreak}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            {isTrackerOn ? 'Consecutive Goal Days' : 'Tracker OFF'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            Best Streak
          </div>
          <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            {displayBestStreak}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">All-time record</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-600 dark:text-sky-400 mb-1">
            <Award className="w-4 h-4" />
            Current Badge
          </div>
          <div className="text-sm font-black text-zinc-900 dark:text-zinc-100 truncate">
            {displayCurrentBadge}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            {isTrackerOn ? 'Active Tier' : 'Tracker OFF'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 dark:text-violet-400 mb-1">
            <Award className="w-4 h-4" />
            Best Badge
          </div>
          <div className="text-sm font-black text-zinc-900 dark:text-zinc-100 truncate">
            {displayBestBadge}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">Highest Earned</p>
        </div>
      </div>

      {/* 8.7 Weekly Performance Report (Sunday - Saturday Cycle) */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Weekly Performance Report
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isTrackerOn
                ? `Week of ${weeklyReport.weekStart} to ${weeklyReport.weekEnd}`
                : 'Goal Tracker is currently OFF'}
            </p>
          </div>

          <div className="text-right">
            <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {isTrackerOn ? `${weeklyReport.successRate}%` : '--'}
            </div>
            <div className="text-[10px] font-semibold text-zinc-400 uppercase">
              Success Rate
            </div>
          </div>
        </div>

        {/* 7-Day Cycle Matrix (Sunday Day 1 to Saturday Day 7) */}
        {isTrackerOn ? (
          <>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-3 mb-4">
              {weeklyReport.dailyBreakdown.map((item, idx) => (
                <div
                  key={item.date}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    item.goalCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase">
                    {item.dayName.slice(0, 3)}
                  </div>
                  <div className="text-[8px] text-zinc-400 font-semibold mb-0.5">
                    D{idx + 1}
                  </div>
                  <div className="my-1 flex justify-center">
                    {item.goalCompleted ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-600" />
                    )}
                  </div>
                  <div className="text-[9px] font-semibold text-zinc-400">
                    {item.tasksCount} {item.tasksCount === 1 ? 'task' : 'tasks'}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-850 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-750 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
              <span>
                Goals Logged: <b>{weeklyReport.goalsCompletedCount} / 7</b>
              </span>
              <span>
                Tasks Done: <b>{weeklyReport.tasksCompletedCount}</b>
              </span>
              <span>
                Days Tracked: <b>{weeklyReport.daysTracked}</b>
              </span>
            </div>
          </>
        ) : (
          <div className="mt-2 py-6 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800 text-center">
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Weekly Report: <span className="font-bold text-zinc-900 dark:text-zinc-100">--</span>
            </p>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-md mx-auto">
              Goal Tracker is disabled. Turn ON the Goal Tracker in the Goals section to record and
              view Sunday–Saturday completion metrics.
            </p>
          </div>
        )}
      </section>

      {/* 8.9 Badges Section & 8.10 Track Popup Action */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Badges & Achievements
            </h2>
            <p className="text-xs text-zinc-500">
              {badges.filter((b) => b.unlocked).length} of {badges.length} streak milestones earned
            </p>
          </div>

          <button
            id="profile-track-badges-btn"
            onClick={() => setShowBadgeHistory(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            TRACK
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Milestone cards displaying the streak badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              onClick={() => setShowBadgeHistory(true)}
              className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                badge.unlocked
                  ? 'bg-zinc-50 dark:bg-zinc-850 border-emerald-300 dark:border-emerald-800/60 hover:scale-[1.02]'
                  : 'bg-zinc-50/40 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="text-2xl mb-1 flex items-center justify-center gap-1">
                <span>{badge.icon}</span>
                {!badge.unlocked && <Lock className="w-3 h-3 text-zinc-400" />}
              </div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {badge.title}
              </div>
              <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                {badge.maxProgress} Days • {badge.tier}
              </div>
              <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {badge.unlocked ? 'Earned' : `${badge.progress}/${badge.maxProgress}d`}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Preferences & System: Updated with Notification Sound & Alarm Sound Options and Clean Factory Reset */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors space-y-3">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            System & Preferences
          </h2>
          <p className="text-xs text-zinc-500">
            Configure custom sound effects, alarm tones, and app data
          </p>
        </div>

        {/* 1. Notification Sound Option */}
        <div
          id="pref-notification-sound-card"
          onClick={() => setActiveSoundModal('notification')}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 hover:border-emerald-400 dark:hover:border-emerald-700 cursor-pointer transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0 group-hover:scale-105 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Notification Sound
              </div>
              <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {soundSettings.notificationType === 'custom' && soundSettings.notificationCustomName
                    ? `Custom: ${soundSettings.notificationCustomName}`
                    : 'Default Notification Chime'}
                </span>
                <span>• 1–5 sec</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>Change</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 2. Alarm Sound Option */}
        <div
          id="pref-alarm-sound-card"
          onClick={() => setActiveSoundModal('alarm')}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 hover:border-amber-400 dark:hover:border-amber-700 cursor-pointer transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Alarm Sound
              </div>
              <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {soundSettings.alarmType === 'custom' && soundSettings.alarmCustomName
                    ? `Custom: ${soundSettings.alarmCustomName}`
                    : 'Default Alarm Chime'}
                </span>
                <span>• 30 sec (with OK button)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>Change</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 3. Reset All Commit7 Data Button */}
        <div className="pt-2">
          <button
            id="reset-all-commit7-trigger-btn"
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 px-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Commit7 Data
          </button>
        </div>
      </section>

      {/* Badge History Track Modal */}
      <BadgeHistoryModal
        isOpen={showBadgeHistory}
        onClose={() => setShowBadgeHistory(false)}
        badges={badges}
      />

      {/* Choose Photo Modal */}
      <ChoosePhotoModal
        isOpen={showChoosePhoto}
        onClose={() => setShowChoosePhoto(false)}
        currentAvatarUrl={profile.avatarUrl}
        onSelectPhoto={handleSelectPhoto}
        soundEnabled={true}
      />

      {/* Sound Settings Modal for Notification & Alarm */}
      {activeSoundModal && (
        <SoundSettingsModal
          isOpen={true}
          onClose={() => setActiveSoundModal(null)}
          soundType={activeSoundModal}
          soundSettings={soundSettings}
          onSave={updateSoundSettings}
        />
      )}

      {/* Factory Reset Confirmation Warning Modal */}
      <ResetConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          resetAllData();
          soundManager.playSuccessFanfare();
        }}
      />
    </div>
  );
}
