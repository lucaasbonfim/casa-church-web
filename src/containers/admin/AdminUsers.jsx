import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Trash2, UserCheck } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import {
  deleteUser,
  findAllUsers,
  updateUser,
} from "../../services/users/usersService";
import { toastError, toastSuccess } from "../../utils/toastHelper";

function getUsers(data) {
  if (Array.isArray(data)) return data;
  return data?.users || data?.items || [];
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => findAllUsers({ page: 1, limit: 100 }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateUser(id, body),
    onSuccess: () => {
      invalidate();
      toastSuccess("Usuario atualizado.");
    },
    onError: (error) => {
      toastError(
        error?.response?.data?.message || "Erro ao atualizar usuario.",
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

  const users = getUsers(data);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-white/60">
            Gerencie permissao e status dos usuarios cadastrados.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="grid gap-4 p-4">
              {users.map((user) => (
                <article
                  key={user.id}
                  className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h2 className="font-semibold">{user.name}</h2>
                    <p className="text-sm text-white/60">{user.email}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">
                      {user.role} •{" "}
                      {user.active === false ? "Inativo" : "Ativo"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      style={2}
                      size="sm"
                      onClick={() =>
                        updateMutation.mutate({
                          id: user.id,
                          body: {
                            role: user.role === "admin" ? "user" : "admin",
                          },
                        })
                      }
                    >
                      <Shield size={16} />
                      {user.role === "admin" ? "Tornar user" : "Tornar admin"}
                    </Button>
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
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
