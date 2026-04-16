import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext.jsx';

export default function MapPage() {
  const { complaints } = useAppContext();
  const [userPosition, setUserPosition] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('safesan-map', {
        center: [12.823, 80.044],
        zoom: 15,
        zoomControl: true
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current);
    }

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        mapRef.current.removeLayer(layer);
      }
    });

    complaints.forEach((item) => {
      const color = item.hygieneScore > 3.5 ? '#34d399' : item.hygieneScore >= 2.5 ? '#fbbf24' : '#fb7185';
      const marker = L.circleMarker([item.coordinates.lat, item.coordinates.lng], {
        radius: 10,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(mapRef.current);
      marker.bindPopup(`
        <div class="max-w-xs">
          <p class="font-semibold text-slate-900">${item.issueType}</p>
          <p class="text-sm text-slate-700">${item.location}</p>
          <p class="mt-2 text-sm text-slate-700">Score: ${item.hygieneScore}</p>
        </div>
      `);
    });

    if (userPosition) {
      const userMarker = L.circleMarker([userPosition.lat, userPosition.lng], {
        radius: 10,
        fillColor: '#3b82f6',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95
      }).addTo(mapRef.current);
      userMarker.bindPopup('Your location');
      mapRef.current.panTo([userPosition.lat, userPosition.lng]);
    }
  }, [complaints, userPosition]);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
    });
  };

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Map</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">Sanitation locations</h1>
          </div>
          <button
            type="button"
            onClick={handleLocate}
            className="rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
          >
            Use my location
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-200 shadow-sm">
            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-sm" />
            Clean
          </div>
          <div className="flex items-center gap-2 rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-200 shadow-sm">
            <span className="h-3 w-3 rounded-full bg-orange-400 shadow-sm" />
            Needs attention
          </div>
          <div className="flex items-center gap-2 rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-200 shadow-sm">
            <span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm" />
            Poor hygiene
          </div>
          <div className="flex items-center gap-2 rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-200 shadow-sm">
            <span className="h-3 w-3 rounded-full bg-sky-500 shadow-sm" />
            My location
          </div>
        </div>
      </section>
      <div id="safesan-map" className="h-[620px] rounded-[2rem] border border-white/10 bg-slate-900 shadow-soft" />
    </main>
  );
}
