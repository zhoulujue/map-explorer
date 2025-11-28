import { useNavigate } from 'react-router-dom';
import type { Business } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store';
import { haversineKm, formatDistanceKm } from '@/lib/geo';
import { motion } from 'framer-motion';

interface PlaceCardProps {
  business: Business;
  onClick?: () => void;
}

export default function PlaceCard({ business, onClick }: PlaceCardProps) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { mapCenter } = useStore();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/place/${business.id}`);
    }
  };

  const getCategoryName = () => {
    return business.categories?.[0]?.title || '商家';
  };

  

  const distance = (() => {
    const c = mapCenter;
    if (!c || !business.coordinates) return null;
    const km = haversineKm(c.latitude, c.longitude, business.coordinates.latitude, business.coordinates.longitude);
    return formatDistanceKm(km);
  })();

  const badges = (() => {
    const cat = getCategoryName().toLowerCase();
    const arr: string[] = [];
    if (cat.includes('bar')) arr.push('Top Drinks');
    if (cat.includes('japanese')) arr.push('Top Japanese Food');
    if (cat.includes('restaurant')) arr.push('24h open');
    arr.push('Child chair');
    return arr.slice(0, 3);
  })();

  return (
    <motion.div
      onClick={handleClick}
      className={`${isDark ? 'bg-card border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-3 cursor-pointer`}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <div className="flex space-x-3">
        {/* Image */}
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16">
            <img
              src={business.image_url || 'https://via.placeholder.com/80x80?text=No+Image'}
              alt={business.name}
            className="w-16 h-16 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=No+Image';
              }}
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-text truncate">
                {business.name}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                <span className="text-yellow-400">★</span>
                <span className="ml-0.5 font-medium">{business.rating}</span>
                <span className="ml-0.5">/5</span>
                <span className="ml-1 text-text-secondary">({business.review_count})</span>
                <span className="mx-1">·</span>
                <span>{getCategoryName()}</span>
                {business.price && (<><span className="mx-1">·</span><span>{business.price}</span></>)}
              </p>
            </div>
            {distance && <div className="text-[11px] text-text-secondary whitespace-nowrap ml-2">{distance} from current location</div>}
          </div>
          
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 flex-wrap">
              {badges.map((b) => (
                <span key={b} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {b}
                </span>
              ))}
            </div>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                const url = `https://maps.apple.com/?daddr=${business.coordinates.latitude},${business.coordinates.longitude}`;
                window.open(url, '_blank');
              }}
              className="text-primary hover:text-primary/90 text-xs font-medium p-2 -mr-1 rounded-md transition-colors"
              aria-label={`导航到${business.name}`}
              whileTap={{ scale: 0.95 }}
            >
              导航 →
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
