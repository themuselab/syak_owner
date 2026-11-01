// GA4(index.html gtag) 이벤트. 소비자 사이트와 같은 속성(G-Q0WLLSMTXM) — 호스트(owner.themuselab.kr)로 구분.
// gtag가 없으면(차단·로컬) 조용히 통과.
// 모든 이벤트에 platform: 'owner_web' 자동 부착. params에는 내부 id(uuid/shop id/slot id)만 — 이름·전화·이메일 금지.
// 이벤트 명세: docs/analytics.md
type Gtag = (cmd: 'event', name: string, params?: Record<string, unknown>) => void;

export function track(name: string, params: Record<string, unknown> = {}) {
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  try {
    g?.('event', name, { ...params, platform: 'owner_web' });
  } catch {
    /* noop */
  }
}
