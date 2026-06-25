import { useState, useEffect } from "react";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { Calendar, User, Search, Clock, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import { BlogCarousel } from "../components/BlogCarousel";

export function Blog() {
  const { posts, loading, error, fetchPosts } = useBlogPosts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [activeCarouselTab, setActiveCarouselTab] = useState<"featured" | "most_viewed">("featured");

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const categories = ["Todas", ...Array.from(new Set(posts.map(post => post.category)))];

  const carouselPosts = activeCarouselTab === "featured" 
    ? posts.filter(p => p.featured).slice(0, 6)
    : [...posts].sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 6);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Central de Postagens do Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Informações técnicas, dicas e novidades sobre administração condominial
          </p>
        </div>

        
        {!loading && posts.length > 0 && (
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-2 border-b border-gray-200 gap-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {activeCarouselTab === "featured" ? (
                  <><Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Escolha do Editor</>
                ) : (
                  <><TrendingUp className="w-6 h-6 text-blue-600" /> Mais Lidos</>
                )}
              </h2>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveCarouselTab("featured")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeCarouselTab === "featured" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Destaques
                </button>
                <button
                  onClick={() => setActiveCarouselTab("most_viewed")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeCarouselTab === "most_viewed" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Em Alta
                </button>
              </div>
            </div>
            
            {carouselPosts.length > 0 ? (
              <BlogCarousel posts={carouselPosts} compact={true} />
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-500">Nenhum artigo classificado para esta sessão ainda.</p>
              </div>
            )}
          </div>
        )}

        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            
            <div className="flex gap-2 flex-wrap justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-center py-12 text-red-600">
            Houve um erro ao carregar as postagens. Tente novamente mais tarde.
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-600">
            Carregando artigos...
          </div>
        ) : (
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2NvdW50aW5nfGVufDF8fHx8MTc3MjY1Njk4Mnww&ixlib=rb-4.1.0&q=80&w=1080'} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium">
                    {post.category}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="font-semibold text-xl text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span>{post.author}</span>
                    </div>
                    {post.reading_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{post.reading_time}</span>
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/blog/${post.id}`}
                    className="text-blue-600 font-medium hover:text-blue-700 transition-colors mt-auto"
                  >
                    Ler artigo completo →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        
        {!loading && filteredPosts.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Nenhum artigo encontrado com os filtros selecionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
