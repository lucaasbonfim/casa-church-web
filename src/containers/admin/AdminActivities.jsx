import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Activity, Check, ChevronDown, Search } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import { findAllUsers } from "../../services/users/usersService";
import { findUserActivities } from "../../services/admin/adminService";
import {
  ACTION_OPTIONS,
  formatActivityDateTime,
  formatActivityDescription,
  getActivityActionLabel,
} from "../../utils/activityUtils";

const PAGE_SIZE = 20;

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
  searchable = false,
  searchPlaceholder = "Buscar",
}) {
  const [search, setSearch] = useState("");

  const selectedLabel = options.find((option) => option.value === value)?.label;
  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;

    const normalizedSearch = search.toLowerCase().trim();
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedSearch)
    );
  }, [options, search, searchable]);

  return (
    <div className="space-y-2">
      <span className="text-sm text-white/60">{label}</span>

      <DropdownMenu.Root
        onOpenChange={(open) => {
          if (!open) setSearch("");
        }}
      >
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex h-11 w-full items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 text-left text-sm text-white transition-colors hover:border-white/20"
          >
            <span className="truncate">{selectedLabel || "Selecionar"}</span>
            <ChevronDown size={16} className="text-white/50" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={8}
            className="z-50 w-[var(--radix-dropdown-menu-trigger-width)] rounded-lg border border-white/10 bg-[#10141d] p-2 shadow-2xl"
          >
            {searchable ? (
              <div className="mb-2 flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-2">
                <Search size={14} className="text-white/40" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => event.stopPropagation()}
                  placeholder={searchPlaceholder}
                  className="h-9 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                />
              </div>
            ) : null}

            <DropdownMenu.RadioGroup value={value} onValueChange={onValueChange}>
              <div className="max-h-72 overflow-y-auto pr-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <DropdownMenu.RadioItem
                      key={option.value || "__all__"}
                      value={option.value}
                      className="group flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm text-white/85 outline-none transition-colors hover:bg-white/10 data-[state=checked]:bg-white/10"
                    >
                      <span className="truncate">{option.label}</span>
                      <DropdownMenu.ItemIndicator>
                        <Check size={14} className="text-white/80" />
                      </DropdownMenu.ItemIndicator>
                    </DropdownMenu.RadioItem>
                  ))
                ) : (
                  <div className="px-2 py-3 text-sm text-white/45">
                    Nenhum resultado
                  </div>
                )}
              </div>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

export default function AdminActivities() {
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAction, setSelectedAction] = useState("");

  const { data: usersData } = useQuery({
    queryKey: ["admin-activity-users"],
    queryFn: () => findAllUsers({ page: 1, limit: 200 }),
  });

  const {
    data: activitiesData,
    isLoading: loadingActivities,
    isFetching: fetchingActivities,
  } = useQuery({
    queryKey: ["admin-activities-page", page, selectedUser, selectedAction],
    queryFn: () =>
      findUserActivities({
        page,
        limit: PAGE_SIZE,
        userId: selectedUser || undefined,
        action: selectedAction || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });

  const userOptions = useMemo(
    () => [
      { value: "", label: "Todos os usuarios" },
      ...(usersData?.users || []).map((user) => ({
        value: user.id,
        label: `${user.name} (${user.email})`,
      })),
    ],
    [usersData]
  );

  const actionOptions = useMemo(
    () => [
      { value: "", label: "Acoes principais (sem visualizacoes)" },
      ...ACTION_OPTIONS,
    ],
    []
  );

  const activities = activitiesData?.activities || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Atividades de Usuarios</h1>
          <p className="text-white/60">
            Por padrao, visualizacoes ficam ocultas para reduzir ruido.
          </p>
        </div>

        <div className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
          <FilterSelect
            label="Filtrar por usuario"
            value={selectedUser}
            onValueChange={(value) => {
              setSelectedUser(value);
              setPage(1);
            }}
            options={userOptions}
            searchable
            searchPlaceholder="Buscar por nome ou email"
          />

          <FilterSelect
            label="Filtrar por acao"
            value={selectedAction}
            onValueChange={(value) => {
              setSelectedAction(value);
              setPage(1);
            }}
            options={actionOptions}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
          {loadingActivities ? (
            <div className="flex justify-center py-16">
              <Loader />
            </div>
          ) : activities.length > 0 ? (
            <div className="divide-y divide-white/10">
              {activities.map((activity) => (
                <article key={activity.id} className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Activity size={14} className="text-white/50" />
                      <span className="rounded bg-white/10 px-2 py-0.5 text-xs">
                        {getActivityActionLabel(activity.action)}
                      </span>
                    </div>
                    <span className="text-xs text-white/50">
                      {formatActivityDateTime(activity.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-white/90">
                    {formatActivityDescription(activity)}
                  </p>

                  <div className="text-xs text-white/50">
                    <span className="break-all">{activity.endpoint || "-"}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-white/50">
              Nenhuma atividade encontrada com os filtros atuais.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-white/50">
            {activitiesData?.total || 0} registro(s) encontrado(s)
          </p>
          {fetchingActivities && !loadingActivities ? (
            <p className="text-xs text-white/40">Atualizando...</p>
          ) : null}
        </div>

        <Pagination
          currentPage={activitiesData?.page || page}
          totalPages={activitiesData?.totalPages || 1}
          onPageChange={setPage}
        />
      </div>
    </AdminLayout>
  );
}
