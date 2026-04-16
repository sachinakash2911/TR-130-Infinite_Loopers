import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext.jsx';
import { getDistance } from '../utils/complaintUtils.js';

export default function FinderPage() {
  const { complaints } = useAppContext();
  const [location, setLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [nearby, setNearby] = useState([]);

  const cleanToilets = useMemo(
    () => complaints.filter((item) => item.hygieneScore >= 3.5),
    [complaints]
  );

  useEffect(() => {
    if (!mapInstance || !location) return;
    mapInstance.setView([location.lat, location.lng], 13);
    mapInstance.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        if (layer.options.pane !== 'tilePane') {
          mapInstance.removeLayer(layer);
        }
      }
    });

    L.circleMarker([location.lat, location.lng], {
      radius: 10,
      fillColor: '#3b82f6',
      color: '#fff',
      weight: 2,
      fillOpacity: 0.95
    })
      .addTo(mapInstance)
      .bindPopup('You are here');

    cleanToilets.forEach((item) => {
      const marker = L.circleMarker([item.coordinates.lat, item.coordinates.lng], {
        radius: 9,
        fillColor: '#34d399',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.9
      }).addTo(mapInstance);
      marker.bindPopup(`${item.location} — ${item.hygieneScore}`);
    });
  }, [cleanToilets, location, mapInstance]);

  useEffect(() => {
    if (!mapInstance) {
      const map = L.map('finder-map', {
        center: [28.7041, 77.1025],
        zoom: 13,
        zoomControl: true
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);
      setMapInstance(map);
    }
  }, [mapInstance]);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const nextLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
      setLocation(nextLocation);
      const sorted = cleanToilets
        .map((item) => ({
          ...item,
          distance: getDistance(nextLocation.lat, nextLocation.lng, item.coordinates.lat, item.coordinates.lng)
        }))
        .sort((a, b) => a.distance - b.distance);
      setNearby(sorted);
    });
  };

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-300">Finder</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">Find clean toilets nearby</h1>
          </div>
          <button
            type="button"
            onClick={handleLocate}
            className="rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
          >
            Get nearby toilets
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_0.3fr]">
        <div className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-soft">
          {!location && (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
              Click above to detect your location and discover clean toilets nearby.
            </div>
          )}
          {location && nearby.length === 0 && (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
              ⚠️ No clean toilets nearby.
            </div>
          )}
          <div className="grid gap-4">
            {nearby.map((item) => (
              <div key={item.id} className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{item.location}</h2>
                    <p className="mt-2 text-sm text-slate-400">{item.issueType}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200">{item.distance.toFixed(1)} km</span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-300">
                  <span>Score: {item.hygieneScore}</span>
                  <span>{item.tags.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-white">Map</h2>
          <div id="finder-map" className="mt-6 h-[560px] rounded-[1.75rem] bg-slate-900" />
        </div>
      </div>
    </main>
  );
}
