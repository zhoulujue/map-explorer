export interface Business {
  id: string;
  name: string;
  image_url: string;
  rating: number;
  review_count: number;
  categories: Array<{
    alias: string;
    title: string;
  }>;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  location: {
    address1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  phone: string;
  price: string;
  hours?: Array<{
    open: Array<{
      day: number;
      start: string;
      end: string;
    }>;
  }>;
  photos?: string[];
  website?: string;
}

export interface Review {
  id: string;
  rating: number;
  text: string;
  time_created: string;
  user: {
    name: string;
    image_url: string;
  };
}

export interface BusinessSearchResponse {
  businesses: Business[];
  total: number;
  region: {
    center: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface ReviewResponse {
  reviews: Review[];
  total: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_login: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  business_id: string;
  created_at: string;
}