import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin', className)} />;
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-6 w-6 text-brand-400" />
    </div>
  );
}

export function FullSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <Spinner className="h-7 w-7 text-brand-400" />
    </div>
  );
}
