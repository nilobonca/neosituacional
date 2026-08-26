import { useEffect, useState } from "react";
import { Star, ArrowRight } from "lucide-react";
import { BlogCarousel } from "../components/BlogCarousel";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { Link } from "react-router";
import { supabase } from "../../lib/supabase";

import { useSiteSettings, HomeBanners, defaultHomeSettings } from "../hooks/useSiteSettings";
import { HelpSelectionForm } from "../components/HelpSelectionForm";

export function Home() {
  const { posts, loading: loadingPosts, fetchPosts } = useBlogPosts();
  const [activeClients, setActiveClients] = useState<any[]>([]);
  const [activeTestimonials, setActiveTestimonials] = useState<any[]>([]);
  const { fetchHomeBanners } = useSiteSettings();
  const [banners, setBanners] = useState<HomeBanners>(defaultHomeSettings);

  useEffect(() => {
    fetchPosts();
    
    const fetchClientsAndTestimonials = async () => {
      try {
        const [clientsRes, testimonialsRes] = await Promise.all([
          supabase.from("clients").select("*").eq("active", true).order("created_at", { ascending: false }),
          supabase.from("testimonials").select("*").eq("show_on_home", true).order("created_at", { ascending: false }).limit(3)
        ]);
        
        if (!clientsRes.error && clientsRes.data) {
          setActiveClients(clientsRes.data);
        }
        
        if (!testimonialsRes.error && testimonialsRes.data) {
          setActiveTestimonials(testimonialsRes.data);
        }
        
        const bannersData = await fetchHomeBanners();
        if (bannersData) {
          setBanners(prev => ({ ...prev, ...bannersData }));
        }
      } catch (err) {
        console.error("Erro ao buscar dados da home:", err);
      }
    };
    
    fetchClientsAndTestimonials();
  }, [fetchPosts, fetchHomeBanners]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {banners.heroTitle}
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                {banners.heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/servicos"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-colors inline-flex items-center gap-2 shadow-md"
                >
                  {banners.heroButtonText || "Conheça nossos serviços"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl text-gray-900 border border-white/20">
                <HelpSelectionForm compact={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {banners.blogSectionTitle || "Blog - Conteúdo Técnico"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {banners.blogSectionSubtitle || "Artigos e informações técnicas sobre administração condominial, legislação, gestão e boas práticas."}
            </p>
          </div>
          {loadingPosts ? (
            <div className="text-center py-8 text-gray-500">Montando vitrine de artigos...</div>
          ) : (
            <BlogCarousel posts={posts.slice(0, 6)} />
          )}
          <div className="text-center mt-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              {banners.blogButtonText || "Ver todos os artigos"}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Clientes e Parceiros */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {banners.clientsSectionTitle || "Nossos Clientes e Parceiros"}
            </h2>
            <p className="text-gray-600">
              {banners.clientsSectionSubtitle || "Condomínios que confiam em nossa gestão"}
            </p>
          </div>
          <div className="w-full relative overflow-hidden">
            {activeClients.length === 0 ? (
              <div className="text-center text-gray-400 italic py-8">
                Nenhum parceiro adicionado ainda...
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center py-8">
                {activeClients.map((client) => {
                  const CardComponent = client.website_url ? 'a' : 'div';
                  const linkProps = client.website_url ? { href: client.website_url, target: "_blank", rel: "noopener noreferrer" } : {};
                  
                  return (
                    <CardComponent
                      key={client.id}
                      {...linkProps}
                      className={`flex flex-col items-center justify-center p-6 w-48 transition-transform ${client.website_url ? "hover:scale-105 cursor-pointer" : "cursor-default"}`}
                    >
                      <div className="h-20 w-full flex items-center justify-center mb-3">
                        <img src={client.logo_url} alt={client.name} className="max-h-full max-w-full object-contain mix-blend-multiply transition-all duration-300" />
                      </div>
                      <p className="text-sm text-gray-700 text-center font-medium transition-opacity">
                        {client.name}
                      </p>
                    </CardComponent>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Depoimentos em Destaque */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comentários e Feedbacks em Destaque
            </h2>
            <p className="text-gray-600">
              O que nossos clientes dizem sobre nossos serviços
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeTestimonials.length > 0 ? (
              activeTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic flex-1">"{testimonial.content}"</p>
                  <div className="border-t pt-4 flex items-center gap-4 mt-auto">
                    {testimonial.avatar_url ? (
                      <img src={testimonial.avatar_url} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 leading-tight">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role || "Cliente"}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 text-center text-gray-400 italic py-8">
                Nenhum depoimento em destaque ainda.
              </div>
            )}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/feedback"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              Ver todos os feedbacks
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Banner Final CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {banners.ctaTitle}
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            {banners.ctaSubtitle}
          </p>
          <Link
            to="/proposta"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-colors inline-flex items-center gap-2 shadow-lg"
          >
            {banners.ctaButtonText || "Solicitar Orçamento"}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
