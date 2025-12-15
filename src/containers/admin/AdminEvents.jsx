import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import AdminCard from "../../components/AdminCard";
import AdminModal from "../../components/AdminModal";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Loader from "../../components/Loader";
import { toastSuccess, toastError } from "../../utils/toastHelper";
import { 
  findAllEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} from "../../services/events/eventsService";
import { findAllLocations } from "../../services/locations/locationsService";

export default function AdminEvents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    locationId: "",
    image: "",
  });

  const queryClient = useQueryClient();

  // Buscar eventos
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["admin-events", searchTerm],
    queryFn: () => findAllEvents({ limit: 100, title: searchTerm || undefined }),
    refetchOnWindowFocus: true,
  });

  // Buscar localizações
  const { data: locationsData } = useQuery({
    queryKey: ["locations"],
    queryFn: () => findAllLocations({ limit: 100 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.refetchQueries({ queryKey: ["admin-events"] });
      toastSuccess("Evento criado com sucesso!");
      closeModal();
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao criar evento");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.refetchQueries({ queryKey: ["admin-events"] });
      toastSuccess("Evento atualizado com sucesso!");
      closeModal();
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao atualizar evento");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toastSuccess("Evento deletado com sucesso!");
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao deletar evento");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.locationId) {
      toastError("Preencha todos os campos obrigatórios");
      return;
    }

    const dataToSend = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: dataToSend });
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    
    const startDate = event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : "";
    const endDate = event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "";
    
    setFormData({
      title: event.title || "",
      description: event.description || "",
      startDate: startDate,
      endDate: endDate,
      locationId: event.locationId || "",
      image: event.image || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja deletar este evento?")) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      locationId: "",
      image: "",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Eventos</h1>
            <p className="text-white/60">Gerencie os eventos da igreja</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Novo Evento
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Buscar eventos..."
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm("")}
          allowClear
        />

        {/* Lista de Eventos */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsData?.events?.map((event) => (
              <AdminCard
                key={event.id}
                title={event.title}
                description={event.description}
                image={event.image}
                metadata={[
                  { label: "Início", value: event.startDate },
                  { label: "Fim", value: event.endDate },
                ]}
                onEdit={() => handleEdit(event)}
                onDelete={() => handleDelete(event.id)}
              />
            ))}
          </div>
        )}

        {eventsData?.events?.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <p>Nenhum evento encontrado</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingEvent ? "Editar Evento" : "Novo Evento"}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        submitText={editingEvent ? "Atualizar" : "Criar"}
      >
        <Input
          label="Título *"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          placeholder="Nome do evento"
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
            placeholder="Descrição do evento"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/20 transition min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-white/40 mt-1">
            {formData.description.length}/500 caracteres
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Data Início *"
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
          />

          <Input
            label="Data Fim *"
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Localização *
          </label>
          <select
            value={formData.locationId}
            onChange={(e) =>
              setFormData({ ...formData, locationId: e.target.value })
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-white/20 transition [&>option]:bg-[#1a1d24] [&>option]:text-white"
          >
            <option value="">Selecione uma localização</option>
            {locationsData?.locations?.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="URL da Imagem"
          value={formData.image}
          onChange={(e) =>
            setFormData({ ...formData, image: e.target.value })
          }
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </AdminModal>
    </AdminLayout>
  );
}