import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

const issueTypes = ['Cleanliness', 'Water', 'Lighting', 'Accessibility'];

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export default function ReportPage() {
  const navigate = useNavigate();
  const { submitComplaint } = useAppContext();
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [issueType, setIssueType] = useState('Cleanliness');
  const [rating, setRating] = useState(3);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocation(`Lat ${position.coords.latitude.toFixed(3)}, Lng ${position.coords.longitude.toFixed(3)}`);
      },
      () => {
        setLocation('Unable to get GPS. Enter location manually.');
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const image = imageFile ? await readFileAsDataUrl(imageFile) : '';
    await new Promise((resolve) => setTimeout(resolve, 900));

    await submitComplaint({
      image,
      location: location || 'Unknown location',
      coordinates: coordinates || { lat: 28.7041, lng: 77.1025 },
      issueType,
      description: description || 'No details provided',
      rating
    });

    setIsSubmitting(false);
    setLocation('');
    setCoordinates(null);
    setIssueType('Cleanliness');
    setRating(3);
    setDescription('');
    setImageFile(null);
    setPreview('');
    navigate('/user-dashboard');
  };

  return (
    <main className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="glass-card rounded-[2rem] border border-white/10 p-8 shadow-soft">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Report</p>
          <h1 className="mt-3 text-4xl font-extrabold text-white">Submit a sanitation report</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Add location, issue type, rating, and description.</p>
        </div>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-200">
              Location
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Enter location or use GPS"
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            <button
              type="button"
              onClick={handleUseLocation}
              className="inline-flex items-center justify-center rounded-3xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
            >
              📍 Use Current Location
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-200">
              Issue type
              <select
                value={issueType}
                onChange={(event) => setIssueType(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              >
                {issueTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Rating
              <input
                type="range"
                min="1"
                max="5"
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="mt-4 w-full accent-brand-500"
              />
              <div className="mt-2 text-slate-100">{rating} / 5</div>
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-200">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows="5"
              placeholder="Describe the issue in a few words"
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-200">
              Upload image
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none file:rounded-3xl file:border-0 file:bg-brand-500/90 file:px-4 file:py-2 file:text-sm file:text-white"
              />
            </label>
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-4">
              <p className="text-sm text-slate-400">Preview</p>
              {preview ? (
                <img src={preview} alt="preview" className="mt-3 h-40 w-full rounded-3xl object-cover" />
              ) : (
                <div className="mt-3 flex h-40 items-center justify-center rounded-3xl border border-dashed border-white/10 text-slate-500">No image selected</div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="action-button inline-flex items-center justify-center rounded-3xl bg-brand-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Send report'}
          </button>
        </form>
      </div>
    </main>
  );
}
