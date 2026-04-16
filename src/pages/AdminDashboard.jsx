import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext.jsx';

function statusClass(score) {
  if (score < 2.5) return 'bg-rose-500/10 text-rose-200';
  if (score < 3.5) return 'bg-amber-500/10 text-amber-200';
  return 'bg-emerald-500/10 text-emerald-200';
}

export default function AdminDashboardPage() {
  const { complaints, totalUpvotes, avgScore, sortedTrending } = useAppContext();

  const alerts = useMemo(() => {
    return [...complaints]
      .sort((a, b) => b.upvotes - a.upvotes || a.hygieneScore - b.hygieneScore)
      .slice(0, 4);
  }, [complaints]);

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="glass-card rounded-[2rem] p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Complaints</p>
          <p className="mt-4 text-4xl font-extrabold text-white">{complaints.length}</p>
        </div>
        <div className="glass-card rounded-[2rem] p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Avg hygiene</p>
          <p className="mt-4 text-4xl font-extrabold text-emerald-300">{avgScore}</p>
        </div>
        <div className="glass-card rounded-[2rem] p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total upvotes</p>
          <p className="mt-4 text-4xl font-extrabold text-brand-300">{totalUpvotes}</p>
        </div>
      </section>

      <section className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-soft">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Priority alerts</p>
            <h1 className="mt-3 text-3xl font-extrabold text-white">Critical sanitation issues</h1>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['🔴 Critical', '🟡 Moderate', '🟢 Low'].map((label) => (
              <div key={label} className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {alerts.map((item) => (
            <div key={item.id} className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{item.issueType}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{item.location}</h2>
                </div>
                <span className={`rounded-full px-3 py-2 text-sm font-semibold ${statusClass(item.hygieneScore)}`}>
                  {item.hygieneScore}
                </span>
              </div>
              <p className="mt-4 max-h-14 overflow-hidden text-slate-400">{item.description}</p>
              <div className="mt-5 flex items-center justify-between text-sm text-slate-300">
                <span>{item.upvotes} upvotes</span>
                <span>{item.tags.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {sortedTrending.map((item) => (
          <div key={item.id} className="glass-card rounded-[2rem] p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Trending issue</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">{item.location}</h2>
            <p className="mt-3 text-3xl font-extrabold text-brand-300">{item.upvotes} upvotes</p>
          </div>
        ))}
      </section>
    </main>
  );
}
