import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, CheckCircle2, Pencil } from 'lucide-react';
import { api, type OwnerSlot, type SlotStatus } from '@/lib/api';
import { PageSpinner } from '@/components/ui/Spinner';
import { SlotFormModal } from '@/components/SlotFormModal';
import { ReserveModal } from '@/components/ReserveModal';
import { SLOT_STATUS, timeRange, serviceText, dayLabel } from '@/lib/slot';
import { cn } from '@/lib/utils';

const TABS: { key: 'all' | SlotStatus; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'waiting', label: '대기중' },
  { key: 'notified', label: '알림 완료' },
  { key: 'reserved', label: '예약 완료' },
  { key: 'expired', label: '만료' },
];
const PAGE_SIZE = 12;

export function History() {
  const { data, isLoading } = useQuery({ queryKey: ['slots'], queryFn: api.slots.list });
  const [tab, setTab] = useState<'all' | SlotStatus>('all');
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<OwnerSlot | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [reserve, setReserve] = useState<OwnerSlot | null>(null);

  const filtered = useMemo(() => {
    const slots = data?.slots ?? [];
    return tab === 'all' ? slots : slots.filter((s) => s.status === tab);
  }, [data, tab]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-ink">빈자리 등록 히스토리</h1>
        <button className="btn-primary" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> 빈자리 등록</button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-line">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
            className={cn('whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors',
              tab === t.key ? 'border-b-2 border-brand-500 text-brand-600' : 'text-muted hover:text-ink')}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card p-5">
        <p className="mb-3 text-right text-xs text-faint">총 {filtered.length}건</p>
        {rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-faint">등록한 내역이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs text-faint">
                  <th className="pb-2 font-medium">날짜</th><th className="pb-2 font-medium">시술</th>
                  <th className="pb-2 font-medium">시간</th><th className="pb-2 font-medium">시술 상세</th>
                  <th className="pb-2 font-medium">상태</th><th className="pb-2 font-medium text-right">관리</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-t border-line hover:bg-zinc-50/60">
                    <td className="py-3 text-ink">{dayLabel(s.date)}</td>
                    <td className="py-3 text-muted">{s.serviceItems[0] ?? '-'}</td>
                    <td className="py-3 text-muted">{timeRange(s.startTime, s.endTime)}</td>
                    <td className="py-3 text-muted">{serviceText(s.serviceItems)}</td>
                    <td className="py-3">
                      <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', SLOT_STATUS[s.status].cls)}>
                        {SLOT_STATUS[s.status].label}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        {(s.status === 'waiting' || s.status === 'notified') && (
                          <button onClick={() => setReserve(s)} title="예약 성사"
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50">
                            <CheckCircle2 className="h-3.5 w-3.5" /> 예약
                          </button>
                        )}
                        {s.status !== 'reserved' && (
                          <button onClick={() => setEdit(s)} title="수정" className="icon-btn h-7 w-7">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-1">
            {Array.from({ length: pages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={cn('h-8 w-8 rounded-lg text-sm', cur === i + 1 ? 'bg-brand-500 text-white font-semibold' : 'text-muted hover:bg-zinc-100')}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {addOpen && <SlotFormModal open onClose={() => setAddOpen(false)} />}
      {edit && <SlotFormModal open onClose={() => setEdit(null)} slot={edit} />}
      {reserve && <ReserveModal open onClose={() => setReserve(null)} slot={reserve} />}
    </div>
  );
}
