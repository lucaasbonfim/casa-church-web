import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Avatar from "../components/Avatar";
import { findUserById, updateUser } from "../services/users/usersService";
import { toastError, toastSuccess } from "../utils/toastHelper";
import { getStoredUser, mergeStoredUser } from "../utils/authStorage";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 512;
const TARGET_IMAGE_SIZE_BYTES = 220 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Falha ao carregar imagem"));
    image.src = dataUrl;
  });
}

async function compressImageToDataUrl(file) {
  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);

  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(image.width, image.height)
  );
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Nao foi possivel processar a imagem");
  }

  context.drawImage(image, 0, 0, width, height);

  let quality = 0.82;
  let compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

  while (
    compressedDataUrl.length > TARGET_IMAGE_SIZE_BYTES * 1.37 &&
    quality > 0.45
  ) {
    quality -= 0.08;
    compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  return compressedDataUrl;
}

export default function Profile() {
  const userStorage = useMemo(() => getStoredUser(), []);
  const token = userStorage?.token;

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
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await findUserById(userId);
        setUser(data);
        setName(data?.name || "");
        setEmail(data?.email || "");
        setProfileImage(data?.profileImage || "");
      } catch (error) {
        toastError(
          error?.response?.data?.message || "Erro ao carregar perfil"
        );
      } finally {
        setLoading(false);
      }
    }

    if (!token || !userId) {
      toastError("Usuario nao autenticado");
      setLoading(false);
      return;
    }

    fetchUser();
  }, [token, userId]);

  async function handleProfileImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toastError("Selecione um arquivo de imagem valido");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toastError("A imagem deve ter no maximo 5 MB");
      event.target.value = "";
      return;
    }

    setIsProcessingImage(true);

    try {
      const imageDataUrl = await compressImageToDataUrl(file);
      setProfileImage(imageDataUrl);
    } catch {
      toastError("Nao foi possivel processar a imagem");
    } finally {
      setIsProcessingImage(false);
      event.target.value = "";
    }
  }

  async function handleUpdateProfile() {
    if (!name.trim() || !email.trim()) {
      toastError("Preencha nome e e-mail");
      return;
    }

    if (isProcessingImage) {
      toastError("Aguarde o processamento da imagem");
      return;
    }

    setIsSavingProfile(true);

    try {
      const updatedUser = await updateUser(userId, {
        name: name.trim(),
        email: email.trim(),
        profileImage: profileImage.trim(),
      });

      setUser(updatedUser);
      setName(updatedUser?.name || "");
      setEmail(updatedUser?.email || "");
      setProfileImage(updatedUser?.profileImage || "");
      mergeStoredUser({
        name: updatedUser?.name || name.trim(),
        email: updatedUser?.email || email.trim(),
        profileImage: updatedUser?.profileImage || "",
      });

      setIsEditing(false);
      toastSuccess("Perfil atualizado com sucesso");
    } catch (error) {
      toastError(
        error?.response?.data?.message || "Erro ao atualizar perfil"
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleUpdatePassword() {
    if (!password || password !== confirmPassword) {
      toastError("As senhas nao conferem");
      return;
    }

    setIsSavingPassword(true);

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
    } finally {
      setIsSavingPassword(false);
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setName(user?.name || "");
    setEmail(user?.email || "");
    setProfileImage(user?.profileImage || "");
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
        <h1 className="text-4xl font-bold">Meu perfil</h1>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 flex flex-col md:flex-row md:items-center gap-6">
          <Avatar
            name={user?.name || userStorage?.name}
            src={user?.profileImage || userStorage?.profileImage}
            size="2xl"
          />

          <div className="flex-1">
            <p className="text-xl font-semibold">
              {user?.name || userStorage?.name || "-"}
            </p>
            <p className="text-white/60">
              {user?.email || userStorage?.email || "-"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Informacoes da conta</h2>

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
                  disabled={isSavingProfile || isProcessingImage}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-60"
                  disabled={isSavingProfile || isProcessingImage}
                >
                  {isSavingProfile
                    ? "Salvando..."
                    : isProcessingImage
                    ? "Processando..."
                    : "Salvar"}
                </button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-3 text-white/70">
              <p>
                <strong className="text-white">Nome:</strong> {user?.name}
              </p>
              <p>
                <strong className="text-white">E-mail:</strong> {user?.email}
              </p>
              <p>
                <strong className="text-white">Foto:</strong>{" "}
                {user?.profileImage ? "Configurada" : "Nao configurada"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 md:items-center">
                <Avatar name={name} src={profileImage} size="2xl" />

                <div className="space-y-3">
                  <label className="block">
                    <span className="block text-sm text-white/70 mb-2">
                      Imagem de perfil
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="block w-full text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white hover:file:bg-white/20"
                    />
                  </label>

                  <p className="text-xs text-white/50">
                    A imagem sera reduzida automaticamente para caber no envio.
                  </p>

                  <button
                    type="button"
                    onClick={() => setProfileImage("")}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                    disabled={isProcessingImage}
                  >
                    Remover imagem
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nome"
                  className="bg-white/10 rounded-xl px-4 py-3 outline-none"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="E-mail"
                  className="bg-white/10 rounded-xl px-4 py-3 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Seguranca</h2>

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
                disabled={isSavingPassword}
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
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nova senha"
                  className="bg-white/10 rounded-xl px-4 py-3 outline-none"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirmar senha"
                  className="bg-white/10 rounded-xl px-4 py-3 outline-none"
                />
              </div>

              <button
                onClick={handleUpdatePassword}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition disabled:opacity-60"
                disabled={isSavingPassword}
              >
                {isSavingPassword ? "Salvando..." : "Salvar nova senha"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
