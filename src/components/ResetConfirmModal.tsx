import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetConfirmModal({ isOpen, onClose, onConfirm }: ResetConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-rose-200 dark:border-rose-900/60">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/60 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
                Reset All Commit7 Data?
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                Permanent Action • Cannot be undone
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

        <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
          <p>
            Are you sure you want to completely reset Commit7? This action will permanently erase:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-zinc-700 dark:text-zinc-300 font-medium">
            <li>All scheduled Timetable tasks & history</li>
            <li>All Daily Goals and Streak Progress</li>
            <li>All Standalone Reminders</li>
            <li>All Badge milestones and unlocked achievements</li>
            <li>Profile details and custom sound configurations</li>
          </ul>
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 pt-1">
            After confirmation, all data will be deleted and the app will become completely fresh like a brand new app.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="confirm-reset-all-btn"
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Yes, Delete & Reset All
          </button>
        </div>
      </div>
    </div>
  );
}
