import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export interface FooterSettings {
  address: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  linkedin: string;
}

export interface HomeBanners {
  heroTitle: string;
  heroSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
}

export function useSiteSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFooterSettings = useCallback(async (): Promise<FooterSettings | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "footer")
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found, return null to use fallback
          return null;
        }
        throw error;
      }
      
      return data?.value as FooterSettings;
    } catch (err: any) {
      console.error("Error fetching footer settings:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFooterSettings = async (settings: FooterSettings) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: 'footer', value: settings as any, updated_at: new Date().toISOString() });

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error("Error updating footer settings:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchHomeBanners = useCallback(async (): Promise<HomeBanners | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "home_banners")
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Fallback
        }
        throw error;
      }
      
      return data?.value as HomeBanners;
    } catch (err: any) {
      console.error("Error fetching home banners:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateHomeBanners = async (settings: HomeBanners) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: 'home_banners', value: settings as any, updated_at: new Date().toISOString() });

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error("Error updating home banners:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchFooterSettings,
    updateFooterSettings,
    fetchHomeBanners,
    updateHomeBanners,
  };
}
