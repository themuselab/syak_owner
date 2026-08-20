# syak_owner — 샥 사장님 웹앱

취소·노쇼로 빈 시술 시간을 대기 고객에게 알려 매출로 전환하는 **사장님용** 웹앱.
관리자(syak_admin)·소비자(syak)와 **같은 EC2 백엔드(syak_BE)** 를 사용한다. 프론트만 별도.

## 스택
React 18 · Vite 5 · TypeScript · Tailwind 3 · react-router 6 · @tanstack/react-query
(디자인 시스템·API 규약은 syak_admin을 계승 — 브랜드 핑크 + Pretendard, `/api/v1` 쿠키 인증)

## 실행
```bash
npm install
cp .env.example .env   # 소셜 로그인 키 입력
npm run dev            # http://localhost:3200 (→ /api 프록시: localhost:3000)
```

## 인증 (HttpOnly 쿠키, `syak_owner_*`)
1. 소셜 로그인 `POST /owner/auth/{kakao|naver|apple}` — 웹은 provider JS SDK로 access_token 획득 후 전송
2. 매장 인증코드 8자리 `POST /owner/auth/code` — 계정↔매장 연동
3. `GET /owner/auth/me` 로 세션 확인

## 화면 흐름
- `/` 랜딩 (+ 도입문의 모달 → `POST /inquiries`)
- `/login` 소셜 로그인 → 연동 여부에 따라 `/dashboard` 또는 `/link`
- `/link` 매장 인증코드 입력
- `/dashboard` 대시보드 *(다음 단계 구현 예정)*

## 남은 백엔드 작업 (프론트와 함께 추가 필요)
- 빈자리 등록 "알림 보내기" (현재 슬롯 생성은 알림 미발송)
- 슬롯: 종료시간·시술항목 (현재 `{date, startTime}`만)
- 사장님 프로필/매장정보 read·update 엔드포인트 (현재 없음)
- (보안) 웹 클라이언트용 CSRF 재검토 — 현재 비활성
