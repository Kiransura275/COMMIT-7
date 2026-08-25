import { useState } from 'react';
import { CheckCircle2, Sparkles, Clock, X } from 'lucide-react';
import { TimetableTask } from '../types';
import { soundManager } from '../utils/audio';

interface SmartCheckModalProps {
  task?: TimetableTask | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSuccess: (taskId: string) => void;
  onConfirmFail?: (taskId: string) => void;
}

export function SmartCheckModal({
  task,
  isOpen,
  onClose,
  onConfirmSuccess,
  onConfirmFail,
}: SmartCheckModalProps) {
  const [answeredState, setAnsweredState] = useState<'none' | 'success' | 'fail'>('none');

  if (!isOpen || !task) return null;

  const handleYes = () => {
    soundManager.playSuccessFanfare();
    setAnsweredState('success');
    onConfirmSuccess(task.id);
  };

  const handleNo = () => {
    soundManager.playPop();
    setAnsweredState('fail');
    if (onConfirmFail) onConfirmFail(task.id);
  };

  const handleDoneOk = () => {
    setAnsweredState('none');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleDoneOk}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {answeredState === 'none' && (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-4 border border-sky-200 dark:border-sky-800">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>

            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 mb-2">
              Smart Check
            </span>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Did You Complete This Task?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Check in for your scheduled timetable commitment.
            </p>

            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-6 text-left">
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                {task.category} • {task.fromTime} {task.toTime ? `– ${task.toTime}` : ''}
              </span>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {task.purpose}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                id="smart-check-no-btn"
                onClick={handleNo}
                className="py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm cursor-pointer"
              >
                NO
              </button>
              <button
                id="smart-check-yes-btn"
                onClick={handleYes}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 transition-colors text-sm cursor-pointer"
              >
                YES
              </button>
            </div>
          </div>
        )}

        {answeredState === 'success' && (
          <div className="py-2 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">
              Congratulations! You completed your task.
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Recorded in your timetable history.
            </p>
            <button
              id="smart-check-success-ok-btn"
              onClick={handleDoneOk}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        )}

        {answeredState === 'fail' && (
          <div className="py-2 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-700">
              <CheckCircle2 className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 mb-2">
              No Problem! Try Better Next Time.
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Consistency is built one step at a time.
            </p>
            <button
              id="smart-check-fail-ok-btn"
              onClick={handleDoneOk}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
