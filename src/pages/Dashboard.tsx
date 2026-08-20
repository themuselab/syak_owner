import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/app/auth';

/**
 * 대시보드 — 다음 단계에서 목업대로 구현(KPI 카드/조회수 차트/최근 등록 내역).
 * 지금은 온보딩 플로우의 종착지 자리표시자.
 */
export function Dashboard() {
  const nav = useNavigate();
  const { me, logout } = useAuth();
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <span className="text-2xl"><Logo /></span>
          <button
            onClick={async () => { await logout(); nav('/login', { replace: true }); }}
            className="rounded-xl px-3 py-2 text-sm font-medium text-muted hover:text-ink hover:bg-zinc-100"
          >
            로그아웃
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="card p-10 text-center">
          <h1 className="text-xl font-extrabold text-ink">대시보드는 다음 단계에서 만듭니다</h1>
          <p className="mt-2 text-sm text-muted">
            온보딩 연결 완료 — 로그인/샵 연동이 정상 동작하면 여기까지 도달해요.
          </p>
          {me && <p className="mt-4 text-xs text-faint">owner: {me.id.slice(0, 8)}… · shop: {me.shopId ?? '미연동'}</p>}
        </div>
      </main>
    </div>
  );
}
