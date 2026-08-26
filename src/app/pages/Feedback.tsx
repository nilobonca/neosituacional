import { useState, useEffect } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useSiteSettings, FeedbackSettings, defaultFeedbackSettings } from "../hooks/useSiteSettings";

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

  const { fetchFeedbackSettings } = useSiteSettings();
  const [settings, setSettings] = useState<FeedbackSettings>(defaultFeedbackSettings);

  useEffect(() => {
    fetchTestimonials();
    fetchCondominiums();
    
    const loadSettings = async () => {
      const data = await fetchFeedbackSettings();
      if (data) {
        setSettings(data);
      }
    };
    loadSettings();
  }, [fetchFeedbackSettings]);

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
      {/* Topo / Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-montserrat">
            {settings.headerTitle || "Feedbacks de Clientes"}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {settings.headerSubtitle || defaultFeedbackSettings.headerSubtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Lista de Depoimentos */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 font-montserrat">
              {settings.testimonialsTitle || "Depoimentos de Nossos Clientes"}
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
                  className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow flex flex-col border border-gray-100"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic flex-1 text-sm leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t pt-4 flex items-center gap-4 mt-auto">
                    {testimonial.avatar_url ? (
                      <img src={testimonial.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 leading-tight">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(testimonial.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulário Lateral */}
          <div>
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 sticky top-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-montserrat">
                {settings.formTitle || "Deixe seu Feedback"}
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                {settings.formDescription || defaultFeedbackSettings.formDescription}
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-4 text-xs font-medium">
                  <p>{error}</p>
                </div>
              )}

              {submitted ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl text-center">
                  <p className="font-bold text-base mb-1">Obrigado pelo feedback!</p>
                  <p className="text-xs">
                    Sua opinião foi enviada com sucesso e será analisada por nossa equipe.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-semibold text-gray-700 uppercase mb-1.5"
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
                      placeholder="Seu nome completo"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="condominium"
                      className="block text-xs font-semibold text-gray-700 uppercase mb-1.5"
                    >
                      Condomínio *
                    </label>
                    <select
                      id="condominium"
                      name="condominium_id"
                      required
                      value={formData.condominium_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="" disabled>Selecione o condomínio</option>
                      {condominiums.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
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
                          className="focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`h-7 w-7 ${
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
                      className="block text-xs font-semibold text-gray-700 uppercase mb-1.5"
                    >
                      Seu Comentário *
                    </label>
                    <textarea
                      id="text"
                      name="text"
                      required
                      rows={4}
                      value={formData.text}
                      onChange={handleChange}
                      placeholder="Conte-nos sobre sua experiência..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer font-montserrat text-sm"
                  >
                    <Send className="h-4 w-4" />
                    Enviar Feedback
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
