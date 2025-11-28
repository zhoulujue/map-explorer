import { useState } from 'react';
import FilterModal from './FilterModal';
import { useStore } from '@/store';

export default function FilterBar() {
  const { ratingFilter, setRatingFilter, activeCategory, setActiveCategory, sortBy, setSortBy } = useStore();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
      <div className="flex items-center gap-2 p-3 overflow-x-auto no-scrollbar">
        <button onClick={() => setOpen('area')} className="px-3 py-1.5 rounded-full border bg-gray-100 text-sm">Area ▾</button>
        <button onClick={() => setOpen('category')} className="px-3 py-1.5 rounded-full border bg-gray-100 text-sm">Category ▾</button>
        <button onClick={() => setOpen('sort')} className="px-3 py-1.5 rounded-full border bg-gray-100 text-sm">Sort by ▾</button>
        <button onClick={() => setOpen('rating')} className="px-3 py-1.5 rounded-full border bg-gray-100 text-sm">Rating ▾</button>
      </div>

      <FilterModal
        title="Rating"
        open={open === 'rating'}
        value={ratingFilter ? String(ratingFilter) : null}
        options={[
          { label: 'All ratings', value: '0' },
          { label: '≥ 3.5', value: '3.5' },
          { label: '≥ 4.0', value: '4.0' },
          { label: '≥ 4.5', value: '4.5' },
        ]}
        onClose={() => setOpen(null)}
        onApply={(v) => setRatingFilter(v && v !== '0' ? parseFloat(v) : null)}
      />

      <FilterModal
        title="Category"
        open={open === 'category'}
        value={activeCategory}
        options={[
          { label: 'All', value: 'all' },
          { label: 'Food & drink', value: 'Food & drink' },
          { label: 'Hotels', value: 'Hotels' },
          { label: 'Leisure', value: 'Leisure' },
          { label: 'Travel', value: 'Travel' },
          { label: 'Cafe', value: 'Cafe' },
          { label: 'Bar', value: 'Bar' },
          { label: 'Museum', value: 'Museum' },
          { label: 'Park', value: 'Park' },
          { label: 'Shopping', value: 'Shopping' },
        ]}
        onClose={() => setOpen(null)}
        onApply={(v) => { setActiveCategory(v || 'all'); setOpen(null); }}
      />

      <FilterModal
        title="Sort by"
        open={open === 'sort'}
        value={sortBy || null}
        options={[
          { label: 'Default', value: 'default' },
          { label: 'Rating ↓', value: 'rating_desc' },
          { label: 'Reviews ↓', value: 'reviews_desc' },
        ]}
        onClose={() => setOpen(null)}
        onApply={(v) => setSortBy(v)}
      />
    </div>
  );
}
