/**
 * 웹 소셜 로그인 — provider JS SDK로 access_token을 받아온다.
 * 백엔드(POST /owner/auth/:provider)는 { access_token }을 받아 프로필을 교환한다.
 *
 * 필요한 env (owner/.env, .env.example 참고):
 *   VITE_KAKAO_JS_KEY       카카오 JavaScript 키 (웹 플랫폼 도메인 등록 필요)
 *   VITE_NAVER_CLIENT_ID    네이버 아이디로 로그인 Client ID
 *   VITE_NAVER_CALLBACK     네이버 콜백 URL (등록된 서비스 URL과 일치)
 *   VITE_APPLE_CLIENT_ID    Apple Services ID
 *   VITE_APPLE_REDIRECT     Apple redirect URI
 *
 * 키가 없으면 SocialConfigError를 던져 UI가 "키 미설정"을 안내한다.
 */
import type { Provider } from './api';

export class SocialConfigError extends Error {}

const env = import.meta.env as Record<string, string | undefined>;

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
  Auth: { login(opts: { success: (a: { access_token: string }) => void; fail: (e: unknown) => void }): void };
}
function kakao(): KakaoSDK | undefined {
  return (window as unknown as { Kakao?: KakaoSDK }).Kakao;
}

async function kakaoToken(): Promise<string> {
  const key = env.VITE_KAKAO_JS_KEY;
  if (!key) throw new SocialConfigError('카카오 로그인 키(VITE_KAKAO_JS_KEY)가 설정되지 않았습니다');
  await loadScript('https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js', 'kakao-sdk');
  const K = kakao();
  if (!K) throw new Error('카카오 SDK 초기화 실패');
  if (!K.isInitialized()) K.init(key);
  return new Promise((resolve, reject) => {
    K.Auth.login({
      success: (a) => resolve(a.access_token),
      fail: (e) => reject(new Error('카카오 로그인이 취소되었거나 실패했습니다: ' + JSON.stringify(e))),
    });
  });
}

// ── Naver / Apple ────────────────────────────────────────────────
// 네이버/애플은 리다이렉트 기반 플로우라 별도 콜백 페이지가 필요.
// 앱키 등록 후 구현 — 지금은 미설정 안내만.
async function naverToken(): Promise<string> {
  if (!env.VITE_NAVER_CLIENT_ID) throw new SocialConfigError('네이버 로그인 키(VITE_NAVER_CLIENT_ID)가 설정되지 않았습니다');
  throw new SocialConfigError('네이버 로그인은 키 등록 후 연결됩니다');
}
async function appleToken(): Promise<string> {
  if (!env.VITE_APPLE_CLIENT_ID) throw new SocialConfigError('애플 로그인 키(VITE_APPLE_CLIENT_ID)가 설정되지 않았습니다');
  throw new SocialConfigError('애플 로그인은 키 등록 후 연결됩니다');
}

/** provider별 access_token 획득 */
export function getSocialToken(provider: Provider): Promise<string> {
  switch (provider) {
    case 'kakao': return kakaoToken();
    case 'naver': return naverToken();
    case 'apple': return appleToken();
  }
}
