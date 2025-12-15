import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import AdminLayout from "../../components/AdminLayout";
import AdminCard from "../../components/AdminCard";
import AdminModal from "../../components/AdminModal";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Loader from "../../components/Loader";
import { toastSuccess, toastError } from "../../utils/toastHelper";
import { 
  findAllSermons, 
  createSermon, 
  updateSermon, 
  deleteSermon 
} from "../../services/sermons/sermonsService";

export default function AdminSermons() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const queryClient = useQueryClient();

  // Buscar sermões
  const { data: sermonsData, isLoading } = useQuery({
    queryKey: ["admin-sermons", searchTerm],
    queryFn: () => findAllSermons({ limit: 100 }),
    refetchOnWindowFocus: true,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createSermon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sermons"] });
      queryClient.refetchQueries({ queryKey: ["admin-sermons"] });
      toastSuccess("Sermão criado com sucesso!");
      closeModal();
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao criar sermão");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSermon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sermons"] });
      queryClient.refetchQueries({ queryKey: ["admin-sermons"] });
      toastSuccess("Sermão atualizado com sucesso!");
      closeModal();
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao atualizar sermão");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSermon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sermons"] });
      toastSuccess("Sermão deletado com sucesso!");
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao deletar sermão");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toastError("Preencha todos os campos obrigatórios");
      return;
    }

    // Pega o userId do token
    const user = JSON.parse(localStorage.getItem("user"));
    const decoded = jwtDecode(user.token);
    const userId = decoded.sub || decoded.id || decoded.userId;

    const dataToSend = {
      ...formData,
      createdBy: userId,
    };

    if (editingSermon) {
      updateMutation.mutate({ id: editingSermon.id, data: formData });
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  const handleEdit = (sermon) => {
    setEditingSermon(sermon);
    setFormData({
      title: sermon.title || "",
      description: sermon.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja deletar este sermão?")) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSermon(null);
    setFormData({
      title: "",
      description: "",
    });
  };

  const filteredSermons = sermonsData?.sermons?.filter((sermon) =>
    sermon.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sermões</h1>
            <p className="text-white/60">Gerencie os sermões da igreja</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Novo Sermão
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Buscar sermões..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm("")}
          allowClear
        />

        {/* Lista de Sermões */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSermons?.map((sermon) => (
              <AdminCard
                key={sermon.id}
                title={sermon.title}
                description={sermon.description}
                metadata={[
                  { label: "Criado em", value: new Date(sermon.createdAt).toLocaleDateString('pt-BR') },
                ]}
                onEdit={() => handleEdit(sermon)}
                onDelete={() => handleDelete(sermon.id)}
              />
            ))}
          </div>
        )}

        {filteredSermons?.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <p>Nenhum sermão encontrado</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSermon ? "Editar Sermão" : "Novo Sermão"}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        submitText={editingSermon ? "Atualizar" : "Criar"}
      >
        <Input
          label="Título *"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          placeholder="Nome do sermão"
          maxLength={100}
        />

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Descrição *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Descrição do sermão"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/20 transition min-h-[100px] resize-none"
            maxLength={255}
          />
          <p className="text-xs text-white/40 mt-1">
            {formData.description.length}/255 caracteres
          </p>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}