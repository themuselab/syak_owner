/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KAKAO_JS_KEY?: string;
  readonly VITE_NAVER_CLIENT_ID?: string;
  readonly VITE_NAVER_CALLBACK?: string;
  readonly VITE_APPLE_CLIENT_ID?: string;
  readonly VITE_APPLE_REDIRECT?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
