import { X, Award, CheckCircle2, Lock, Sparkles, Flame } from 'lucide-react';
import { Badge } from '../types';

interface BadgeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
}

export function BadgeHistoryModal({ isOpen, onClose, badges }: BadgeHistoryModalProps) {
  if (!isOpen) return null;

  // Order badges in descending order of requirement: Legend (100) down to Beginner (3)
  const sortedBadges = [...badges].sort((a, b) => b.maxProgress - a.maxProgress);
  const unlockedCount = sortedBadges.filter((b) => b.unlocked).length;

  const tierColors: Record<Badge['tier'], { bg: string; text: string; border: string }> = {
    Bronze: {
      bg: 'bg-amber-100 dark:bg-amber-950/60',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-800',
    },
    Silver: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-700',
    },
    Gold: {
      bg: 'bg-yellow-100 dark:bg-yellow-950/60',
      text: 'text-yellow-800 dark:text-yellow-300',
      border: 'border-yellow-400 dark:border-yellow-700',
    },
    Platinum: {
      bg: 'bg-purple-100 dark:bg-purple-950/60',
      text: 'text-purple-800 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-750',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Badge Achievements History
              </h2>
              <p className="text-xs text-zinc-500">
                Unlocked {unlockedCount} of {sortedBadges.length} streak milestones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {sortedBadges.map((badge) => {
            const tierStyle = tierColors[badge.tier];
            const pct = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  badge.unlocked
                    ? 'bg-white dark:bg-zinc-850 border-emerald-300 dark:border-emerald-800/80 shadow-2xs'
                    : 'bg-zinc-50/60 dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                      badge.unlocked
                        ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 grayscale opacity-60'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          {badge.title}
                          {badge.unlocked ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-zinc-400" />
                          )}
                        </h3>
                        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-0.5">
                          <Flame className="w-3 h-3 text-amber-500" />
                          {badge.maxProgress} Days
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                      >
                        {badge.tier}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {badge.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] font-semibold mb-1 text-zinc-500">
                        <span>Streak Progress: {badge.progress} / {badge.maxProgress} Days</span>
                        <span className={badge.unlocked ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                          {badge.unlocked ? 'Earned' : `${pct}%`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            badge.unlocked
                              ? 'bg-emerald-500'
                              : pct > 0
                              ? 'bg-amber-500'
                              : 'bg-zinc-300 dark:bg-zinc-700'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {badge.unlockedAt && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5">
                        Unlocked on {badge.unlockedAt}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

