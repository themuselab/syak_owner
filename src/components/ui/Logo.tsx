import { cn } from '@/lib/utils';

/** syak 워드마크 — 목업의 소문자 핑크 로고 */
export function Logo({ className, muted = false }: { className?: string; muted?: boolean }) {
  return (
    <span
      className={cn(
        'select-none font-extrabold tracking-tight',
        muted ? 'text-brand-200' : 'text-gradient',
        className,
      )}
      style={{ fontSize: 'inherit' }}
    >
      syak
    </span>
  );
}
