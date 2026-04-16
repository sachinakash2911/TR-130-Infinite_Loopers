import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext.jsx';
import ComplaintCard from '../components/ComplaintCard.jsx';
import { getSeverity } from '../utils/severityUtils.js';

const issueOptions = ['All', 'Cleanliness', 'Water', 'Lighting', 'Accessibility'];

function ComplaintDetailOverlay({ complaint, onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const criticalState = complaint?.criticalState ?? (complaint?.hygieneScore <= 2.5 ? 'Critical' : complaint?.hygieneScore <= 3.5 ? 'High' : 'Moderate');

  useEffect(() => {
    if (!complaint || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [complaint.coordinates.lat, complaint.coordinates.lng],
        zoom: 16,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView([complaint.coordinates.lat, complaint.coordinates.lng], 16);
    }

    const marker = L.circleMarker([complaint.coordinates.lat, complaint.coordinates.lng], {
      radius: 10,
      fillColor: complaint.hygieneScore > 3.5 ? '#34d399' : complaint.hygieneScore >= 2.5 ? '#fbbf24' : '#fb7185',
      color: '#fff',
      weight: 2,
      fillOpacity: 0.95,
    }).addTo(mapInstanceRef.current);
    marker.bindPopup(`<strong>${complaint.location}</strong>`).openPopup();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [complaint]);

  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/95 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-950/80 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
        >
          Close
        </button>

        <div className="space-y-6 p-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
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
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Complaint details</p>
                <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                  <p><span className="font-semibold text-slate-200">Hygiene score:</span> {complaint.hygieneScore}</p>
                  <p><span className="font-semibold text-slate-200">Field officer review:</span> {complaint.review || 'Pending'}</p>
                  <p><span className="font-semibold text-slate-200">Upvotes:</span> {complaint.upvotes}</p>
                  <p><span className="font-semibold text-slate-200">Posted:</span> {new Date(complaint.createdAt).toLocaleString()}</p>
                  {complaint.gps && <p><span className="font-semibold text-slate-200">GPS:</span> {complaint.gps}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Location map</p>
                <div ref={mapContainerRef} className="h-72 w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900" />
                <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-100">
                  <p className="text-xs uppercase tracking-[0.3em] text-rose-300">SEVERITY LEVEL</p>
                  <p className="mt-2 font-semibold text-white">{criticalState}</p>
                  <p className="mt-1 text-xs text-slate-400">AI-trained severity will be shown here once the model integration is complete.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { complaints, totalUpvotes, avgScore } = useAppContext();
  const [search, setSearch] = useState('');
  const [issueType, setIssueType] = useState('All');
  const [sortKey, setSortKey] = useState('latest');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  const selectedComplaint = complaints.find((item) => item.id === selectedComplaintId) || null;

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
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onOpenDetail={() => setSelectedComplaintId(complaint.id)}
            />
          ))}
        </div>

        {!filtered.length && (
          <div className="mt-8 rounded-[2rem] border border-dashed border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
            No complaints match your search.
          </div>
        )}
      </section>

      {selectedComplaint && (
        <ComplaintDetailOverlay complaint={selectedComplaint} onClose={() => setSelectedComplaintId(null)} />
      )}
    </main>
  );
}
