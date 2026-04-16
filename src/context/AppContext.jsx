import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { extractTags, getDistance, getHygieneScore, isDuplicate } from '../utils/complaintUtils.js';
import { getSeverity } from '../utils/severityUtils.js';
import { sendBrevoEmail } from '../utils/brevoUtils.js';

const AppContext = createContext(null);

const initialComplaints = [];

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
  const [complaints, setComplaints] = useState(() => {
    const raw = getStoredItem('safesan_complaints', initialComplaints);
    return raw.filter(c => ![1001, 1002, 1003].includes(c.id));
  });
  const [registeredUsers, setRegisteredUsers] = useState(() => getStoredItem('safesan_registered_users', []));
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.localStorage.setItem('safesan_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    window.localStorage.setItem('safesan_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    window.localStorage.setItem('safesan_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    setComplaints((current) => {
      const uniqueIds = new Set();
      return current.filter(c => {
        if (uniqueIds.has(c.id)) return false;
        uniqueIds.add(c.id);
        return true;
      });
    });
  }, []);

  const registerUser = ({ email, password }) => {
    if (email === 'admin@admin.com') {
      setToast({ message: 'Cannot register with admin email', type: 'error' });
      return { success: false, error: 'Cannot register with admin email' };
    }
    if (registeredUsers.some(u => u.email === email)) {
      setToast({ message: 'Email already registered', type: 'error' });
      return { success: false, error: 'Email already registered' };
    }
    const newUser = { email, password };
    setRegisteredUsers(prev => [...prev, newUser]);
    const nextUser = { email, role: 'user' };
    setUser(nextUser);
    setToast({ message: 'Signed up successfully! Logged in as user', type: 'success' });
    return { success: true };
  };

  const login = ({ email, password, role }) => {
    if (role === 'admin') {
      if (email === 'admin@admin.com') {
        if (password === 'admin123') {
          setUser({ email, role });
          setToast({ message: 'Logged in as admin', type: 'success' });
          return { success: true };
        } else {
          setToast({ message: 'Wrong password', type: 'error' });
          return { success: false, error: 'Wrong password' };
        }
      } else {
        setToast({ message: 'Invalid email id', type: 'error' });
        return { success: false, error: 'Invalid email id' };
      }
    } else {
      if (email === 'admin@admin.com') {
        setToast({ message: 'Invalid email id', type: 'error' });
        return { success: false, error: 'Invalid email id' };
      }
      
      const existingUser = registeredUsers.find(u => u.email === email);
      if (!existingUser) {
        setToast({ message: 'Invalid email id', type: 'error' });
        return { success: false, error: 'Invalid email id' };
      }
      if (existingUser.password !== password) {
        setToast({ message: 'Wrong password', type: 'error' });
        return { success: false, error: 'Wrong password' };
      }
      setUser({ email, role });
      setToast({ message: 'Logged in as user', type: 'success' });
      return { success: true };
    }
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

  const updateComplaintReview = async (complaintId, review) => {
    let targetComplaint = null;

    setComplaints((current) =>
      current.map((item) => {
        if (item.id === complaintId) {
          targetComplaint = { ...item, review };
          return targetComplaint;
        }
        return item;
      })
    );

    setToast({ message: 'Field officer review updated.', type: 'success' });

    if (targetComplaint && targetComplaint.userEmail && ['Clean', 'Moderate'].includes(review)) {
      const subject = `Status Update for your SafeSan Complaint`;
      const htmlContent = `<html><body>
        <h2>Your complaint status has been updated!</h2>
        <p><strong>Location:</strong> ${targetComplaint.location}</p>
        <p><strong>Issue Type:</strong> ${targetComplaint.issueType}</p>
        <p><strong>Description:</strong> ${targetComplaint.description}</p>
        <hr />
        <p>The field officer has reviewed your complaint and marked its new status as: <strong style="color: #059669;">${review}</strong></p>
        <p>Thank you for helping keep our environment clean!<br>SafeSan Team</p>
        </body></html>`;
        
      sendBrevoEmail(import.meta.env.VITE_BREVO_API_KEY, targetComplaint.userEmail, subject, htmlContent)
        .then(success => {
          if (success) setToast({ message: 'Email sent to user!', type: 'success' });
        });
    }
  };

  const submitComplaint = async (incoming) => {
    console.log('Submitting complaint:', incoming);
    
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
      rating: incoming.rating || 1,
      hygieneScore: Number(incoming.hygieneScore) || 5.0,
      severity: getSeverity(incoming.description),
      review: 'Pending',
      tags: extractTags(incoming.description),
      upvotes: 1,
      userEmail: user?.email || 'anonymous',
      createdAt: new Date().toISOString()
    };

    console.log('Adding complaint:', nextComplaint);
    setComplaints((current) => [nextComplaint, ...current]);
    setToast({ message: '✅ Complaint submitted successfully!', type: 'success' });
    
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
    registerUser,
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
