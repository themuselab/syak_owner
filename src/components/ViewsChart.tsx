import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import type { DashboardRes } from '@/lib/api';

// recharts(~360KB)는 이 파일에만 둔다 — Dashboard에서 lazy로 불러 KPI·표가 차트 번들을 기다리지 않게.
export default function ViewsChart({ daily }: { daily: DashboardRes['views']['daily'] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={daily} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <XAxis dataKey="date" tickFormatter={(d) => d.slice(5).replace('-', '/')}
          tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Bar dataKey="value" radius={[6, 6, 6, 6]} maxBarSize={22}>
          {daily.map((_, i) => (
            <Cell key={i} fill={i === daily.length - 1 ? '#18181b' : '#f9a8d4'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
