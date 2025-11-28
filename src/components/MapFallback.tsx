import { useEffect, useRef, useState } from 'react';
import { yelpService } from '@/services/yelp';
import { useStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';

export default function MapFallback() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const { isDark } = useTheme();
  
  const {
    mapCenter,
    isLoading: isSearching,
    setNearbyBusinesses,
    setMapCenter,
    setLoading,
  } = useStore();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setMapError(null);

        // Create a simple map using Leaflet or just show a placeholder
        // For now, we'll show a placeholder with the current location
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing fallback map:', error);
        setMapError('地图服务暂不可用');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, []);

  const findNearbyPlaces = async () => {
    if (isSearching) return;

    try {
      setLoading(true);
      const backend = import.meta.env.VITE_BACKEND_URL;
      if (!backend || backend.trim().length === 0) {
        console.warn('Yelp backend not configured');
        setLoading(false);
        return;
      }
      const businesses = await yelpService.searchBusinesses(
        mapCenter.latitude,
        mapCenter.longitude
      );
      
      setNearbyBusinesses(businesses);
      setLoading(false);
    } catch (error) {
      console.warn('Fallback search unavailable:', String(error));
      setLoading(false);
    }
  };

  if (mapError) {
    return (
      <div className={`h-full w-full flex items-center justify-center ${isDark ? 'bg-background' : 'bg-gray-100'}`}>
        <div className="text-center p-4">
          <div className="text-error mb-2">⚠️</div>
          <p className="text-text">{mapError}</p>
          <p className="text-sm text-text-secondary mt-2">Google Maps 需要有效的 API 密钥</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full relative ${isDark ? 'bg-background' : 'bg-gray-100'}`}>
      {/* Map Placeholder */}
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <div className="text-gray-400 text-6xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-text mb-2">地图视图</h3>
          <p className="text-text-secondary mb-4 break-all">
            当前位置: {mapCenter.latitude.toFixed(4)}, {mapCenter.longitude.toFixed(4)}
          </p>
          <div className="text-sm text-text-secondary">
            <p>Google Maps 需要配置 API 密钥</p>
            <p>请查看 .env.example 文件了解配置方法</p>
          </div>
        </div>
      </div>
      
      {/* Find Nearby Button */}
      <button
        onClick={findNearbyPlaces}
        disabled={isSearching || isLoading}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 z-20 transition-colors"
      >
        {isSearching ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>搜索中...</span>
          </>
        ) : (
          <>
            <span>🔍</span>
            <span>查找附近</span>
          </>
        )}
      </button>
      
      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 space-y-2 z-20">
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const center = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  };
                  setMapCenter(center);
                },
                (error) => {
                  console.error('Error getting location:', error);
                }
              );
            }
          }}
          className={`${isDark ? 'bg-card' : 'bg-white'} hover:bg-gray-50 p-3 rounded-full shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} transition-colors`}
          title="定位到我的位置"
        >
          📍
        </button>
      </div>
    </div>
  );
}
