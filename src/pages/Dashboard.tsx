import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Bell, RefreshCw, Wallet, Mail, User, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '@/lib/api';
import { PageSpinner } from '@/components/ui/Spinner';
import { SlotFormModal } from '@/components/SlotFormModal';
import { SLOT_STATUS, timeRange, serviceText, dayLabel } from '@/lib/slot';
import { fmtNumber, cn } from '@/lib/utils';

export function Dashboard() {
  const [addOpen, setAddOpen] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard.get });

  if (isLoading || !data) return <PageSpinner />;
  const today = new Date(Date.now() + 9 * 3600e3);
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold leading-snug text-ink md:text-2xl">
          안녕하세요,<br />오늘 {data.shopCategory ?? ''} 사장님
        </h1>
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-muted">{dateStr}</span>
          <button className="btn-primary" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> 빈자리 등록
          </button>
        </div>
      </div>

      {/* KPI 4 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<Bell className="h-4 w-4" />} label="오늘 등록한 빈자리" value={`${data.today.registered}건`} />
        <StatCard icon={<Mail className="h-4 w-4" />} label="알림 발송" value={`${fmtNumber(data.today.notificationsSent)}건`} />
        <StatCard icon={<RefreshCw className="h-4 w-4" />} label="예약 전환" value={`${data.week.reservedCount}건`}
          delta={data.week.reservedDelta} accent />
        <StatCard icon={<Wallet className="h-4 w-4" />} label="회수한 매출"
          value={data.week.recoveredRevenue ? `${fmtNumber(data.week.recoveredRevenue)}원` : '—'} accent />
      </div>

      {/* 조회수 + 즐겨찾기 */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-ink">가게 조회 수</p>
              <p className="text-xs text-faint">최근 7일, 내 가게 페이지를 본 횟수</p>
            </div>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-muted">매주 일요일 업데이트</span>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-extrabold text-ink">{fmtNumber(data.views.total)}회</span>
            <Delta value={data.views.deltaVsPrev} suffix="지난주보다" />
          </div>
          <div className="mt-4 h-32">
            {data.views.daily.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.views.daily} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5).replace('-', '/')}
                    tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} maxBarSize={22}>
                    {data.views.daily.map((_, i) => (
                      <Cell key={i} fill={i === data.views.daily.length - 1 ? '#18181b' : '#f9a8d4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-faint">조회수 데이터가 아직 없어요</div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div>
            <p className="text-sm font-bold text-ink">즐겨찾기 한 고객</p>
            <p className="text-xs text-faint">내 가게를 저장해 둔 손님</p>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-extrabold text-ink">{data.favorites.count}명</span>
            <Delta value={data.favorites.deltaWeek} suffix="이번주" />
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            {data.favorites.recent.slice(0, 5).map((c) => (
              <div key={c.id} className="h-9 w-9 overflow-hidden rounded-full bg-brand-100 ring-2 ring-white">
                {c.profileImage
                  ? <img src={c.profileImage} alt="" className="h-full w-full object-cover" />
                  : <div className="flex h-full w-full items-center justify-center"><User className="h-4 w-4 text-brand-400" /></div>}
              </div>
            ))}
            {data.favorites.count > 5 && (
              <span className="ml-1 text-sm text-muted">+{data.favorites.count - 5}</span>
            )}
            {data.favorites.count === 0 && <span className="text-sm text-faint">아직 즐겨찾기한 손님이 없어요</span>}
          </div>
          <div className="mt-4 rounded-xl bg-brand-50/60 px-4 py-3 text-sm text-brand-600">
            즐겨찾기한 손님은 빈자리 등록 시 우선 알림을 받아요
          </div>
        </div>
      </div>

      {/* 최근 등록 내역 */}
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-ink">최근 등록 내역</p>
          <Link to="/history" className="text-xs font-medium text-brand-500 hover:underline">전체보기</Link>
        </div>
        {data.recent.length === 0 ? (
          <p className="py-10 text-center text-sm text-faint">등록 내역이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs text-faint">
                  <th className="pb-2 font-medium">날짜</th><th className="pb-2 font-medium">시술</th>
                  <th className="pb-2 font-medium">시간</th><th className="pb-2 font-medium">시술 상세</th>
                  <th className="pb-2 font-medium text-right">상태</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((s) => (
                  <tr key={s.id} className="border-t border-line">
                    <td className="py-2.5 text-ink">{dayLabel(s.date)}</td>
                    <td className="py-2.5 text-muted">{s.serviceItems[0] ?? '-'}</td>
                    <td className="py-2.5 text-muted">{timeRange(s.startTime, s.endTime)}</td>
                    <td className="py-2.5 text-muted">{serviceText(s.serviceItems)}</td>
                    <td className="py-2.5 text-right">
                      <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', SLOT_STATUS[s.status].cls)}>
                        {SLOT_STATUS[s.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {addOpen && <SlotFormModal open onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function StatCard({ icon, label, value, delta, accent }: {
  icon: React.ReactNode; label: string; value: string; delta?: number; accent?: boolean;
}) {
  return (
    <div className={cn('rounded-2xl border p-4', accent ? 'border-transparent brand-gradient text-white' : 'card')}>
      <div className={cn('flex items-center gap-1.5 text-xs', accent ? 'text-white/90' : 'text-faint')}>
        {icon} {label}
      </div>
      <p className={cn('mt-3 text-2xl font-extrabold', accent ? 'text-white' : 'text-ink')}>{value}</p>
      {delta !== undefined && (
        <p className={cn('mt-1 text-xs', accent ? 'text-white/90' : 'text-muted')}>
          {delta > 0 ? `▲ 이번주 +${delta}명` : delta < 0 ? `▼ 이번주 ${delta}명` : '—'}
        </p>
      )}
    </div>
  );
}

function Delta({ value, suffix }: { value: number; suffix: string }) {
  if (!value) return <span className="mb-1 text-xs text-faint">{suffix} 변화 없음</span>;
  const up = value > 0;
  return (
    <span className={cn('mb-1 flex items-center gap-0.5 text-xs font-medium', up ? 'text-emerald-500' : 'text-brand-500')}>
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {suffix} {up ? '+' : ''}{value}
    </span>
  );
}
