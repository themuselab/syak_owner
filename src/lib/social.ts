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

// 공개 클라이언트 키 fallback — Vercel env 미설정 시에도 동작하게(이 값들은 원래 클라이언트에
// 박히는 공개키: 카카오 JavaScript 키, 네이버 client_id). env가 있으면 그게 우선.
// ⚠️ 비밀값 아님(네이버 secret은 백엔드 전용이라 여기 없음).
const KAKAO_JS_KEY = env.VITE_KAKAO_JS_KEY || '9031903041583ac1b4b01be5c45a5106';
const NAVER_CLIENT_ID = env.VITE_NAVER_CLIENT_ID || '1MuTe1TgsNlcRvmpv5jP';

/** 콜백 URL — authorize와 백엔드 토큰 교환에서 동일해야 하고, 콘솔 Redirect URI와 일치해야 함. */
export function redirectUriFor(provider: Provider): string {
  return `${window.location.origin}/oauth/${provider}`;
}

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const s = document.createElement('script');
    s.id = id; s.src = src; s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`스크립트 로드 실패: ${src}`));
    document.head.appendChild(s);
  });
}

// ── Kakao ────────────────────────────────────────────────────────
interface KakaoSDK {
  init(key: string): void;
  isInitialized(): boolean;
  Auth: { authorize(opts: { redirectUri: string }): void };
}
function kakao(): KakaoSDK | undefined {
  return (window as unknown as { Kakao?: KakaoSDK }).Kakao;
}

async function redirectKakao(): Promise<void> {
  const key = KAKAO_JS_KEY;
  if (!key) throw new SocialConfigError('카카오 로그인 키(VITE_KAKAO_JS_KEY)가 설정되지 않았습니다');
  await loadScript('https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js', 'kakao-sdk');
  const K = kakao();
  if (!K) throw new Error('카카오 SDK 초기화 실패');
  if (!K.isInitialized()) K.init(key);
  // 카카오 인가 페이지로 전체 리다이렉트 → 완료 후 redirectUri 로 ?code= 붙어 복귀.
  K.Auth.authorize({ redirectUri: redirectUriFor('kakao') });
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

/** provider 인가 페이지로 리다이렉트 시작. (반환 후 페이지가 떠남) */
export async function startLogin(provider: Provider): Promise<void> {
  switch (provider) {
    case 'kakao':
      return redirectKakao();
    case 'naver':
      return redirectNaver();
    case 'apple':
      throw new SocialConfigError('애플 로그인은 키 등록 후 연결됩니다');
  }
}
