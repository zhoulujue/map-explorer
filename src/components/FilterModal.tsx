import { motion, AnimatePresence } from 'framer-motion';

interface Option { label: string; value: string }

interface FilterModalProps {
  title: string;
  options: Option[];
  open: boolean;
  value: string | null;
  onClose: () => void;
  onApply: (value: string | null) => void;
}

export default function FilterModal({ title, options, open, value, onClose, onApply }: FilterModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 shadow-2xl"
            initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button onClick={onClose} className="text-gray-400">✕</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {options.map(opt => (
                <button key={opt.value} onClick={() => onApply(opt.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border ${value === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                  <span className="text-sm">{opt.label}</span>
                  <span className={`w-4 h-4 rounded-full ${value === opt.value ? 'bg-blue-500' : 'bg-gray-200'}`} />
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              <button onClick={() => onApply(null)} className="px-4 py-2 rounded-lg border border-gray-300">Clear</button>
              <button onClick={onClose} className="px-4 py-2 rounded-lg bg-pink-500 text-white">Apply</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

