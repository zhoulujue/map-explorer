import PlaceCard from './PlaceCard';
import type { Business } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store';
import SkeletonCard from './SkeletonCard';

interface PlaceListProps {
  businesses: Business[];
  title?: string;
  onBusinessClick?: (business: Business) => void;
}

export default function PlaceList({ businesses, title, onBusinessClick }: PlaceListProps) {
  const { isDark } = useTheme();
  const { ratingFilter, sortBy, isLoading } = useStore();
  if (!businesses || businesses.length === 0) {
    return (
      <div className={`${isDark ? 'bg-background' : 'bg-gray-50'} text-center py-10 rounded-xl my-4`}>
        <div className="text-gray-400 text-4xl mb-3">🔍</div>
        <p className="text-text-secondary">暂无商家信息</p>
        <p className="text-sm text-text-secondary mt-1">尝试移动地图或搜索其他地区</p>
      </div>
    );
  }

  const dedup = (() => {
    const m = new Map<string, Business>()
    for (const b of businesses) {
      const id = String(b.id)
      if (!m.has(id)) m.set(id, b)
    }
    return Array.from(m.values())
  })()
  const filtered = dedup.filter(b => !ratingFilter || (b.rating || 0) >= ratingFilter)
  const sorted = [...filtered]
  if (sortBy === 'rating_desc') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  if (sortBy === 'reviews_desc') sorted.sort((a, b) => (b.review_count || 0) - (a.review_count || 0))

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text">{title}</h2>
          <span className="text-sm text-text-secondary">
            {sorted.length} 个商家
          </span>
        </div>
      )}
      
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`s-${i}`} />)
          : sorted.map((business, idx) => (
              <PlaceCard
                key={`${business.id}-${idx}`}
                business={business}
                onClick={() => onBusinessClick?.(business)}
              />
            ))}
      </div>
    </div>
  );
}
