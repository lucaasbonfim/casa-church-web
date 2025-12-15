import { useMemo, useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Avatar from "./Avatar";
import Button from "./Button";
import {
  createLike,
  deleteLike,
  findAllLikes,
} from "../services/likes/likesService";
import {
  createComment,
  findAllComments,
  deleteComment,
} from "../services/comments/commentsService";
import { deletePost } from "../services/posts/postsService";
import { toastSuccess, toastError } from "../utils/toastHelper";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { jwtDecode } from "jwt-decode";

export default function Post({ post, onDelete, now }) {
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const queryClient = useQueryClient();

  // 🔐 Usuário logado (ID vem do token)
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = useMemo(() => {
    if (!storedUser?.token) return undefined;
    const decoded = jwtDecode(storedUser.token);
    return decoded.sub || decoded.id || decoded.userId;
  }, [storedUser?.token]);

  /* ============================
     TIME FORMAT
     ============================ */
  const formatTime = (date) =>
    formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
      baseDate: new Date(now),
    });

  /* ============================
     LIKES
     ============================ */
  const {
    data: likesRaw,
  } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () => findAllLikes({ postId: post.id, limit: 100 }),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const likes = useMemo(() => {
    // Aceita formatos diferentes
    if (!likesRaw) return [];
    if (Array.isArray(likesRaw)) return likesRaw;
    if (Array.isArray(likesRaw.likes)) return likesRaw.likes;
    if (Array.isArray(likesRaw.data?.likes)) return likesRaw.data.likes;
    if (Array.isArray(likesRaw.rows)) return likesRaw.rows;
    return [];
  }, [likesRaw]);

  const userLike = likes.find(
    (like) => String(like.userId) === String(currentUserId)
  );
  const isLiked = !!userLike;
  const likesCount = likes.length;

  const likeMutation = useMutation({
    mutationFn: createLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes", post.id] });
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao curtir");
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: deleteLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes", post.id] });
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao descurtir");
    },
  });

  const handleLike = () => {
    if (!currentUserId) {
      toastError("Usuário não identificado. Faça login novamente.");
      return;
    }

    if (isLiked && userLike?.id) {
      unlikeMutation.mutate(userLike.id);
    } else {
      likeMutation.mutate({ postId: post.id });
    }
  };

  /* ============================
     COMMENTS
     ============================ */

  const {
    data: commentsRaw,
    isLoading: isLoadingComments,
    isError: isCommentsError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => findAllComments({ postId: post.id, limit: 100 }),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // 🔥 Normaliza QUALQUER formato de retorno
const comments = useMemo(() => {
  if (!commentsRaw) return [];

  // FORMATO REAL DA API
  if (Array.isArray(commentsRaw.posts)) return commentsRaw.posts;

  // fallback (caso mude no futuro)
  if (Array.isArray(commentsRaw.comments)) return commentsRaw.comments;
  if (Array.isArray(commentsRaw.data)) return commentsRaw.data;

  return [];
}, [commentsRaw]);

  const commentsCount = comments.length;

  const commentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: async () => {
      setCommentContent("");
      toastSuccess("Comentário adicionado!");

      await queryClient.invalidateQueries({
        queryKey: ["comments", post.id],
      });

      refetchComments();
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao comentar");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async () => {
      toastSuccess("Comentário excluído!");
      await queryClient.invalidateQueries({
        queryKey: ["comments", post.id],
      });
      refetchComments();
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao excluir comentário");
    },
  });

  const handleComment = () => {
    if (!commentContent.trim()) return;

    if (!showComments) setShowComments(true);

    commentMutation.mutate({
      postId: post.id,
      content: commentContent.trim(),
    });
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Tem certeza que deseja excluir este comentário?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  /* ============================
     DELETE POST
     ============================ */
  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toastSuccess("Post excluído com sucesso!");
      onDelete?.();
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao excluir post");
    },
  });

  const handleDeletePost = () => {
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      deletePostMutation.mutate(post.id);
    }
  };

  /* ============================
     RENDER
     ============================ */

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={post.user?.name || "Usuário"} size="md" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">
                {post.user?.name || "Usuário"}
              </p>
              <p className="text-xs text-white/50">{formatTime(post.createdAt)}</p>
            </div>

            {String(post.userId) === String(currentUserId) && (
              <button
                onClick={handleDeletePost}
                className="text-white/50 hover:text-red-500 p-2"
                disabled={deletePostMutation.isPending}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <p className="text-white/90 mb-4 whitespace-pre-wrap break-words">
        {post.content}
      </p>

      {/* Ações */}
      <div className="flex items-center gap-4 pt-3 border-t border-white/10">
        <button
          onClick={handleLike}
          disabled={likeMutation.isPending || unlikeMutation.isPending}
          className={`flex items-center gap-2 text-sm ${
            isLiked ? "text-red-500" : "text-white/60 hover:text-red-500"
          }`}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-blue-500"
        >
          <MessageCircle size={18} />
          <span>{commentsCount}</span>
        </button>
      </div>

      {/* Comentários */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
          {/* Novo comentário */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Escreva um comentário..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              maxLength={300}
            />
            <Button
              onClick={handleComment}
              loading={commentMutation.isPending}
              disabled={!commentContent.trim()}
              size="sm"
              icon="Send"
              iconSize={14}
            />
          </div>

          {/* Estado de loading/erro */}
          {isLoadingComments ? (
            <p className="text-sm text-white/40 text-center py-4">
              Carregando comentários...
            </p>
          ) : isCommentsError ? (
            <p className="text-sm text-red-400 text-center py-4">
              Erro ao carregar comentários.
            </p>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar name={comment.user?.name || "Usuário"} size="sm" />
                <div className="flex-1 bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-white">
                      {comment.user?.name || "Usuário"}
                    </p>

                    {String(comment.userId) === String(currentUserId) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-white/50 hover:text-red-500"
                        disabled={deleteCommentMutation.isPending}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-white/80 break-words">
                    {comment.content}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {formatTime(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/40 text-center py-4">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
