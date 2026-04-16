import { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import ComplaintCard from '../components/ComplaintCard.jsx';

const issueOptions = ['All', 'Cleanliness', 'Water', 'Lighting', 'Accessibility'];

export default function DashboardPage() {
  const { complaints, totalUpvotes, avgScore } = useAppContext();
  const [search, setSearch] = useState('');
  const [issueType, setIssueType] = useState('All');
  const [sortKey, setSortKey] = useState('latest');

  const filtered = useMemo(() => {
    return complaints
      .filter((item) => issueType === 'All' || item.issueType === issueType)
      .filter((item) => item.location.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortKey === 'upvotes') return b.upvotes - a.upvotes;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [complaints, issueType, search, sortKey]);

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="glass-card rounded-[2rem] p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total complaints</p>
          <p className="mt-4 text-4xl font-extrabold text-white">{complaints.length}</p>
        </div>
        <div className="glass-card rounded-[2rem] p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Average score</p>
          <p className="mt-4 text-4xl font-extrabold text-emerald-300">{avgScore}</p>
        </div>
        <div className="glass-card rounded-[2rem] p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total upvotes</p>
          <p className="mt-4 text-4xl font-extrabold text-brand-300">{totalUpvotes}</p>
        </div>
      </section>

      <section className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-soft">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Dashboard</p>
            <h1 className="mt-3 text-3xl font-extrabold text-white">Sanitation complaints</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search location or issue"
              className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            />
            <select
              value={issueType}
              onChange={(event) => setIssueType(event.target.value)}
              className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            >
              {issueOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value)}
              className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="latest">Latest</option>
              <option value="upvotes">Most upvoted</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>

        {!filtered.length && (
          <div className="mt-8 rounded-[2rem] border border-dashed border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
            No complaints match your search.
          </div>
        )}
      </section>
    </main>
  );
}
