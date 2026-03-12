import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export interface BlogPost {
  id: number; // Supondo serial. Se for UUID, mudar para string
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
  views?: number;
  reading_time?: string;
  tags?: string[];
  featured?: boolean;
}

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      
      // Mapeia snake_case para camelCase se necessário
      const formattedData = data.map((item: any) => ({
        ...item,
        readingTime: item.reading_time || item.readingTime
      }));

      setPosts(formattedData || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPost = async (id: number | string) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      return {
        ...data,
        readingTime: data.reading_time || data.readingTime
      } as BlogPost;
    } catch (err: any) {
      console.error("Error getting post:", err);
      return null;
    }
  };

  const addPost = async (post: Omit<BlogPost, "id" | "views">) => {
    try {
      // Calcular tempo de leitura estimado (aprox. 200 palavras por min)
      const words = post.content.trim().split(/\s+/).length;
      const calcReadingTime = Math.ceil(words / 200);
      const readingTimeStr = `${calcReadingTime} min leitura`;

      const postToSave = {
        ...post,
        reading_time: readingTimeStr,
        views: 0,
      };

      const { data, error } = await supabase
        .from("posts")
        .insert([postToSave])
        .select()
        .single();

      if (error) throw error;
      
      const newPost = {
        ...data,
        readingTime: data.reading_time || data.readingTime
      };
      
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err: any) {
      console.error("Error adding post:", err);
      throw err;
    }
  };

  const updatePost = async (id: number | string, post: Partial<BlogPost>) => {
    try {
      let updateData = { ...post };
      
      // Se conteúdo mudou, recalcular tempo de leitura
      if (post.content) {
        const words = post.content.trim().split(/\s+/).length;
        const calcReadingTime = Math.ceil(words / 200);
        updateData.reading_time = `${calcReadingTime} min leitura`; 
      }
      
      // Remove readingTime (camelCase) to avoid Supabase schema error
      if ('readingTime' in updateData) {
        delete (updateData as any).readingTime;
      }

      const { data, error } = await supabase
        .from("posts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedPost = {
        ...data,
        readingTime: data.reading_time || data.readingTime
      };

      setPosts((prev) => prev.map((p) => (p.id === id ? updatedPost : p)));
      return updatedPost;
    } catch (err: any) {
      console.error("Error updating post:", err);
      throw err;
    }
  };

  const deletePost = async (id: number | string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error("Error deleting post:", err);
      throw err;
    }
  };

  const incrementViews = async (id: number | string) => {
    try {
      // Método RPC no Supabase (precisa ser criado para view count atômico)
      // Ou um simples select + update para demonstração (se não quiser usar RPC)
      const { data: currentPost, error: fetchErr } = await supabase
        .from("posts")
        .select("views")
        .eq("id", id)
        .single();
        
      if (fetchErr) throw fetchErr;
      
      const newViews = (currentPost.views || 0) + 1;
      
      const { error: updateErr } = await supabase
        .from("posts")
        .update({ views: newViews })
        .eq("id", id);
        
      if (updateErr) throw updateErr;
      
      return newViews;
    } catch (err: any) {
      console.error("Error incrementing views:", err);
      return null;
    }
  };

  return {
    posts,
    loading,
    error,
    fetchPosts,
    getPost,
    addPost,
    updatePost,
    deletePost,
    incrementViews,
  };
}
