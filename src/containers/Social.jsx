import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import CreatePost from "../components/CreatePost";
import Post from "../components/Post";
import Loader from "../components/Loader";
import { findAllPosts } from "../services/posts/postsService";

const POSTS_PER_PAGE = 10;

export default function Social() {
  const [now, setNow] = useState(() => Date.now());
  const loadMoreRef = useRef(null);

  // ⏱️ Atualiza o "agora" a cada 1 minuto (tempo relativo)
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  // 🔁 Infinite Query
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 1 }) =>
      findAllPosts({
        page: pageParam,
        limit: POSTS_PER_PAGE,
        orderBy: "createdAt",
        orderDirection: "DESC",
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  // 📦 Junta todos os posts carregados
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  // 👀 Observer para carregar mais ao scrollar
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  return (
    <div className="min-h-screen bg-[#0f1115] text-white">
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Social</h1>
          <p className="text-white/60">
            Compartilhe momentos e conecte-se com a comunidade
          </p>
        </div>

        {/* Criar Post */}
        <div className="mb-6">
          <CreatePost
            onPostCreated={() => {
              // volta pro topo e recarrega o feed
              window.scrollTo({ top: 0, behavior: "smooth" });
              refetch();
            }}
          />
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="w-full min-h-[400px] flex items-center justify-center">
            <Loader />
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="space-y-4 mb-6">
              {posts.map((post) => (
                <Post key={post.id} post={post} now={now} />
              ))}
            </div>

            {/* Gatilho do infinite scroll */}
            <div ref={loadMoreRef} className="h-10" />

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            )}
          </>
        ) : (
          <div className="w-full min-h-[400px] flex flex-col items-center justify-center">
            <p className="text-white/50 mb-4">
              Nenhum post ainda. Seja o primeiro a postar!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
