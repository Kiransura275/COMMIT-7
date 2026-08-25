import { Home, CalendarDays, Target, Bell, User } from 'lucide-react';

export type NavTab = 'home' | 'timetable' | 'goals' | 'reminder' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingRemindersCount?: number;
}

export function BottomNav({ currentTab, onTabChange, pendingRemindersCount = 0 }: BottomNavProps) {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'timetable' as NavTab, label: 'Timetable', icon: CalendarDays },
    { id: 'goals' as NavTab, label: 'Goals', icon: Target },
    { id: 'reminder' as NavTab, label: 'Reminder', icon: Bell, badge: pendingRemindersCount },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-3xl mx-auto px-2 flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
