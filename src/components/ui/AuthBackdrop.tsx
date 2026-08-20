/**
 * 온보딩(로그인/인증코드) 배경 — 목업의 파스텔 그라데이션 오브들.
 * 절대배치 + blur로 은은하게 깔린다.
 */
export function AuthBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="auth-blob left-[-8%] top-[12%] h-72 w-72"
        style={{ background: 'radial-gradient(circle, #bae6fd 0%, #e0f2fe 70%, transparent 100%)' }}
      />
      <div
        className="auth-blob right-[-6%] top-[8%] h-80 w-80"
        style={{ background: 'radial-gradient(circle, #fbcfe8 0%, #fce7f3 70%, transparent 100%)', animationDelay: '-6s' }}
      />
      <div
        className="auth-blob bottom-[-10%] left-[20%] h-96 w-96"
        style={{ background: 'radial-gradient(circle, #f9a8d4 0%, #fbcfe8 60%, transparent 100%)', animationDelay: '-12s' }}
      />
    </div>
  );
}
