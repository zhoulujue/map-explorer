declare global {
  interface Window {
    google: any;
  }
}

export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

export class MapService {
  private map: any = null;
  private markers: any[] = [];
  private isInitialized = false;
  private annotationSelectCallback: ((annotation: any) => void) | null = null;
  private overlayHelper: any = null;
  private dataLayerLoaded = false;

  async initializeMap(container: HTMLElement, center: MapCoordinates, zoom: number = 14) {
    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps JS not loaded.');
    }

    try {
      this.map = new window.google.maps.Map(container, {
        center: { lat: center.latitude, lng: center.longitude },
        zoom,
        mapTypeId: 'roadmap',
        fullscreenControl: true,
        scaleControl: true,
        mapTypeControl: false,
      });
      const Overlay = class extends window.google.maps.OverlayView {
        onAdd() {}
        onRemove() {}
        draw() {}
      };
      this.overlayHelper = new Overlay();
      this.overlayHelper.setMap(this.map);

      this.isInitialized = true;
      return this.map;
    } catch (error) {
      console.error('Error initializing map:', error);
      throw error;
    }
  }

  addMarker(coordinates: MapCoordinates, title: string, _subtitle?: string, data?: any) {
    if (!this.map || !this.isInitialized) {
      throw new Error('Map not initialized');
    }

    const marker = new window.google.maps.Marker({
      position: { lat: coordinates.latitude, lng: coordinates.longitude },
      map: this.map,
      title,
      icon: {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
        fillColor: '#007AFF',
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 1.2,
        anchor: new window.google.maps.Point(12, 22),
      },
    });

    (marker as any).data = data;

    if (this.annotationSelectCallback) {
      marker.addListener('click', () => {
        this.annotationSelectCallback && this.annotationSelectCallback({ data: (marker as any).data });
      });
    }

    this.markers.push(marker);
    return marker;
  }

  removeAllMarkers() {
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers = [];
  }

  setCenter(coordinates: MapCoordinates, animated: boolean = true) {
    if (!this.map || !this.isInitialized) {
      throw new Error('Map not initialized');
    }
    const latLng = new window.google.maps.LatLng(coordinates.latitude, coordinates.longitude);
    if (animated) {
      this.map.panTo(latLng);
    } else {
      this.map.setCenter(latLng);
    }
  }

  getCenter(): MapCoordinates {
    if (!this.map || !this.isInitialized) {
      throw new Error('Map not initialized');
    }
    const center = this.map.getCenter();
    return {
      latitude: center.lat(),
      longitude: center.lng(),
    };
  }

  getMap(): any {
    return this.map;
  }

  setMapStyle(styles: any[]) {
    if (!this.map || !this.isInitialized) {
      throw new Error('Map not initialized');
    }
    this.map.setOptions({ styles });
  }

  async loadZipcodeGeoJson(url: string) {
    if (!this.map || !this.isInitialized) {
      throw new Error('Map not initialized');
    }
    try {
      this.map.data.loadGeoJson(url);
      this.dataLayerLoaded = true;
      const pastel = ['#ffdce5','#ffecc6','#d9f2ff','#e7e0ff','#cffff1','#ffe8d6','#f1f7b5','#e2f0cb']
      const propKey = (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_ZIPCODE_PROP_KEY : undefined) || 'ZCTA5CE10'
      const pickColor = (feature: any) => {
        const key = feature.getProperty(propKey) || feature.getProperty('zipcode') || feature.getProperty('postalcode') || feature.getProperty('name') || ''
        let hash = 0
        const s = String(key)
        for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
        return pastel[hash % pastel.length]
      }
      this.map.data.setStyle((feature: any) => ({
        strokeColor: '#7d6b7d',
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: pickColor(feature),
        fillOpacity: 0.75,
      }));
      this.map.data.addListener('mouseover', (e: any) => {
        this.map.data.overrideStyle(e.feature, { strokeWeight: 5, fillOpacity: 0.85 })
      })
      this.map.data.addListener('mouseout', (e: any) => {
        this.map.data.revertStyle(e.feature)
      })
    } catch (e) {
      console.error('Error loading zipcode geojson:', e);
    }
  }

  clearZipcodeLayer() {
    if (!this.map || !this.isInitialized || !this.dataLayerLoaded) return;
    this.map.data.forEach((f: any) => this.map.data.remove(f));
    this.dataLayerLoaded = false;
  }

  getVisibleRegion(): { north: number; south: number; east: number; west: number } {
    if (!this.map || !this.isInitialized) {
      throw new Error('Map not initialized');
    }
    const bounds = this.map.getBounds();
    if (!bounds) {
      const c = this.map.getCenter();
      return { north: c.lat(), south: c.lat(), east: c.lng(), west: c.lng() };
    }
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    return {
      north: ne.lat(),
      south: sw.lat(),
      east: ne.lng(),
      west: sw.lng(),
    };
  }

  getApproxRadiusMeters(): number {
    const bounds = this.map.getBounds();
    const center = this.map.getCenter();
    if (!bounds || !center) {
      return 5000;
    }
    const ne = bounds.getNorthEast();
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(ne.lat() - center.lat());
    const dLon = toRad(ne.lng() - center.lng());
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(center.lat())) *
        Math.cos(toRad(ne.lat())) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  onRegionChange(callback: (region: any) => void) {
    if (!this.map || !this.isInitialized) {
      throw new Error('Map not initialized');
    }
    this.map.addListener('idle', () => {
      callback(this.map.getBounds());
    });
  }

  onAnnotationSelect(callback: (annotation: any) => void) {
    if (!this.map || !this.isInitialized) {
      throw new Error('Map not initialized');
    }
    this.annotationSelectCallback = callback;
  }

  convertCoordinateToPoint(coordinates: MapCoordinates): { x: number; y: number } {
    if (!this.map || !this.isInitialized) {
      throw new Error('Map not initialized');
    }
    const proj = this.overlayHelper.getProjection();
    const latLng = new window.google.maps.LatLng(coordinates.latitude, coordinates.longitude);
    const point = proj.fromLatLngToDivPixel(latLng);
    return { x: point.x, y: point.y };
  }

  destroy() {
    if (this.map) {
      this.markers.forEach(marker => marker.setMap(null));
      this.map = null;
      this.isInitialized = false;
    }
    this.markers = [];
  }
}

export const mapService = new MapService();

let googleMapsScriptLoading: Promise<void> | null = null;
export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }
  const existing = document.querySelector('script[data-google-maps]') as HTMLScriptElement | null;
  if (existing) {
    if (googleMapsScriptLoading) return googleMapsScriptLoading;
    return new Promise((resolve) => {
      existing.addEventListener('load', () => resolve(), { once: true });
    });
  }
  if (!googleMapsScriptLoading) {
    googleMapsScriptLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-google-maps', 'true');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps JS'));
      document.head.appendChild(script);
    });
  }
  return googleMapsScriptLoading;
}
