import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import { deletePost, findAllPosts } from "../../services/posts/postsService";
import { toastError, toastSuccess } from "../../utils/toastHelper";

function getPosts(data) {
  if (Array.isArray(data)) return data;
  return data?.posts || data?.items || [];
}

export default function AdminPosts() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () =>
      findAllPosts({
        page: 1,
        limit: 100,
        orderBy: "createdAt",
        orderDirection: "DESC",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toastSuccess("Post removido.");
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao remover post.");
    },
  });

  const posts = getPosts(data);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-white/60">
            Modere publicacoes feitas na area social.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : posts.length ? (
          <div className="grid gap-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm text-white/50">
                      {post.user?.name || "Usuario"}
                    </p>
                    <p className="mt-2 whitespace-pre-line text-white/80">
                      {post.content || post.description || post.text}
                    </p>
                  </div>
                  <Button
                    style={2}
                    size="sm"
                    onClick={() => deleteMutation.mutate(post.id)}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                    Remover
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-white/50">
            Nenhum post publicado.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
