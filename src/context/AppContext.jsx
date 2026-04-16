import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { extractTags, getDistance, getHygieneScore, isDuplicate } from '../utils/complaintUtils.js';

const AppContext = createContext(null);

const initialComplaints = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    location: 'Sector 14 Public Toilet',
    coordinates: { lat: 28.7041, lng: 77.1025 },
    issueType: 'Cleanliness',
    description: 'Dirty floor and no soap',
    rating: 2,
    hygieneScore: 1.9,
    review: 'Critical',
    tags: ['Cleanliness'],
    upvotes: 14,
    createdAt: '2026-04-16T08:30:00.000Z'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1550446983-42ab4a7da11c?auto=format&fit=crop&w=1200&q=80',
    location: 'Riverside Park Toilet',
    coordinates: { lat: 28.707, lng: 77.106 },
    issueType: 'Accessibility',
    description: 'Ramps are not accessible for wheelchairs',
    rating: 4,
    hygieneScore: 4.1,
    review: 'Clean',
    tags: ['Accessibility'],
    upvotes: 8,
    createdAt: '2026-04-15T12:45:00.000Z'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1511393187461-a7983f2f8b77?auto=format&fit=crop&w=1200&q=80',
    location: 'City Bus Terminal Washroom',
    coordinates: { lat: 28.7055, lng: 77.11 },
    issueType: 'Water',
    description: 'Water tap often runs dry',
    rating: 3,
    hygieneScore: 3.2,
    review: 'Moderate',
    tags: ['Water'],
    upvotes: 11,
    createdAt: '2026-04-14T10:15:00.000Z'
  }
];

function getStoredItem(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => getStoredItem('safesan_user', null));
  const [complaints, setComplaints] = useState(() => getStoredItem('safesan_complaints', initialComplaints));
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.localStorage.setItem('safesan_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    window.localStorage.setItem('safesan_complaints', JSON.stringify(complaints));
  }, [complaints]);

  const login = ({ email, role }) => {
    const nextUser = { email, role };
    setUser(nextUser);
    setToast({ message: `Logged in as ${role}`, type: 'success' });
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem('safesan_user');
    setToast({ message: 'Logged out', type: 'info' });
  };

  const hasUpvoted = (complaintId) => {
    const upvoted = getStoredItem('upvoted_complaints', []);
    return upvoted.includes(complaintId);
  };

  const addUpvote = (complaintId) => {
    const upvoted = getStoredItem('upvoted_complaints', []);
    if (upvoted.includes(complaintId)) {
      return false;
    }
    const nextList = [...upvoted, complaintId];
    window.localStorage.setItem('upvoted_complaints', JSON.stringify(nextList));
    setComplaints((current) =>
      current.map((item) =>
        item.id === complaintId ? { ...item, upvotes: item.upvotes + 1 } : item
      )
    );
    return true;
  };

  const updateComplaintReview = (complaintId, review) => {
    setComplaints((current) =>
      current.map((item) =>
        item.id === complaintId ? { ...item, review } : item
      )
    );
    setToast({ message: 'Field officer review updated.', type: 'success' });
  };

  const submitComplaint = async (incoming) => {
    const existing = complaints.find((item) => isDuplicate(item, incoming));

    if (existing) {
      if (!hasUpvoted(existing.id)) {
        addUpvote(existing.id);
      }
      setToast({ message: 'This issue already exists. Counted as upvote.', type: 'warning' });
      return { duplicate: true, existingId: existing.id };
    }

    const nextComplaint = {
      id: Date.now(),
      image: incoming.image || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      location: incoming.location,
      coordinates: incoming.coordinates,
      issueType: incoming.issueType,
      description: incoming.description,
      rating: incoming.rating,
      hygieneScore: getHygieneScore(),
      review: 'Moderate',
      tags: extractTags(incoming.description),
      upvotes: 1,
      createdAt: new Date().toISOString()
    };

    setComplaints((current) => [nextComplaint, ...current]);
    setToast({ message: 'Complaint submitted successfully.', type: 'success' });
    return { duplicate: false, complaint: nextComplaint };
  };

  const sortedTrending = useMemo(
    () => [...complaints].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3),
    [complaints]
  );

  const totalUpvotes = useMemo(
    () => complaints.reduce((sum, item) => sum + item.upvotes, 0),
    [complaints]
  );

  const avgScore = useMemo(
    () => {
      if (!complaints.length) return 0;
      return (complaints.reduce((sum, item) => sum + item.hygieneScore, 0) / complaints.length).toFixed(1);
    },
    [complaints]
  );

  const value = {
    user,
    complaints,
    login,
    logout,
    submitComplaint,
    addUpvote,
    hasUpvoted,
    updateComplaintReview,
    toast,
    setToast,
    sortedTrending,
    totalUpvotes,
    avgScore,
    getDistance
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => useContext(AppContext);
