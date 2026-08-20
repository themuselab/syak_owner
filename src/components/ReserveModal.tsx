import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { api, ApiError, type OwnerSlot } from '@/lib/api';
import { timeRange } from '@/lib/slot';

export function ReserveModal({ open, onClose, slot }: { open: boolean; onClose: () => void; slot: OwnerSlot | null }) {
  const qc = useQueryClient();
  const [customer, setCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: () => api.slots.reserve(slot!.id, {
      customer: customer.trim() || null,
      amount: amount ? parseInt(amount.replace(/[^0-9]/g, ''), 10) : null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['owner-notifications'] });
      setCustomer(''); setAmount(''); onClose();
    },
    onError: (e) => setErr(e instanceof ApiError ? e.message : '처리에 실패했어요'),
  });

  if (!slot) return null;

  return (
    <Modal open={open} onClose={onClose} title="예약 성사 처리"
      footer={
        <button className="btn-primary w-full" onClick={() => { setErr(null); m.mutate(); }} disabled={m.isPending}>
          {m.isPending ? <Spinner className="h-4 w-4" /> : '예약 완료로 표시'}
        </button>
      }>
      <div className="space-y-4">
        <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm">
          <span className="text-faint">{slot.date}</span>{' '}
          <span className="font-semibold text-ink">{timeRange(slot.startTime, slot.endTime)}</span>{' · '}
          <span className="text-muted">{slot.serviceItems.join(', ') || '빈자리'}</span>
        </div>
        <div>
          <label className="field-label">고객 이름 (선택)</label>
          <input className="field" placeholder="예: 박서연" value={customer} onChange={(e) => setCustomer(e.target.value)} />
        </div>
        <div>
          <label className="field-label">결제 금액 (선택)</label>
          <input className="field" placeholder="예: 25000" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <p className="mt-1 text-xs text-faint">입력하면 대시보드 '회수한 매출'에 합산돼요.</p>
        </div>
        {err && <p className="text-sm text-brand-600">{err}</p>}
      </div>
    </Modal>
  );
}
