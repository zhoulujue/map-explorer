import { create } from 'zustand';
import type { Business, User } from '@/types';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Map state
  mapCenter: { latitude: number; longitude: number };
  selectedBusiness: Business | null;
  nearbyBusinesses: Business[];
  isLoading: boolean;
  
  // UI state
  showSearchModal: boolean;
  showFavorites: boolean;
  showList: boolean;
  activeCategory: string;
  ratingFilter: number | null;
  sortBy?: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setMapCenter: (center: { latitude: number; longitude: number }) => void;
  setSelectedBusiness: (business: Business | null) => void;
  setNearbyBusinesses: (businesses: Business[]) => void;
  setLoading: (loading: boolean) => void;
  setShowSearchModal: (show: boolean) => void;
  setShowFavorites: (show: boolean) => void;
  setShowList: (show: boolean) => void;
  setActiveCategory: (cat: string) => void;
  setRatingFilter: (rating: number | null) => void;
  setSortBy: (sort: string | null) => void;
  
  // Business actions
  addBusinesses: (businesses: Business[]) => void;
  clearNearbyBusinesses: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  mapCenter: { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
  selectedBusiness: null,
  nearbyBusinesses: [],
  isLoading: false,
  showSearchModal: false,
  showFavorites: false,
  showList: false,
  activeCategory: 'all',
  ratingFilter: null,
  sortBy: null,
  
  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setMapCenter: (mapCenter) => set({ mapCenter }),
  setSelectedBusiness: (selectedBusiness) => set({ selectedBusiness }),
  setNearbyBusinesses: (nearbyBusinesses) => set({ nearbyBusinesses }),
  setLoading: (isLoading) => set({ isLoading }),
  setShowSearchModal: (showSearchModal) => set({ showSearchModal }),
  setShowFavorites: (showFavorites) => set({ showFavorites }),
  setShowList: (showList) => set({ showList }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setRatingFilter: (ratingFilter) => set({ ratingFilter }),
  setSortBy: (sortBy) => set({ sortBy }),
  
  // Business actions
  addBusinesses: (businesses) => set((state) => ({
    nearbyBusinesses: [...state.nearbyBusinesses, ...businesses]
  })),
  clearNearbyBusinesses: () => set({ nearbyBusinesses: [] }),
}));
