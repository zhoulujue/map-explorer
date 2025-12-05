export const cuteMapStyle = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a3d5ff' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f6f2e8' }] },
]

export function applyCuteStyle(map: any) {
  if (!map) return
  map.setOptions({ styles: cuteMapStyle })
}
