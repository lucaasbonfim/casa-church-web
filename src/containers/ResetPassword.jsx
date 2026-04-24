import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, KeyRound, Lock, XCircle } from "lucide-react";
import { toastError, toastSuccess } from "../utils/toastHelper";
import Button from "../components/Button";
import Input from "../components/Input";
import Logo from "../assets/logo.png";
import { resetPassword } from "../services/auth/authService";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(token ? "form" : "error");
  const [message, setMessage] = useState(
    token ? "" : "Link de redefinicao invalido ou expirado.",
  );

  const heading = useMemo(() => {
    if (status === "success") return "Senha redefinida";
    if (status === "error") return "Link invalido";
    return "Redefinir senha";
  }, [status]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!token) {
      toastError("Link de redefinicao invalido.");
      return;
    }

    if (password.length < 6) {
      toastError("A senha deve ter no minimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toastError("As senhas nao conferem.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await resetPassword(token, password);
      const apiMessage = data?.message || "Senha redefinida com sucesso.";
      setStatus("success");
      setMessage(apiMessage);
      toastSuccess(apiMessage);
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        "Nao foi possivel redefinir sua senha.";
      setStatus("error");
      setMessage(apiMessage);
      toastError(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderIcon() {
    if (status === "success") {
      return <CheckCircle2 size={34} className="text-emerald-400" />;
    }

    if (status === "error") {
      return <XCircle size={34} className="text-red-400" />;
    }

    return <KeyRound size={34} className="text-white" />;
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
            {renderIcon()}
          </div>

          <h1 className="mt-6 text-3xl font-bold">{heading}</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {message || "Crie uma nova senha para acessar sua conta."}
          </p>
        </div>

        {status === "form" && (
          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Nova senha"
              type="password"
              placeholder="Minimo 6 caracteres"
              icon={Lock}
              value={password}
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
            />

            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Digite a senha novamente"
              icon={Lock}
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(event) => setConfirmPassword(event.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              style={1}
              size="lg"
              loading={isSubmitting}
            >
              Redefinir senha
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-white/70">
          {status === "success" ? (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="cursor-pointer font-medium text-white transition-colors hover:text-neutral-400"
            >
              Ir para login
            </button>
          ) : (
            <Link
              to="/esqueci-senha"
              className="font-medium text-white transition-colors hover:text-neutral-400"
            >
              Solicitar novo link
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
