import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Trash2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import {
  deleteContact,
  findAllContacts,
} from "../../services/contacts/contactsService";
import { toastError, toastSuccess } from "../../utils/toastHelper";

function getMessages(data) {
  if (Array.isArray(data)) return data;
  return data?.contactMessages || data?.items || [];
}

export default function AdminContacts() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: () =>
      findAllContacts({
        page: 1,
        limit: 100,
        orderBy: "createdAt",
        orderDirection: "DESC",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      toastSuccess("Mensagem removida.");
    },
    onError: (error) => {
      toastError(error?.response?.data?.message || "Erro ao remover mensagem.");
    },
  });

  const messages = getMessages(data);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mensagens de contato</h1>
          <p className="text-white/60">
            Acompanhe as mensagens enviadas pelo formulario publico.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : messages.length ? (
          <div className="grid gap-4">
            {messages.map((message) => (
              <article
                key={message.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-white/55">
                      <Mail size={16} />
                      {message.email}
                    </div>
                    <h2 className="mt-2 text-xl font-semibold">
                      {message.subject}
                    </h2>
                    <p className="mt-1 text-sm text-white/60">{message.name}</p>
                  </div>

                  <Button
                    style={2}
                    size="sm"
                    onClick={() => deleteMutation.mutate(message.id)}
                    loading={deleteMutation.isPending}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                    Remover
                  </Button>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-white/75">
                  {message.message}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-white/50">
            Nenhuma mensagem recebida ainda.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
