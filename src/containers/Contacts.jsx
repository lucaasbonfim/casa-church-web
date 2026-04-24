import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Type,
  User,
} from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import { createContact } from "../services/contacts/contactsService";
import { findPageContent } from "../services/pageContent/pageContentService";
import { toastError, toastSuccess } from "../utils/toastHelper";

const defaultContent = {
  heroTitle: "Entre em Contato",
  heroSubtitle:
    "Tem alguma duvida ou sugestao? Estamos aqui para ajudar. Preencha o formulario e retornaremos em breve.",
  email: "contato@empresa.com",
  phone: "+55 (21) 99999-9999",
  address: "Taquara - Duque de Caxias, RJ\nBrasil",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d29463.606992865807!2d-43.2461818!3d-22.6183096!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x990b83903f4529%3A0x913b11ec1f7eee0b!2sTaquara%2C%20Duque%20de%20Caxias%20-%20RJ!5e0!3m2!1spt-BR!2sbr!4v1765671518718!5m2!1spt-BR!2sbr",
  faqTitle: "Perguntas Frequentes",
  faqItems: [
    {
      question: "Suporte tecnico?",
      answer: "Disponivel de segunda a sexta.",
    },
    {
      question: "Tempo de resposta?",
      answer: "Respondemos em ate 24 horas uteis.",
    },
  ],
  formTitle: "Envie sua Mensagem",
  formSubtitle: "Preencha os campos abaixo e entraremos em contato.",
  privacyText:
    "Seus dados serao utilizados apenas para responder sua solicitacao e nao serao compartilhados com terceiros.",
};

export default function Contacts() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data } = useQuery({
    queryKey: ["page-content", "contacts"],
    queryFn: () => findPageContent("contacts"),
  });
  const content = { ...defaultContent, ...(data || {}) };
  const faqItems = content.faqItems?.length
    ? content.faqItems
    : defaultContent.faqItems;

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Nome e obrigatorio";
    if (!formData.email) newErrors.email = "Email e obrigatorio";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalido";
    }
    if (!formData.subject) newErrors.subject = "Assunto e obrigatorio";
    if (!formData.message) newErrors.message = "Mensagem e obrigatoria";
    return newErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createContact(formData);
      setShowSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      toastSuccess(res?.message || "Mensagem enviada com sucesso");
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      toastError(
        error?.response?.data?.message ||
          error?.message ||
          "Erro ao enviar a mensagem. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">{content.heroTitle}</h1>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            {content.heroSubtitle}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <aside className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h2 className="mb-6 text-xl font-semibold">Informacoes</h2>

              <div className="space-y-5">
                <InfoItem icon={Mail} label="Email" value={content.email} />
                <InfoItem icon={Phone} label="Telefone" value={content.phone} />
                <InfoItem
                  icon={MapPin}
                  label="Endereco"
                  value={content.address}
                />

                {content.mapEmbedUrl && (
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <iframe
                      src={content.mapEmbedUrl}
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-xl font-semibold">{content.faqTitle}</h2>
              <div className="space-y-4 text-sm">
                {faqItems.map((item, index) => (
                  <div key={`${item.question}-${index}`}>
                    <p className="mb-1 font-medium">{item.question}</p>
                    <p className="text-white/60">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              {showSuccess ? (
                <div className="py-12 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">Mensagem enviada!</h3>
                  <p className="mb-6 text-white/60">
                    Obrigado pelo contato. Retornaremos em breve.
                  </p>
                  <button
                    onClick={() => setShowSuccess(false)}
                    className="text-white/80 transition hover:text-white"
                  >
                    Enviar nova mensagem
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="mb-2 text-2xl font-bold">
                      {content.formTitle}
                    </h2>
                    <p className="text-sm text-white/60">
                      {content.formSubtitle}
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <Input
                        label="Nome Completo"
                        name="name"
                        type="text"
                        placeholder="Seu nome completo"
                        icon={User}
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                      />
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                      />
                    </div>

                    <Input
                      label="Assunto"
                      name="subject"
                      type="text"
                      placeholder="Sobre o que deseja falar?"
                      icon={Type}
                      value={formData.subject}
                      onChange={handleChange}
                      error={errors.subject}
                    />

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        Mensagem
                      </label>
                      <div className="relative">
                        <textarea
                          name="message"
                          placeholder="Escreva sua mensagem detalhada..."
                          value={formData.message}
                          onChange={handleChange}
                          className="min-h-[160px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-white outline-none transition placeholder:text-white/50 focus:ring-2 focus:ring-white/20"
                        />
                        <MessageSquare
                          size={18}
                          className="pointer-events-none absolute right-3 top-3 text-white/50"
                        />
                      </div>
                      {errors.message && (
                        <div className="mt-1 text-xs text-red-500">
                          {errors.message}
                        </div>
                      )}
                      <div className="mt-1.5 text-xs text-white/40">
                        {formData.message.length}/1000 caracteres
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/60">
                      <strong className="text-white">
                        Politica de Privacidade:
                      </strong>{" "}
                      {content.privacyText}
                    </div>

                    <Button onClick={handleSubmit} loading={isSubmitting}>
                      <Send size={18} />
                      Enviar Mensagem
                    </Button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 rounded-lg bg-white/10 p-2.5">
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <h3 className="mb-1 font-medium">{label}</h3>
        <p className="whitespace-pre-line text-sm text-white/60">{value}</p>
      </div>
    </div>
  );
}
