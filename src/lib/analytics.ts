// GA4(index.html gtag) 이벤트. 소비자 사이트와 같은 속성(G-Q0WLLSMTXM) — 호스트(owner.themuselab.kr)로 구분.
// gtag가 없으면(차단·로컬) 조용히 통과.
type Gtag = (cmd: 'event', name: string, params?: Record<string, unknown>) => void;

export function track(name: string, params: Record<string, unknown> = {}) {
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  try {
    g?.('event', name, params);
  } catch {
    /* noop */
  }
}
