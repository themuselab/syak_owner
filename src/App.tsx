import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, RequireAuth, RedirectIfReady } from '@/app/auth';
import { PageSpinner } from '@/components/ui/Spinner';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { LinkCode } from '@/pages/LinkCode';

const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })));

const qc = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: false },
  },
});

export function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* 공개 온보딩 */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<RedirectIfReady><Login /></RedirectIfReady>} />

            {/* 로그인 필요 — 샵 미연동이면 코드 입력 */}
            <Route path="/link" element={<RequireAuth><LinkCode /></RequireAuth>} />

            {/* 로그인 + 샵연동 필요 */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth needShop>
                  <Suspense fallback={<PageSpinner />}>
                    <Dashboard />
                  </Suspense>
                </RequireAuth>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
