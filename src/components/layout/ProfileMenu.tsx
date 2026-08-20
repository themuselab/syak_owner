import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/app/auth';

export function ProfileMenu({ onClose }: { onClose: () => void }) {
  const nav = useNavigate();
  const { me, logout } = useAuth();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl bg-white shadow-pop border border-line">
      <div className="border-b border-line px-4 py-3">
        <p className="text-sm font-bold text-ink">사장님</p>
        <p className="text-xs text-faint">{me?.shopId ? '매장 연동됨' : '매장 미연동'}</p>
      </div>
      <button
        onClick={() => { onClose(); nav('/settings'); }}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-zinc-50"
      >
        <Settings className="h-4 w-4 text-muted" /> 계정 설정
      </button>
      <button
        onClick={async () => { onClose(); await logout(); nav('/login', { replace: true }); }}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50"
      >
        <LogOut className="h-4 w-4" /> 로그아웃
      </button>
    </div>
  );
}
