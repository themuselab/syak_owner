import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

const LEN = 8;
// 파트너 코드 charset (0/O/1/I 제외) — 그 외 입력은 무시
const CHARSET = /[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/;

interface Props {
  value: string;               // 대문자 코드 (최대 8)
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  error?: boolean;
  disabled?: boolean;
}

/** 8칸 매장 인증코드 입력 — 자동 이동/붙여넣기/백스페이스 지원 */
export function CodeInput({ value, onChange, onComplete, error, disabled }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.padEnd(LEN).split('').slice(0, LEN);

  function setAt(i: number, raw: string) {
    const ch = raw.toUpperCase();
    if (ch && !CHARSET.test(ch)) return;
    const next = (value.padEnd(LEN).substring(0, i) + (ch || ' ') + value.padEnd(LEN).substring(i + 1)).replace(/\s+$/, '');
    const cleaned = next.replace(/\s/g, '');
    onChange(cleaned);
    if (ch && i < LEN - 1) refs.current[i + 1]?.focus();
    if (cleaned.length === LEN) onComplete?.(cleaned);
  }

  function onKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !chars[i].trim() && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().split('').filter((c) => CHARSET.test(c)).join('').slice(0, LEN);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, LEN - 1);
    refs.current[focusIdx]?.focus();
    if (pasted.length === LEN) onComplete?.(pasted);
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5">
      {Array.from({ length: LEN }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={chars[i].trim()}
          onChange={(e) => setAt(i, e.target.value.slice(-1))}
          onKeyDown={(e) => onKey(i, e)}
          onPaste={onPaste}
          disabled={disabled}
          inputMode="text"
          autoCapitalize="characters"
          maxLength={1}
          className={cn(
            'h-12 w-9 rounded-lg border text-center text-lg font-bold text-ink outline-none transition sm:h-14 sm:w-11',
            'focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
            error ? 'border-brand-400 bg-brand-50/40' : 'border-line bg-white',
            disabled && 'opacity-60',
          )}
        />
      ))}
    </div>
  );
}
