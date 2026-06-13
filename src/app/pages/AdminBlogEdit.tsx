import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useBlogPosts, BlogPost } from "../hooks/useBlogPosts";
import { ArrowLeft, Save, Image as ImageIcon, X } from "lucide-react";
import { ImagePicker } from "../components/ImagePicker";
import { BlockEditor } from "../components/BlockEditor";

export function AdminBlogEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== undefined;
  
  const { getPost, addPost, updatePost } = useBlogPosts();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    author: "Equipe Situacional",
    date: new Date().toISOString().split("T")[0],
    tags: [],
    featured: false
  });
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !formData.tags?.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagToRemove) }));
  };

  useEffect(() => {
    if (isEditing) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    const post = await getPost(id!);
    if (post) {
      setFormData(post);
    } else {
      setError("Post não encontrado");
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditing) {
        await updatePost(id!, formData);
      } else {
        await addPost(formData as any);
      }
      navigate("/admin/blog");
    } catch (err: any) {
      setError(err.message || "Erro ao salvar o post");
      setLoading(false);
    }
  };

  // Categorias predefinidas, você pode alterar conforme quiser
  const categories = ["Geral", "Gestão Financeira", "Legislação", "Manutenção", "Gestão", "Tecnologia", "Segurança"];

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/admin/blog" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition">
          <ArrowLeft className="h-5 w-5" />
          Voltar para Lista
        </Link>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 border border-gray-100">
          <div className="border-b border-gray-100 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? "Editar Post" : "Criar Novo Post"}
            </h1>
            <p className="text-gray-500 mt-2">Preencha os dados do post. O tempo de leitura será calculado automaticamente pelo tamanho do conteúdo.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Título do Post *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Ex: Como Reduzir Custos na Administração"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Publicação *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date?.substring(0, 10)}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Autor</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Capa *</label>
                <div className="flex items-center gap-4">
                  {formData.image ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                      <img src={formData.image} alt="Capa" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 border-dashed">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(true)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-500 hover:text-white transition"
                  >
                    {formData.image ? "Trocar Imagem" : "Escolher Imagem"}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Pressione Enter para adicionar)</label>
                <div className="p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-600 bg-white flex flex-wrap gap-2 items-center min-h-[42px]">
                  {formData.tags?.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="text-blue-600 hover:text-blue-900 focus:outline-none rounded-full p-0.5 hover:bg-blue-200 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-sm py-1"
                    placeholder={formData.tags?.length ? "Adicionar mais tags..." : "Ex: condomínio, gestão..."}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Resumo (Excerpt) *</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  placeholder="Um breve texto chamativo sobre o que é este post..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo Completo *</label>
                <div className="bg-gray-50 border border-gray-300 rounded-lg pb-1">
                  <div className="bg-white p-3 border-b border-gray-200 text-sm text-gray-500 rounded-t-lg">
                    Dica: Pressione <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">/ </kbd> para ver o menu de formatação e adicionar imagens, tabelas e títulos.
                  </div>
                  <BlockEditor
                    initialContent={formData.content || ""}
                    onChange={(newMarkdown) => {
                      setFormData(prev => ({ ...prev, content: newMarkdown }));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-100">
              <Link
                to="/admin/blog"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-blue-500 hover:text-white transition"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-500 transition flex items-center gap-2 disabled:bg-blue-400"
              >
                {loading ? "Salvando..." : (
                  <>
                    <Save className="h-5 w-5" />
                    Salvar Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {showImagePicker && (
          <ImagePicker 
            currentImage={formData.image}
            onClose={() => setShowImagePicker(false)}
            onSelect={({ url }) => {
              setFormData(prev => ({ ...prev, image: url }));
              setShowImagePicker(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
