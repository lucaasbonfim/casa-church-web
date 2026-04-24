import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Save } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Loader from "../../components/Loader";
import {
  findPageContent,
  updatePageContent,
} from "../../services/pageContent/pageContentService";
import { toastError, toastSuccess } from "../../utils/toastHelper";

const pageConfigs = {
  about: {
    label: "Sobre",
    fields: [
      ["heroTitle", "Titulo principal"],
      ["heroSubtitle", "Subtitulo", "textarea"],
      ["introTitle", "Titulo da secao"],
      ["introText", "Texto da secao", "textarea"],
      ["cards.0.title", "Card 1 - titulo"],
      ["cards.0.text", "Card 1 - texto", "textarea"],
      ["cards.1.title", "Card 2 - titulo"],
      ["cards.1.text", "Card 2 - texto", "textarea"],
      ["cards.2.title", "Card 3 - titulo"],
      ["cards.2.text", "Card 3 - texto", "textarea"],
      ["sectionTitle", "Titulo complementar"],
      ["sectionText", "Texto complementar", "textarea"],
      ["ctaTitle", "CTA - titulo"],
      ["ctaText", "CTA - texto"],
      ["ctaButtonText", "CTA - texto do botao"],
      ["ctaButtonLink", "CTA - link do botao"],
    ],
  },
  contacts: {
    label: "Contatos",
    fields: [
      ["heroTitle", "Titulo principal"],
      ["heroSubtitle", "Subtitulo", "textarea"],
      ["email", "Email"],
      ["phone", "Telefone"],
      ["address", "Endereco", "textarea"],
      ["mapEmbedUrl", "URL embed do mapa", "textarea"],
      ["faqTitle", "Titulo do FAQ"],
      ["faqItems.0.question", "FAQ 1 - pergunta"],
      ["faqItems.0.answer", "FAQ 1 - resposta"],
      ["faqItems.1.question", "FAQ 2 - pergunta"],
      ["faqItems.1.answer", "FAQ 2 - resposta"],
      ["formTitle", "Formulario - titulo"],
      ["formSubtitle", "Formulario - subtitulo"],
      ["privacyText", "Texto de privacidade", "textarea"],
    ],
  },
  donations: {
    label: "Doacoes",
    fields: [
      ["eyebrow", "Selo"],
      ["title", "Titulo principal"],
      ["description", "Descricao", "textarea"],
      ["howTitle", "Como ofertar - titulo"],
      ["howText", "Como ofertar - texto", "textarea"],
      ["freedomTitle", "Contribuicao - titulo"],
      ["freedomText", "Contribuicao - texto", "textarea"],
      ["note", "Nota final", "textarea"],
      ["pixLabel", "Pix - selo"],
      ["pixTitle", "Pix - titulo"],
      ["pixDescription", "Pix - descricao", "textarea"],
      ["pixQrCodeUrl", "URL do QR Code Pix"],
    ],
  },
};

function getValue(data, path) {
  return path.split(".").reduce((value, key) => value?.[key], data) ?? "";
}

function setValue(data, path, value) {
  const next = structuredClone(data || {});
  const parts = path.split(".");
  let current = next;

  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    const nextPart = parts[index + 1];

    if (isLast) {
      current[part] = value;
      return;
    }

    if (current[part] === undefined) {
      current[part] = Number.isInteger(Number(nextPart)) ? [] : {};
    }

    current = current[part];
  });

  return next;
}

export default function AdminPageContent({ initialSlug = "about" }) {
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();
  const config = pageConfigs[activeSlug];

  const { data, isLoading } = useQuery({
    queryKey: ["page-content", activeSlug],
    queryFn: () => findPageContent(activeSlug),
  });

  useEffect(() => {
    setActiveSlug(initialSlug);
  }, [initialSlug]);

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => updatePageContent(activeSlug, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
      toastSuccess("Conteudo atualizado com sucesso.");
    },
    onError: (error) => {
      toastError(
        error?.response?.data?.message ||
          "Nao foi possivel atualizar a pagina.",
      );
    },
  });

  const fields = useMemo(() => config.fields, [config]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Paginas publicas</h1>
            <p className="text-white/60">
              Edite os textos exibidos nas paginas institucionais.
            </p>
          </div>

          <Button
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
          >
            <Save size={18} />
            Salvar alteracoes
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(pageConfigs).map(([slug, item]) => (
            <button
              key={slug}
              type="button"
              onClick={() => setActiveSlug(slug)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${
                activeSlug === slug
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FileText size={16} />
              {item.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map(([path, label, type]) => (
                <div
                  key={path}
                  className={type === "textarea" ? "md:col-span-2" : ""}
                >
                  {type === "textarea" ? (
                    <>
                      <label className="mb-2 block text-sm font-medium text-white/90">
                        {label}
                      </label>
                      <textarea
                        value={getValue(formData, path)}
                        onChange={(event) =>
                          setFormData((current) =>
                            setValue(current, path, event.target.value),
                          )
                        }
                        className="min-h-[110px] w-full resize-y rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-neutral-500 focus:bg-white/10"
                      />
                    </>
                  ) : (
                    <Input
                      label={label}
                      value={getValue(formData, path)}
                      onChange={(event) =>
                        setFormData((current) =>
                          setValue(current, path, event.target.value),
                        )
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
