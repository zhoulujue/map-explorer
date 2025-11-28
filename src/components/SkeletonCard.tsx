import { motion } from 'framer-motion'

export default function SkeletonCard() {
  return (
    <motion.div
      className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex space-x-3">
        <div className="w-16 h-16 rounded-lg bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/5 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-2/5 rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 flex gap-2">
            <div className="h-5 w-20 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-5 w-16 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
