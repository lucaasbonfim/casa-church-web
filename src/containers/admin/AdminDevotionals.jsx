import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Image,
  Link as LinkIcon,
  Plus,
  Search,
} from "lucide-react";
import AdminCard from "../../components/AdminCard";
import AdminLayout from "../../components/AdminLayout";
import AdminModal from "../../components/AdminModal";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Loader from "../../components/Loader";
import {
  createDevotional,
  deleteDevotional,
  findAllDevotionals,
  updateDevotional,
} from "../../services/devotionals/devotionalsService";
import { toastError, toastSuccess } from "../../utils/toastHelper";

const initialFormData = {
  title: "",
  devotionalDate: "",
  verseReference: "",
  verseText: "",
  content: "",
  imageUrl: "",
  videoUrl: "",
  published: true,
};

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getDevotionalsList(data) {
  if (Array.isArray(data)) return data;
  return data?.devotionals || data?.items || [];
}

export default function AdminDevotionals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevotional, setEditingDevotional] = useState(null);
  const [formData, setFormData] = useState({
    ...initialFormData,
    devotionalDate: toDateInputValue(new Date()),
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-devotionals", searchTerm],
    queryFn: () =>
      findAllDevotionals({
        page: 1,
        limit: 100,
        title: searchTerm || undefined,
        orderBy: "devotionalDate",
        orderDirection: "DESC",
      }),
  });

  const devotionals = useMemo(() => getDevotionalsList(data), [data]);

  const createMutation = useMutation({
    mutationFn: createDevotional,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-devotionals"] });
      queryClient.invalidateQueries({ queryKey: ["devotional-by-date"] });
      queryClient.invalidateQueries({ queryKey: ["devotionals-month"] });
      toastSuccess("Devocional criado com sucesso.");
      closeModal();
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao criar devocional.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateDevotional(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-devotionals"] });
      queryClient.invalidateQueries({ queryKey: ["devotional-by-date"] });
      queryClient.invalidateQueries({ queryKey: ["devotionals-month"] });
      toastSuccess("Devocional atualizado com sucesso.");
      closeModal();
    },
    onError: (error) => {
      toastError(
        error?.response?.data?.message || "Erro ao atualizar devocional."
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDevotional,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-devotionals"] });
      queryClient.invalidateQueries({ queryKey: ["devotional-by-date"] });
      queryClient.invalidateQueries({ queryKey: ["devotionals-month"] });
      toastSuccess("Devocional removido com sucesso.");
    },
    onError: (error) => {
      toastError(
        error?.response?.data?.message || "Erro ao remover devocional."
      );
    },
  });

  const openCreateModal = () => {
    setEditingDevotional(null);
    setFormData({
      ...initialFormData,
      devotionalDate: toDateInputValue(new Date()),
    });
    setIsModalOpen(true);
  };

  const handleEdit = (devotional) => {
    setEditingDevotional(devotional);
    setFormData({
      title: devotional.title || "",
      devotionalDate: toDateInputValue(
        devotional.devotionalDate || devotional.date
      ),
      verseReference: devotional.verseReference || "",
      verseText: devotional.verseText || "",
      content: devotional.content || devotional.description || "",
      imageUrl: devotional.imageUrl || devotional.image || "",
      videoUrl: devotional.videoUrl || devotional.videoLink || "",
      published: devotional.published !== false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDevotional(null);
    setFormData({
      ...initialFormData,
      devotionalDate: toDateInputValue(new Date()),
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja remover este devocional?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title || !formData.devotionalDate || !formData.content) {
      toastError("Informe titulo, data e conteudo do devocional.");
      return;
    }

    const body = {
      ...formData,
      devotionalDate: new Date(`${formData.devotionalDate}T12:00:00`).toISOString(),
      published: Boolean(formData.published),
    };

    if (editingDevotional) {
      updateMutation.mutate({ id: editingDevotional.id, body });
      return;
    }

    createMutation.mutate(body);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Devocionais</h1>
            <p className="text-white/60">
              Publique a palavra diaria com texto, imagem ou video.
            </p>
          </div>

          <Button onClick={openCreateModal}>
            <Plus size={18} />
            Novo Devocional
          </Button>
        </div>

        <Input
          placeholder="Buscar devocional por titulo..."
          icon={Search}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onClear={() => setSearchTerm("")}
          allowClear
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : devotionals.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {devotionals.map((devotional) => (
              <AdminCard
                key={devotional.id}
                title={devotional.title}
                description={devotional.content || devotional.description}
                image={devotional.imageUrl || devotional.image}
                metadata={[
                  {
                    label: "Data",
                    value: formatDate(
                      devotional.devotionalDate || devotional.date
                    ),
                  },
                  {
                    label: "Versiculo",
                    value: devotional.verseReference || "Nao informado",
                  },
                  {
                    label: "Video",
                    value:
                      devotional.videoUrl || devotional.videoLink
                        ? "Cadastrado"
                        : "Nao informado",
                  },
                  {
                    label: "Status",
                    value: devotional.published === false ? "Rascunho" : "Publicado",
                  },
                ]}
                onEdit={() => handleEdit(devotional)}
                onDelete={() => handleDelete(devotional.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-white/50">
            Nenhum devocional cadastrado ainda.
          </div>
        )}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingDevotional ? "Editar Devocional" : "Novo Devocional"}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        submitText={editingDevotional ? "Atualizar" : "Criar"}
        containerClassName="max-w-4xl"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Titulo *"
            value={formData.title}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder="Ex.: Descanso para hoje"
          />

          <Input
            label="Data *"
            type="date"
            icon={CalendarDays}
            value={formData.devotionalDate}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                devotionalDate: event.target.value,
              }))
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Referencia biblica"
            value={formData.verseReference}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                verseReference: event.target.value,
              }))
            }
            placeholder="Ex.: Salmos 23:1"
          />

          <Input
            label="URL do video"
            icon={LinkIcon}
            value={formData.videoUrl}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                videoUrl: event.target.value,
              }))
            }
            placeholder="YouTube, Instagram, Vimeo..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Texto do versiculo
          </label>
          <textarea
            value={formData.verseText}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                verseText: event.target.value,
              }))
            }
            placeholder="Cole aqui o texto do versiculo, se quiser destacar."
            className="min-h-[90px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/50 focus:ring-2 focus:ring-white/20"
            maxLength={500}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Conteudo *
          </label>
          <textarea
            value={formData.content}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                content: event.target.value,
              }))
            }
            placeholder="Escreva o devocional do dia."
            className="min-h-[180px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/50 focus:ring-2 focus:ring-white/20"
            maxLength={5000}
          />
          <p className="mt-1 text-xs text-white/40">
            {formData.content.length}/5000 caracteres
          </p>
        </div>

        <Input
          label="URL da imagem"
          icon={Image}
          value={formData.imageUrl}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              imageUrl: event.target.value,
            }))
          }
          placeholder="https://exemplo.com/imagem.jpg"
        />

        <label className="flex items-center gap-3 text-sm text-white/80">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                published: event.target.checked,
              }))
            }
            className="rounded border-white/10 bg-white/5"
          />
          Publicado para aparecer na pagina publica
        </label>
      </AdminModal>
    </AdminLayout>
  );
}
