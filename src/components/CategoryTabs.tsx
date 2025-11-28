import { useStore } from '@/store';

const tabs = [
  { key: 'food', label: 'Food & drink' },
  { key: 'travel', label: 'Travel' },
  { key: 'hotels', label: 'Hotels' },
  { key: 'leisure', label: 'Leisure' },
  { key: 'beauty', label: 'Beauty' },
];

export default function CategoryTabs() {
  const { activeCategory, setActiveCategory } = useStore();

  return (
    <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar px-4 py-2">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => setActiveCategory(t.key)}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            activeCategory === t.key
              ? 'bg-white text-gray-900 border-gray-300 shadow-sm'
              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

