import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '@/components/Map';
import { useStore } from '@/store';
import { supabaseService } from '@/services/supabase';
import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';
import BottomSheet from '@/components/BottomSheet';

export default function Home() {
  const navigate = useNavigate();
  const { showList, setShowList } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { toggleTheme, isDark } = useTheme();
  const { selectedBusiness, setUser } = useStore();
  

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const currentUser = await supabaseService.getCurrentUser();
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email || '',
          name: currentUser.user_metadata?.name || 'User',
          created_at: currentUser.created_at,
          last_login: new Date().toISOString(),
        });
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      navigate(`/place/${selectedBusiness.id}`);
    }
  }, [selectedBusiness, navigate]);

  return (
    <div className="h-screen flex flex-col bg-background text-text">
      {/* Header aligned to design */}
      <header className="bg-card shadow-sm border-b border-border px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">←</button>
          <h1 className="text-base font-semibold">Explore places</h1>
          <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">{isDark ? '☀️' : '🌙'}</button>
        </div>
      </header>

      {/* Search Bar */}
      <motion.div 
        className="px-4 py-3 bg-card border-b border-border"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            const q = searchQuery.trim();
            if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
          }}
        >
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 border-0 rounded-full pl-10 pr-20 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
            placeholder="搜索地点或商家名称"
            aria-label="搜索"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium hover:bg-primary/90"
          >
            搜索
          </button>
        </form>
      </motion.div>

      {/* Categories removed per request */}

      {/* Map Toggle Button moved to Map component */}

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        <div className="h-full w-full">
          <Map />
          <div className="absolute bottom-4 right-4 z-20">
            <button onClick={() => setShowList(!showList)} className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200 text-gray-800">
              {showList ? 'Map' : 'List'}
            </button>
          </div>
        </div>
        {showList && <BottomSheet />}
      </div>

      {/* Bottom Sheet for Mobile */}
      
    </div>
  );
}
