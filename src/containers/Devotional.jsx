import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Image as ImageIcon,
  PlayCircle,
} from "lucide-react";
import Button from "../components/Button";
import Loader from "../components/Loader";
import {
  findAllDevotionals,
  findDevotionalByDate,
} from "../services/devotionals/devotionalsService";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

const weekdayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value) {
  if (!value) return new Date();
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

function getDateKey(value) {
  if (!value) return "";
  return toDateInputValue(new Date(value));
}

function getDevotionalsList(data) {
  if (Array.isArray(data)) return data;
  return data?.devotionals || data?.items || [];
}

function getYouTubeEmbedUrl(url = "") {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace("www.", "");

    if (hostname === "youtu.be") {
      const id = parsedUrl.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (hostname.includes("youtube.com")) {
      const id = parsedUrl.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;

      const shortsId = parsedUrl.pathname.match(/\/shorts\/([^/]+)/)?.[1];
      if (shortsId) return `https://www.youtube.com/embed/${shortsId}`;
    }
  } catch {
    return "";
  }

  return "";
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
}

function DevotionalMedia({ devotional }) {
  const imageUrl = devotional?.imageUrl || devotional?.image;
  const videoUrl = devotional?.videoUrl || devotional?.videoLink;
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  if (embedUrl) {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
        <iframe
          src={embedUrl}
          title={devotional?.title || "Video do devocional"}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={devotional?.title || "Devocional"}
        className="h-72 w-full rounded-2xl border border-white/10 object-cover md:h-[420px]"
      />
    );
  }

  return (
    <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-white/35 md:h-[420px]">
      <ImageIcon size={32} />
    </div>
  );
}

export default function Devotional() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDateValue = searchParams.get("date") || toDateInputValue(new Date());
  const selectedDate = parseDateInput(selectedDateValue);
  const monthValue = searchParams.get("month") || selectedDateValue.slice(0, 7);
  const monthDate = parseDateInput(`${monthValue}-01`);

  const monthStart = toDateInputValue(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  const monthEnd = toDateInputValue(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0));

  const { data: selectedDevotional, isLoading: isLoadingSelected } = useQuery({
    queryKey: ["devotional-by-date", selectedDateValue],
    queryFn: () => findDevotionalByDate(selectedDateValue),
  });

  const { data: monthData, isLoading: isLoadingMonth } = useQuery({
    queryKey: ["devotionals-month", monthStart, monthEnd],
    queryFn: () =>
      findAllDevotionals({
        page: 1,
        limit: 100,
        startDate: monthStart,
        endDate: monthEnd,
        orderBy: "devotionalDate",
        orderDirection: "ASC",
        published: true,
      }),
  });

  const devotionalsByDate = useMemo(() => {
    const mapped = new Map();
    getDevotionalsList(monthData).forEach((devotional) => {
      const key = getDateKey(devotional.devotionalDate || devotional.date);
      if (key) mapped.set(key, devotional);
    });
    return mapped;
  }, [monthData]);

  const calendarDays = buildCalendarDays(monthDate);
  const devotional =
    selectedDevotional?.id || selectedDevotional?.title
      ? selectedDevotional
      : devotionalsByDate.get(selectedDateValue);
  const videoUrl = devotional?.videoUrl || devotional?.videoLink;
  const hasExternalVideo = videoUrl && !getYouTubeEmbedUrl(videoUrl);

  const updateDate = (dateValue) => {
    const next = new URLSearchParams(searchParams);
    next.set("date", dateValue);
    next.set("month", dateValue.slice(0, 7));
    setSearchParams(next);
  };

  const updateMonth = (offset) => {
    const nextMonthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + offset, 1);
    const next = new URLSearchParams(searchParams);
    next.set("month", toDateInputValue(nextMonthDate).slice(0, 7));
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white">
      <main className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <section className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
              Devocional
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-5xl">
              Palavra diária para a sua caminhada
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
              Leia o devocional do dia ou navegue pelo calendario para rever
              mensagens anteriores.
            </p>
          </div>

          <label className="w-full md:w-64">
            <span className="mb-2 block text-sm font-medium text-white/80">
              Escolher data
            </span>
            <input
              type="date"
              value={selectedDateValue}
              onChange={(event) => updateDate(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-neutral-500 focus:bg-white/10"
            />
          </label>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {isLoadingSelected ? (
              <div className="flex min-h-[520px] items-center justify-center">
                <Loader />
              </div>
            ) : devotional ? (
              <div className="grid gap-0 xl:grid-cols-[0.95fr_1.05fr]">
                <DevotionalMedia devotional={devotional} />

                <div className="p-5 md:p-7">
                  <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-white/60">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={16} />
                      {dateFormatter.format(selectedDate)}
                    </span>
                    {hasExternalVideo && (
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white"
                      >
                        <PlayCircle size={16} />
                        Assistir video
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold md:text-4xl">
                    {devotional.title}
                  </h2>

                  {(devotional.verseReference || devotional.verseText) && (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                      {devotional.verseReference && (
                        <p className="text-sm font-semibold text-white/85">
                          {devotional.verseReference}
                        </p>
                      )}
                      {devotional.verseText && (
                        <p className="mt-2 text-sm leading-relaxed text-white/70">
                          {devotional.verseText}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-6 whitespace-pre-line text-sm leading-7 text-white/75 md:text-base">
                    {devotional.content || devotional.description}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[520px] flex-col items-center justify-center px-6 text-center">
                <CalendarDays className="text-white/30" size={38} />
                <h2 className="mt-4 text-2xl font-semibold">
                  Nenhum devocional nessa data
                </h2>
                <p className="mt-2 max-w-md text-sm text-white/60">
                  Escolha outro dia no calendario ou volte para a data de hoje.
                </p>
                <Button
                  onClick={() => updateDate(toDateInputValue(new Date()))}
                  style={2}
                  className="mt-6"
                >
                  Ver devocional de hoje
                </Button>
              </div>
            )}
          </article>

          <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => updateMonth(-1)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Mes anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-center text-sm font-semibold capitalize text-white/85">
                {monthFormatter.format(monthDate)}
              </h2>
              <button
                type="button"
                onClick={() => updateMonth(1)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Proximo mes"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs text-white/45">
              {weekdayLabels.map((label, index) => (
                <span key={`${label}-${index}`}>{label}</span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <span key={`empty-${index}`} className="aspect-square" />;
                }

                const key = toDateInputValue(date);
                const hasDevotional = devotionalsByDate.has(key);
                const isSelected = key === selectedDateValue;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateDate(key)}
                    className={`relative aspect-square rounded-lg border text-sm transition ${
                      isSelected
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-black/20 text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {date.getDate()}
                    {hasDevotional && (
                      <span
                        className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                          isSelected ? "bg-black/60" : "bg-white/70"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {isLoadingMonth && (
              <div className="mt-5 flex justify-center">
                <Loader />
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}
