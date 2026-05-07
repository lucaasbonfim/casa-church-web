import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import { findAllSermons } from "../services/sermons/sermonsService";
import Loader from "../components/Loader";
import { toastError } from "../utils/toastHelper";

const SERMON_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1200&auto=format&fit=crop";

function getSermonImage(sermon) {
  return (
    sermon?.image ||
    sermon?.imageUrl ||
    sermon?.thumbnailUrl ||
    SERMON_FALLBACK_IMAGE
  );
}

function formatSermonDate(date) {
  if (!date) return "Disponivel";

  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getSermonsFromResponse(response) {
  if (Array.isArray(response?.sermons)) return response.sermons;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response)) return response;

  return [];
}

function SermonSkeleton() {
  return (
    <div className="grid gap-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="grid overflow-hidden rounded-xl border border-white/10 bg-white/5 md:grid-cols-[minmax(16rem,34%)_1fr]"
        >
          <div className="h-56 animate-pulse bg-white/10 md:h-full" />
          <div className="space-y-4 p-5 sm:p-6">
            <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
            <div className="h-7 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-white/10" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Sermons() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSermons() {
      try {
        const response = await findAllSermons({ limit: 100 });
        setSermons(getSermonsFromResponse(response));
      } catch (error) {
        toastError("Erro ao carregar sermoes");
        console.error(error);
        setSermons([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSermons();
  }, []);

  function handleNavigate(sermonId) {
    navigate(`/sermons/${sermonId}`);
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <div className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
              <BookOpen size={16} />
              Serie de mensagens
            </span>
            <div>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
                Sermoes para acompanhar no seu ritmo
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/62">
                Encontre as mensagens da Casa Church, continue pelas aulas e
                acompanhe cada serie com imagem, tema e contexto no mesmo card.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#151b22] p-4">
            <p className="text-sm text-white/55">Biblioteca</p>
            <p className="mt-1 text-3xl font-bold">
              {loading ? "--" : sermons.length}
            </p>
            <p className="mt-1 text-sm text-white/55">
              {sermons.length === 1
                ? "sermao disponivel"
                : "sermoes disponiveis"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-white/55">
              <Loader />
              <span>Carregando sermoes...</span>
            </div>
            <SermonSkeleton />
          </div>
        ) : sermons.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-12 text-center text-white/62">
            Nenhum sermao encontrado.
          </div>
        ) : (
          <div className="grid gap-5">
            {sermons.map((sermon, index) => (
              <button
                key={sermon.id}
                type="button"
                onClick={() => handleNavigate(sermon.id)}
                className="group grid overflow-hidden rounded-xl border border-white/10 bg-[#151b22] text-left shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-[#18202d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:grid-cols-[minmax(16rem,34%)_1fr]"
              >
                <div className="relative h-56 overflow-hidden bg-black/30 md:h-full md:min-h-56">
                  <img
                    src={getSermonImage(sermon)}
                    alt={sermon.title || "Sermao"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent md:bg-gradient-to-r md:from-transparent md:via-black/5 md:to-black/30" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
                    Mensagem {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex min-h-56 flex-col justify-between gap-6 p-5 sm:p-6">
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-sm text-white/50">
                      <CalendarDays size={16} />
                      <span>{formatSermonDate(sermon.createdAt)}</span>
                    </div>
                    <h2 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
                      {sermon.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
                      {sermon.description ||
                        "Mensagem disponivel para assistir e acompanhar as aulas."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/65">
                      Aulas vinculadas
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-transform group-hover:translate-x-1">
                      Ver conteudo
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
