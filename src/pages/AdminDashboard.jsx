import { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { getSeverity } from '../utils/severityUtils.js';

function statusClass(score) {
  if (score < 2.5) return 'bg-rose-500/10 text-rose-200';
  if (score < 3.5) return 'bg-amber-500/10 text-amber-200';
  return 'bg-emerald-500/10 text-emerald-200';
}

function AdminComplaintOverlay({ complaint, onClose, onReviewChange }) {
  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/95 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-950/80 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
        >
          Close
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] p-6">
          <div>
            <img src={complaint.image} alt={complaint.location} className="h-72 w-full rounded-[1.5rem] object-cover shadow-lg" />
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Issue type</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{complaint.issueType}</h2>
                </div>
                <span className="rounded-3xl bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-200">{complaint.location}</span>
              </div>

              <p className="mt-5 text-slate-300">{complaint.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {complaint.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-brand-500/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-brand-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-6">
            <div className="space-y-3 rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Complaint details</p>
              <p><span className="font-semibold text-slate-200">Hygiene score:</span> {complaint.hygieneScore}</p>
              <p><span className="font-semibold text-slate-200">Upvotes:</span> {complaint.upvotes}</p>
              <p><span className="font-semibold text-slate-200">Field officer review:</span> {complaint.review || 'Pending'}</p>
              <p><span className="font-semibold text-slate-200">Posted:</span> {new Date(complaint.createdAt).toLocaleString()}</p>
              {complaint.gps && <p><span className="font-semibold text-slate-200">GPS:</span> {complaint.gps}</p>}
            </div>

            <div className="space-y-3 rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
              <label className="block text-sm uppercase tracking-[0.28em] text-slate-400">Field officer review</label>
              <select
                value={complaint.review || 'Moderate'}
                onChange={(event) => onReviewChange(complaint.id, event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Clean">Clean</option>
                <option value="Moderate">Moderate</option>
                <option value="Critical">Critical</option>
              </select>
              <p className="text-xs text-slate-500">Update the officer assessment for this complaint.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { complaints, totalUpvotes, avgScore, sortedTrending, updateComplaintReview } = useAppContext();

  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const selectedComplaint = complaints.find((item) => item.id === selectedComplaintId) || null;

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
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedComplaintId(item.id)}
              className="group rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5 text-left transition hover:border-brand-400"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{item.issueType}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white group-hover:text-brand-300">{item.location}</h2>
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
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {sortedTrending.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedComplaintId(item.id)}
            className="glass-card rounded-[2rem] p-6 shadow-soft text-left transition hover:border-brand-400"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Priority issue</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">{item.location}</h2>
            <p className="mt-3 text-3xl font-extrabold text-brand-300">{item.upvotes} upvotes</p>
          </button>
        ))}
      </section>

      {selectedComplaint && (
        <AdminComplaintOverlay
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaintId(null)}
          onReviewChange={updateComplaintReview}
        />
      )}
    </main>
  );
}
