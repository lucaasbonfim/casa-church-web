import { useState } from "react";
import {
  User,
  Mail,
  Type,
  MessageSquare,
  Send,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { createContact } from "../services/contacts/contactsService";
import { toastSuccess, toastError } from "../utils/toastHelper";

// components
import Input from "../components/Input";
import Button from "../components/Button";

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

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Nome é obrigatório";
    if (!formData.email) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email inválido";
    if (!formData.subject) newErrors.subject = "Assunto é obrigatório";
    if (!formData.message) newErrors.message = "Mensagem é obrigatória";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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

      // Caso queira manter a mensagem de sucesso por X segundos
      setTimeout(() => setShowSuccess(false), 5000);
      return res;
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null) ||
        error?.message ||
        "Erro ao enviar a mensagem. Tente novamente.";

      toastError(apiMessage);
      console.error(error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Entre em Contato</h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Tem alguma dúvida ou sugestão? Estamos aqui para ajudar. Preencha o
            formulário e retornaremos em breve.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informações de Contato */}
<div className="lg:col-span-1 h-full">
  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
    <h2 className="text-xl font-semibold mb-6">Informações</h2>

    <div className="space-y-5">
      {/* Email */}
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-white/10 p-2.5 mt-0.5">
          <Mail size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-medium mb-1">Email</h3>
          <p className="text-white/60 text-sm">contato@empresa.com</p>
        </div>
      </div>

      {/* Telefone */}
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-white/10 p-2.5 mt-0.5">
          <Phone size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-medium mb-1">Telefone</h3>
          <p className="text-white/60 text-sm">+55 (21) 99999-9999</p>
        </div>
      </div>

      {/* Endereço */}
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-white/10 p-2.5 mt-0.5">
          <MapPin size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-medium mb-1">Endereço</h3>
          <p className="text-white/60 text-sm">
            Taquara - Duque de Caxias, RJ
            <br />
            Brasil
          </p>
        </div>
      </div>

      {/* Mapa (agora isolado como um "filho" próprio) */}
      <div className="rounded-xl overflow-hidden border border-white/10">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d29463.606992865807!2d-43.2461818!3d-22.6183096!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x990b83903f4529%3A0x913b11ec1f7eee0b!2sTaquara%2C%20Duque%20de%20Caxias%20-%20RJ!5e0!3m2!1spt-BR!2sbr!4v1765671518718!5m2!1spt-BR!2sbr"
          width="100%"
          height="200"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  </div>

 {/* FAQ Rápido */}
  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
    <h2 className="text-xl font-semibold mb-4">Perguntas Frequentes</h2>
    <div>
      <p className="font-medium mb-1">Suporte técnico?</p>
      <p className="text-white/60">Disponível de segunda a sexta.</p>
    </div>
    <div className="space-y-3 text-sm mt-4">
      <div>
        <p className="font-medium mb-1">Tempo de resposta?</p>
        <p className="text-white/60">
          Respondemos em até 24 horas úteis.
        </p>
      </div>
    </div>
  </div>



</div>


          {/* Formulário */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
              {showSuccess ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Mensagem Enviada!</h3>
                  <p className="text-white/60 mb-6">
                    Obrigado pelo contato. Retornaremos em breve.
                  </p>
                  <button
                    onClick={() => setShowSuccess(false)}
                    className="text-white/80 hover:text-white transition"
                  >
                    Enviar nova mensagem
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">
                      Envie sua Mensagem
                    </h2>
                    <p className="text-white/60 text-sm">
                      Preencha os campos abaixo e entraremos em contato.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
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
                      <label className="block text-sm font-medium mb-1.5">
                        Mensagem
                      </label>
                      <div className="relative">
                        <textarea
                          name="message"
                          placeholder="Escreva sua mensagem detalhada..."
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/20 transition min-h-[160px] resize-none"
                        />
                        <MessageSquare
                          size={18}
                          className="absolute right-3 top-3 text-white/50 pointer-events-none"
                        />
                      </div>
                      {errors.message && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.message}
                        </div>
                      )}
                      <div className="text-white/40 text-xs mt-1.5">
                        {formData.message.length}/1000 caracteres
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-white/60 text-xs leading-relaxed">
                        <strong className="text-white">
                          Política de Privacidade:
                        </strong>{" "}
                        Seus dados serão utilizados apenas para responder sua
                        solicitação e não serão compartilhados com terceiros.
                      </div>
                    </div>

                    <Button onClick={handleSubmit} loading={isSubmitting}>
                      <Send size={18} />
                      Enviar Mensagem
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 