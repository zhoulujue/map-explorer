export const cuteMapStyle = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.local', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.arterial', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a3d5ff' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#fff9e6' }] },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ visibility: 'off' }] },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ visibility: 'off' }] },
]

export function applyCuteStyle(map: any) {
  if (!map) return
  map.setOptions({ styles: cuteMapStyle })
}
