import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import PlaceList from '@/components/PlaceList';
import { supabaseService, isSupabaseConfigured } from '@/services/supabase';
import { yelpService } from '@/services/yelp';
import { googlePlacesService } from '@/services/googlePlaces';
import { useStore } from '@/store';
import type { Business, Favorite } from '@/types';

export default function Favorites() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useStore();
  const { isDark } = useTheme();
  
  const [favorites, setFavorites] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoginClick = () => {
    if (!isSupabaseConfigured) return;
    navigate('/login');
  };

  const loadFavorites = async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const userFavorites = await supabaseService.getFavorites(user.id);

      const businessPromises = userFavorites.map(async (favorite: Favorite) => {
        try {
          if (import.meta.env.VITE_YELP_API_KEY) {
            return await yelpService.getBusinessDetails(favorite.business_id);
          }
          return await googlePlacesService.getBusinessDetails(favorite.business_id);
        } catch (err) {
          console.error(`Error loading business ${favorite.business_id}:`, err);
          return null;
        }
      });

      const businesses = await Promise.all(businessPromises);
      const validBusinesses = businesses.filter((b): b is Business => b !== null);
      setFavorites(validBusinesses);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('无法加载收藏列表，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-text flex flex-col items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-5xl mb-4">❤️</div>
          <h2 className="text-2xl font-bold text-text mb-2">登录后查看收藏</h2>
          <p className="text-text-secondary mb-6">登录后可以收藏您喜欢的地点并在收藏夹中查看</p>
          <motion.button
            className={`px-6 py-3 rounded-full shadow-md w-full ${isSupabaseConfigured ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
            whileTap={{ scale: isSupabaseConfigured ? 0.97 : 1 }}
            onClick={handleLoginClick}
            disabled={!isSupabaseConfigured}
          >
            {isSupabaseConfigured ? '登录 / 注册' : '未配置 Supabase，暂不可用'}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border px-4 py-4 sticky top-0 z-10">
        <motion.h1 
          className="text-xl font-bold text-text text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          我的收藏
        </motion.h1>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        {isLoading ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className={`w-12 h-12 border-4 border-t-primary ${isDark ? 'border-gray-700' : 'border-blue-100'} rounded-full mx-auto mb-4`}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-500">加载中...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div 
              className="text-error text-4xl mb-4"
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              ⚠️
            </motion.div>
            <p className="text-text-secondary mb-6">{error}</p>
            <motion.button
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-medium shadow-md"
              whileTap={{ scale: 0.97 }}
              onClick={() => loadFavorites()}
            >
              重新加载
            </motion.button>
          </motion.div>
        ) : favorites.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="text-gray-400 dark:text-gray-500 text-5xl mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🤍
            </motion.div>
            <h2 className="text-xl font-semibold text-text mb-2">暂无收藏</h2>
            <p className="text-text-secondary mb-8 max-w-md">您还没有收藏任何商家，去探索页面发现并收藏喜欢的地点吧</p>
            <motion.button
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-medium shadow-md"
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/')}
            >
              去发现好店
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <PlaceList 
              businesses={favorites}
              title={`收藏的商家 (${favorites.length} 个)`}
              onBusinessClick={(business) => navigate(`/place/${business.id}`)}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
