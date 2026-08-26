import { useEffect, useState } from "react";
import { Target, Eye, Award, Users, Building2, Home, Sparkles, Clock } from "lucide-react";
import { useSiteSettings, AboutSettings, defaultAboutSettings } from "../hooks/useSiteSettings";

export function About() {
  const { fetchAboutSettings } = useSiteSettings();
  const [settings, setSettings] = useState<AboutSettings>(defaultAboutSettings);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchAboutSettings();
      if (data) {
        setSettings(data);
      }
    };
    loadSettings();
  }, [fetchAboutSettings]);

  const stats = [
    {
      icon: Building2,
      value: settings.statsCondos || defaultAboutSettings.statsCondos,
      label: settings.statsCondosLabel || defaultAboutSettings.statsCondosLabel,
      color: "from-blue-600 to-indigo-600"
    },
    {
      icon: Home,
      value: settings.statsUnits || defaultAboutSettings.statsUnits,
      label: settings.statsUnitsLabel || defaultAboutSettings.statsUnitsLabel,
      color: "from-indigo-600 to-blue-700"
    },
    {
      icon: Users,
      value: settings.statsEmployees || defaultAboutSettings.statsEmployees,
      label: settings.statsEmployeesLabel || defaultAboutSettings.statsEmployeesLabel,
      color: "from-blue-700 to-cyan-700"
    },
    {
      icon: Clock,
      value: settings.statsExperience || defaultAboutSettings.statsExperience,
      label: settings.statsExperienceLabel || defaultAboutSettings.statsExperienceLabel,
      color: "from-cyan-700 to-blue-600"
    }
  ];

  const values = [
    {
      icon: Target,
      title: settings.missionTitle || "Missão",
      description: settings.missionText || defaultAboutSettings.missionText
    },
    {
      icon: Eye,
      title: settings.visionTitle || "Visão",
      description: settings.visionText || defaultAboutSettings.visionText
    },
    {
      icon: Award,
      title: settings.valuesTitle || "Valores",
      description: settings.valuesText || defaultAboutSettings.valuesText
    }
  ];

  const team = settings.teamMembers && settings.teamMembers.length > 0
    ? settings.teamMembers
    : defaultAboutSettings.teamMembers;

  const historyParagraphs = (settings.historyText || defaultAboutSettings.historyText)
    .split("\n\n")
    .filter(p => p.trim().length > 0);

  return (
    <div className="py-16">
      {/* Topo / Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-montserrat">
              {settings.headerTitle || "Quem Somos"}
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              {settings.headerSubtitle || defaultAboutSettings.headerSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Estatísticas e Números em Destaque */}
      <section className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center shadow-md flex-shrink-0`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold text-gray-900 font-montserrat tracking-tight leading-none mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* História */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-montserrat">
              {settings.historyTitle || "Nossa História"}
            </h2>
            <div className="prose max-w-none text-gray-700 space-y-4 text-base md:text-lg leading-relaxed">
              {historyParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-md text-center border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 font-montserrat">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center font-montserrat">
            {settings.teamTitle || "Nossa Equipe"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-3xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Users className="h-14 w-14 text-blue-600" />
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-1 font-montserrat">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-semibold text-xs mb-2">
                  {member.role}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
