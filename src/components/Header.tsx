import { useState } from 'react';
import {
  Sun,
  Moon,
  Bell,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCommit7 } from '../hooks/useCommit7';

interface HeaderProps {
  onOpenSmartCheck?: (taskId: string) => void;
  onOpenGoalCheck?: (targetDate?: string) => void;
}

export function Header({ onOpenSmartCheck, onOpenGoalCheck }: HeaderProps) {
  const {
    todayDateObj,
    profile,
    updateProfile,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
  } = useCommit7();

  const [showNotifications, setShowNotifications] = useState(false);

  const hours = todayDateObj.getHours();
  let greeting = 'Good Morning';
  let greetingIcon = '☀️';
  if (hours >= 12 && hours < 17) {
    greeting = 'Good Afternoon';
    greetingIcon = '🌤️';
  } else if (hours >= 17 || hours < 5) {
    greeting = 'Good Evening';
    greetingIcon = '🌙';
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleTheme = () => {
    const nextTheme = profile.themeMode === 'light' ? 'dark' : 'light';
    updateProfile({ themeMode: nextTheme });
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const formattedDate = todayDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const handleNotificationClick = (n: { id: string; type: string; referenceId?: string }) => {
    markNotificationAsRead(n.id);
    if (n.type === 'smart_check' && n.referenceId && onOpenSmartCheck) {
      onOpenSmartCheck(n.referenceId);
      setShowNotifications(false);
    } else if (n.type === 'goal_check' && onOpenGoalCheck) {
      onOpenGoalCheck(n.referenceId);
      setShowNotifications(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Branding, Dynamic Greeting, User Name, and Day & Date */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-emerald-500/20 shrink-0">
            C7
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
              <span>{greetingIcon}</span>
              <span>{greeting}</span>
            </div>
            <h1 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight">
              {profile.name || 'Commit7 Champion'}
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Right Corner: ONLY Dark Mode Toggle and Notification Bell */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle (Dark/Light mode) */}
          <button
            id="header-theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle light or dark theme"
            title={`Switch to ${profile.themeMode === 'light' ? 'Dark' : 'Light'} Mode`}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            {profile.themeMode === 'light' ? (
              <Moon className="w-4 h-4 text-zinc-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              id="header-notification-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className="w-9 h-9 relative flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 max-h-[420px] bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      Alerts & Notifications
                    </span>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-medium cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto p-2 space-y-2 max-h-[320px] divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                      <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50 text-emerald-500" />
                      No active alerts right now.
                      <p className="text-[10px] mt-0.5 text-zinc-400">
                        Scheduled notifications & alarms will appear here when triggered at their designated time.
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                          n.read
                            ? 'bg-transparent text-zinc-600 dark:text-zinc-400'
                            : 'bg-emerald-50/70 dark:bg-emerald-950/40 text-zinc-900 dark:text-zinc-100 font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            {n.type === 'smart_check' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />}
                            {n.type === 'goal_check' && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                            {n.type === 'reminder' && <Bell className="w-3.5 h-3.5 text-emerald-500" />}
                            {n.title}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-1 leading-normal">
                          {n.message}
                        </p>
                        {n.type === 'smart_check' && (
                          <div className="mt-1.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                            Tap to respond (YES / NO) →
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
