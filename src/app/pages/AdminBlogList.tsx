import { useEffect } from "react";
import { Link } from "react-router";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { Edit, Trash2, Plus, ArrowLeft, Star } from "lucide-react";

export function AdminBlogList() {
  const { posts, loading, error, fetchPosts, deletePost, updatePost } = useBlogPosts();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (id: number | string) => {
    if (window.confirm("Tem certeza que deseja apagar este post?")) {
      await deletePost(id);
    }
  };

  const handleToggleFeatured = async (post: any) => {
    try {
      await updatePost(post.id, { featured: !post.featured });
    } catch (err) {
      console.error("Erro ao alterar destaque:", err);
      alert("Não foi possível alterar o destaque do post.");
    }
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/blog" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition">
              <ArrowLeft className="h-5 w-5" />
              Voltar para o Blog
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Blog
            </h1>
          </div>
          <Link
            to="/admin/blog/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Novo Post
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            <p>Erro ao carregar posts: {error}</p>
            <p className="text-sm mt-2">Você configurou as variáveis SUPABASE_URL e SUPABASE_ANON_KEY no painel da Vercel e criou a tabela no Supabase?</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">Post</th>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Categoria</th>
                  <th className="px-6 py-4 font-medium text-center">Destaque</th>
                  <th className="px-6 py-4 font-medium text-center">Visualizações</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Carregando posts...
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Nenhum post encontrado. Clique em "Novo Post" para começar!
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {post.image ? (
                            <img src={post.image} alt="" className="w-12 h-12 rounded object-cover" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded"></div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 line-clamp-1">{post.title}</p>
                            <p className="text-sm text-gray-500">{post.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(post.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(post)}
                          className="p-1.5 rounded-full hover:bg-blue-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title={post.featured ? "Remover dos destaques" : "Destacar post"}
                        >
                          <Star 
                            className={`h-5 w-5 ${post.featured ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-center">
                        {post.views || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            to={`/admin/blog/edit/${post.id}`}
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-500 hover:text-red-700 transition"
                            title="Apagar"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
