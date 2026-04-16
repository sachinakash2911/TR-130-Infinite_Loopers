const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export async function fetchChennaiToilets() {
  const query = `[out:json];area["name"="Chennai"]["boundary"="administrative"]->.searchArea;(node["amenity"="toilets"](area.searchArea);way["amenity"="toilets"](area.searchArea);relation["amenity"="toilets"](area.searchArea););out center geom;`;

  try {
    const response = await fetch(OVERPASS_URL + '?data=' + encodeURIComponent(query));
    const data = await response.json();
    
    return data.elements.map((el, index) => ({
      id: el.id || 'osm-' + index,
      location: el.tags?.name || 'Toilet ' + (index + 1),
      coordinates: {
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon
      },
      tags: el.tags ? Object.entries(el.tags).filter(([k]) => k !== 'name').map(([k, v]) => k + ':' + v) : [],
      osmData: el
    })).filter(t => t.coordinates.lat && t.coordinates.lng);
  } catch (error) {
    console.error('Overpass API error:', error);
    return [];
  }
}

