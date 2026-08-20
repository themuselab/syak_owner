import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { api, ApiError, type OwnerSlot } from '@/lib/api';
import { cn, ymd, relativeDayLabel } from '@/lib/utils';

const TIMES = Array.from({ length: 15 }, (_, i) => `${String(9 + i).padStart(2, '0')}:00`); // 09:00~23:00
const SERVICES = ['젤네일', '원컬러', '프렌치', '이달아트', '네일아트', '페디', '기타'];

interface Props {
  open: boolean;
  onClose: () => void;
  /** 있으면 수정 모드 */
  slot?: OwnerSlot | null;
}

export function SlotFormModal({ open, onClose, slot }: Props) {
  const qc = useQueryClient();
  const editing = !!slot;

  const [date, setDate] = useState<string>(slot?.date ?? ymd(0));
  const [start, setStart] = useState<string>(slot?.startTime ?? '');
  const [end, setEnd] = useState<string | null>(slot?.endTime ?? null);
  const [items, setItems] = useState<string[]>(slot?.serviceItems ?? []);
  const [err, setErr] = useState<string | null>(null);

  const dayOptions = [0, 1, 2] as const;

  function pickTime(t: string) {
    // 시작 없거나 이미 범위 완성 → 시작 재설정
    if (!start || (start && end)) { setStart(t); setEnd(null); return; }
    if (t <= start) { setStart(t); setEnd(null); return; }
    setEnd(t);
  }
  function toggleItem(s: string) {
    setItems((cur) => cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s]);
  }

  const valid = date && start && items.length > 0;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    qc.invalidateQueries({ queryKey: ['slots'] });
    qc.invalidateQueries({ queryKey: ['owner-notifications'] });
  };

  const save = useMutation({
    mutationFn: async () => {
      if (editing) return api.slots.update(slot!.id, { date, startTime: start, endTime: end, serviceItems: items });
      return api.slots.create({ date, startTime: start, endTime: end, serviceItems: items, notify: true });
    },
    onSuccess: () => { invalidate(); onClose(); },
    onError: (e) => setErr(e instanceof ApiError ? e.message : '저장에 실패했어요'),
  });

  const del = useMutation({
    mutationFn: () => api.slots.remove(slot!.id),
    onSuccess: () => { invalidate(); onClose(); },
    onError: (e) => setErr(e instanceof ApiError ? e.message : '삭제에 실패했어요'),
  });

  const busy = save.isPending || del.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="빈자리 등록"
      footer={
        <div className="flex items-center gap-2">
          {editing && (
            <button className="btn-ghost !px-3 text-brand-600" onClick={() => del.mutate()} disabled={busy} aria-label="삭제">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button className="btn-ghost flex-1" onClick={onClose} disabled={busy}>취소</button>
          <button className="btn-primary flex-1" onClick={() => { setErr(null); save.mutate(); }} disabled={!valid || busy}>
            {busy ? <Spinner className="h-4 w-4" /> : editing ? '수정' : '등록하고 알림 보내기'}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* 날짜 */}
        <div>
          <label className="field-label">날짜 <span className="text-brand-500">*</span></label>
          <div className="grid grid-cols-3 gap-2">
            {dayOptions.map((off) => {
              const d = ymd(off);
              return (
                <button key={off} type="button" onClick={() => setDate(d)}
                  className={cn('rounded-xl border py-2.5 text-center transition-colors',
                    date === d ? 'border-brand-500 bg-brand-50' : 'border-line bg-white hover:border-brand-300')}>
                  <div className={cn('text-sm font-semibold', date === d ? 'text-brand-600' : 'text-ink')}>{relativeDayLabel(off)}</div>
                  <div className="text-xs text-faint">{d.slice(5).replace('-', '/')}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 시간대 */}
        <div>
          <label className="field-label">빈 시간대 <span className="text-brand-500">*</span></label>
          <div className="mb-2 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-line bg-zinc-50 px-3 py-2 text-sm">
              <span className="text-faint">시작</span> <span className="font-semibold text-ink">{start || '—'}</span>
            </div>
            <div className="rounded-xl border border-line bg-zinc-50 px-3 py-2 text-sm">
              <span className="text-faint">종료</span> <span className="font-semibold text-ink">{end || '—'}</span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {TIMES.map((t) => {
              const inRange = start && end && t >= start && t <= end;
              const isEdge = t === start || t === end;
              return (
                <button key={t} type="button" onClick={() => pickTime(t)}
                  className={cn('rounded-lg border py-1.5 text-xs transition-colors',
                    isEdge ? 'border-brand-500 bg-brand-500 text-white font-semibold'
                    : inRange ? 'border-brand-200 bg-brand-50 text-brand-600'
                    : 'border-line bg-white text-muted hover:border-brand-300')}>
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* 시술 항목 */}
        <div>
          <label className="field-label">시술 항목 <span className="text-brand-500">*</span></label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => (
              <button key={s} type="button" className={cn('chip', items.includes(s) && 'on')} onClick={() => toggleItem(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {err && <p className="text-sm text-brand-600">{err}</p>}
      </div>
    </Modal>
  );
}
