import type { Business, BusinessSearchResponse, ReviewResponse } from '@/types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY;
const YELP_API_BASE = 'https://api.yelp.com/v3';

class YelpService {
  private async fetchWithAuth(endpoint: string, params?: Record<string, string | number>) {
    if (!BACKEND_URL || BACKEND_URL.trim().length === 0) {
      return Promise.reject(new Error('Backend proxy not configured'));
    }
    let url: URL
    if (BACKEND_URL && BACKEND_URL.trim().length > 0) {
      const base = BACKEND_URL.replace(/\/$/, '')
      url = new URL(`${base}/api/yelp${endpoint}`)
    } else {
      url = new URL(`${YELP_API_BASE}${endpoint}`)
    }
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async searchBusinesses(
    latitude: number,
    longitude: number,
    categories: string[] = ['restaurants', 'hotels'],
    radius: number = 16000, // 10 miles in meters
    limit: number = 20
  ): Promise<Business[]> {
    if (!BACKEND_URL || BACKEND_URL.trim().length === 0) {
      console.warn('Yelp backend not configured');
      return [];
    }
    const data: BusinessSearchResponse = await this.fetchWithAuth('/businesses/search', {
      latitude,
      longitude,
      categories: categories.join(','),
      radius,
      limit,
      sort_by: 'rating',
    });
    return data.businesses;
  }

  async getBusinessDetails(businessId: string): Promise<Business> {
    if (!BACKEND_URL || BACKEND_URL.trim().length === 0) {
      throw new Error('Backend proxy not configured');
    }
    const business: Business = await this.fetchWithAuth(`/businesses/${businessId}`);
    return business;
  }

  async getBusinessReviews(businessId: string): Promise<ReviewResponse> {
    if (!BACKEND_URL || BACKEND_URL.trim().length === 0) {
      throw new Error('Backend proxy not configured');
    }
    const data: ReviewResponse = await this.fetchWithAuth(`/businesses/${businessId}/reviews`);
    return data;
  }
}

export const yelpService = new YelpService();
