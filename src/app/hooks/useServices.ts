import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  active: boolean;
  order_index: number;
}

export function useServices() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async (activeOnly: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("services")
        .select("*")
        .order("order_index", { ascending: true });

      if (activeOnly) {
        query = query.eq("active", true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      setServices(data || []);
    } catch (err: any) {
      console.error("Error fetching services:", err);
      // Suppress missing table error so we can still render if they haven't executed the SQL yet
      if (err.code !== '42P01') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addService = async (service: Omit<ServiceItem, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("services")
        .insert([service])
        .select()
        .single();

      if (insertError) throw insertError;
      
      setServices(prev => [...prev, data]);
      return true;
    } catch (err: any) {
      console.error("Error adding service:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (id: string, updates: Partial<ServiceItem>) => {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("services")
        .update(updates)
        .eq("id", id);

      if (updateError) throw updateError;
      
      setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      return true;
    } catch (err: any) {
      console.error("Error updating service:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      
      setServices(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err: any) {
      console.error("Error deleting service:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    loading,
    error,
    fetchServices,
    addService,
    updateService,
    deleteService
  };
}
