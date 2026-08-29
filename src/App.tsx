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

const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const History = lazy(() => import('@/pages/History').then((m) => ({ default: m.History })));
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })));

const qc = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: false },
  },
});

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
