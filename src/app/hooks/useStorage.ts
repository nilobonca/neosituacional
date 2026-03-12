import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export interface StorageImage {
  name: string;
  url: string;
  created_at?: string;
}

export function useStorage() {
  const [images, setImages] = useState<StorageImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bucketName = "blog-images";

  const getPublicUrl = useCallback((path: string) => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
    return data.publicUrl;
  }, []);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.storage.from(bucketName).list();

      if (error) throw error;

      // Filtra arquivos e mapeia para a URL pública
      const fileList = data
        .filter((file) => file.name !== ".emptyFolderPlaceholder")
        .map((file) => ({
          name: file.name,
          created_at: file.created_at || undefined,
          url: getPublicUrl(file.name),
        }))
        .sort((a, b) => {
          // Ordena pelas mais recentes
          if (!a.created_at || !b.created_at) return 0;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      setImages(fileList);
    } catch (err: any) {
      console.error("Erro ao carregar imagens:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getPublicUrl]);

  const uploadImage = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      // Gera um nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Recarrega a galeria
      await loadImages();
      
      // Retorna a URL recém criada
      return getPublicUrl(fileName);
    } catch (err: any) {
      console.error("Erro ao fazer upload da imagem:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    images,
    loading,
    error,
    loadImages,
    uploadImage,
    getPublicUrl,
  };
}
