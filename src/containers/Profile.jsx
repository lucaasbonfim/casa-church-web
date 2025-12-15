import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { findUserById, updateUser } from "../services/users/usersService";
import { toastError, toastSuccess } from "../utils/toastHelper";

export default function Profile() {
  // 🔐 Padrão do projeto: pega user do localStorage
  const userStorage = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const token = userStorage?.token;

  // 🔓 Decodifica JWT (igual CreatePost)
  const userId = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.sub || decoded.id || decoded.userId;
    } catch (error) {
      console.error("Erro ao decodificar token", error);
      return null;
    }
  }, [token]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Estados de edição
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ✏️ Campos editáveis
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // 🔒 Senha
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 📡 Busca usuário
  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await findUserById(userId);
        setUser(data);
        setName(data?.name || "");
        setEmail(data?.email || "");
      } catch (error) {
        toastError(
          error?.response?.data?.message || "Erro ao carregar perfil"
        );
      } finally {
        setLoading(false);
      }
    }

    if (!token || !userId) {
      toastError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    fetchUser();
  }, [token, userId]);

  function getInitials(fullName) {
    if (!fullName) return "";
    return fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }

  // 💾 Atualiza nome/email
  async function handleUpdateProfile() {
    if (!name.trim() || !email.trim()) {
      toastError("Preencha nome e e-mail");
      return;
    }

    try {
      const updated = await updateUser(userId, {
        name: name.trim(),
        email: email.trim(),
      });

      setUser((prev) => ({
        ...(prev || {}),
        ...(updated || {}),
        name: updated?.name ?? name.trim(),
        email: updated?.email ?? email.trim(),
      }));

      setIsEditing(false);
      toastSuccess("Perfil atualizado com sucesso");
    } catch (error) {
      toastError(
        error?.response?.data?.message || "Erro ao atualizar perfil"
      );
    }
  }

  // 🔑 Atualiza senha
  async function handleUpdatePassword() {
    if (!password || password !== confirmPassword) {
      toastError("As senhas não conferem");
      return;
    }

    try {
      await updateUser(userId, { password });
      toastSuccess("Senha atualizada com sucesso");

      setPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
    } catch (error) {
      toastError(
        error?.response?.data?.message || "Erro ao atualizar senha"
      );
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setName(user?.name || "");
    setEmail(user?.email || "");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white px-4 py-12">
        <p className="text-white/60">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <h1 className="text-4xl font-bold">Meu perfil</h1>

        {/* Identidade */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold">
            {getInitials(user?.name || userStorage?.name)}
          </div>

          <div>
            <p className="text-xl font-semibold">
              {user?.name || userStorage?.name || "—"}
            </p>
            <p className="text-white/60">
              {user?.email || userStorage?.email || "—"}
            </p>
          </div>
        </div>

        {/* Informações da conta */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Informações da conta</h2>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                Editar
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                >
                  Salvar
                </button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-2 text-white/70">
              <p>
                <strong className="text-white">Nome:</strong> {user?.name}
              </p>
              <p>
                <strong className="text-white">E-mail:</strong> {user?.email}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome"
                className="bg-white/10 rounded-xl px-4 py-3 outline-none"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="bg-white/10 rounded-xl px-4 py-3 outline-none"
              />
            </div>
          )}
        </div>

        {/* Segurança */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Segurança</h2>

            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                Alterar senha
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsChangingPassword(false);
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                Cancelar
              </button>
            )}
          </div>

          {!isChangingPassword ? (
            <p className="text-white/60">
              Para manter sua conta segura, altere sua senha regularmente.
            </p>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nova senha"
                  className="bg-white/10 rounded-xl px-4 py-3 outline-none"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar senha"
                  className="bg-white/10 rounded-xl px-4 py-3 outline-none"
                />
              </div>

              <button
                onClick={handleUpdatePassword}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                Salvar nova senha
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
