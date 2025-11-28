import { createClient } from '@supabase/supabase-js';
import type { Favorite } from '@/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not found. Some features will be disabled.');
}

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export class SupabaseService {
  async getCurrentUser() {
    if (!supabase) return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }

  async signUp(email: string, password: string, name: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    const backend = import.meta.env.VITE_BACKEND_URL;
    if (backend) {
      const resp = await fetch(`${backend}/api/favorites?user_id=${encodeURIComponent(userId)}`);
      if (!resp.ok) throw new Error(`Backend error: ${resp.status}`);
      return await resp.json();
    }
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  }

  async addFavorite(userId: string, businessId: string): Promise<Favorite> {
    const backend = import.meta.env.VITE_BACKEND_URL;
    if (backend) {
      const resp = await fetch(`${backend}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, business_id: businessId }),
      });
      if (!resp.ok) throw new Error(`Backend error: ${resp.status}`);
      return await resp.json();
    }
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, business_id: businessId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async removeFavorite(userId: string, businessId: string): Promise<void> {
    const backend = import.meta.env.VITE_BACKEND_URL;
    if (backend) {
      const resp = await fetch(`${backend}/api/favorites`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, business_id: businessId }),
      });
      if (!resp.ok) throw new Error(`Backend error: ${resp.status}`);
      return;
    }
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('business_id', businessId);
    if (error) throw error;
  }

  async isFavorited(userId: string, businessId: string): Promise<boolean> {
    const backend = import.meta.env.VITE_BACKEND_URL;
    if (backend) {
      const resp = await fetch(`${backend}/api/favorites/check?user_id=${encodeURIComponent(userId)}&business_id=${encodeURIComponent(businessId)}`);
      if (!resp.ok) return false;
      const data = await resp.json();
      return !!data?.favorited;
    }
    if (!supabase) return false;
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('business_id', businessId)
      .single();
    if (error && error.code !== 'PGRST116') return false;
    return !!data;
  }
}

export const supabaseService = new SupabaseService();
