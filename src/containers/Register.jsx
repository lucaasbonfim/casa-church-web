import { Mail, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "../utils/toastHelper";

// components
import Input from "../components/Input";
import Button from "../components/Button";
import Loader from "../components/Loader";

// services
import { create } from "../services/users/usersService";

// assets
import Logo from "../assets/logo.png";

export default function Register() {
  const navigate = useNavigate();

  const schema = z
    .object({
      name: z.string().min(1, "Nome é obrigatório"),
      email: z.string().email("Email inválido"),
      password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
      confirmPassword: z.string().min(1, "Confirme sua senha"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "As senhas não coincidem",
    });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const onSubmit = async (values) => {
    try {
      const createUserData = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: "user",
      };

      const { data } = await create(createUserData);
      toastSuccess(
        data?.message || "Conta criada. Confira seu email para confirmar."
      );
      reset();
      navigate(`/confirmar-email?email=${encodeURIComponent(values.email)}`);

      return data;
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null) ||
        error?.message ||
        "Erro ao cadastrar usuário. Tente novamente.";
      toastError(apiMessage);
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
            <h1 className="text-4xl font-bold my-4">Crie sua conta</h1>
            <p className="text-white/60 text-sm">Junte-se à nossa comunidade</p>
          </div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Nome Completo"
                    name={field.name}
                    placeholder="Seu nome completo"
                    icon={User}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.name?.message}
                    className="mb-5"
                  />
                )}
              />

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

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Confirmar Senha"
                    name={field.name}
                    type="password"
                    placeholder="Confirme sua senha"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.confirmPassword?.message}
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
                Cadastrar
              </Button>
            </form>

            <div className="text-center text-white/70 text-sm mt-4">
              Já tem uma conta?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-white hover:text-neutral-400 transition-colors font-medium cursor-pointer"
              >
                Faça login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
