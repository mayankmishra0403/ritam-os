import { Play, ArrowRight } from 'lucide-react';

export function MobileStickyCTA({ onOpenContact }) {
  const handleFreeTrial = (e) => {
    e.preventDefault();
    const el = document.querySelector('#demo');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleWatchDemo = (e) => {
    e.preventDefault();
    const el = document.querySelector('#demo');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[hsl(var(--card)/0.95)] backdrop-blur-xl border-t border-[hsl(var(--border)/0.5)] px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={handleFreeTrial}
          className="flex-1 btn-primary text-sm py-2.5"
        >
          Free Trial <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleWatchDemo}
          className="flex-1 btn-secondary text-sm py-2.5"
        >
          <Play className="w-3.5 h-3.5" /> Watch Demo
        </button>
      </div>
    </div>
  );
}
