import { createContext, useContext, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, useLocation } from 'react-router-dom';
import { api, type OwnerMe } from '@/lib/api';
import { FullSpinner } from '@/components/ui/Spinner';

interface AuthState {
  me: OwnerMe | null;
  isAuthed: boolean;
  shopLinked: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.auth.me().catch(() => null), // 401 → 미로그인(null)
    retry: false,
    staleTime: 60_000,
  });

  const me = data ?? null;
  const value: AuthState = {
    me,
    isAuthed: !!me,
    shopLinked: !!me?.shopId,
    loading: isLoading,
    refresh: async () => { await qc.invalidateQueries({ queryKey: ['me'] }); },
    logout: async () => {
      await api.auth.logout().catch(() => {});
      qc.setQueryData(['me'], null);
      await qc.invalidateQueries();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}

/** 로그인 필요 — 미로그인 시 /login. 샵 미연동인데 연동 필요한 화면이면 /link로. */
export function RequireAuth({ children, needShop = false }: { children: ReactNode; needShop?: boolean }) {
  const { isAuthed, shopLinked, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <FullSpinner />;
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (needShop && !shopLinked) return <Navigate to="/link" replace />;
  return <>{children}</>;
}

/** 이미 로그인+연동된 사용자가 온보딩 페이지에 오면 대시보드로 */
export function RedirectIfReady({ children }: { children: ReactNode }) {
  const { isAuthed, shopLinked, loading } = useAuth();
  if (loading) return <FullSpinner />;
  if (isAuthed && shopLinked) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
