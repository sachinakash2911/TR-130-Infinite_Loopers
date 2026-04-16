export function getHygieneScore() {
  return Number((Math.random() * 5).toFixed(1));
}

export function extractTags(description) {
  const text = description.toLowerCase();
  const tags = new Set();

  if (text.includes('dirty') || text.includes('smell') || text.includes('filthy') || text.includes('unclean')) {
    tags.add('Cleanliness');
  }
  if (text.includes('no water') || text.includes('dry') || text.includes('tap') || text.includes('flush')) {
    tags.add('Water');
  }
  if (text.includes('dark') || text.includes('lighting') || text.includes('light')) {
    tags.add('Lighting');
  }
  if (text.includes('ramp') || text.includes('wheelchair') || text.includes('access') || text.includes('accessible')) {
    tags.add('Accessibility');
  }

  return tags.size ? Array.from(tags) : ['Cleanliness'];
}

export function isDuplicate(existing, incoming) {
  return (
    existing.location === incoming.location &&
    existing.issueType === incoming.issueType &&
    existing.description.toLowerCase().includes(incoming.description.toLowerCase().split(' ')[0])
  );
}

export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
