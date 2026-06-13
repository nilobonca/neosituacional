import { useState, useEffect } from "react";
import { Star, Send, Loader2, User } from "lucide-react";
import { supabase } from "../../lib/supabase";

export function Feedback() {
  const [formData, setFormData] = useState({
    name: "",
    condominium_id: "",
    rating: 5,
    text: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeTestimonials, setActiveTestimonials] = useState<any[]>([]);
  const [condominiums, setCondominiums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
    fetchCondominiums();
  }, []);

  const fetchCondominiums = async () => {
    try {
      const { data, error } = await supabase
        .from("condominiums")
        .select("id, name")
        .eq("active", true)
        .order("name", { ascending: true });
      if (!error && data) setCondominiums(data);
    } catch (err) {
      console.error("Erro ao buscar condomínios:", err);
    }
  };

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("show_on_home", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActiveTestimonials(data || []);
    } catch (err) {
      console.error("Erro ao buscar depoimentos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.condominium_id) {
      setError("Por favor, selecione seu condomínio.");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.from("testimonials").insert([{
        name: formData.name,
        condominium_id: formData.condominium_id,
        content: formData.text,
        show_on_home: false
      }]);

      if (error) throw error;
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: "",
          condominium_id: "",
          rating: 5,
          text: ""
        });
      }, 4000);
    } catch (err: any) {
      setError("Erro ao enviar feedback: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "rating" ? Number(value) : value
    });
  };

  return (
    <div className="py-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Feedbacks de Clientes
          </h1>
          <p className="text-xl text-blue-100">
            O que nossos clientes dizem sobre nossos serviços
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Existing Feedbacks */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Depoimentos de Nossos Clientes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-1 md:col-span-2 flex justify-center py-12">
                  <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
                </div>
              ) : activeTestimonials.length === 0 ? (
                <div className="col-span-1 md:col-span-2 text-center text-gray-400 italic py-8">
                  Nenhum depoimento disponível no momento.
                </div>
              ) : activeTestimonials.map((testimonial) => (
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
                  <p className="text-gray-700 mb-6 italic flex-1">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t pt-4 flex items-center gap-4 mt-auto">
                    {testimonial.avatar_url ? (
                      <img src={testimonial.avatar_url} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 leading-tight">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {testimonial.role || "Cliente"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(testimonial.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Form */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Deixe seu Feedback
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {submitted ? (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  <p className="font-semibold">Obrigado pelo feedback!</p>
                  <p className="text-sm mt-1">
                    Sua opinião foi enviada com sucesso.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="condominium"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Condomínio *
                    </label>
                    <select
                      id="condominium"
                      name="condominium_id"
                      required
                      value={formData.condominium_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="" disabled>Selecione o condomínio</option>
                      {condominiums.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avaliação *
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, rating: star })
                          }
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= formData.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="text"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Seu Comentário *
                    </label>
                    <textarea
                      id="text"
                      name="text"
                      required
                      rows={5}
                      value={formData.text}
                      onChange={handleChange}
                      placeholder="Conte-nos sobre sua experiência..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white border border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    Enviar Feedback
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Nossa Avaliação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">4.9/5.0</div>
              <div className="text-blue-100">Avaliação Média</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Clientes Satisfeitos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">350+</div>
              <div className="text-blue-100">Avaliações Positivas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
