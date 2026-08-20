import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtNumber(n: number): string {
  return new Intl.NumberFormat('ko-KR').format(n);
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

/** YYYY-MM-DD (KST 기준) — 빈자리 등록 날짜 계산용 */
export function ymd(offsetDays = 0): string {
  const now = new Date(Date.now() + 9 * 3600e3); // KST
  now.setUTCDate(now.getUTCDate() + offsetDays);
  return now.toISOString().slice(0, 10);
}

/** 오늘/내일/모레 라벨 + 날짜 */
export function relativeDayLabel(offset: 0 | 1 | 2): string {
  return ['오늘', '내일', '모레'][offset];
}
