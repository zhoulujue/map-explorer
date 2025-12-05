export interface Bounds { north: number; south: number; east: number; west: number }

function buildZipcodeQuery(b: Bounds) {
  return `
[out:json][timeout:25];
(
  relation["postal_code"](${b.south},${b.west},${b.north},${b.east});
  way["postal_code"](${b.south},${b.west},${b.north},${b.east});
);
out geom;
`
}

export async function fetchZipcodesGeoJSON(bounds: Bounds): Promise<any> {
  const backend = (import.meta as any).env?.VITE_BACKEND_URL
  const query = buildZipcodeQuery(bounds)
  let data
  if (backend) {
    const resp = await fetch(`${backend}/api/overpass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    data = await resp.json()
  } else {
    const resp = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ data: query }).toString(),
    })
    data = await resp.json()
  }
  return overpassToGeoJSON(data)
}

function overpassToGeoJSON(overpass: any) {
  const features: any[] = []
  for (const el of overpass.elements || []) {
    const pc = el.tags?.postal_code
    if (!el.geometry || !pc) continue
    if (el.type === 'way') {
      const coords = el.geometry.map((g: any) => [g.lon, g.lat])
      if (coords.length && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
        coords.push(coords[0])
      }
      features.push({ type: 'Feature', properties: { postal_code: pc }, geometry: { type: 'Polygon', coordinates: [coords] } })
    } else if (el.type === 'relation') {
      const outers = (el.members || []).filter((m: any) => m.role === 'outer' && m.geometry)
      for (const m of outers) {
        const coords = m.geometry.map((g: any) => [g.lon, g.lat])
        if (coords.length && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
          coords.push(coords[0])
        }
        features.push({ type: 'Feature', properties: { postal_code: pc }, geometry: { type: 'Polygon', coordinates: [coords] } })
      }
    }
  }
  return { type: 'FeatureCollection', features }
}
