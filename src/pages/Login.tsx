import { useState } from 'react';
import { Apple, MessageCircle } from 'lucide-react';
import { OnboardHeader } from '@/components/OnboardHeader';
import { AuthBackdrop } from '@/components/ui/AuthBackdrop';
import { InquiryModal } from '@/components/InquiryModal';
import { Spinner } from '@/components/ui/Spinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/auth';
import { api, ApiError, type Provider } from '@/lib/api';
import { startLogin, getAppleIdToken, SocialConfigError } from '@/lib/social';

export function Login() {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [busy, setBusy] = useState<Provider | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [inquiry, setInquiry] = useState(false);

  async function loginWith(provider: Provider) {
    if (busy) return;
    setBusy(provider); setErr(null);
    try {
      if (provider === 'apple') {
        // 애플은 팝업 → id_token 즉시 반환 → 백엔드 검증 → 이동(카카오/네이버 리다이렉트와 다름)
        const idToken = await getAppleIdToken();
        const res = await api.auth.social('apple', idToken);
        await refresh();
        nav(res.shopLinked ? '/dashboard' : '/link', { replace: true });
      } else {
        // 카카오/네이버는 인가 페이지로 리다이렉트 → 복귀는 /oauth/:provider 콜백에서 처리.
        // 성공 시 이 페이지는 떠나므로 이후 코드는 실행되지 않는다(에러일 때만 아래 catch).
        await startLogin(provider);
      }
    } catch (e) {
      if (e instanceof SocialConfigError) setErr(e.message);
      else if (e instanceof ApiError) setErr(e.message);
      else setErr(e instanceof Error ? e.message : '로그인에 실패했어요. 다시 시도해주세요.');
      setBusy(null);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <AuthBackdrop />
      <OnboardHeader onInquiry={() => setInquiry(true)} floating />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-5">
        <div className="card w-full max-w-md p-8 shadow-pop">
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-ink">사장님, 환영합니다 🎉</h1>
            <p className="mt-1 text-sm text-muted">로그인</p>
          </div>

          <div className="mt-7 space-y-2.5">
            <SocialButton
              onClick={() => loginWith('apple')} busy={busy === 'apple'} disabled={!!busy}
              className="bg-black text-white hover:bg-zinc-800"
              icon={<Apple className="h-4 w-4" />} label="Apple로 계속하기"
            />
            <SocialButton
              onClick={() => loginWith('kakao')} busy={busy === 'kakao'} disabled={!!busy}
              className="bg-[#FEE500] text-[#191600] hover:brightness-95"
              icon={<MessageCircle className="h-4 w-4 fill-current" />} label="카카오로 계속하기"
            />
            <SocialButton
              onClick={() => loginWith('naver')} busy={busy === 'naver'} disabled={!!busy}
              className="bg-[#03C75A] text-white hover:brightness-95"
              icon={<span className="text-base font-black leading-none">N</span>} label="네이버로 계속하기"
            />
          </div>

          {err && (
            <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-center text-xs text-brand-600">{err}</p>
          )}

          <p className="mt-6 text-center text-xs text-faint">
            서비스 코드를 잃어버리셨나요?{' '}
            <button className="font-semibold text-brand-500 hover:underline" onClick={() => setInquiry(true)}>
              문의하기
            </button>
          </p>
        </div>
      </main>

      <InquiryModal open={inquiry} onClose={() => setInquiry(false)} />
    </div>
  );
}

function SocialButton({
  onClick, busy, disabled, className, icon, label,
}: {
  onClick: () => void; busy: boolean; disabled: boolean;
  className: string; icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition disabled:opacity-60 ${className}`}
    >
      {busy ? <Spinner className="h-4 w-4" /> : icon}
      {label}
    </button>
  );
}
