import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock3, MapPin } from "lucide-react";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { findAllEvents } from "../services/events/eventsService";
import { findAllChurchHouses } from "../services/churchHouses/churchHousesService";
import { findHomeContent } from "../services/homeContent/homeContentService";
import { buildChurchHouseAddress } from "../utils/churchHouseUtils";
import { formatDate } from "../utils/utils";

const FALLBACK_HOME_CONTENT = {
  heroTitle: "Bem-vindo a Casa Church Global",
  heroSubtitle: "Seja muito bem-vindo, esta casa tambem e sua.",
  heroImageUrl:
    "https://images.unsplash.com/photo-1569759276108-31b8e7e43e7b?q=80&w=1200&auto=format&fit=crop",
  aboutTitle: "Sobre nos",
  aboutDescription:
    "Conheca nossa historia, visao e valores como comunidade cristocentrica.",
  aboutImageUrl:
    "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1200&auto=format&fit=crop",
  aboutButtonText: "Saiba mais",
  aboutButtonLink: "/sobre",
  eventsTitle: "Proximos eventos",
  eventsDescription:
    "Acompanhe os proximos encontros e nao perca os momentos da comunidade.",
  eventsImageUrl:
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
  eventsButtonText: "Ver agenda",
  eventsButtonLink: "/eventos",
  ciTitle: "Encontre um CI",
  ciDescription:
    "Veja os CIs ativos e encontre o ponto mais proximo para comunhao durante a semana.",
  ciImageUrl:
    "https://images.unsplash.com/photo-1599818539518-c5d59a0e2a08?q=80&w=1200&auto=format&fit=crop",
  ciButtonText: "Ver CIs",
  ciButtonLink: "/cis",
};

function HomeCard({ imageUrl, title, description, children }) {
  return (
    <article className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="h-44">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover select-none"
        />
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-white/70 mt-2">{description}</p>
        </div>
        {children}
      </div>
    </article>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  const { data: homeContentData, isLoading: loadingHomeContent } = useQuery({
    queryKey: ["home-content-public"],
    queryFn: findHomeContent,
  });

  const { data: eventsData, isLoading: loadingEvents } = useQuery({
    queryKey: ["home-upcoming-events"],
    queryFn: () =>
      findAllEvents({
        page: 1,
        limit: 20,
        orderBy: "startDate",
        orderDirection: "ASC",
      }),
  });

  const { data: churchHousesData } = useQuery({
    queryKey: ["home-featured-ci"],
    queryFn: () =>
      findAllChurchHouses({
        page: 1,
        limit: 3,
        active: true,
        orderBy: "createdAt",
        orderDirection: "DESC",
      }),
  });

  const homeContent = homeContentData || FALLBACK_HOME_CONTENT;
  const featuredChurchHouse = churchHousesData?.churchHouses?.[0];

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const allEvents = eventsData?.events || [];

    return allEvents
      .filter((event) => new Date(event.endDate) >= now)
      .sort((left, right) => {
        return new Date(left.startDate) - new Date(right.startDate);
      })
      .slice(0, 3);
  }, [eventsData]);

  const goToLink = (link) => {
    if (!link) return;

    if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(link);
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white">
      <main className="mx-auto max-w-7xl px-4 pb-16">
        {loadingHomeContent ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : (
          <>
            <section className="py-8">
              <div className="relative rounded-3xl overflow-hidden border border-white/10">
                <img
                  src={homeContent.heroImageUrl || FALLBACK_HOME_CONTENT.heroImageUrl}
                  alt={homeContent.heroTitle}
                  className="w-full h-[360px] sm:h-[420px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,14,0.25)_0%,rgba(5,8,14,0.78)_80%)]" />
                <div className="absolute inset-0 flex flex-col justify-end px-8 py-8 md:px-10 md:py-10">
                  <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-3xl">
                    {homeContent.heroTitle}
                  </h1>
                  <p className="mt-3 text-white/80 text-sm md:text-lg max-w-2xl">
                    {homeContent.heroSubtitle}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <HomeCard
                imageUrl={
                  homeContent.aboutImageUrl || FALLBACK_HOME_CONTENT.aboutImageUrl
                }
                title={homeContent.aboutTitle}
                description={homeContent.aboutDescription}
              >
                <Button
                  onClick={() =>
                    goToLink(
                      homeContent.aboutButtonLink ||
                        FALLBACK_HOME_CONTENT.aboutButtonLink
                    )
                  }
                  style={2}
                  fullWidth
                >
                  {homeContent.aboutButtonText ||
                    FALLBACK_HOME_CONTENT.aboutButtonText}
                </Button>
              </HomeCard>

              <HomeCard
                imageUrl={
                  homeContent.eventsImageUrl || FALLBACK_HOME_CONTENT.eventsImageUrl
                }
                title={homeContent.eventsTitle}
                description={homeContent.eventsDescription}
              >
                {loadingEvents ? (
                  <div className="py-3 flex justify-center">
                    <Loader />
                  </div>
                ) : upcomingEvents.length ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => navigate(`/evento/${event.id}`)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left hover:bg-white/10 transition"
                      >
                        <p className="text-sm font-semibold line-clamp-1">{event.title}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={13} />
                            {formatDate(event.startDate)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={13} />
                            {new Date(event.startDate).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/60">
                    Nenhum evento futuro cadastrado no momento.
                  </p>
                )}

                <Button
                  onClick={() =>
                    goToLink(
                      homeContent.eventsButtonLink ||
                        FALLBACK_HOME_CONTENT.eventsButtonLink
                    )
                  }
                  style={2}
                  fullWidth
                >
                  {homeContent.eventsButtonText ||
                    FALLBACK_HOME_CONTENT.eventsButtonText}
                </Button>
              </HomeCard>

              <HomeCard
                imageUrl={homeContent.ciImageUrl || FALLBACK_HOME_CONTENT.ciImageUrl}
                title={homeContent.ciTitle}
                description={homeContent.ciDescription}
              >
                {featuredChurchHouse ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                    <p className="text-sm font-semibold">{featuredChurchHouse.name}</p>
                    <p className="text-xs text-white/65 mt-2 inline-flex items-start gap-1.5">
                      <MapPin size={13} className="mt-0.5 shrink-0" />
                      <span>{buildChurchHouseAddress(featuredChurchHouse)}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-white/60">
                    Nenhum CI ativo cadastrado no momento.
                  </p>
                )}

                <Button
                  onClick={() =>
                    goToLink(
                      homeContent.ciButtonLink || FALLBACK_HOME_CONTENT.ciButtonLink
                    )
                  }
                  style={2}
                  fullWidth
                >
                  {homeContent.ciButtonText || FALLBACK_HOME_CONTENT.ciButtonText}
                </Button>
              </HomeCard>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
