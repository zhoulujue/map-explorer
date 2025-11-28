import { } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from '@/pages/Home';
import PlaceDetail from '@/pages/PlaceDetail';
import Login from '@/pages/Login';
import BottomNavBar from '@/components/BottomNavBar';
import Favorites from '@/pages/Favorites';
import Settings from '@/pages/Settings';
import Search from '@/pages/Search';

function App() {
  const location = useLocation();
  


  return (
    <div className="h-full bg-background text-text min-h-screen">
      <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div key="route-home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full pb-20 bg-background text-text"
            >
              <Home />
            </motion.div>
          }
        />
        <Route
          path="/place/:id"
          element={
            <motion.div key="route-place"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PlaceDetail />
            </motion.div>
          }
        />
        <Route
          path="/login"
          element={
            <motion.div key="route-login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Login />
            </motion.div>
          }
        />
        <Route
          path="/favorites"
          element={
            <motion.div key="route-favorites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pb-20 bg-background text-text"
            >
              <Favorites />
            </motion.div>
          }
        />
        <Route
          path="/settings"
          element={
            <motion.div key="route-settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pb-20"
            >
              <Settings />
            </motion.div>
          }
        />
        <Route
          path="/search"
          element={
            <motion.div key="route-search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pb-20 bg-background text-text"
            >
              <Search />
            </motion.div>
          }
        />
      </Routes>
      <BottomNavBar />
    </AnimatePresence>
    </div>
  );
}

export default App;
