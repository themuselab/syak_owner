/**
 * 웹 소셜 로그인 — OAuth authorize(redirect) 플로우.
 *   로그인 버튼 → provider 인가 페이지로 리다이렉트 → `/oauth/:provider?code=…` 로 복귀
 *   → 콜백 페이지가 code를 백엔드(POST /owner/auth/:provider { code, redirect_uri })로 보내 세션 발급.
 *
 * (구 팝업 토큰 방식 Kakao.Auth.login 은 카카오 JS SDK v2에서 제거됨 → authorize 사용.)
 *
 * 필요한 env (owner/.env, .env.example 참고):
 *   VITE_KAKAO_JS_KEY       카카오 JavaScript 키 (웹 플랫폼 도메인 + Redirect URI 등록 필요)
 *   VITE_NAVER_CLIENT_ID    네이버 아이디로 로그인 Client ID (다음 단계)
 *   VITE_APPLE_CLIENT_ID    Apple Services ID (다음 단계)
 */
import type { Provider } from './api';

export class SocialConfigError extends Error {}

const env = import.meta.env as Record<string, string | undefined>;

// 공개 클라이언트 키 fallback — Vercel env 미설정 시에도 동작하게.
// 카카오는 OAuth code 플로우라 authorize·token의 client_id가 동일해야 하고, 정공법은 둘 다
// REST API 키다(JS SDK authorize는 JS키를 client_id로 써서 백엔드 REST키 교환과 불일치 → 실패).
// REST 키는 authorize URL에 노출되는 client_id 역할이라 공개값(비밀 아님). 네이버 client_id도 공개.
// ⚠️ 네이버 secret은 백엔드 전용이라 여기 없음.
const KAKAO_REST_KEY = env.VITE_KAKAO_REST_KEY || 'bb5046a818bee8b40405d90a9f150074';
const NAVER_CLIENT_ID = env.VITE_NAVER_CLIENT_ID || '1MuTe1TgsNlcRvmpv5jP';

// 애플 Services ID(웹 client_id, 공개값). env 있으면 우선.
const APPLE_CLIENT_ID = env.VITE_APPLE_CLIENT_ID || 'kr.themuselab.syak.owner';

/** 콜백 URL — authorize와 백엔드 토큰 교환에서 동일해야 하고, 콘솔 Redirect URI와 일치해야 함. */
export function redirectUriFor(provider: Provider): string {
  return `${window.location.origin}/oauth/${provider}`;
}

// ── Kakao ────────────────────────────────────────────────────────
function redirectKakao(): void {
  // 정석 REST OAuth: client_id=REST키로 authorize → code → 백엔드가 같은 REST키로 token 교환.
  const q = new URLSearchParams({
    response_type: 'code',
    client_id: KAKAO_REST_KEY,
    redirect_uri: redirectUriFor('kakao'),
  });
  window.location.href = `https://kauth.kakao.com/oauth/authorize?${q}`;
}

// ── Naver ────────────────────────────────────────────────────────
// 네이버는 CSRF 방지 state가 필수. 리다이렉트 전에 저장 → 콜백에서 검증.
const NAVER_STATE_KEY = 'syak_naver_oauth_state';

export function consumeNaverState(): string | null {
  try {
    const s = sessionStorage.getItem(NAVER_STATE_KEY);
    sessionStorage.removeItem(NAVER_STATE_KEY);
    return s;
  } catch {
    return null;
  }
}

function redirectNaver(): void {
  const clientId = NAVER_CLIENT_ID;
  if (!clientId) throw new SocialConfigError('네이버 로그인 키(VITE_NAVER_CLIENT_ID)가 설정되지 않았습니다');
  const state = (crypto.randomUUID?.() ?? String(Math.random()).slice(2)) + Date.now().toString(36);
  try { sessionStorage.setItem(NAVER_STATE_KEY, state); } catch { /* private mode 등 */ }
  const q = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUriFor('naver'),
    state,
  });
  window.location.href = `https://nid.naver.com/oauth2.0/authorize?${q}`;
}

// ── Apple ────────────────────────────────────────────────────────
// redirect+code 방식(카카오/네이버와 동일). name/email scope 없이 response_mode=query →
// GET ?code 로 복귀 → 백엔드가 .p8로 client_secret 만들어 code→id_token 교환. (도메인 인증 불필요)
function redirectApple(): void {
  if (!APPLE_CLIENT_ID) throw new SocialConfigError('애플 로그인 키(VITE_APPLE_CLIENT_ID)가 설정되지 않았습니다');
  const q = new URLSearchParams({
    response_type: 'code',
    response_mode: 'query', // scope 없이 → query 모드로 ?code GET 복귀(form_post 회피)
    client_id: APPLE_CLIENT_ID,
    redirect_uri: redirectUriFor('apple'),
  });
  window.location.href = `https://appleid.apple.com/auth/authorize?${q}`;
}

/** provider 인가 페이지로 리다이렉트 시작. 복귀는 /oauth/:provider 콜백에서 처리. */
export async function startLogin(provider: Provider): Promise<void> {
  switch (provider) {
    case 'kakao':
      return redirectKakao();
    case 'naver':
      return redirectNaver();
    case 'apple':
      return redirectApple();
  }
}
