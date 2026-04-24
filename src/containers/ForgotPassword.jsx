import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send } from "lucide-react";
import { toastError, toastSuccess } from "../utils/toastHelper";
import Button from "../components/Button";
import Input from "../components/Input";
import Logo from "../assets/logo.png";
import { forgotPassword } from "../services/auth/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      toastError("Informe seu email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await forgotPassword(email.trim());
      const apiMessage =
        data?.message || "Se o email existir, enviaremos um link de reset.";
      setMessage(apiMessage);
      toastSuccess(apiMessage);
    } catch (error) {
      toastError(
        error?.response?.data?.message ||
          "Nao foi possivel solicitar a redefinicao de senha.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1115] px-4 py-10 text-white">
      <main className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
        <div className="text-center">
          <img
            src={Logo}
            alt="Logo Casa Church"
            width={74}
            draggable={false}
            className="mx-auto select-none"
          />

          <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
            <Mail size={34} className="text-white" />
          </div>

          <h1 className="mt-6 text-3xl font-bold">Recuperar senha</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Informe seu email e enviaremos um link para criar uma nova senha.
          </p>
        </div>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            icon={Mail}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            style={1}
            size="lg"
            loading={isSubmitting}
          >
            <Send size={18} />
            Enviar link
          </Button>
        </form>

        {message && (
          <p className="mt-5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-relaxed text-emerald-100">
            {message}
          </p>
        )}

        <div className="mt-6 text-center text-sm text-white/70">
          <Link
            to="/login"
            className="font-medium text-white transition-colors hover:text-neutral-400"
          >
            Voltar para login
          </Link>
        </div>
      </main>
    </div>
  );
}
