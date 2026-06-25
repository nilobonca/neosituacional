import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useBlogPosts, BlogPost as BlogPostType } from "../hooks/useBlogPosts";
import { Calendar, User, ArrowLeft, Clock, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPost, incrementViews, posts, fetchPosts } = useBlogPosts();
  
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadPostDetails() {
      if (!id) return;
      setLoading(true);
      const postData = await getPost(id);
      
      if (postData) {
        setPost(postData);
        incrementViews(id);
      }
      setLoading(false);
    }
    
    loadPostDetails();
  }, [id]);
  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts();
    }
  }, [posts.length, fetchPosts]);

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-600">
        Carregando artigo...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Artigo não encontrado
          </h1>
          <Link to="/blog" className="text-blue-600 hover:text-blue-700">
            Voltar para o blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </button>

        <article>
          <div className="mb-6 flex items-center justify-between">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium">
              {post.category}
            </span>
            <div className="flex gap-4 text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-md">
              <div className="flex items-center gap-1.5" title="Tempo de Leitura Estimado">
                <Clock className="h-4 w-4" />
                <span>{post.reading_time}</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-gray-600 mb-8 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>{post.author}</span>
            </div>
          </div>

          {post.image && (
            <div className="mb-10 rounded-xl overflow-hidden shadow-sm">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-[400px] object-cover"
              />
            </div>
          )}

          <div className="prose max-w-none prose-lg prose-blue">
            <p className="text-xl text-gray-800 mb-8 leading-relaxed font-medium italic border-l-4 border-blue-600 pl-4 bg-gray-50 py-3 pr-3 rounded-r-lg">
              {post.excerpt}
            </p>
            
            <div className="prose prose-lg prose-blue max-w-none prose-img:rounded-xl prose-img:shadow-md prose-headings:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-500">
              <ReactMarkdown
                components={{
                  img: ({node, ...props}) => (
                    <span className="block my-8 text-center">
                      <img className="max-h-[500px] w-auto mx-auto rounded-xl shadow-md" {...props} />
                      {props.alt && props.alt !== "Imagem incluída no texto" && (
                        <span className="block text-sm text-gray-500 mt-2">{props.alt}</span>
                      )}
                    </span>
                  ),
                  p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-6" {...props} />
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-gray-700 font-medium">
                <Tag className="h-5 w-5" />
                <span>Tags relacionadas:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-blue-500 hover:text-white transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        <div className="mt-16 pt-8 border-t border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Outros artigos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts
              .filter(p => p.id !== post.id)
              .slice(0, 3)
              .map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.id}`}
                  className="group block h-full"
                >
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                    {relatedPost.image && (
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={relatedPost.image} 
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-auto">
                        {new Date(relatedPost.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
