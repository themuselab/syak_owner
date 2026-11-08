# Syak 사장님 웹

독립 레포 `themuselab/syak_owner`. React 18 / TypeScript / Vite / Tailwind CSS / TanStack Query / React Router.

- 개발: `npm run dev`. 검증: `npm run typecheck`, `npm run build`. 미리보기: `npm run preview`.
- 파트너 API 계약은 `../backend/docs/07-owner.md`와 실제 API 호출부를 확인한다. 사장님 쿠키는 `syak_owner_access`/`syak_owner_refresh`이다.
- 샵 소유권과 인증코드 연결은 서버 권한 검사와 함께 확인한다. 소비자·관리자 인증 흐름과 섞지 않는다.
- 기존 `src/` 구조를 따르고 배포 대상은 `vercel.json`과 실제 프로젝트에서 확인한다.
- 세부 규칙은 `.claude/rules/dashboard.md`. 전체 지도는 `../CLAUDE.md`.

공통 MCP·명령·훅은 상위 `syak/`에서 Claude Code를 실행해 사용한다.
