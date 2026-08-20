# 배포 — Vercel + 서브도메인 `owner.themuselab.kr`

사장님 웹앱은 소비자 웹과 동일하게 **Vercel**에 올리고, **서브도메인**으로 분리해 관리한다.
백엔드는 기존 EC2(`api.themuselab.kr`)를 그대로 쓴다.

## 1. Vercel 프로젝트 생성
- New Project → `themuselab/syak_owner` import
- Framework: **Vite** (자동 감지) · Build: `npm run build` · Output: `dist`
- 배포되면 `vercel.json`이 적용된다:
  - `/api/*` → `https://api.themuselab.kr/api/*` **프록시** (같은 오리진 → 쿠키 인증 유지)
  - 그 외 경로 → `index.html` (SPA 라우팅)

## 2. 서브도메인 연결
- Vercel 프로젝트 → Settings → Domains → `owner.themuselab.kr` 추가
- DNS(도메인 관리처)에 CNAME 추가: `owner` → `cname.vercel-dns.com`
- (소비자 웹이 이미 `www`/루트를 쓰고 있으므로 `owner`만 추가하면 됨)

## 3. 환경변수 (Vercel → Settings → Environment Variables)
소셜 로그인 키. 각 콘솔에서 **웹 플랫폼 도메인 `https://owner.themuselab.kr` 등록** 후 발급.
```
VITE_KAKAO_JS_KEY      = (카카오 JavaScript 키)
VITE_NAVER_CLIENT_ID   = (네이버 로그인 Client ID)
VITE_NAVER_CALLBACK    = https://owner.themuselab.kr/login
VITE_APPLE_CLIENT_ID   = (Apple Services ID)
VITE_APPLE_REDIRECT    = https://owner.themuselab.kr/login
```
- 카카오: 내 앱 → 플랫폼 → Web 사이트 도메인에 `https://owner.themuselab.kr`
- 네이버: 애플리케이션 → 서비스 URL / Callback URL 등록
- 카카오 JS 키만 있으면 카카오 로그인은 바로 동작(가장 먼저 붙일 것)

## 4. 쿠키/인증 주의
- 백엔드 owner 쿠키(`syak_owner_*`)는 **host-only**. Vercel `/api` 프록시로 같은 오리진이 되어
  `owner.themuselab.kr`에 정상 저장·전송된다. (별도 백엔드 쿠키 도메인 설정 불필요)
- 운영 백엔드는 `COOKIE_SECURE=true`(HTTPS)여야 한다 — 이미 설정됨.
- (보안 TODO) 백엔드 CSRF가 꺼져 있음 — 웹 클라이언트가 붙었으니 추후 재검토.

## 5. 백엔드 선행 조건
owner 화면이 실제 동작하려면 백엔드(syak_BE)에 이 커밋들의 owner 대시보드 API가
배포돼 있어야 하고, **RDS 마이그레이션(`db/migration_owner_dashboard.sql`)이 적용**돼 있어야 한다.
