import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Edit3, Image, MapPin } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import AdminModal from "../../components/AdminModal";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Loader from "../../components/Loader";
import { findHomeContent, updateHomeContent } from "../../services/homeContent/homeContentService";
import { toastError, toastSuccess } from "../../utils/toastHelper";

const initialFormData = {
  heroTitle: "",
  heroSubtitle: "",
  heroImageUrl: "",
  aboutTitle: "",
  aboutDescription: "",
  aboutImageUrl: "",
  aboutButtonText: "",
  aboutButtonLink: "",
  eventsTitle: "",
  eventsDescription: "",
  eventsImageUrl: "",
  eventsButtonText: "",
  eventsButtonLink: "",
  ciTitle: "",
  ciDescription: "",
  ciImageUrl: "",
  ciButtonText: "",
  ciButtonLink: "",
  footerWelcomePhrase: "Você é bem vindo a casa!",
  footerServiceDays: "Domingos, 10h e 19h",
  footerAddress: "Endereço da Casa Church",
};

const mapHomeContentToFormData = (data) => ({
  heroTitle: data?.heroTitle || "",
  heroSubtitle: data?.heroSubtitle || "",
  heroImageUrl: data?.heroImageUrl || "",
  aboutTitle: data?.aboutTitle || "",
  aboutDescription: data?.aboutDescription || "",
  aboutImageUrl: data?.aboutImageUrl || "",
  aboutButtonText: data?.aboutButtonText || "",
  aboutButtonLink: data?.aboutButtonLink || "",
  eventsTitle: data?.eventsTitle || "",
  eventsDescription: data?.eventsDescription || "",
  eventsImageUrl: data?.eventsImageUrl || "",
  eventsButtonText: data?.eventsButtonText || "",
  eventsButtonLink: data?.eventsButtonLink || "",
  ciTitle: data?.ciTitle || "",
  ciDescription: data?.ciDescription || "",
  ciImageUrl: data?.ciImageUrl || "",
  ciButtonText: data?.ciButtonText || "",
  ciButtonLink: data?.ciButtonLink || "",
  footerWelcomePhrase: data?.footerWelcomePhrase || "Você é bem vindo a casa!",
  footerServiceDays: data?.footerServiceDays || "Domingos, 10h e 19h",
  footerAddress: data?.footerAddress || "Endereço da Casa Church",
});

const sections = [
  {
    key: "hero",
    title: "Hero principal",
    description: "Faixa principal da home.",
    titleField: "heroTitle",
    descriptionField: "heroSubtitle",
    imageField: "heroImageUrl",
    descriptionLabel: "Subtitulo",
  },
  {
    key: "about",
    title: "Card Sobre nos",
    description: "Resumo institucional.",
    titleField: "aboutTitle",
    descriptionField: "aboutDescription",
    imageField: "aboutImageUrl",
    buttonTextField: "aboutButtonText",
    buttonLinkField: "aboutButtonLink",
    descriptionLabel: "Descricao",
  },
  {
    key: "events",
    title: "Card Proximos eventos",
    description: "Card de agenda e acesso rapido.",
    titleField: "eventsTitle",
    descriptionField: "eventsDescription",
    imageField: "eventsImageUrl",
    buttonTextField: "eventsButtonText",
    buttonLinkField: "eventsButtonLink",
    descriptionLabel: "Descricao",
  },
  {
    key: "ci",
    title: "Card CI",
    description: "Card para encontrar CIs.",
    titleField: "ciTitle",
    descriptionField: "ciDescription",
    imageField: "ciImageUrl",
    buttonTextField: "ciButtonText",
    buttonLinkField: "ciButtonLink",
    descriptionLabel: "Descricao",
  },
  {
    key: "footer",
    title: "Rodape",
    description: "Frase, dias de culto e endereco exibidos no rodape.",
    titleField: "footerWelcomePhrase",
    descriptionField: "footerServiceDays",
    descriptionLabel: "Dias de culto",
    titleLabel: "Frase do rodape *",
    previewIcon: CalendarDays,
    extraFields: [
      {
        field: "footerAddress",
        draftField: "address",
        label: "Endereco",
        previewLabel: "Endereco",
        icon: MapPin,
        multiline: true,
        placeholder: "Rua, numero, bairro, cidade - UF",
      },
    ],
  },
];

function HomePreviewCard({ section, formData, onEdit }) {
  const imageUrl = section.imageField ? formData[section.imageField] : "";
  const title = formData[section.titleField];
  const description = formData[section.descriptionField];
  const buttonText = section.buttonTextField
    ? formData[section.buttonTextField]
    : null;
  const buttonLink = section.buttonLinkField
    ? formData[section.buttonLinkField]
    : null;
  const PreviewIcon = section.previewIcon || Image;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {section.imageField ? (
        <div className="h-32 bg-[#141922] border-b border-white/10">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title || section.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white/35">
              <Image size={22} />
            </div>
          )}
        </div>
      ) : (
        <div className="h-32 bg-[#141922] border-b border-white/10 flex items-center justify-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/55">
            <PreviewIcon size={24} />
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
            {section.title}
          </p>
          <h3 className="mt-1 text-lg font-semibold line-clamp-1">
            {title || "Sem titulo"}
          </h3>
          <p className="mt-2 text-sm text-white/65 line-clamp-2">
            {description || "Sem descricao"}
          </p>
        </div>

        {(buttonText || buttonLink || section.extraFields?.length) && (
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70 space-y-1">
            {buttonText && <p>Botao: {buttonText}</p>}
            {buttonLink && <p className="truncate">Link: {buttonLink}</p>}
            {section.extraFields?.map((field) => {
              const value = formData[field.field];
              return value ? (
                <p key={field.field} className="line-clamp-2">
                  {field.previewLabel}: {value}
                </p>
              ) : null;
            })}
          </div>
        )}

        <Button onClick={onEdit} style={2} fullWidth>
          <Edit3 size={16} />
          Editar
        </Button>
      </div>
    </article>
  );
}

export default function AdminHomeContent() {
  const [localFormData, setLocalFormData] = useState(null);
  const [activeSectionKey, setActiveSectionKey] = useState(null);
  const [sectionDraft, setSectionDraft] = useState({});
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-home-content"],
    queryFn: findHomeContent,
  });

  const apiFormData = useMemo(
    () => (data ? mapHomeContentToFormData(data) : initialFormData),
    [data]
  );

  const formData = localFormData || apiFormData;

  const activeSection = useMemo(
    () => sections.find((section) => section.key === activeSectionKey) || null,
    [activeSectionKey]
  );

  const updateMutation = useMutation({
    mutationFn: updateHomeContent,
    onSuccess: (updatedContent) => {
      setLocalFormData(mapHomeContentToFormData(updatedContent));
      queryClient.invalidateQueries({ queryKey: ["home-content-public"] });
      closeEditModal();
      toastSuccess("Conteudo da home atualizado com sucesso.");
    },
    onError: (error) => {
      toastError(
        error?.response?.data?.message || "Erro ao atualizar conteudo da home."
      );
    },
  });

  const openEditModal = (section) => {
    setActiveSectionKey(section.key);
    const nextDraft = {
      title: formData[section.titleField] || "",
      description: formData[section.descriptionField] || "",
      imageUrl: section.imageField ? formData[section.imageField] || "" : "",
      buttonText: section.buttonTextField
        ? formData[section.buttonTextField] || ""
        : "",
      buttonLink: section.buttonLinkField
        ? formData[section.buttonLinkField] || ""
        : "",
    };

    section.extraFields?.forEach((field) => {
      nextDraft[field.draftField] = formData[field.field] || "";
    });

    setSectionDraft(nextDraft);
  };

  const closeEditModal = () => {
    setActiveSectionKey(null);
    setSectionDraft({});
  };

  const saveSectionDraft = (event) => {
    event.preventDefault();

    if (!activeSection) return;
    if (!sectionDraft.title?.trim()) {
      toastError("O titulo dessa secao e obrigatorio.");
      return;
    }

    const nextData = {
      ...formData,
      [activeSection.titleField]: sectionDraft.title,
      [activeSection.descriptionField]: sectionDraft.description,
    };

    if (activeSection.imageField) {
      nextData[activeSection.imageField] = sectionDraft.imageUrl;
    }

    if (activeSection.buttonTextField) {
      nextData[activeSection.buttonTextField] = sectionDraft.buttonText || "";
    }

    if (activeSection.buttonLinkField) {
      nextData[activeSection.buttonLinkField] = sectionDraft.buttonLink || "";
    }

    activeSection.extraFields?.forEach((field) => {
      nextData[field.field] = sectionDraft[field.draftField] || "";
    });

    setLocalFormData(nextData);
    updateMutation.mutate(nextData);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Conteudo da Home</h1>
            <p className="text-white/60">
              Visualize cada card com preview e edite por modal. Cada secao e
              salva automaticamente ao aplicar.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
            {sections.map((section) => (
              <HomePreviewCard
                key={section.key}
                section={section}
                formData={formData}
                onEdit={() => openEditModal(section)}
              />
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-white/60">
          Dica: para imagens dinamicas, suba o arquivo no seu storage/CDN e cole
          aqui apenas a URL final.
        </div>
      </div>

      <AdminModal
        isOpen={Boolean(activeSection)}
        onClose={closeEditModal}
        title={activeSection ? `Editar: ${activeSection.title}` : "Editar"}
        onSubmit={saveSectionDraft}
        submitText="Salvar secao"
        isLoading={updateMutation.isPending}
      >
        <Input
          label={activeSection?.titleLabel || "Titulo *"}
          value={sectionDraft.title || ""}
          onChange={(event) =>
            setSectionDraft((current) => ({
              ...current,
              title: event.target.value,
            }))
          }
        />

        <div>
          <label className="block text-sm font-medium mb-1.5">
            {activeSection?.descriptionLabel || "Descricao"}
          </label>
          <textarea
            value={sectionDraft.description || ""}
            onChange={(event) =>
              setSectionDraft((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/20 transition min-h-[120px] resize-none"
            maxLength={1000}
          />
        </div>

        {activeSection?.imageField && (
          <Input
            label="URL da imagem"
            icon={Image}
            value={sectionDraft.imageUrl || ""}
            onChange={(event) =>
              setSectionDraft((current) => ({
                ...current,
                imageUrl: event.target.value,
              }))
            }
            placeholder="https://..."
          />
        )}

        {activeSection?.extraFields?.map((field) =>
          field.multiline ? (
            <div key={field.field}>
              <label className="block text-sm font-medium mb-1.5">
                {field.label}
              </label>
              <textarea
                value={sectionDraft[field.draftField] || ""}
                onChange={(event) =>
                  setSectionDraft((current) => ({
                    ...current,
                    [field.draftField]: event.target.value,
                  }))
                }
                placeholder={field.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/20 transition min-h-[96px] resize-none"
                maxLength={1000}
              />
            </div>
          ) : (
            <Input
              key={field.field}
              label={field.label}
              icon={field.icon}
              value={sectionDraft[field.draftField] || ""}
              onChange={(event) =>
                setSectionDraft((current) => ({
                  ...current,
                  [field.draftField]: event.target.value,
                }))
              }
              placeholder={field.placeholder}
            />
          )
        )}

        {activeSection?.buttonTextField && (
          <Input
            label="Texto do botao"
            value={sectionDraft.buttonText || ""}
            onChange={(event) =>
              setSectionDraft((current) => ({
                ...current,
                buttonText: event.target.value,
              }))
            }
          />
        )}

        {activeSection?.buttonLinkField && (
          <Input
            label="Link do botao"
            value={sectionDraft.buttonLink || ""}
            onChange={(event) =>
              setSectionDraft((current) => ({
                ...current,
                buttonLink: event.target.value,
              }))
            }
            placeholder="/sobre, /eventos, /cis ou https://..."
          />
        )}
      </AdminModal>
    </AdminLayout>
  );
}
