import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, KeyRound, Shield, Trash2, UserCheck } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import {
  deleteUser,
  findAllUsers,
  updateUser,
} from "../../services/users/usersService";
import { toastError, toastSuccess } from "../../utils/toastHelper";
import { getStoredUser, mergeStoredUser } from "../../utils/authStorage";
import {
  ADMIN_FULL_ACCESS,
  ADMIN_MODULES,
  ADMIN_MODULE_LABELS,
  getEffectiveAdminModules,
  normalizeAdminModules,
} from "../../utils/adminPermissions";

function getUsers(data) {
  if (Array.isArray(data)) return data;
  return data?.users || data?.items || [];
}

function formatDateTime(date) {
  if (!date) return "Nunca";

  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatModulesSummary(user) {
  if (user.role !== "admin") return "Sem acesso administrativo";

  const modules = getEffectiveAdminModules(user);
  if (modules.includes(ADMIN_FULL_ACCESS)) return "Acesso total";

  return modules
    .map((module) => ADMIN_MODULE_LABELS[module] || module)
    .join(", ");
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [editingModulesForUserId, setEditingModulesForUserId] = useState(null);
  const [draftModules, setDraftModules] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => findAllUsers({ page: 1, limit: 100 }),
  });

  const users = getUsers(data);
  const editingUser = useMemo(
    () => users.find((user) => user.id === editingModulesForUserId) || null,
    [users, editingModulesForUserId]
  );
  const sortedAndFilteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...users]
      .sort((a, b) => {
        const aPriority = a.role === "admin" ? 0 : 1;
        const bPriority = b.role === "admin" ? 0 : 1;

        if (aPriority !== bPriority) return aPriority - bPriority;
        return String(a.name || "").localeCompare(String(b.name || ""), "pt-BR");
      })
      .filter((user) => {
        if (roleFilter !== "all" && user.role !== roleFilter) return false;

        if (!normalizedSearch) return true;

        const name = String(user.name || "").toLowerCase();
        const email = String(user.email || "").toLowerCase();

        return (
          name.includes(normalizedSearch) || email.includes(normalizedSearch)
        );
      });
  }, [users, roleFilter, searchTerm]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateUser(id, body),
    onSuccess: (result, variables) => {
      const loggedUser = getStoredUser();
      const updatedUser = result?.user ?? result;

      if (loggedUser?.id && updatedUser?.id === loggedUser.id) {
        mergeStoredUser({
          role: updatedUser.role,
          adminModules: updatedUser.adminModules || [],
        });
      }

      invalidate();
      toastSuccess("Usuario atualizado.");
    },
    onError: (error) => {
      toastError(
        error?.response?.data?.message || "Erro ao atualizar usuario."
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      invalidate();
      toastSuccess("Usuario removido.");
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao remover usuario.");
    },
  });

  function openModuleEditor(user, options = {}) {
    const { forPromotion = false } = options;
    setEditingModulesForUserId(user.id);
    setDraftModules(forPromotion ? [] : getEffectiveAdminModules(user));
  }

  function closeModuleEditor() {
    setEditingModulesForUserId(null);
    setDraftModules([]);
  }

  function toggleAllAccess() {
    setDraftModules((current) =>
      current.includes(ADMIN_FULL_ACCESS) ? [] : [ADMIN_FULL_ACCESS]
    );
  }

  function toggleModule(moduleKey) {
    setDraftModules((current) => {
      const normalizedCurrent = current.includes(ADMIN_FULL_ACCESS) ? [] : current;
      return normalizedCurrent.includes(moduleKey)
        ? normalizedCurrent.filter((module) => module !== moduleKey)
        : [...normalizedCurrent, moduleKey];
    });
  }

  function saveModules(userId) {
    if (
      !draftModules.includes(ADMIN_FULL_ACCESS) &&
      draftModules.length === 0
    ) {
      toastError("Selecione pelo menos um modulo ou marque acesso total.");
      return;
    }

    const normalized = normalizeAdminModules(draftModules);
    const isPromotion = editingUser?.id === userId && editingUser?.role !== "admin";

    updateMutation.mutate({
      id: userId,
      body: {
        ...(isPromotion ? { role: "admin" } : {}),
        adminModules: normalized,
      },
    }, {
      onSuccess: () => {
        closeModuleEditor();
      },
    });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-white/60">
            Gerencie status, papel e modulos administrativos de cada usuario.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "Todos" },
                  { value: "admin", label: "Admins" },
                  { value: "user", label: "Usuarios" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRoleFilter(option.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      roleFilter === option.value
                        ? "bg-white text-black"
                        : "bg-black/25 text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="w-full md:max-w-sm">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por nome ou email"
                  className="h-10 w-full rounded-lg border border-white/15 bg-black/25 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-white/35"
                />
              </div>
            </div>

            <div className="grid gap-4 p-4">
              {sortedAndFilteredUsers.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-center text-sm text-white/60">
                  Nenhum usuario encontrado com os filtros atuais.
                </div>
              ) : null}

              {sortedAndFilteredUsers.map((user) => (
                <article
                  key={user.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <h2 className="font-semibold">{user.name}</h2>
                      <p className="text-sm text-white/60">{user.email}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                        {user.role} | {user.active === false ? "Inativo" : "Ativo"}
                      </p>
                      <p className="pt-1 text-xs text-white/50">
                        Ultimo login: {formatDateTime(user.lastLoginAt)}
                      </p>
                      <p className="pt-1 text-xs text-white/60">
                        Modulos: {formatModulesSummary(user)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        style={2}
                        size="sm"
                        onClick={() =>
                          user.role === "admin"
                            ? updateMutation.mutate({
                                id: user.id,
                                body: { role: "user", adminModules: [] },
                              })
                            : openModuleEditor(user, { forPromotion: true })
                        }
                      >
                        <Shield size={16} />
                        {user.role === "admin" ? "Tornar user" : "Tornar admin"}
                      </Button>

                      {user.role === "admin" ? (
                        <Button
                          style={2}
                          size="sm"
                          onClick={() =>
                            editingModulesForUserId === user.id
                              ? closeModuleEditor()
                              : openModuleEditor(user)
                          }
                        >
                          <KeyRound size={16} />
                          Permissoes
                        </Button>
                      ) : null}

                      <Button
                        style={2}
                        size="sm"
                        onClick={() =>
                          updateMutation.mutate({
                            id: user.id,
                            body: { active: user.active === false },
                          })
                        }
                      >
                        <UserCheck size={16} />
                        {user.active === false ? "Ativar" : "Desativar"}
                      </Button>

                      <Button
                        style={2}
                        size="sm"
                        onClick={() => deleteMutation.mutate(user.id)}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {editingUser?.id === user.id ? (
                    <div className="mt-4 rounded-xl border border-white/15 bg-[#1a1f2a] p-4 md:p-5">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          Modulos administrativos
                        </p>
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80">
                          {draftModules.includes(ADMIN_FULL_ACCESS)
                            ? "Acesso total"
                            : `${draftModules.length} modulo(s) selecionado(s)`}
                        </span>
                      </div>

                      {user.role !== "admin" ? (
                        <div className="mb-3 rounded-lg border border-blue-300/25 bg-blue-400/10 px-3 py-2 text-xs text-blue-100">
                          Defina as permissoes antes de promover este usuario para admin.
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={toggleAllAccess}
                        className={`mb-3 flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-colors ${
                          draftModules.includes(ADMIN_FULL_ACCESS)
                            ? "border-white/35 bg-white/12 text-white"
                            : "border-white/15 bg-black/25 text-white/85 hover:border-white/25 hover:bg-black/35"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">Acesso total</p>
                          <p className="text-xs text-white/60">
                            Libera todas as areas administrativas para este usuario
                          </p>
                        </div>
                        {draftModules.includes(ADMIN_FULL_ACCESS) ? (
                          <CheckCircle2 size={18} className="text-white" />
                        ) : (
                          <Circle size={18} className="text-white/45" />
                        )}
                      </button>

                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {ADMIN_MODULES.map((module) => {
                          const selected =
                            draftModules.includes(ADMIN_FULL_ACCESS) ||
                            draftModules.includes(module.key);
                          const disabled = draftModules.includes(ADMIN_FULL_ACCESS);

                          return (
                            <button
                              key={module.key}
                              type="button"
                              disabled={disabled}
                              onClick={() => toggleModule(module.key)}
                              className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                                selected
                                  ? "border-white/35 bg-white/12 text-white"
                                  : "border-white/15 bg-black/25 text-white/80 hover:border-white/25 hover:bg-black/35"
                              } ${disabled ? "opacity-55 cursor-not-allowed" : ""}`}
                            >
                              <span>{module.label}</span>
                              {selected ? (
                                <CheckCircle2 size={16} className="text-white/95" />
                              ) : (
                                <Circle size={16} className="text-white/40" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex justify-end gap-2">
                        <Button style={2} size="sm" onClick={closeModuleEditor}>
                          Cancelar
                        </Button>
                        <Button
                          style={1}
                          size="sm"
                          onClick={() => saveModules(user.id)}
                          loading={updateMutation.isPending}
                        >
                          Salvar permissoes
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
