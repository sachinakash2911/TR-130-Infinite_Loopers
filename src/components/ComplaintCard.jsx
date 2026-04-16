import { useAppContext } from '../context/AppContext.jsx';

export default function ComplaintCard({ complaint }) {
  const { addUpvote, hasUpvoted } = useAppContext();
  const voted = hasUpvoted(complaint.id);
  const status = complaint.hygieneScore > 3.5 ? 'text-emerald-300' : complaint.hygieneScore >= 2.5 ? 'text-amber-300' : 'text-rose-300';

  return (
    <article className="glass-card glass-card-hover overflow-hidden rounded-[2rem] border border-white/10 shadow-soft transition duration-300">
      <div className="relative h-56 overflow-hidden">
        <img src={complaint.image} alt={complaint.location} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
        <div className="absolute left-4 top-4 rounded-full bg-slate-950/70 px-3 py-2 text-xs uppercase tracking-[0.22em] text-slate-200 shadow-sm">
          {complaint.issueType}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{complaint.location}</h3>
            <p className="mt-2 max-h-12 overflow-hidden text-sm text-slate-400">{complaint.description}</p>
          </div>
          <div className={`rounded-3xl px-4 py-2 text-sm font-semibold ${status} bg-slate-950/80`}> {complaint.hygieneScore} </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {complaint.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => addUpvote(complaint.id)}
            disabled={voted}
            className={`action-button inline-flex items-center justify-center rounded-3xl px-4 py-3 text-sm font-semibold transition ${
              voted ? 'bg-slate-700 text-slate-200 cursor-not-allowed' : 'bg-brand-500 text-white hover:bg-brand-400'
            }`}
          >
            👍 {voted ? 'Upvoted' : `Upvote (${complaint.upvotes})`}
          </button>
          {complaint.upvotes >= 8 && (
            <span className="rounded-full bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200">🔥 Trending</span>
          )}
        </div>
      </div>
    </article>
  );
}
