import { useEffect, useRef, useState } from 'react';
import { mapService, loadGoogleMapsScript } from '@/services/map';
import { googlePlacesService } from '@/services/googlePlaces';
import { useStore } from '@/store';
import MapFallback from './MapFallback';
import type { Business } from '@/types';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { mapCategoryToPlacesType } from '@/lib/category';
import { debounce } from '@/lib/utils';
import { yelpService } from '@/services/yelp';
import { applyCuteStyle } from '@/services/mapStyle';
import { emojiForBusiness } from '@/lib/emoji';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const EMOJI_OVERRIDES: Record<string, string> = (() => { try { return JSON.parse((import.meta as any).env?.VITE_EMOJI_OVERRIDES || '{}') } catch { return {} } })();
const DISABLE_EMOJI = ((import.meta as any).env?.VITE_DISABLE_EMOJI_MARKERS === 'true');

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const markerRefs = useRef<any[]>([]);
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const {
    mapCenter,
    nearbyBusinesses,
    isLoading,
    setNearbyBusinesses,
    setSelectedBusiness,
    setMapCenter,
    setLoading,
    showList,
    setShowList,
    activeCategory,
    setActiveCategory,
  } = useStore();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initializeMap = async () => {
      try {
        setIsMapLoading(true);
        setMapError(null);

        if (!window.google?.maps && GOOGLE_MAPS_API_KEY) {
          await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
        }

        if (!window.google?.maps) {
          throw new Error('Google Maps JS not available');
        }

        // Initialize map
        await mapService.initializeMap(mapContainerRef.current!, mapCenter);
        const enableCute = import.meta.env.VITE_ENABLE_CUTE_MAP === 'true';
        if (enableCute) {
          applyCuteStyle(mapService.getMap());
          const zipcodeUrl = import.meta.env.VITE_ZIPCODES_GEOJSON_URL as string | undefined;
          if (zipcodeUrl) {
            await mapService.loadZipcodeGeoJson(zipcodeUrl);
          } else {
            const region = mapService.getVisibleRegion();
            await mapService.loadZipcodesFromOverpass(region);
          }
          const roadsUrl = import.meta.env.VITE_MAJOR_ROADS_GEOJSON_URL as string | undefined;
          if (roadsUrl) {
            await mapService.loadMajorRoads(roadsUrl);
          }
          const landmarksUrl = import.meta.env.VITE_LANDMARKS_GEOJSON_URL as string | undefined;
          if (landmarksUrl) {
            await mapService.loadLandmarks(landmarksUrl);
          }
        }

        // Set up event listeners
        mapService.onAnnotationSelect((annotation) => {
          if (annotation.data) {
            setSelectedBusiness(annotation.data);
            setSelectedMarker(annotation.data.id);
          }
        });

        const debounced = debounce(() => {
          findNearbyPlaces();
        }, 600);
        mapService.onRegionChange(() => {
          const center = mapService.getCenter();
          setMapCenter(center);
          debounced();
        });

        mapService.getMap().addListener('zoom_changed', () => {
          const z = mapService.getMap().getZoom();
          const size = sizeForZoom(z);
          markerRefs.current.forEach((m: any) => {
            const emoji = (m as any).__emoji || '📍';
            const icon = getEmojiIcon(emoji, size);
            m.setIcon(icon);
          });
        });

        setIsMapLoading(false);
        await findNearbyPlaces();
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('无法加载地图，请检查网络连接');
        setIsMapLoading(false);
      }
    };

    initializeMap();

    return () => {
      mapService.destroy();
    };
  }, []);

  const findNearbyPlaces = async (categoryOverride?: string) => {
    if (isLoading) return;

    try {
      setLoading(true);
      let businesses: Business[] = [];
      const type = mapCategoryToPlacesType(categoryOverride ?? activeCategory);
      const hasPlaces = !!(window.google?.maps?.places);
      const hasMap = !!mapService.getMap();
      const backend = import.meta.env.VITE_BACKEND_URL;
      if (hasPlaces) {
        if (type) {
          businesses = await googlePlacesService.searchNearbyByType(type);
        } else {
          businesses = await googlePlacesService.searchNearbyRestaurantsAndHotels();
        }
      } else if (backend && backend.trim().length > 0) {
        const cats = (() => {
          const key = (categoryOverride?.toLowerCase() || activeCategory?.toLowerCase() || 'all')
          if (key === 'all') return ['restaurants', 'hotels'];
          if (key.includes('food') || key.includes('f&b')) return ['restaurants'];
          if (key.includes('hotel')) return ['hotels'];
          if (key.includes('bar')) return ['bars'];
          if (key.includes('cafe')) return ['coffee'];
          return ['restaurants'];
        })();
        const radius = hasMap
          ? Math.min(Math.max(mapService.getApproxRadiusMeters(), 500), 50000)
          : 5000;
        businesses = await yelpService.searchBusinesses(
          mapCenter.latitude,
          mapCenter.longitude,
          cats,
          radius,
          20
        );
      } else {
        setNearbyBusinesses([]);
      }
      
      setNearbyBusinesses(businesses);
      
      // Add markers to map
      if (hasMap) {
        mapService.removeAllMarkers();
        markerRefs.current = [];
        const z = mapService.getMap().getZoom();
        const size = sizeForZoom(z);
        const limit = markerLimitForZoom(z);
        const list = businesses.slice(0, limit);
        list.forEach((business) => {
          const marker = mapService.addMarker(
            business.coordinates,
            business.name,
            `${business.rating} ⭐ (${business.review_count} reviews)`,
            business
          );
          const emoji = emojiForBusiness(business, EMOJI_OVERRIDES);
          const icon = getEmojiIcon(emoji, size);
          marker.setIcon(icon);
          (marker as any).__emoji = emoji;
          markerRefs.current.push(marker);
        });
      }
    } catch (error) {
      try {
        const cats = ['restaurants', 'hotels'];
        const radius = !!mapService.getMap()
          ? Math.min(Math.max(mapService.getApproxRadiusMeters(), 500), 16000)
          : 5000;
        const fallback = await yelpService.searchBusinesses(
          mapCenter.latitude,
          mapCenter.longitude,
          cats,
          radius,
          20
        );
        setNearbyBusinesses(fallback);
        if (!!mapService.getMap()) {
          mapService.removeAllMarkers();
          markerRefs.current = [];
          const z = mapService.getMap().getZoom();
          const size = sizeForZoom(z);
          const limit = markerLimitForZoom(z);
          const list = fallback.slice(0, limit);
          list.forEach((business) => {
            const marker = mapService.addMarker(
              business.coordinates,
              business.name,
              `${business.rating} ⭐ (${business.review_count} reviews)`,
              business
            );
            const emoji = emojiForBusiness(business, EMOJI_OVERRIDES);
            const icon = getEmojiIcon(emoji, size);
            marker.setIcon(icon);
            (marker as any).__emoji = emoji;
            markerRefs.current.push(marker);
          });
        }
      } catch (err2) {
        console.warn('Nearby search unavailable:', String(error));
      }
    } finally {
      setLoading(false);
    }
  };

  if (mapError || !GOOGLE_MAPS_API_KEY) {
    return <MapFallback />;
  }

  return (
    <div className="h-full w-full relative">
      {/* Map Container */}
      <div ref={mapContainerRef} className="h-full w-full" />
      {/* Category Chips */}
      <div className="absolute top-4 left-4 right-4 z-20 overflow-x-auto whitespace-nowrap flex items-center gap-2 px-1 hide-scrollbar">
        {['All','F&B','Travel','Hotels','Leisure','Cafe','Bar','Museum','Park','Shopping'].map((cat) => (
          <motion.button
            key={cat}
            onClick={() => {
              const nextCat = (cat === 'All' ? 'all' : cat);
              setActiveCategory(nextCat);
              findNearbyPlaces(nextCat);
            }}
            className={`px-3 py-2 rounded-full text-sm shadow flex items-center gap-1 flex-shrink-0 ${((activeCategory==='all' && cat==='All') || activeCategory===cat) ? 'bg-blue-600 text-white' : (isDark ? 'bg-card text-text' : 'bg-white text-text')}`}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
          >
            <span>
              {cat === 'F&B' ? '🍽️' : cat === 'Travel' ? '🧳' : cat === 'Hotels' ? '🏨' : cat === 'Leisure' ? '🎡' : cat === 'Cafe' ? '☕' : cat === 'Bar' ? '🍺' : cat === 'Museum' ? '🏛️' : cat === 'Park' ? '🌳' : cat === 'Shopping' ? '🛍️' : '🗂️'}
            </span>
            <span>{cat}</span>
          </motion.button>
        ))}
        {isLoading && (
          <span className="ml-2 text-sm text-text-secondary">搜索中...</span>
        )}
      </div>
      
      {/* Loading Overlay */}
      {isMapLoading && (
        <div className={`absolute inset-0 ${isDark ? 'bg-background/95' : 'bg-white/95'} flex flex-col items-center justify-center z-10`}>
          <motion.div 
            className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          ></motion.div>
          <motion.p 
            className="text-text font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            地图加载中...
          </motion.p>
        </div>
      )}
      
      {/* List Toggle Button */}
      <motion.button
        onClick={() => setShowList(!showList)}
        className={`absolute bottom-24 right-4 ${isDark ? 'bg-card' : 'bg-white'} hover:bg-gray-50 text-text px-4 py-2.5 rounded-full shadow-lg flex items-center space-x-2 z-20 transition-colors border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
        aria-label="列表视图"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>≡</span>
        <span className="text-sm font-medium">List</span>
      </motion.button>
      
      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 space-y-3 z-20">
        <motion.button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const center = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  };
                  setMapCenter(center);
                  mapService.setCenter(center);
                },
                (error) => {
                  console.error('Error getting location:', error);
                }
              );
            }
          }}
          className={`${isDark ? 'bg-card' : 'bg-white'} hover:bg-gray-50 p-3.5 rounded-full shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} transition-colors`}
          title="定位到我的位置"
          aria-label="定位到我的位置"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          📍
        </motion.button>
      </div>

      {/* Overlay card: show only when a marker is selected */}
      {!isMapLoading && selectedMarker && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {(() => {
            const b = (nearbyBusinesses || []).find(x => x.id === selectedMarker);
            if (!b) return null;
            const point = safeConvertToPoint(b.coordinates);
            if (!point) return null;
            const style: React.CSSProperties = { position: 'absolute', left: point.x, top: point.y, transform: 'translate(-50%, -105%)' };
            return (
              <div style={style} className="pointer-events-auto">
                <motion.div
                  onClick={(e) => { e.stopPropagation(); navigate(`/place/${b.id}`); }}
                  className={`${isDark ? 'bg-card' : 'bg-white'} rounded-lg shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} px-3 py-2 w-56`}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-text">{b.name}</div>
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <span className="text-yellow-400">★</span>
                        <span className="font-medium text-text">{b.rating}</span>
                        <span>({b.review_count})</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
                <div className={`absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent ${isDark ? 'border-t-gray-800' : 'border-t-white'}`} />
              </div>
            );
          })()}
        </div>
      )}
      
      {/* Map Click Handler to Close Cards */}
      {selectedMarker && (
        <div 
          className="absolute inset-0 z-5" 
          onClick={() => setSelectedMarker(null)}
          style={{ pointerEvents: 'auto' }}
        />
      )}
    </div>
  );
}

function safeConvertToPoint(coords: { latitude: number; longitude: number }) {
  try {
    return mapService.convertCoordinateToPoint(coords);
  } catch {
    return null;
  }
}

const iconCache: Record<string, { url?: string; size?: any; anchor?: any; path?: string; fillColor?: string; fillOpacity?: number; strokeWeight?: number; scale?: number }> = {}

function getEmojiIcon(emoji: string, size: number) {
  const key = `${emoji}:${size}`
  const cached = iconCache[key]
  if (cached) {
    if (DISABLE_EMOJI && cached.path) return { path: cached.path, fillColor: cached.fillColor, fillOpacity: cached.fillOpacity, strokeWeight: cached.strokeWeight, scale: cached.scale, anchor: cached.anchor }
    return { url: cached.url, scaledSize: cached.size, anchor: cached.anchor }
  }
  if (DISABLE_EMOJI) {
    const icon = { path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z', fillColor: '#007AFF', fillOpacity: 1, strokeWeight: 0, scale: size / 24, anchor: new window.google.maps.Point(12, 22) }
    iconCache[key] = icon
    return icon
  }
  const bg = '#ffffff'
  const stroke = '#1f2937'
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>`+
    `<circle cx='${size / 2}' cy='${size / 2}' r='${(size / 2) - 2}' fill='${bg}' fill-opacity='0.9' stroke='${stroke}' stroke-opacity='0.15' stroke-width='2'/>`+
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='${Math.floor(size * 0.64)}'>${emoji}</text>`+
    `</svg>`
  const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  const scaledSize = new window.google.maps.Size(size, size)
  const anchor = new window.google.maps.Point(size / 2, size / 2)
  iconCache[key] = { url, size: scaledSize, anchor }
  return { url, scaledSize, anchor }
}

function sizeForZoom(z: number) {
  if (z >= 17) return 40
  if (z >= 15) return 34
  if (z >= 13) return 30
  if (z >= 11) return 26
  return 22
}

function markerLimitForZoom(z: number) {
  if (z >= 16) return 40
  if (z >= 14) return 30
  if (z >= 12) return 24
  return 18
}
