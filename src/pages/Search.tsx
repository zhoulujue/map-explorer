import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PlaceList from '@/components/PlaceList';
import { yelpService } from '@/services/yelp';
import { googlePlacesService } from '@/services/googlePlaces';
import type { Business } from '@/types';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const category = searchParams.get('category') || 'all';
  const price = searchParams.get('price') || 'all';
  const rating = searchParams.get('rating') || 'all';
  const radius = searchParams.get('radius') || '5';
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  const categories = [
    { value: 'all', label: '全部分类' },
    { value: 'restaurants', label: '餐厅' },
    { value: 'hotels', label: '酒店' },
    { value: 'coffee', label: '咖啡厅' },
    { value: 'bars', label: '酒吧' },
    { value: 'shopping', label: '购物' },
    { value: 'entertainment', label: '娱乐' },
  ];

  const priceOptions = [
    { value: 'all', label: '全部价格' },
    { value: '1', label: '$ 经济实惠' },
    { value: '2', label: '$$ 中等消费' },
    { value: '3', label: '$$$ 高端消费' },
    { value: '4', label: '$$$$ 奢华消费' },
  ];

  const ratingOptions = [
    { value: 'all', label: '全部评分' },
    { value: '4.5', label: '4.5+ 星' },
    { value: '4.0', label: '4.0+ 星' },
    { value: '3.5', label: '3.5+ 星' },
    { value: '3.0', label: '3.0+ 星' },
  ];

  const radiusOptions = [
    { value: '1', label: '1公里' },
    { value: '5', label: '5公里' },
    { value: '10', label: '10公里' },
    { value: '25', label: '25公里' },
    { value: '50', label: '50公里' },
  ];

  useEffect(() => {
    const searchBusinesses = async () => {
      if (!searchQuery && !location) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get location coordinates
        let latitude = 37.7749; // Default: San Francisco
        let longitude = -122.4194;

        if (location) {
          try {
            // Simple geocoding - in real app, use a geocoding service
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
              latitude = parseFloat(data[0].lat);
              longitude = parseFloat(data[0].lon);
            }
          } catch (err) {
            console.error('Geocoding error:', err);
          }
        } else if (navigator.geolocation) {
          // Use current location
          navigator.geolocation.getCurrentPosition(
            (position) => {
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
            },
            (error) => {
              console.error('Geolocation error:', error);
            }
          );
        }

        let searchResults: Business[] = [];
        if (import.meta.env.VITE_YELP_API_KEY && import.meta.env.VITE_BACKEND_URL) {
          searchResults = await yelpService.searchBusinesses(
            latitude,
            longitude,
            category === 'all' ? ['restaurants', 'hotels'] : [category],
            parseInt(radius) * 1000,
            50
          );
        } else {
          const typeMap: Record<string, string> = {
            all: '',
            restaurants: 'restaurant',
            hotels: 'lodging',
            coffee: 'cafe',
            bars: 'bar',
            shopping: 'store',
            entertainment: 'tourist_attraction',
          };
          const type = typeMap[category] || '';
          const keyword = searchQuery || (category !== 'all' ? categories.find(c => c.value === category)?.label || '' : '');
          searchResults = await googlePlacesService.textSearch(
            keyword,
            latitude,
            longitude,
            parseInt(radius) * 1000,
            type || undefined
          );
        }

        // Apply filters
        let filteredResults = searchResults;

        // Filter by price
        if (price !== 'all') {
          const priceLevel = '$'.repeat(parseInt(price));
          filteredResults = filteredResults.filter(b => b.price === priceLevel);
        }

        // Filter by rating
        if (rating !== 'all') {
          const minRating = parseFloat(rating);
          filteredResults = filteredResults.filter(b => b.rating >= minRating);
        }

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredResults = filteredResults.filter(b => 
            b.name.toLowerCase().includes(query) ||
            b.categories.some(cat => cat.title.toLowerCase().includes(query))
          );
        }

        setBusinesses(filteredResults);
      } catch (err) {
        console.error('Search error:', err);
        setError('搜索失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    searchBusinesses();
  }, [searchQuery, location, searchParams]);

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams('q', searchQuery);
    updateSearchParams('location', location);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <span>←</span>
            <span>返回</span>
          </button>
          
          <h1 className="text-xl font-semibold text-gray-900">搜索商家</h1>
          
          <div className="w-16"></div>
        </div>
      </header>

      {/* Search Form */}
      <div className="bg-white border-b border-gray-200 p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索餐厅、酒店等..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="地点（可选）"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              搜索
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <select
              value={category}
              onChange={(e) => updateSearchParams('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">价格</label>
            <select
              value={price}
              onChange={(e) => updateSearchParams('price', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priceOptions.map((priceOpt) => (
                <option key={priceOpt.value} value={priceOpt.value}>
                  {priceOpt.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">评分</label>
            <select
              value={rating}
              onChange={(e) => updateSearchParams('rating', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ratingOptions.map((ratingOpt) => (
                <option key={ratingOpt.value} value={ratingOpt.value}>
                  {ratingOpt.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">距离</label>
            <select
              value={radius}
              onChange={(e) => updateSearchParams('radius', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {radiusOptions.map((radiusOpt) => (
                <option key={radiusOpt.value} value={radiusOpt.value}>
                  {radiusOpt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">搜索中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : (
          <PlaceList 
            businesses={businesses}
            title={`搜索结果 (${businesses.length} 个商家)`}
            onBusinessClick={(business) => navigate(`/place/${business.id}`)}
          />
        )}
      </div>
    </div>
  );
}
