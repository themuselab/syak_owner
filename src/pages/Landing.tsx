import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, ArrowRight, CalendarClock, BellRing, CheckCircle2 } from 'lucide-react';
import { OnboardHeader } from '@/components/OnboardHeader';
import { InquiryModal } from '@/components/InquiryModal';
import { Logo } from '@/components/ui/Logo';

const STEPS = [
  { n: 1, title: '빈자리를 등록하세요', desc: '취소·노쇼로 갑자기 빈 시술 시간을 30초 만에 등록해요.' },
  { n: 2, title: '대기 고객을 찾아요', desc: '그 시술을 기다리던 근처 대기 고객을 syak이 자동으로 매칭해요.' },
  { n: 3, title: '알림으로 알려드려요', desc: '매칭된 고객에게 취소석 알림을 보내고, 먼저 누른 분께 예약돼요.' },
];

export function Landing() {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [inquiry, setInquiry] = useState(false);

  // ?inquiry=1 로 들어오면 모달 자동 오픈 (헤더 도입문의 링크 대응)
  useEffect(() => {
    if (params.get('inquiry') === '1') { setInquiry(true); params.delete('inquiry'); setParams(params, { replace: true }); }
  }, [params, setParams]);

  return (
    <div className="relative min-h-screen bg-white">
      {/* 상단 파스텔 배경 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-sky-50/40 to-white" />
        <div className="auth-blob right-[-4%] top-[6%] h-72 w-72" style={{ background: 'radial-gradient(circle,#fbcfe8,transparent 70%)' }} />
        <div className="auth-blob left-[8%] top-[24%] h-64 w-64" style={{ background: 'radial-gradient(circle,#bae6fd,transparent 70%)', animationDelay: '-8s' }} />
      </div>

      <OnboardHeader onInquiry={() => setInquiry(true)} />

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 md:grid-cols-2 md:px-8 md:pt-16">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink md:text-5xl">
            비어버린 자리,<br />그냥 두지 마세요
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted md:text-lg">
            예약이 취소돼도 빈 시간을 그대로 두지 마세요.<br />
            <Logo className="text-base md:text-lg" />이 그 시간을 기다리던 대기 고객에게 바로 알려드려요.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="btn-primary px-6 py-3.5 text-base" onClick={() => nav('/login')}>
              시작하기 <ArrowRight className="h-4 w-4" />
            </button>
            <button className="btn-ghost px-6 py-3.5 text-base" onClick={() => setInquiry(true)}>
              도입 문의
            </button>
          </div>
        </div>

        {/* 취소석 알림 미리보기 카드 */}
        <div className="relative">
          <div className="card mx-auto max-w-sm p-5 shadow-pop">
            <div className="flex items-center gap-2 text-brand-600">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-bold">취소석 알림</span>
            </div>
            <div className="mt-4 rounded-xl bg-brand-50/60 p-4">
              <p className="text-sm font-semibold text-ink">오늘 15:00–16:30 젤네일</p>
              <p className="mt-1 text-xs text-muted">청담 · 원컬러 / 이달의 아트 가능</p>
              <p className="mt-1 text-xs text-muted">대기 고객 3명에게 알림을 보냈어요</p>
            </div>
            <button className="btn-primary mt-4 w-full">예약하기</button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <p className="text-center text-xs font-bold tracking-widest text-brand-500">HOW IT WORKS</p>
        <h2 className="mt-2 text-center text-2xl font-extrabold text-ink md:text-3xl">
          빈자리만 등록하면, 나머지는 <Logo className="text-2xl md:text-3xl" />이 삭-
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-600">
                {s.n}
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 하단 CTA 배너 */}
      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-brand-50 via-white to-sky-50 p-10 text-center shadow-soft">
          <div className="auth-blob left-[-6%] bottom-[-30%] h-64 w-64" style={{ background: 'radial-gradient(circle,#f9a8d4,transparent 70%)' }} />
          <div className="auth-blob right-[-4%] top-[-30%] h-56 w-56" style={{ background: 'radial-gradient(circle,#bae6fd,transparent 70%)', animationDelay: '-6s' }} />
          <h2 className="relative text-2xl font-extrabold text-ink md:text-3xl">
            버려지는 예약시간을,<br className="sm:hidden" /> 오늘의 매출로
          </h2>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <button className="btn-primary px-6 py-3.5 text-base" onClick={() => nav('/login')}>
              로그인하고 시작
            </button>
            <button className="btn-ghost px-6 py-3.5 text-base" onClick={() => setInquiry(true)}>
              살펴보기
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />

      <InquiryModal open={inquiry} onClose={() => setInquiry(false)} />
    </div>
  );
}

const FOOTER_COLS: { title: string; items: string[] }[] = [
  { title: '제품', items: ['빈자리 등록', '취소석 알림', '대기 매칭'] },
  { title: '지원', items: ['도입 문의', '자주 묻는 질문', '고객센터'] },
  { title: '회사', items: ['소개', '블로그'] },
  { title: '문의', items: ['이용약관', '개인정보'] },
];

const HOW_ICONS = [CalendarClock, BellRing, CheckCircle2];

function LandingFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {FOOTER_COLS.map((col, i) => {
            const Icon = HOW_ICONS[i % HOW_ICONS.length];
            return (
              <div key={col.title}>
                <div className="flex items-center gap-1.5 text-sm font-bold text-ink">
                  <Icon className="h-3.5 w-3.5 text-brand-400" /> {col.title}
                </div>
                <ul className="mt-3 space-y-2">
                  {col.items.map((it) => (
                    <li key={it} className="text-sm text-muted hover:text-ink cursor-pointer">{it}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="mt-10 border-t border-line pt-6 text-xs text-faint">
          © 2026 Muse Lab Inc. · 이용약관 · 개인정보처리방침
        </div>
      </div>
    </footer>
  );
}
