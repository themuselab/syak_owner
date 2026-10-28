import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, RequireAuth, RedirectIfReady } from '@/app/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageSpinner } from '@/components/ui/Spinner';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { OAuthCallback } from '@/pages/OAuthCallback';
import { LinkCode } from '@/pages/LinkCode';
import { api } from '@/lib/api';

const qc = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: false },
  },
});

// 청크 → 데이터 → 차트 청크 순의 워터폴 방지: 페이지 청크·대시보드 데이터·차트 청크를 동시에 시작.
// (로그인+연동 후 처음 렌더될 때만 호출되므로 미인증 요청은 나가지 않음. 같은 queryKey라 useQuery가 이 결과를 재사용)
const Dashboard = lazy(() => {
  void qc.prefetchQuery({ queryKey: ['dashboard'], queryFn: api.dashboard.get });
  void import('@/components/ViewsChart');
  return import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard }));
});
const History = lazy(() => import('@/pages/History').then((m) => ({ default: m.History })));
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })));

const page = (el: React.ReactNode) => <Suspense fallback={<PageSpinner />}>{el}</Suspense>;

export function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<RedirectIfReady><Login /></RedirectIfReady>} />
            <Route path="/oauth/:provider" element={<OAuthCallback />} />
            <Route path="/link" element={<RequireAuth><LinkCode /></RequireAuth>} />

            <Route element={<RequireAuth needShop><AppLayout /></RequireAuth>}>
              <Route path="/dashboard" element={page(<Dashboard />)} />
              <Route path="/history" element={page(<History />)} />
              <Route path="/settings" element={page(<Settings />)} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
