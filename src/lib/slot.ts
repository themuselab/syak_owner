import type { SlotStatus, OwnerNotifKind } from './api';

export const SLOT_STATUS: Record<SlotStatus, { label: string; cls: string }> = {
  waiting:  { label: '대기중',    cls: 'bg-amber-50 text-amber-600' },
  notified: { label: '알림 완료',  cls: 'bg-brand-50 text-brand-600' },
  reserved: { label: '예약 완료',  cls: 'bg-emerald-50 text-emerald-600' },
  expired:  { label: '만료',      cls: 'bg-zinc-100 text-faint' },
};

export const NOTIF_KIND: Record<OwnerNotifKind, { label: string; dot: string }> = {
  dispatched: { label: '취소석 알림 발송', dot: 'bg-brand-500' },
  reserved:   { label: '예약 확정',       dot: 'bg-emerald-500' },
  expired:    { label: '빈자리 만료',     dot: 'bg-zinc-400' },
};

/** "15:00 – 16:30" (종료 없으면 시작만) */
export function timeRange(start: string, end: string | null): string {
  return end ? `${start} – ${end}` : start;
}

export function serviceText(items: string[]): string {
  return items.length ? items.join(', ') : '-';
}

/** "7/1 (오늘)" 처럼 표시 */
export function dayLabel(dateStr: string): string {
  const kstToday = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  const d = new Date(dateStr + 'T00:00:00');
  const md = `${d.getMonth() + 1}/${d.getDate()}`;
  if (dateStr === kstToday) return `${md} (오늘)`;
  const t = new Date(kstToday + 'T00:00:00');
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  if (diff === 1) return `${md} (내일)`;
  if (diff === 2) return `${md} (모레)`;
  return md;
}
