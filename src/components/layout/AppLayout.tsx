import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Logo } from '@/components/ui/Logo';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ProfileMenu } from './ProfileMenu';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/dashboard', label: '대시보드' },
  { to: '/history', label: '등록 히스토리' },
];

export function AppLayout() {
  const nav = useNavigate();
  const [openBell, setOpenBell] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const { data: notif } = useQuery({
    queryKey: ['owner-notifications'],
    queryFn: api.notifications.list,
    refetchInterval: 60_000,
  });
  const unread = notif?.unread ?? 0;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <button onClick={() => nav('/dashboard')} className="text-2xl"><Logo /></button>

          <nav className="flex items-center gap-1 rounded-full bg-zinc-100 p-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn('rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink')
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <div className="relative">
              <button className="icon-btn relative" onClick={() => { setOpenBell(v => !v); setOpenProfile(false); }} aria-label="알림">
                <Bell className="h-5 w-5" />
                {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />}
              </button>
              {openBell && <NotificationsDropdown onClose={() => setOpenBell(false)} />}
            </div>
            <div className="relative">
              <button className="icon-btn" onClick={() => { setOpenProfile(v => !v); setOpenBell(false); }} aria-label="내 메뉴">
                <User className="h-5 w-5" />
              </button>
              {openProfile && <ProfileMenu onClose={() => setOpenProfile(false)} />}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
