import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { NOTIF_KIND } from '@/lib/slot';
import { fmtRelative } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

export function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const ref = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['owner-notifications'],
    queryFn: api.notifications.list,
  });
  const markRead = useMutation({
    mutationFn: api.notifications.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['owner-notifications'] }),
  });

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onClose]);

  const items = data?.notifications ?? [];

  return (
    <div ref={ref} className="absolute right-0 top-12 z-50 w-[min(92vw,360px)] overflow-hidden rounded-2xl bg-white shadow-pop border border-line">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <h3 className="text-base font-bold text-ink">알림</h3>
        {!!data?.unread && (
          <span className="flex items-center gap-1 text-xs text-brand-600">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> {data.unread}개 안읽음
          </span>
        )}
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10"><Spinner className="h-5 w-5 text-brand-400" /></div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-sm text-faint">새 알림이 없어요</p>
        ) : (
          items.map((n) => {
            const meta = NOTIF_KIND[n.kind];
            return (
              <button
                key={n.id}
                onClick={() => !n.readAt && markRead.mutate(n.id)}
                className={`flex w-full flex-col items-start gap-1 border-b border-line px-4 py-3 text-left transition-colors hover:bg-zinc-50 ${n.readAt ? '' : 'bg-brand-50/30'}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  <span className="text-sm font-bold text-ink">{n.title}</span>
                </div>
                <p className="text-sm text-muted">{n.body}</p>
                <span className="text-xs text-faint">{fmtRelative(n.createdAt)}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
