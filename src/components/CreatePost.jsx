import { useState } from "react";
import { Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import Button from "./Button";
import Avatar from "./Avatar";
import { createPost } from "../services/posts/postsService";
import { toastSuccess, toastError } from "../utils/toastHelper";

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      setContent("");
      toastSuccess("Post criado com sucesso!");
      onPostCreated?.();
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao criar post");
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toastError("Digite algo para postar");
      return;
    }

    // Decodifica o token para pegar o userId
    const token = user.token;
    const decoded = jwtDecode(token);
    const userId = decoded.sub || decoded.id || decoded.userId;

    createPostMutation.mutate({
      userId: userId,
      content: content.trim(),
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      <div className="flex gap-3">
        <Avatar name={user.name} size="md" />
        <div className="flex-1">
          <textarea
            placeholder="O que está acontecendo?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent text-white placeholder:text-white/50 outline-none resize-none min-h-[80px]"
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <span className="text-xs text-white/40">
              {content.length}/500
            </span>
            <Button
              onClick={handleSubmit}
              loading={createPostMutation.isPending}
              disabled={!content.trim() || createPostMutation.isPending}
              size="sm"
            >
              <Send size={16} />
              Postar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}