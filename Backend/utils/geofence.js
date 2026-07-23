function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isPointInPolygon(point, vs) {
  const x = parseFloat(point.lat !== undefined ? point.lat : point[0]);
  const y = parseFloat(point.lng !== undefined ? point.lng : point[1]);

  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = parseFloat(vs[i].lat !== undefined ? vs[i].lat : vs[i][0]);
    const yi = parseFloat(vs[i].lng !== undefined ? vs[i].lng : vs[i][1]);
    const xj = parseFloat(vs[j].lat !== undefined ? vs[j].lat : vs[j][0]);
    const yj = parseFloat(vs[j].lng !== undefined ? vs[j].lng : vs[j][1]);

    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

function detectProjectArea(userLat, userLng, geofenceItems, defaultRadiusMeters = 200) {
  if (userLat === null || userLat === undefined || userLng === null || userLng === undefined) {
    return null;
  }
  if (!geofenceItems || !Array.isArray(geofenceItems)) {
    return null;
  }

  const uLat = parseFloat(userLat);
  const uLng = parseFloat(userLng);
  if (isNaN(uLat) || isNaN(uLng)) {
    return null;
  }

  for (const item of geofenceItems) {
    let polygon = null;
    if (item.location) {
      try {
        const parsed = JSON.parse(item.location);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          polygon = parsed;
        }
      } catch (e) {}
    }

    if (polygon) {
      if (isPointInPolygon({ lat: uLat, lng: uLng }, polygon)) {
        return {
          id: item.id,
          code: item.code || item.name,
          name: item.name,
          location: item.location || '',
          distance: 0
        };
      }
    } else if (item.latitude !== null && item.latitude !== undefined && item.longitude !== null && item.longitude !== undefined) {
      const pLat = parseFloat(item.latitude);
      const pLng = parseFloat(item.longitude);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        const dist = calculateDistanceInMeters(uLat, uLng, pLat, pLng);
        if (dist <= defaultRadiusMeters) {
          return {
            id: item.id,
            code: item.code || item.name,
            name: item.name,
            location: item.location || '',
            distance: Math.round(dist * 100) / 100
          };
        }
      }
    }
  }

  return null;
}

module.exports = {
  calculateDistanceInMeters,
  isPointInPolygon,
  detectProjectArea,
  detectGeofenceArea: detectProjectArea
};
