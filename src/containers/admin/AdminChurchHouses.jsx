import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapPinned,
  Plus,
  Search,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import AdminCard from "../../components/AdminCard";
import AdminLayout from "../../components/AdminLayout";
import AdminModal from "../../components/AdminModal";
import Button from "../../components/Button";
import ChurchHousePickerMap from "../../components/ChurchHousePickerMap";
import Input from "../../components/Input";
import Loader from "../../components/Loader";
import {
  createChurchHouse,
  deleteChurchHouse,
  findAllChurchHouses,
  updateChurchHouse,
} from "../../services/churchHouses/churchHousesService";
import {
  geocodeChurchHouseAddress,
  reverseGeocodeCoordinates,
  searchAddresses,
} from "../../services/geocoding/geocodingService";
import { toastError, toastSuccess } from "../../utils/toastHelper";
import { buildChurchHouseAddress } from "../../utils/churchHouseUtils";

const initialFormData = {
  name: "",
  description: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  uf: "",
  zipCode: "",
  reference: "",
  contactPhone: "",
  meetingSchedule: "",
  latitude: "",
  longitude: "",
  active: true,
};

const BRAZILIAN_STATE_CODES = {
  acre: "AC",
  alagoas: "AL",
  amapa: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceara: "CE",
  "distrito federal": "DF",
  "espirito santo": "ES",
  goias: "GO",
  maranhao: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  para: "PA",
  paraiba: "PB",
  parana: "PR",
  pernambuco: "PE",
  piaui: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondonia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "sao paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
};

function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeStateCode(value = "", state = "") {
  const normalizedValue = String(value).trim();
  const matchedCode = normalizedValue
    .toUpperCase()
    .match(/(?:BR-)?([A-Z]{2})$/)?.[1];

  if (matchedCode) {
    return matchedCode;
  }

  return BRAZILIAN_STATE_CODES[normalizeText(state)] || "";
}

function parseCoordinate(value) {
  if (value === "" || value === null || value === undefined) {
    return Number.NaN;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function applyAddressToForm(result, currentForm) {
  const nextState = result.address?.state || currentForm.state;
  const nextUf = normalizeStateCode(
    result.address?.uf || currentForm.uf,
    nextState
  );

  return {
    ...currentForm,
    street: result.address?.street || currentForm.street,
    number: result.address?.number || currentForm.number,
    neighborhood: result.address?.neighborhood || currentForm.neighborhood,
    city: result.address?.city || currentForm.city,
    state: nextState,
    uf: nextUf,
    zipCode: result.address?.zipCode || currentForm.zipCode,
    latitude: String(result.latitude),
    longitude: String(result.longitude),
  };
}

export default function AdminChurchHouses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChurchHouse, setEditingChurchHouse] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState([]);
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [viewerLocation, setViewerLocation] = useState(null);
  const [shouldAutoFocusViewerLocation, setShouldAutoFocusViewerLocation] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-church-houses", searchTerm],
    queryFn: () =>
      findAllChurchHouses({
        limit: 100,
        name: searchTerm || undefined,
        orderBy: "name",
        orderDirection: "ASC",
      }),
  });

  const churchHouses = data?.churchHouses || [];

  const geocodeAddress = async () => {
    const resolvedUf = normalizeStateCode(formData.uf, formData.state);

    if (
      !formData.street ||
      !formData.neighborhood ||
      !formData.city ||
      !resolvedUf
    ) {
      toastError("Escolha um ponto no mapa ou busque um lugar primeiro");
      return null;
    }

    setIsGeocoding(true);

    try {
      const result = await geocodeChurchHouseAddress(formData);
      setFormData((current) => applyAddressToForm(result, current));
      toastSuccess("Coordenadas atualizadas com sucesso");
      return result;
    } catch (error) {
      toastError(error?.message || "Nao foi possivel geocodificar o endereco");
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };

  const reverseGeocodePoint = async (latitude, longitude) => {
    setIsReverseGeocoding(true);

    try {
      const result = await reverseGeocodeCoordinates(latitude, longitude);
      setFormData((current) => applyAddressToForm(result, current));
      toastSuccess("Endereco preenchido a partir do mapa");
    } catch (error) {
      toastError(error?.message || "Nao foi possivel ler esse ponto");
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleSearchPlace = async () => {
    if (!placeQuery.trim()) {
      toastError("Digite um lugar, rua ou bairro para buscar no mapa");
      return;
    }

    setIsSearchingPlace(true);

    try {
      const results = await searchAddresses(`${placeQuery}, Brasil`, {
        limit: 6,
      });
      setPlaceResults(results);

      if (!results.length) {
        toastError("Nenhum lugar encontrado para essa busca");
      }
    } catch (error) {
      toastError(error?.message || "Erro ao buscar lugar");
    } finally {
      setIsSearchingPlace(false);
    }
  };

  const handleSelectPlace = (result) => {
    setFormData((current) => applyAddressToForm(result, current));
    setPlaceResults([]);
    setPlaceQuery(result.label);
    setViewerLocation({
      latitude: result.latitude,
      longitude: result.longitude,
      label: result.label,
    });
    setShouldAutoFocusViewerLocation(true);
    toastSuccess("Endereco carregado no formulario");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toastError("Seu navegador nao suporta geolocalizacao");
      return;
    }

    setIsLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setViewerLocation({
          latitude,
          longitude,
          label: "Sua localizacao atual",
        });
        setShouldAutoFocusViewerLocation(true);

        try {
          await reverseGeocodePoint(latitude, longitude);
        } finally {
          setIsLocatingUser(false);
        }
      },
      () => {
        toastError("Nao foi possivel obter sua localizacao");
        setIsLocatingUser(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const createMutation = useMutation({
    mutationFn: createChurchHouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-church-houses"] });
      toastSuccess("CI criado com sucesso!");
      closeModal();
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao criar CI");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateChurchHouse(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-church-houses"] });
      toastSuccess("CI atualizado com sucesso!");
      closeModal();
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao atualizar CI");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChurchHouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-church-houses"] });
      toastSuccess("CI removido com sucesso!");
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao remover CI");
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const resolvedUf = normalizeStateCode(formData.uf, formData.state);

    if (
      !formData.name ||
      !formData.street ||
      !formData.neighborhood ||
      !formData.city ||
      !formData.state ||
      !resolvedUf
    ) {
      toastError("Escolha um ponto no mapa e informe pelo menos o nome do CI");
      return;
    }

    let coordinates = null;
    if (!formData.latitude || !formData.longitude) {
      coordinates = await geocodeAddress();
      if (!coordinates) return;
    }

    const body = {
      ...formData,
      uf: resolvedUf,
      latitude: Number(coordinates?.latitude ?? formData.latitude),
      longitude: Number(coordinates?.longitude ?? formData.longitude),
      active: Boolean(formData.active),
    };

    if (editingChurchHouse) {
      updateMutation.mutate({ id: editingChurchHouse.id, body });
      return;
    }

    createMutation.mutate(body);
  };

  const handleEdit = (churchHouse) => {
    setEditingChurchHouse(churchHouse);
    setFormData({
      name: churchHouse.name || "",
      description: churchHouse.description || "",
      street: churchHouse.street || "",
      number: churchHouse.number || "",
      complement: churchHouse.complement || "",
      neighborhood: churchHouse.neighborhood || "",
      city: churchHouse.city || "",
      state: churchHouse.state || "",
      uf: churchHouse.uf || "",
      zipCode: churchHouse.zipCode || "",
      reference: churchHouse.reference || "",
      contactPhone: churchHouse.contactPhone || "",
      meetingSchedule: churchHouse.meetingSchedule || "",
      latitude: String(churchHouse.latitude || ""),
      longitude: String(churchHouse.longitude || ""),
      active: Boolean(churchHouse.active),
    });
    setPlaceQuery(buildChurchHouseAddress(churchHouse));
    setPlaceResults([]);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja remover este CI?")) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setEditingChurchHouse(null);
    setFormData(initialFormData);
    setPlaceQuery("");
    setPlaceResults([]);
    setViewerLocation(null);
    setShouldAutoFocusViewerLocation(false);
    setIsModalOpen(false);
  };

  const selectedAddressPreview = useMemo(
    () => buildChurchHouseAddress(formData),
    [formData]
  );

  const mapLatitude = parseCoordinate(formData.latitude);
  const mapLongitude = parseCoordinate(formData.longitude);
  const viewerLatitude = parseCoordinate(viewerLocation?.latitude);
  const viewerLongitude = parseCoordinate(viewerLocation?.longitude);

  useEffect(() => {
    if (!isModalOpen || !navigator.geolocation) return;
    if (Number.isFinite(mapLatitude) && Number.isFinite(mapLongitude)) return;
    if (viewerLocation) return;

    const tryAutoLocate = async () => {
      try {
        const permissionStatus = await navigator.permissions?.query?.({
          name: "geolocation",
        });

        if (permissionStatus && permissionStatus.state !== "granted") {
          return;
        }
      } catch {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewerLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            label: "Sua localizacao atual",
          });
          setShouldAutoFocusViewerLocation(true);
        },
        () => {}
      );
    };

    tryAutoLocate();
  }, [
    isModalOpen,
    mapLatitude,
    mapLongitude,
    viewerLocation,
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">CIs</h1>
            <p className="text-white/60">
              Cadastre e gerencie as Casas Igreja da comunidade
            </p>
          </div>

          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Novo CI
          </Button>
        </div>

        <Input
          placeholder="Buscar CI por nome..."
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
        ) : churchHouses.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {churchHouses.map((churchHouse) => (
              <AdminCard
                key={churchHouse.id}
                title={churchHouse.name}
                description={
                  churchHouse.description ||
                  "Ponto de encontro da Casa Church para comunhao, discipulado e oracao."
                }
                metadata={[
                  {
                    label: "Endereco",
                    value: buildChurchHouseAddress(churchHouse),
                  },
                  {
                    label: "Agenda",
                    value: churchHouse.meetingSchedule || "A definir",
                  },
                  {
                    label: "Status",
                    value: churchHouse.active ? "Ativo" : "Inativo",
                  },
                ]}
                onEdit={() => handleEdit(churchHouse)}
                onDelete={() => handleDelete(churchHouse.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-white/50">
            Nenhum CI cadastrado ainda.
          </div>
        )}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingChurchHouse ? "Editar CI" : "Novo CI"}
        onSubmit={handleSubmit}
        isLoading={
          createMutation.isPending ||
          updateMutation.isPending ||
          isGeocoding ||
          isSearchingPlace ||
          isReverseGeocoding ||
          isLocatingUser
        }
        submitText={editingChurchHouse ? "Atualizar" : "Criar"}
        containerClassName="max-w-6xl"
      >
        <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
              <div className="flex items-center gap-2 text-white/80">
                <Sparkles size={16} className="text-violet-300" />
                <p className="text-sm">
                  Escolha o ponto no mapa ou busque um lugar para preencher o
                  endereco automaticamente.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={placeQuery}
                  onChange={(event) => setPlaceQuery(event.target.value)}
                  placeholder="Busque por rua, bairro, cidade ou ponto de referencia"
                  icon={Search}
                  fullWidth
                />
                <Button
                  type="button"
                  onClick={handleSearchPlace}
                  style={2}
                  loading={isSearchingPlace}
                >
                  Buscar
                </Button>
              </div>

              {placeResults.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
                  {placeResults.map((result) => (
                    <button
                      key={`${result.latitude}-${result.longitude}`}
                      type="button"
                      onClick={() => handleSelectPlace(result)}
                      className="w-full text-left px-4 py-3 border-b last:border-b-0 border-white/10 hover:bg-white/10 transition"
                    >
                      <p className="text-sm text-white/90">{result.label}</p>
                    </button>
                  ))}
                </div>
              )}

              <ChurchHousePickerMap
                latitude={mapLatitude}
                longitude={mapLongitude}
                viewLatitude={viewerLatitude}
                viewLongitude={viewerLongitude}
                shouldAutoFocusView={shouldAutoFocusViewerLocation}
                onPick={reverseGeocodePoint}
                onUseCurrentLocation={handleUseCurrentLocation}
                isLocating={isLocatingUser}
              />

              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65">
                <p className="font-medium text-white/90 mb-1">
                  Endereco detectado
                </p>
                <p>{selectedAddressPreview || "Clique no mapa para preencher"}</p>
                {viewerLocation && !selectedAddressPreview && (
                  <p className="mt-2 text-xs text-blue-300/80">
                    Mapa iniciado na sua localizacao atual.
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Latitude *"
                  value={formData.latitude}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      latitude: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Longitude *"
                  value={formData.longitude}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      longitude: event.target.value,
                    }))
                  }
                />
              </div>

              <Button
                type="button"
                onClick={geocodeAddress}
                style={2}
                loading={isGeocoding}
              >
                <MapPinned size={16} />
                Ajustar coordenadas pelo endereco atual
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Nome do CI *"
              value={formData.name}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Ex.: CI Jardim Primavera"
            />

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Descricao
              </label>
              <textarea
                value={formData.description}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Uma contextualizacao generica para depois personalizar."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/20 transition min-h-[96px] resize-none"
                maxLength={1000}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Rua *"
                value={formData.street}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    street: event.target.value,
                  }))
                }
              />
              <Input
                label="Numero"
                value={formData.number}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    number: event.target.value,
                  }))
                }
                placeholder="Ajuste manualmente, se precisar"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Complemento"
                value={formData.complement}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    complement: event.target.value,
                  }))
                }
              />
              <Input
                label="Bairro *"
                value={formData.neighborhood}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    neighborhood: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Cidade *"
                  value={formData.city}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      city: event.target.value,
                    }))
                  }
                />
              </div>
              <Input
                label="Estado *"
                value={formData.state}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    state: event.target.value,
                  }))
                }
              />
              <Input
                label="UF *"
                value={formData.uf}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    uf: event.target.value.toUpperCase(),
                  }))
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="CEP"
                value={formData.zipCode}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    zipCode: event.target.value,
                  }))
                }
              />
              <Input
                label="Referencia"
                value={formData.reference}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    reference: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Telefone de contato"
                value={formData.contactPhone}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    contactPhone: event.target.value,
                  }))
                }
              />
              <Input
                label="Agenda"
                value={formData.meetingSchedule}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    meetingSchedule: event.target.value,
                  }))
                }
                placeholder="Ex.: Quartas, 20h"
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
                className="rounded border-white/10 bg-white/5"
              />
              CI ativo para aparecer nas buscas publicas
            </label>

            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
              <div className="flex items-start gap-2">
                <WandSparkles size={16} className="mt-0.5 text-violet-300" />
                <p>
                  Fluxo recomendado: busque um lugar ou clique no mapa, deixe o
                  endereco preencher sozinho e ajuste apenas nome, numero,
                  referencia e detalhes do CI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
