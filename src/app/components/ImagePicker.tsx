import { useState, useEffect, useRef } from "react";
import { useStorage } from "../hooks/useStorage";
import { Upload, Image as ImageIcon, X, Loader2, Check } from "lucide-react";

interface ImagePickerProps {
  onSelect: (data: { url: string; caption?: string }) => void;
  onClose: () => void;
  currentImage?: string;
  showCaptionField?: boolean;
}

export function ImagePicker({ onSelect, onClose, currentImage, showCaptionField = false }: ImagePickerProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "gallery">("upload");
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { images, loading, error, loadImages, uploadImage } = useStorage();

  useEffect(() => {
    if (activeTab === "gallery" && images.length === 0) {
      loadImages();
    }
  }, [activeTab, loadImages, images.length]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("A imagem deve ter no máximo 5MB.");
      return;
    }

    setUploading(true);
    const url = await uploadImage(file);
    setUploading(false);

    if (url) {
      onSelect({ url, caption: caption.trim() || undefined });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Selecionar Imagem de Capa</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === "upload"
                ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Upload className="h-4 w-4" />
            Enviar Imagem
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === "gallery"
                ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            Escolher da Galeria
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          {activeTab === "upload" ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-white p-8">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              {uploading ? (
                <div className="flex flex-col items-center gap-3 text-blue-600">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <p className="font-medium">Enviando imagem...</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto h-20 w-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-10 w-10" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Faça o upload de uma imagem
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Arraste o arquivo aqui ou clique no botão abaixo para escolher do seu computador (Máx 5MB).
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition"
                  >
                    Procurar Arquivo
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm">
                  {error} - Verifique as permissões de acesso do Bucket.
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center h-48 text-gray-500 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Carregando galeria...
                </div>
              ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-xl border border-gray-100">
                  <ImageIcon className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium font-medium">Nenhuma imagem na galeria</p>
                  <p className="text-gray-400 text-sm mt-1">Faça o upload de sua primeira imagem</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((img) => {
                    const isSelected = currentImage === img.url;
                    return (
                      <div
                        key={img.name}
                        onClick={() => onSelect({ url: img.url, caption: caption.trim() || undefined })}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-gray-200 ${
                          isSelected ? "ring-4 ring-blue-600" : "hover:ring-2 hover:ring-blue-400"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.name}
                          loading="lazy"
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                            isSelected ? "opacity-90" : ""
                          }`}
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                           <p className="text-white text-xs truncate" title={img.name}>{img.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Optional Caption Field */}
        {showCaptionField && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legenda da Imagem (Opcional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ex: Foto da fachada do prédio após a reforma"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Digite a legenda antes de selecionar/fazer envio da imagem acima.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
