import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext.jsx';

export default function Toast() {
  const { toast, setToast } = useAppContext();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast, setToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-soft text-slate-100 toast-enter">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 h-3 w-3 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'warning' ? 'bg-amber-300' : 'bg-sky-400'}`} />
        <div>
          <p className="font-semibold">{toast.type === 'success' ? 'Success' : toast.type === 'warning' ? 'Notice' : 'Info'}</p>
          <p className="mt-1 text-sm text-slate-300">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}
