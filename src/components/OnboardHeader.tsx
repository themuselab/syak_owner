import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';

/** 온보딩(랜딩/로그인/인증코드) 공통 상단바 — 로고 · 도입문의 · 로그인 */
export function OnboardHeader({ onInquiry, floating = false }: { onInquiry?: () => void; floating?: boolean }) {
  const nav = useNavigate();
  return (
    <header className={floating ? 'absolute inset-x-0 top-0 z-20' : 'relative z-20'}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <button onClick={() => nav('/')} className="text-2xl" aria-label="홈">
          <Logo />
        </button>
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onInquiry ?? (() => nav('/?inquiry=1'))}
            className="rounded-xl px-3 py-2 text-sm font-medium text-muted hover:text-ink hover:bg-zinc-100 transition-colors"
          >
            도입문의
          </button>
          <button
            onClick={() => nav('/login')}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
          >
            로그인
          </button>
        </nav>
      </div>
    </header>
  );
}
