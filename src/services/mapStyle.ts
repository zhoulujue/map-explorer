export const cuteMapStyle = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a3d5ff' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#fef6e4' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#d0d7ff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#9eb6ff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#5b7ae6' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'off' }] },
]

export function applyCuteStyle(map: any) {
  if (!map) return
  map.setOptions({ styles: cuteMapStyle })
}
