const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function fetchNearbyToilets(lat, lng, radiusKm = 10) {
  const radius = radiusKm * 1000;
  const query = `[out:json];(node["amenity"="toilets"](around:${radius},${lat},${lng});way["amenity"="toilets"](around:${radius},${lat},${lng});relation["amenity"="toilets"](around:${radius},${lat},${lng}););out center geom;`;

  try {
    const response = await fetch(OVERPASS_URL + "?data=" + encodeURIComponent(query));
    if (!response.ok) return [];
    const data = await response.json();
    
    return data.elements.map((el, index) => ({
      id: el.id || "osm-" + index,
      location: el.tags?.name || (el.tags?.description || "Public Toilet"),
      coordinates: {
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon
      },
      tags: el.tags ? Object.entries(el.tags).filter(([k]) => k !== "name" && k !== "amenity").map(([k, v]) => k + ":" + v) : [],
      osmData: el
    })).filter(t => t.coordinates.lat && t.coordinates.lng);
  } catch (error) {
    console.error("Overpass API error:", error);
    return [];
  }
}

export async function fetchChennaiToilets() {
  const query = `[out:json];area["name"="Chennai"]["boundary"="administrative"]->.searchArea;(node["amenity"="toilets"](area.searchArea);way["amenity"="toilets"](area.searchArea);relation["amenity"="toilets"](area.searchArea););out center geom;`;

  try {
    const response = await fetch(OVERPASS_URL + "?data=" + encodeURIComponent(query));
    const data = await response.json();
    
    return data.elements.map((el, index) => ({
      id: el.id || "osm-" + index,
      location: el.tags?.name || "Public Toilet",
      coordinates: {
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon
      },
      tags: el.tags ? Object.entries(el.tags).filter(([k]) => k !== "name" && k !== "amenity").map(([k, v]) => k + ":" + v) : [],
      osmData: el
    })).filter(t => t.coordinates.lat && t.coordinates.lng);
  } catch (error) {
    console.error("Overpass API error:", error);
    return [];
  }
}
