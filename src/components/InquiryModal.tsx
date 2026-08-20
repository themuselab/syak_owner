import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

const CATEGORIES = ['네일', '속눈썹', '피부', '왁싱', '헤어'];

export function InquiryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [shopName, setShopName] = useState('');
  const [contact, setContact] = useState('');
  const [gu, setGu] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid = shopName.trim() && contact.trim() && gu.trim() && category;

  function reset() {
    setShopName(''); setContact(''); setGu(''); setCategory(''); setNote('');
    setDone(false); setErr(null); setSubmitting(false);
  }
  function close() { reset(); onClose(); }

  async function submit() {
    if (!valid || submitting) return;
    setSubmitting(true); setErr(null);
    try {
      await api.inquiry.submit({ shopName: shopName.trim(), contact: contact.trim(), gu: gu.trim(), category, note: note.trim() || undefined });
      setDone(true);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : '문의 전송에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="도입 문의"
      footer={
        done ? (
          <button className="btn-primary w-full" onClick={close}>확인</button>
        ) : (
          <button className="btn-primary w-full" onClick={submit} disabled={!valid || submitting}>
            {submitting ? <Spinner className="h-4 w-4" /> : '문의 남기기'}
          </button>
        )
      }
    >
      {done ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-brand-500" />
          <p className="text-base font-semibold text-ink">문의가 접수됐어요</p>
          <p className="text-sm text-muted">담당자가 확인 후 남겨주신 연락처로 연락드릴게요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">샥 도입이 궁금하신가요? 남겨주시면 1:1로 안내드려요.</p>

          <div>
            <label className="field-label">대표명 <span className="text-brand-500">*</span></label>
            <input className="field" placeholder="에이머 네일 청담점" value={shopName} onChange={(e) => setShopName(e.target.value)} />
          </div>
          <div>
            <label className="field-label">연락처 <span className="text-brand-500">*</span></label>
            <input className="field" placeholder="010-1234-1234" value={contact} onChange={(e) => setContact(e.target.value)} inputMode="tel" />
          </div>
          <div>
            <label className="field-label">지역 <span className="text-brand-500">*</span></label>
            <input className="field" placeholder="서울 대치구" value={gu} onChange={(e) => setGu(e.target.value)} />
          </div>
          <div>
            <label className="field-label">시술 카테고리 <span className="text-brand-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" className={cn('chip', category === c && 'on')} onClick={() => setCategory(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="field-label">추가 문의 (선택)</label>
            <textarea className="field min-h-[72px] resize-none" placeholder="궁금한 점을 자유롭게 남겨주세요" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {err && <p className="text-sm text-brand-600">{err}</p>}
        </div>
      )}
    </Modal>
  );
}
