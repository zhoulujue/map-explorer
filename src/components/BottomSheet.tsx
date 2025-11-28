import { motion, useMotionValue } from 'framer-motion';
import PlaceList from './PlaceList';
import FilterBar from './FilterBar';
import { useStore } from '@/store';

export default function BottomSheet() {
  const { nearbyBusinesses, showList, setShowList } = useStore();
  const y = useMotionValue(showList ? 0 : 320);

  return (
    <motion.div style={{ y }} className="fixed bottom-0 left-0 right-0 z-40"
      drag="y"
      dragConstraints={{ top: 0, bottom: 320 }}
      onDragEnd={(_, info) => { if (info.point.y > 140) setShowList(false) }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
    >
      <div className="bg-white rounded-t-2xl shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between px-4 pt-3">
          <div className="h-1 w-10 bg-gray-300 rounded-full mx-auto" />
          <button onClick={() => setShowList(false)} className="text-gray-500">✕</button>
        </div>
        <div className="px-0">
          <FilterBar />
        </div>
        <div className="p-4">
          <PlaceList businesses={nearbyBusinesses} title="Popular places in the area" />
        </div>
      </div>
    </motion.div>
  );
}
