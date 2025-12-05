import { useEffect, useRef, useState } from 'react';
import { mapService, loadGoogleMapsScript } from '@/services/map';
import { googlePlacesService } from '@/services/googlePlaces';
import { useStore } from '@/store';
import MapFallback from './MapFallback';
import type { Business } from '@/types';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { mapCategoryToPlacesType } from '@/lib/category';
import { debounce } from '@/lib/utils';
import { yelpService } from '@/services/yelp';
import { applyCuteStyle } from '@/services/mapStyle';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const { isDark } = useTheme();
  
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

  const findNearbyPlaces = async () => {
    if (isLoading) return;

    try {
      setLoading(true);
      let businesses: Business[] = [];
      const type = mapCategoryToPlacesType(activeCategory);
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
          const key = activeCategory?.toLowerCase() || 'all'
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
        businesses.forEach((business) => {
          mapService.addMarker(
            business.coordinates,
            business.name,
            `${business.rating} ⭐ (${business.review_count} reviews)`,
            business
          );
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
          fallback.forEach((business) => {
            mapService.addMarker(
              business.coordinates,
              business.name,
              `${business.rating} ⭐ (${business.review_count} reviews)`,
              business
            );
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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2">
        {['All','F&B','Travel','Hotels','Leisure','Cafe','Bar','Museum','Park','Shopping'].map((cat) => (
          <motion.button
            key={cat}
            onClick={() => {
              setActiveCategory(cat === 'All' ? 'all' : cat);
              findNearbyPlaces();
            }}
            className={`px-3 py-2 rounded-full text-sm shadow flex items-center gap-1 ${((activeCategory==='all' && cat==='All') || activeCategory===cat) ? 'bg-blue-600 text-white' : (isDark ? 'bg-card text-text' : 'bg-white text-text')}`}
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

      {/* Overlay Cards */}
      {!isMapLoading && nearbyBusinesses.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {nearbyBusinesses.slice(0,4).map((b, idx) => {
            const point = safeConvertToPoint(b.coordinates);
            if (!point) return null;
            const style: React.CSSProperties = {
              position: 'absolute',
              left: point.x,
              top: point.y,
              transform: 'translate(-50%, -100%)',
            };
            return (
              <div key={`${b.id}-${idx}`} style={style} className="pointer-events-auto">
                <motion.div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBusiness(b);
                  }}
                  className={`${isDark ? 'bg-card' : 'bg-white'} rounded-xl shadow-xl border ${isDark ? 'border-gray-700' : 'border-gray-100'} p-3 w-[90vw] sm:w-72 max-w-xs overflow-hidden`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`relative h-32 mb-2 overflow-hidden rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <img
                      src={b.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={b.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                    <span className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      {b.categories?.[0]?.title || 'Place'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text truncate">{b.name}</h3>
                    <div className="flex items-center space-x-1 mt-1.5">
                      <span className="text-yellow-400 text-xs">⭐</span>
                      <span className="text-sm font-medium text-text">{b.rating}</span>
                      <span className="text-xs text-text-secondary">({b.review_count})</span>
                    </div>
                  </div>
                </motion.div>
                <div className={`absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent ${isDark ? 'border-t-gray-800' : 'border-t-white'}`} />
              </div>
            );
          })}
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
