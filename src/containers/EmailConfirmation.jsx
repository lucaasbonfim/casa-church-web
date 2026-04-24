import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Mail, RefreshCw, XCircle } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import Logo from "../assets/logo.png";
import {
  confirmEmail,
  resendConfirmationEmail,
} from "../services/auth/authService";
import { toastError, toastSuccess } from "../utils/toastHelper";

export default function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState(token ? "loading" : "notice");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const heading = useMemo(() => {
    if (status === "success") return "Email confirmado";
    if (status === "error") return "Link invalido";
    if (status === "loading") return "Confirmando email";
    return "Confirme seu email";
  }, [status]);

  useEffect(() => {
    if (!token) return;

    let isActive = true;

    async function verifyEmail() {
      try {
        const data = await confirmEmail(token);
        if (!isActive) return;
        setStatus("success");
        setMessage(data?.message || "Email confirmado com sucesso.");
      } catch (error) {
        if (!isActive) return;
        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
            "Nao foi possivel confirmar seu email. Solicite um novo link."
        );
      }
    }

    verifyEmail();

    return () => {
      isActive = false;
    };
  }, [token]);

  async function handleResend() {
    if (!email) {
      toastError("Informe seu email para reenviar o link.");
      return;
    }

    setIsResending(true);

    try {
      const data = await resendConfirmationEmail(email);
      toastSuccess(data?.message || "Link de confirmacao enviado.");
    } catch (error) {
      toastError(
        error?.response?.data?.message ||
          "Nao foi possivel reenviar o email de confirmacao."
      );
    } finally {
      setIsResending(false);
    }
  }

  const renderIcon = () => {
    if (status === "success") {
      return <CheckCircle2 size={34} className="text-emerald-400" />;
    }

    if (status === "error") {
      return <XCircle size={34} className="text-red-400" />;
    }

    return <Mail size={34} className="text-white" />;
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center px-4 py-10">
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
            {renderIcon()}
          </div>

          <h1 className="mt-6 text-3xl font-bold">{heading}</h1>

          {status === "loading" ? (
            <p className="mt-3 text-sm text-white/60">
              Aguarde enquanto confirmamos seu acesso.
            </p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {message ||
                "Enviamos um link de confirmacao para o seu email. Depois de confirmar, voce podera entrar normalmente."}
            </p>
          )}
        </div>

        {(status === "notice" || status === "error") && (
          <div className="mt-7 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={Mail}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <Button
              fullWidth
              style={1}
              size="lg"
              onClick={handleResend}
              loading={isResending}
            >
              <RefreshCw size={18} />
              Reenviar link
            </Button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-white/70">
          <Link
            to="/login"
            className="font-medium text-white transition-colors hover:text-neutral-400"
          >
            Ir para login
          </Link>
        </div>
      </main>
    </div>
  );
}
