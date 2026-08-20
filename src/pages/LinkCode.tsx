import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { OnboardHeader } from '@/components/OnboardHeader';
import { AuthBackdrop } from '@/components/ui/AuthBackdrop';
import { CodeInput } from '@/components/CodeInput';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/app/auth';
import { api, ApiError } from '@/lib/api';

export function LinkCode() {
  const nav = useNavigate();
  const { refresh, logout } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(value = code) {
    if (value.length !== 8 || busy) return;
    setBusy(true); setErr(null);
    try {
      await api.auth.linkByCode(value);
      await refresh();
      nav('/dashboard', { replace: true });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : '코드 연동에 실패했어요. 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  }

  async function otherAccount() {
    await logout();
    nav('/login', { replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <AuthBackdrop />
      <OnboardHeader floating />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-5">
        <div className="card w-full max-w-md p-8 shadow-pop">
          <button onClick={otherAccount} className="mb-5 flex items-center gap-1 text-xs text-muted hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> 다른 계정으로
          </button>

          <h1 className="text-lg font-extrabold text-ink">매장 인증 코드를 입력해주세요</h1>
          <p className="mt-1.5 text-sm text-muted">전달받은 8자리 코드를 입력하면 계정과 매장이 연동돼요.</p>

          <div className="mt-6">
            <CodeInput
              value={code}
              onChange={(v) => { setCode(v); if (err) setErr(null); }}
              onComplete={(v) => submit(v)}
              error={!!err}
              disabled={busy}
            />
          </div>

          {err ? (
            <p className="mt-3 text-center text-xs font-medium text-brand-600">
              {err} 코드를 다시 확인해주세요.
            </p>
          ) : (
            <p className="mt-3 text-center text-xs text-faint">
              전달받은 코드가 없나요? <button onClick={() => nav('/?inquiry=1')} className="font-semibold text-brand-500 hover:underline">문의하기</button>
            </p>
          )}

          <button className="btn-primary mt-6 w-full py-3.5" onClick={() => submit()} disabled={code.length !== 8 || busy}>
            {busy ? <Spinner className="h-4 w-4" /> : '연동하기'}
          </button>
        </div>
      </main>
    </div>
  );
}
