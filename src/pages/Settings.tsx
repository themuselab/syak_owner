import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { PageSpinner, Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

export function Settings() {
  const [tab, setTab] = useState<'account' | 'shop'>('account');
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-ink">계정 설정</h1>
      <div className="flex gap-4 border-b border-line">
        {([['account', '계정'], ['shop', '매장 정보']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={cn('px-1 pb-2.5 text-sm font-medium transition-colors',
              tab === k ? 'border-b-2 border-brand-500 text-brand-600' : 'text-muted hover:text-ink')}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'account' ? <AccountForm /> : <ShopForm />}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function AccountForm() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['profile'], queryFn: api.profile.get });
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data) { setName(data.name ?? ''); setPhone(data.phone ?? ''); setEmail(data.email ?? ''); }
  }, [data]);

  const save = useMutation({
    mutationFn: () => api.profile.update({ name, phone, email }),
    onSuccess: () => { setMsg('저장했어요'); qc.invalidateQueries({ queryKey: ['profile'] }); },
    onError: (e) => setMsg(e instanceof ApiError ? e.message : '저장 실패'),
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="card max-w-xl p-6">
      <p className="mb-4 text-sm font-bold text-ink">계정 정보</p>
      <div className="space-y-4">
        <Row label="원장님 이름"><input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" /></Row>
        <Row label="휴대폰 번호"><input className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" inputMode="tel" /></Row>
        <Row label="이메일"><input className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" inputMode="email" /></Row>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        {msg && <span className="text-xs text-muted">{msg}</span>}
        <button className="btn-primary" onClick={() => { setMsg(null); save.mutate(); }} disabled={save.isPending}>
          {save.isPending ? <Spinner className="h-4 w-4" /> : '저장하기'}
        </button>
      </div>
    </div>
  );
}

function ShopForm() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['shop'], queryFn: api.shop.get, retry: false });
  const [name, setName] = useState(''); const [address, setAddress] = useState('');
  const [items, setItems] = useState<string[]>([]); const [draft, setDraft] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data) { setName(data.name); setAddress(data.address); setItems(data.serviceItems); }
  }, [data]);

  const save = useMutation({
    mutationFn: () => api.shop.update({ name, address, serviceItems: items }),
    onSuccess: () => { setMsg('저장했어요'); qc.invalidateQueries({ queryKey: ['shop'] }); },
    onError: (e) => setMsg(e instanceof ApiError ? e.message : '저장 실패'),
  });

  function addItem() {
    const v = draft.trim();
    if (v && !items.includes(v)) setItems([...items, v]);
    setDraft('');
  }

  if (isLoading) return <PageSpinner />;
  if (error) {
    return (
      <div className="card max-w-xl p-6 text-center">
        <p className="text-sm text-muted">매장 정보를 불러올 수 없어요.</p>
        <p className="mt-1 text-xs text-faint">{error instanceof ApiError ? error.message : '잠시 후 다시 시도해주세요.'}</p>
      </div>
    );
  }

  return (
    <div className="card max-w-xl p-6">
      <p className="mb-4 text-sm font-bold text-ink">매장 정보</p>
      <div className="space-y-4">
        <Row label="매장명"><input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="매장 이름" /></Row>
        <Row label="주소"><input className="field" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="도로명 주소" /></Row>
        <Row label="세부 시술 항목">
          <div className="flex flex-wrap items-center gap-2">
            {items.map((it) => (
              <span key={it} className="flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-sm text-brand-600">
                {it}
                <button onClick={() => setItems(items.filter((x) => x !== it))} aria-label="삭제"><X className="h-3.5 w-3.5" /></button>
              </span>
            ))}
            <span className="flex items-center gap-1 rounded-lg border border-dashed border-line px-2 py-1">
              <input value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                placeholder="직접 추가" className="w-24 bg-transparent text-sm outline-none placeholder:text-faint" />
              <button onClick={addItem} className="text-muted hover:text-ink"><Plus className="h-3.5 w-3.5" /></button>
            </span>
          </div>
        </Row>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        {msg && <span className="text-xs text-muted">{msg}</span>}
        <button className="btn-primary" onClick={() => { setMsg(null); save.mutate(); }} disabled={save.isPending}>
          {save.isPending ? <Spinner className="h-4 w-4" /> : '저장하기'}
        </button>
      </div>
    </div>
  );
}
