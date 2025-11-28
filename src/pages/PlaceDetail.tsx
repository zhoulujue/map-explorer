import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { yelpService } from '@/services/yelp';
import { googlePlacesService } from '@/services/googlePlaces';
import { supabaseService } from '@/services/supabase';
import { useStore } from '@/store';
import ImageCarousel from '@/components/ImageCarousel';
import OperatingHours from '@/components/OperatingHours';
import ReviewList from '@/components/ReviewList';
import type { Business, Review } from '@/types';

export default function PlaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, setSelectedBusiness } = useStore();
  const { isDark } = useTheme();
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // 监听滚动事件来控制导航栏样式
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadBusinessDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load business details
        let businessData: Business;
        if (import.meta.env.VITE_YELP_API_KEY && import.meta.env.VITE_BACKEND_URL) {
          businessData = await yelpService.getBusinessDetails(id);
        } else {
          businessData = await googlePlacesService.getBusinessDetails(id);
        }
        setBusiness(businessData);

        // Load reviews
        if (import.meta.env.VITE_YELP_API_KEY && import.meta.env.VITE_BACKEND_URL) {
          const reviewsData = await yelpService.getBusinessReviews(id);
          setReviews(reviewsData.reviews);
        } else {
          const gpReviews = await googlePlacesService.getBusinessReviews(id);
          setReviews(gpReviews);
        }

        // Check if favorited
        if (isAuthenticated && user) {
          const favorited = await supabaseService.isFavorited(user.id, id);
          setIsFavorited(favorited);
        }
      } catch (err) {
        console.error('Error loading business details:', err);
        setError('无法加载商家信息，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessDetails();
  }, [id, isAuthenticated, user]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !user || !business) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        await supabaseService.removeFavorite(user.id, business.id);
        setIsFavorited(false);
      } else {
        await supabaseService.addFavorite(user.id, business.id);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleCall = () => {
    if (business?.phone) {
      window.location.href = `tel:${business.phone}`;
    }
  };

  const handleGetDirections = () => {
    if (business?.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${business.coordinates.latitude},${business.coordinates.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleVisitWebsite = () => {
    if (business?.website) {
      window.open(business.website, '_blank');
    }
  };

  // 分享功能
  const handleShare = () => {
    if (!business) return;
    
    const shareText = `${business.name} - ${business.location?.address1 || ''}`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: shareText,
        url: shareUrl,
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // 复制到剪贴板作为回退方案
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('链接已复制到剪贴板');
      }).catch(() => {
        alert(`请手动复制链接: ${shareUrl}`);
      });
    }
  };

  

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-text">
        <motion.div
          className={`w-14 h-14 border-4 border-t-primary ${isDark ? 'border-gray-700' : 'border-blue-100'} rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          className="mt-4 text-text-secondary font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          加载中...
        </motion.p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-text p-4">
        <div className="text-gray-400 text-5xl mb-4">📍</div>
        <h2 className="text-xl font-semibold text-text mb-2">无法加载商家信息</h2>
        <p className="text-text-secondary text-center mb-6">{error || '商家不存在或已被移除'}</p>
        <motion.button
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-full shadow-md"
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(-1)}
        >
          返回
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      {/* 顶部导航栏 */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-card shadow-md' : 'bg-transparent'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-4 h-16">
          <motion.button
            className={`p-2 rounded-full ${isScrolled ? 'bg-gray-100 dark:bg-gray-800' : 'bg-black/20 text-white'}`}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setSelectedBusiness(null); navigate('/'); }}
          >
            ✕
          </motion.button>
          
          <motion.h1 
            className={`text-lg font-semibold truncate max-w-[70%] ${isScrolled ? 'text-text' : 'text-white'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: isScrolled ? 1 : 0 }}
          >
            {business.name}
          </motion.h1>
          
          {isAuthenticated && user && (
            <motion.button
              onClick={handleFavoriteToggle}
              className={`p-2 rounded-full transition-colors ${isScrolled ? (isFavorited ? 'bg-error/10 text-error' : 'bg-gray-100 dark:bg-gray-800 text-text-secondary') : (isFavorited ? 'text-red-500' : 'text-white')}`}
              title={isFavorited ? '取消收藏' : '收藏'}
              whileTap={{ scale: 0.9 }}
            >
              {isFavorited ? '❤️' : '🤍'}
            </motion.button>
          )}
        </div>
      </motion.header>

      <div className="pt-16">
        {/* 图片轮播 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ImageCarousel 
            images={business.photos || [business.image_url]} 
            alt={business.name}
            height="300px"
          />
        </motion.div>

        {/* 商家信息 */}
        <motion.div
          className="bg-card px-4 pt-4 -mt-8 relative z-10 rounded-t-3xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* 评分徽章 */}
          <div className="absolute -top-10 right-6 bg-primary text-white text-lg font-bold px-3 py-1.5 rounded-full shadow-lg">
            {business.rating}
          </div>

          <h1 className="text-2xl font-bold text-text mb-1">{business.name}</h1>
          
          <div className="flex items-center text-sm text-text-secondary mb-3 flex-wrap gap-2">
            {business.categories?.[0]?.title && (
              <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {business.categories[0].title}
              </span>
            )}
            
            {business.price && (
              <span className="mr-2">{business.price}</span>
            )}
            
            <span>{business.review_count} 条评论</span>
          </div>

          {/* 地址信息 */}
          {business.location && (
            <div className="flex items-start mb-4">
              <div className="text-gray-400 mr-2 mt-0.5">📍</div>
              <div className="text-sm text-text-secondary">
                <p>{business.location.address1}</p>
                
                <p>{business.location.city}, {business.location.state} {business.location.zip_code}</p>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-between mb-6">
            <motion.button
              className="flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-3 rounded-xl mx-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.95 }}
              onClick={handleCall}
              disabled={!business.phone}
              aria-label="拨打商家电话"
            >
            <div className="text-xl mb-1">📞</div>
            <span className="text-sm font-medium">电话</span>
          </motion.button>

            <motion.button
              className="flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-3 rounded-xl mx-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              whileTap={{ scale: 0.95 }}
              onClick={handleGetDirections}
              aria-label="获取导航到该商家"
            >
              <div className="text-xl mb-1">🚗</div>
              <span className="text-sm font-medium">导航</span>
            </motion.button>

            <motion.button
              className="flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-3 rounded-xl mx-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              whileTap={{ scale: 0.95 }}
              onClick={handleVisitWebsite}
              disabled={!business.website}
              aria-label="访问商家网站"
            >
              <div className="text-xl mb-1">🌐</div>
              <span className="text-sm font-medium">网站</span>
            </motion.button>

            <motion.button
              className="flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-3 rounded-xl mx-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              aria-label="分享商家信息"
            >
              <div className="text-xl mb-1">📤</div>
              <span className="text-sm font-medium">分享</span>
            </motion.button>
          </div>

          {/* 营业时间 */}
          {business.hours && business.hours.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <OperatingHours hours={business.hours} />
            </motion.div>
          )}

          {/* 评论列表 */}
          <motion.div
            className="mb-24 pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ReviewList 
              reviews={reviews} 
              businessName={business.name}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
