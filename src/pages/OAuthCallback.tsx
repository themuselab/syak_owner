import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/app/auth';
import { api, ApiError, type Provider } from '@/lib/api';
import { redirectUriFor } from '@/lib/social';

const VALID: Provider[] = ['kakao', 'naver', 'apple'];

/**
 * 소셜 로그인 콜백 — provider 인가 페이지에서 `/oauth/:provider?code=…` 로 복귀.
 * code를 백엔드(POST /owner/auth/:provider { code, redirect_uri })로 보내 세션(쿠키)을 받고,
 * 샵 연동 여부에 따라 /dashboard 또는 /link 로 이동.
 */
export function OAuthCallback() {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const { provider } = useParams<{ provider: string }>();
  const [params] = useSearchParams();
  const [err, setErr] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode 이중 실행/재렌더 방지 (code는 1회용)
    ran.current = true;
    const p = provider as Provider;
    const code = params.get('code');
    const oauthErr = params.get('error');
    void (async () => {
      if (!VALID.includes(p)) { setErr('지원하지 않는 로그인입니다'); return; }
      if (oauthErr || !code) { setErr('로그인이 취소되었어요'); return; }
      try {
        const res = await api.auth.socialCode(p, code, redirectUriFor(p));
        await refresh();
        nav(res.shopLinked ? '/dashboard' : '/link', { replace: true });
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : '로그인에 실패했어요. 다시 시도해주세요.');
      }
    })();
  }, [provider, params, refresh, nav]);

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      {err ? (
        <div className="text-center">
          <p className="text-sm text-muted">{err}</p>
          <button
            className="mt-3 font-semibold text-brand-500 hover:underline"
            onClick={() => nav('/login', { replace: true })}
          >
            로그인으로 돌아가기
          </button>
        </div>
      ) : (
        <div className="text-center">
          <Spinner />
          <p className="mt-3 text-sm text-muted">로그인 중…</p>
        </div>
      )}
    </div>
  );
}
