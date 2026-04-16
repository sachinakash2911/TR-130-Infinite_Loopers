import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext.jsx';
import { fetchNearbyToilets } from '../utils/overpass.js';
import { categorizeToilet } from '../utils/toiletCategorizer.js';
import { getDistance } from '../utils/complaintUtils.js';

export default function FinderPage() {
  const { complaints } = useAppContext();
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [search, setSearch] = useState('');
  const [osmToilets, setOsmToilets] = useState([]);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRefs = useRef([]);

  useEffect(() => {
    if (!userLocation) return;
    async function loadNearby() {
      setLoadingLocation(true);
      const data = await fetchNearbyToilets(userLocation.lat, userLocation.lng, 8);
      const categorized = data.map(t => categorizeToilet(t, complaints));
      setOsmToilets(categorized);
      setLoadingLocation(false);
    }
    loadNearby();
  }, [userLocation, complaints]);

  const cleanToilets = useMemo(() => {
    const userComplaints = complaints
      .filter((item) => item.hygieneScore >= 3.5)
      .filter((item) => item.coordinates?.lat && item.coordinates?.lng);
      
    const cleanOsm = osmToilets.filter(item => item.hygieneScore >= 3.5);
    return [...userComplaints, ...cleanOsm];
  }, [complaints, osmToilets]);

  const filteredToilets = useMemo(() => {
    const query = search.trim().toLowerCase();
    const candidates = query
      ? cleanToilets.filter((item) => item.location.toLowerCase().includes(query))
      : cleanToilets;

    if (!userLocation) {
      return candidates.map((item) => ({ ...item, distance: null }));
    }

    return candidates
      .map((item) => ({
        ...item,
        distance: getDistance(
          userLocation.lat,
          userLocation.lng,
          item.coordinates.lat,
          item.coordinates.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [cleanToilets, search, userLocation]);

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return [...new Set(
      cleanToilets
        .filter((item) => item.location.toLowerCase().includes(query))
        .slice(0, 6)
        .map((item) => item.location)
    )];
  }, [cleanToilets, search]);

  const bestOption = useMemo(() => {
    if (filteredToilets.length === 0 || !userLocation) return null;
    return [...filteredToilets].sort((a, b) => {
      const utilityA = a.hygieneScore - (a.distance * 0.5);
      const utilityB = b.hygieneScore - (b.distance * 0.5);
      return utilityB - utilityA;
    })[0];
  }, [filteredToilets, userLocation]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [12.823, 80.044],
      zoom: 15,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRefs.current.forEach((marker) => map.removeLayer(marker));
    markerRefs.current = [];

    if (userLocation) {
      const userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 10,
        fillColor: '#3b82f6',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.95
      })
        .addTo(map)
        .bindPopup('You are here');

      markerRefs.current.push(userMarker);
      map.setView([userLocation.lat, userLocation.lng], 13);
    }

    filteredToilets.forEach((item) => {
      if (item.distance == null) return;
      const marker = L.circleMarker([item.coordinates.lat, item.coordinates.lng], {
        radius: 9,
        fillColor: '#34d399',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.9
      })
        .addTo(map)
        .bindPopup(
          `<strong>${item.location}</strong><br/>Score: ${item.hygieneScore}<br/>${item.distance.toFixed(1)} km away`
        );

      markerRefs.current.push(marker);
    });
  }, [filteredToilets, userLocation]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('⚠️ Location access required');
      return;
    }

    setLoadingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoadingLocation(false);
      },
      () => {
        setLoadingLocation(false);
        setLocationError('⚠️ Location access required');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion);
  };

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-300">Finder</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">Find clean toilets nearby</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Using your location, this page surfaces the nearest clean toilets from stored SafeSan reports.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={requestLocation}
              className="inline-flex items-center justify-center rounded-3xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
            >
              {loadingLocation ? 'Fetching location…' : 'Detect my location'}
            </button>
            {locationError && <span className="text-sm text-rose-300">{locationError}</span>}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.45fr_0.55fr]">
        <div className="glass-card rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur-xl">
          <div className="relative">
            <label className="block text-sm uppercase tracking-[0.28em] text-slate-400">Search location</label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by toilet location"
              className="mt-3 w-full rounded-[1.5rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 z-20 mt-2 rounded-[1.5rem] border border-white/10 bg-slate-950/95 p-2 shadow-xl">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full rounded-[1.25rem] px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-slate-900"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-4">
            {bestOption && (
              <div className="rounded-[1.75rem] border border-brand-400/20 bg-brand-500/10 p-5 text-slate-50 shadow-soft">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-200">Best Option Nearby</p>
                <h2 className="mt-3 text-xl font-semibold">{bestOption.location}</h2>
                <p className="mt-2 text-sm text-slate-200">
                  {bestOption.distance.toFixed(1)} km away · Score {bestOption.hygieneScore}
                </p>
              </div>
            )}

            {userLocation ? (
              filteredToilets.length > 0 ? (
                filteredToilets.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 transition hover:-translate-y-1 hover:border-brand-400"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-emerald-200">
                            Clean Toilet
                          </span>
                          {item.id === bestOption?.id && (
                            <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-brand-200">
                              ⭐ Best Option Nearby
                            </span>
                          )}
                        </div>
                        <h2 className="mt-4 text-lg font-semibold text-white">{item.location}</h2>
                        <p className="mt-2 text-sm text-slate-400">{item.tags.join(', ')}</p>
                      </div>

                      <div className="flex flex-col items-start gap-3 text-right lg:items-end">
                        <p className="text-sm text-slate-400">{item.distance.toFixed(1)} km away</p>
                        <p className="text-sm text-slate-200">Score: {item.hygieneScore}</p>
                        <a
                          href={`https://www.google.com/maps?q=${item.coordinates.lat},${item.coordinates.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-3xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
                        >
                          🧭 Navigate
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
                  ⚠️ No clean toilets nearby.
                </div>
              )
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
                {loadingLocation ? 'Fetching location…' : 'Use the button above to share your location.'}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Map</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Nearby clean toilets</h2>
            </div>
            {userLocation && (
              <span className="rounded-3xl bg-slate-900/80 px-4 py-2 text-sm text-slate-200">Blue marker = you</span>
            )}
          </div>
          <div ref={mapContainerRef} className="mt-6 h-[640px] w-full rounded-[1.75rem] border border-white/10 bg-slate-900" />
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              Your location
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Clean toilets
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
