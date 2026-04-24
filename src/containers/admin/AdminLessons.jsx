import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import AdminModal from "../../components/AdminModal";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Loader from "../../components/Loader";
import {
  createLesson,
  deleteLesson,
  findAllLessons,
  updateLesson,
} from "../../services/lessons/lessonsService";
import { findAllSermons } from "../../services/sermons/sermonsService";
import { toastError, toastSuccess } from "../../utils/toastHelper";

const initialForm = {
  title: "",
  description: "",
  sermonId: "",
  videoLink: "",
  ordem: 1,
};

function getLessons(data) {
  if (Array.isArray(data)) return data;
  return data?.lessons || data?.items || [];
}

function getSermons(data) {
  if (Array.isArray(data)) return data;
  return data?.sermons || data?.items || [];
}

export default function AdminLessons() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const queryClient = useQueryClient();

  const { data: lessonsData, isLoading } = useQuery({
    queryKey: ["admin-lessons"],
    queryFn: () =>
      findAllLessons({
        page: 1,
        limit: 100,
        orderBy: "ordem",
        orderDirection: "ASC",
      }),
  });

  const { data: sermonsData } = useQuery({
    queryKey: ["admin-lessons-sermons"],
    queryFn: () => findAllSermons({ page: 1, limit: 100 }),
  });

  const sermons = useMemo(() => getSermons(sermonsData), [sermonsData]);
  const lessons = useMemo(() => getLessons(lessonsData), [lessonsData]);

  useEffect(() => {
    if (!formData.sermonId && sermons[0]?.id) {
      setFormData((current) => ({ ...current, sermonId: sermons[0].id }));
    }
  }, [formData.sermonId, sermons]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });

  const createMutation = useMutation({
    mutationFn: createLesson,
    onSuccess: () => {
      invalidate();
      toastSuccess("Licao criada.");
      closeModal();
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao criar licao.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateLesson(id, body),
    onSuccess: () => {
      invalidate();
      toastSuccess("Licao atualizada.");
      closeModal();
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao atualizar licao.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => {
      invalidate();
      toastSuccess("Licao removida.");
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao remover licao.");
    },
  });

  function openCreateModal() {
    setEditingLesson(null);
    setFormData({ ...initialForm, sermonId: sermons[0]?.id || "" });
    setIsModalOpen(true);
  }

  function openEditModal(lesson) {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title || "",
      description: lesson.description || "",
      sermonId: lesson.sermonId || sermons[0]?.id || "",
      videoLink: lesson.videoLink || "",
      ordem: Number(lesson.ordem) || 1,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingLesson(null);
    setFormData({ ...initialForm, sermonId: sermons[0]?.id || "" });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const body = { ...formData, ordem: Number(formData.ordem) };

    if (editingLesson) {
      updateMutation.mutate({ id: editingLesson.id, body });
      return;
    }

    createMutation.mutate(body);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Licoes</h1>
            <p className="text-white/60">
              Organize as aulas vinculadas aos sermoes.
            </p>
          </div>

          <Button onClick={openCreateModal}>
            <Plus size={18} />
            Nova licao
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="grid gap-4">
            {lessons.map((lesson) => (
              <article
                key={lesson.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                      Ordem {lesson.ordem}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">
                      {lesson.title}
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                      {lesson.description}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      style={2}
                      size="sm"
                      onClick={() => openEditModal(lesson)}
                    >
                      Editar
                    </Button>
                    <Button
                      style={2}
                      size="sm"
                      onClick={() => deleteMutation.mutate(lesson.id)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingLesson ? "Editar licao" : "Nova licao"}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        submitText={editingLesson ? "Atualizar" : "Criar"}
      >
        <Input
          label="Titulo"
          value={formData.title}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              title: event.target.value,
            }))
          }
        />
        <Input
          label="Descricao"
          value={formData.description}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
        />
        <label className="block text-sm font-medium text-white/90">
          Sermao
          <select
            value={formData.sermonId}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                sermonId: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          >
            {sermons.map((sermon) => (
              <option
                key={sermon.id}
                value={sermon.id}
                className="bg-[#111318]"
              >
                {sermon.title}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="URL do video"
          value={formData.videoLink}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              videoLink: event.target.value,
            }))
          }
        />
        <Input
          label="Ordem"
          type="number"
          value={formData.ordem}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              ordem: event.target.value,
            }))
          }
        />
      </AdminModal>
    </AdminLayout>
  );
}
