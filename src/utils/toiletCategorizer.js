import { getDistance } from '../utils/complaintUtils.js';

export function categorizeToilet(toilet, allComplaints = []) {
  // Default score for new toilets
  let score = 3.5;
  
  // Check against complaints for this location
  const matchingComplaints = allComplaints.filter(c => 
    c.location.toLowerCase().includes(toilet.location.toLowerCase()) ||
    getDistance(
      toilet.coordinates.lat, 
      toilet.coordinates.lng, 
      c.coordinates.lat, 
      c.coordinates.lng
    ) < 0.1 // within 100m
  );
  
  if (matchingComplaints.length > 0) {
    score = matchingComplaints.reduce((sum, c) => sum + c.hygieneScore, 0) / matchingComplaints.length;
  }
  
  const category = score >= 4 ? 'green' : 
                   score >= 2.5 ? 'orange' : 
                   'red';
  
  return {
    ...toilet,
    hygieneScore: Number(score.toFixed(1)),
    category,
    color: score >= 4 ? '#10b981' : score >= 2.5 ? '#f59e0b' : '#ef4444'
  };
}

