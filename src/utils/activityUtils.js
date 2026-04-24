import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const ACTION_OPTIONS = [
  { value: "POST", label: "Criacao" },
  { value: "PATCH", label: "Atualizacao" },
  { value: "PUT", label: "Atualizacao completa" },
  { value: "DELETE", label: "Exclusao" },
  { value: "GET", label: "Visualizacao" },
];

const ACTION_VERBS = {
  GET: "visualizou",
  POST: "criou",
  PATCH: "atualizou",
  PUT: "atualizou",
  DELETE: "excluiu",
};

const ACTION_BADGES = {
  GET: "Visualizacao",
  POST: "Criacao",
  PATCH: "Atualizacao",
  PUT: "Atualizacao completa",
  DELETE: "Exclusao",
};

const ENDPOINT_LABELS = {
  users: "usuarios",
  events: "eventos",
  posts: "posts",
  sermons: "sermoes",
  lessons: "licoes",
  comments: "comentarios",
  likes: "curtidas",
  locations: "locais",
  "church-houses": "CIs",
  "contact-messages": "mensagens",
  donations: "doacoes",
  devotionals: "devocionais",
  registrations: "inscricoes",
  "page-content": "paginas",
  "home-content": "pagina inicial",
  "lesson-progress": "progresso de licoes",
  "event-feedbacks": "feedbacks de eventos",
};

export function formatActivityTime(date) {
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return "ha algum tempo";
  }
}

export function formatActivityDateTime(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getActivityUserName(activity) {
  return activity?.user?.name || activity?.user?.email || "Usuario";
}

export function getActivityActionLabel(action) {
  return ACTION_BADGES[action?.toUpperCase()] || action || "Acao";
}

export function getActivityTarget(endpoint) {
  const cleanedEndpoint = String(endpoint || "")
    .replace(/^\/+/, "")
    .split("?")[0];
  const [resource, id] = cleanedEndpoint.split("/");
  const resourceLabel = ENDPOINT_LABELS[resource] || resource || "sistema";

  return id ? `${resourceLabel} (${id})` : resourceLabel;
}

export function formatActivityDescription(activity) {
  const action = activity?.action?.toUpperCase();
  const verb = ACTION_VERBS[action] || action?.toLowerCase() || "fez";
  const userName = getActivityUserName(activity);
  const target = getActivityTarget(activity?.endpoint);

  return `${userName} ${verb} ${target}`;
}
