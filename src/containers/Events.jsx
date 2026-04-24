import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

// components
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import EventCard from "../components/EventCard";
import Input from "../components/Input";

// service
import { findAllEvents } from "../services/events/eventsService";

const EVENTS_PER_PAGE = 8;

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get("page") || 1;
  const title = searchParams.get("title") || "";
  const [searchTerm, setSearchTerm] = useState(title);

  const { data, isLoading } = useQuery({
    queryKey: ["events", page, title],
    queryFn: () =>
      findAllEvents({
        page,
        limit: EVENTS_PER_PAGE,
        title: title || undefined,
      }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    const sp = new URLSearchParams(searchParams);
    const currentTitle = sp.get("title") || "";
    const nextTitle = (searchTerm || "").trim();
    if (nextTitle === currentTitle) return;
    if (nextTitle) {
      sp.set("title", nextTitle);
      sp.set("page", "1");
    } else {
      sp.delete("title");
    }
    const t = setTimeout(() => setSearchParams(sp), 500);
    return () => clearTimeout(t);
  }, [searchParams, searchTerm, setSearchParams]);

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set("page", String(newPage));
      return sp;
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex flex-col">
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 mt-12 pb-16">
          <div className="mb-12 items-end gap-6 md:flex md:justify-between">
            <div className="w-full sm:max-w-2xl">
              <h1 className="text-3xl lg:text-4xl font-bold m-0">Eventos</h1>
              <p className="text-white/80 text-sm mb-5 sm:text-base md:mb-0">
                Confira nossos eventos e descubra tudo o que preparamos para
                você
              </p>
            </div>

            <Input
              name={"search"}
              placeholder="Nome do evento"
              icon={Search}
              value={searchTerm}
              onChange={handleSearchChange}
              onClear={() => setSearchTerm("")}
              allowClear
              className="w-full md:w-90"
            />
          </div>

          {isLoading ? (
            <div className="w-full min-h-[600px] flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <>
              {data?.events?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[600px]">
                  {data.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="w-full min-h-[600px] m-auto flex flex-col items-center justify-center">
                  <p className="text-sm text-white/50">
                    Nenhum evento encontrado
                  </p>
                </div>
              )}

              <Pagination
                currentPage={page}
                totalPages={data?.totalPages ?? 1}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
