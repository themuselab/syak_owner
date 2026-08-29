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
  const key = env.VITE_KAKAO_JS_KEY;
  if (!key) throw new SocialConfigError('카카오 로그인 키(VITE_KAKAO_JS_KEY)가 설정되지 않았습니다');
  await loadScript('https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js', 'kakao-sdk');
  const K = kakao();
  if (!K) throw new Error('카카오 SDK 초기화 실패');
  if (!K.isInitialized()) K.init(key);
  // 카카오 인가 페이지로 전체 리다이렉트 → 완료 후 redirectUri 로 ?code= 붙어 복귀.
  K.Auth.authorize({ redirectUri: redirectUriFor('kakao') });
}

/** provider 인가 페이지로 리다이렉트 시작. (반환 후 페이지가 떠남) */
export async function startLogin(provider: Provider): Promise<void> {
  switch (provider) {
    case 'kakao':
      return redirectKakao();
    case 'naver':
      throw new SocialConfigError('네이버 로그인은 키 등록 후 연결됩니다');
    case 'apple':
      throw new SocialConfigError('애플 로그인은 키 등록 후 연결됩니다');
  }
}
