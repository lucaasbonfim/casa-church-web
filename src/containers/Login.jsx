import axios from "axios";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toastError } from "../utils/toastHelper";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// components
import Input from "../components/Input";
import Button from "../components/Button";

import { login } from "../services/auth/authService";
import { setStoredUser } from "../utils/authStorage";

// assets
import Logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

  const schema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = async (formValues) => {
    try {
      const res = await login(formValues);
      setStoredUser({
        token: res?.token,
        name: res?.name || "",
        email: res?.email || "",
        profileImage: res?.profileImage || "",
      });
      // eslint-disable-next-line react-hooks/immutability
      axios.defaults.headers.common["Authorization"] = res?.token
        ? res.token
        : "";
      navigate("/");
      return res;
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null) ||
        error?.message ||
        "Erro ao realizar login. Tente novamente.";
      toastError(apiMessage);
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 mb-6">
          <div className="text-center mb-2">
            <img
              src={Logo}
              alt="Logo Casa Church"
              width={74}
              draggable={false}
              className="select-none mx-auto"
            />
            <h1 className="text-4xl font-bold my-4">Seja bem vindo</h1>
            <p className="text-white/60 text-sm">Faça login para continuar</p>
          </div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Email"
                    name={field.name}
                    type="email"
                    placeholder="seu@email.com"
                    icon={Mail}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.email?.message}
                    className="mb-5"
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Senha"
                    name={field.name}
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.password?.message}
                    className="mb-5"
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                style={1}
                size="lg"
                loading={isSubmitting}
              >
                Entrar
              </Button>
            </form>

            <div className="text-center text-white/70 text-sm mt-4">
              Não tem uma conta?{" "}
              <button
                onClick={() => navigate("/registrar")}
                className="text-white hover:text-neutral-400 transition-colors font-medium cursor-pointer"
              >
                Registre-se
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
