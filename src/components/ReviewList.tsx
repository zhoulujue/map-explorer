import { useState } from 'react';
import type { Review } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface ReviewListProps {
  reviews: Review[];
  businessName: string;
}

export default function ReviewList({ reviews, businessName }: ReviewListProps) {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const { isDark } = useTheme();

  const sanitizeAvatarUrl = (url: string) => {
    if (!url) return '';
    try {
      const u = new URL(url);
      if (u.hostname.includes('googleusercontent.com')) {
        const proxied = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=64&h=64&fit=cover`;
        return proxied;
      }
      return url;
    } catch {
      return url;
    }
  };

  const toggleExpanded = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ⭐
      </span>
    ));
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-6 text-center`}>
        <div className="text-gray-400 text-3xl mb-2">💬</div>
        <p className="text-text-secondary">暂无评论</p>
        <p className="text-sm text-text-secondary mt-1">成为第一个评价{businessName}的用户吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text">用户评价</h3>
        <span className="text-sm text-text-secondary">
          {reviews.length} 条评论
        </span>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => {
          const isExpanded = expandedReviews.has(review.id);
          const shouldTruncate = review.text && review.text.length > 200;
          
          return (
            <div key={review.id} className={`${isDark ? 'bg-card border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
              <div className="flex items-start space-x-3">
                <img
                  src={sanitizeAvatarUrl(review.user.image_url || '') || 'https://via.placeholder.com/40x40?text=U'}
                  alt={review.user.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=U';
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-text">{review.user.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-text-secondary">
                          {formatDate(review.time_created)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {review.text && (
                    <div className="mt-3">
                      <p className="text-text leading-relaxed">
                        {shouldTruncate && !isExpanded 
                          ? `${review.text.slice(0, 200)}...`
                          : review.text
                        }
                      </p>
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleExpanded(review.id)}
                          className="text-primary hover:text-primary/90 text-sm font-medium mt-2"
                        >
                          {isExpanded ? '收起' : '展开'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
