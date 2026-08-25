import { useState } from 'react';
import { Target, Flame, AlertCircle, X, Check, XCircle } from 'lucide-react';
import { useCommit7 } from '../hooks/useCommit7';
import { CATEGORIES } from '../utils/constants';

interface GoalCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDateStr?: string;
}

export function GoalCheckModal({ isOpen, onClose, targetDateStr }: GoalCheckModalProps) {
  const {
    todayDateString,
    todayDayOfWeek,
    getGoalsForDay,
    processNightCheck,
    profile,
  } = useCommit7();

  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  if (!isOpen) return null;

  const checkDate = targetDateStr || todayDateString;
  const isPastDay = checkDate < todayDateString;
  const dayGoals = getGoalsForDay(todayDayOfWeek);

  const handleResponse = (answer: 'yes' | 'no') => {
    if (isPastDay) return;

    if (answer === 'yes') {
      processNightCheck('all', checkDate);
      setFeedback('yes');
    } else {
      processNightCheck('none', checkDate);
      setFeedback('no');
    }

    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center relative overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Case 1: Response past midnight (12:00 AM) */}
        {isPastDay ? (
          <div className="py-4 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
              Response not valid
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
              The previous day's Goal Check has already been processed.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : feedback === 'yes' ? (
          /* Case 2: User tapped YES */
          <div className="py-4 space-y-2 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <Flame className="w-8 h-8 text-amber-500 animate-bounce" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">
              Excellent!
            </h3>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              You are completed today's goal. Streak +1 🔥
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Current streak: <b className="text-zinc-800 dark:text-zinc-200">{profile.currentStreak} days</b>
            </p>
          </div>
        ) : feedback === 'no' ? (
          /* Case 3: User tapped NO */
          <div className="py-4 space-y-2 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
              Keep trying!
            </h3>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Try again tomorrow. Current streak reset.
            </p>
          </div>
        ) : (
          /* Case 4: Active Question before 12:00 AM */
          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-200 dark:border-amber-800">
              <Target className="w-7 h-7" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 mb-2">
              Goal Check
            </div>

            <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mb-1">
              Are you completed your today commitments?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Respond before midnight (12:00 AM) to record your streak.
            </p>

            {/* Today's Commitments list with symbols */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-5 text-left max-h-36 overflow-y-auto space-y-2">
              {dayGoals.length === 0 ? (
                <p className="text-xs text-zinc-400 italic text-center py-2">
                  No commitments scheduled for today.
                </p>
              ) : (
                dayGoals.map((g) => {
                  const cat = CATEGORIES[g.category] || CATEGORIES.Other;
                  return (
                    <div key={g.id} className="flex items-center gap-2.5 text-xs">
                      <span className="text-lg shrink-0" role="img" aria-label={g.category}>
                        {cat.emoji}
                      </span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-semibold break-words flex-1 min-w-0">
                        {g.text}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Two Clear Options: YES and NO */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="goal-check-no-btn"
                onClick={() => handleResponse('no')}
                className="py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs sm:text-sm hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4 text-rose-500" />
                No
              </button>

              <button
                type="button"
                id="goal-check-yes-btn"
                onClick={() => handleResponse('yes')}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                Yes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
