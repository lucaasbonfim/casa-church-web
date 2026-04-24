export const ADMIN_FULL_ACCESS = "*";

export const ADMIN_MODULES = [
  { key: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
  { key: "home_content", label: "Pagina inicial", path: "/admin/inicio" },
  { key: "page_content", label: "Paginas", path: "/admin/paginas" },
  { key: "gallery", label: "Galeria" },
  { key: "events", label: "Eventos", path: "/admin/eventos" },
  { key: "devotionals", label: "Devocionais", path: "/admin/devocionais" },
  { key: "sermons", label: "Sermoes", path: "/admin/sermoes" },
  { key: "lessons", label: "Licoes", path: "/admin/licoes" },
  { key: "posts", label: "Posts", path: "/admin/posts" },
  { key: "users", label: "Usuarios", path: "/admin/usuarios" },
  { key: "activities", label: "Atividades", path: "/admin/atividades" },
  { key: "church_houses", label: "CIs", path: "/admin/cis" },
  { key: "contacts", label: "Mensagens", path: "/admin/contatos" },
  { key: "donations", label: "Doacoes", path: "/admin/doacoes" },
];

export const ADMIN_MODULE_LABELS = Object.fromEntries(
  ADMIN_MODULES.map((item) => [item.key, item.label])
);

export function normalizeAdminModules(modules) {
  if (!Array.isArray(modules)) return [];

  const deduped = Array.from(
    new Set(modules.filter((item) => typeof item === "string"))
  );

  if (deduped.includes(ADMIN_FULL_ACCESS)) {
    return [ADMIN_FULL_ACCESS];
  }

  const valid = new Set(ADMIN_MODULES.map((item) => item.key));
  return deduped.filter((item) => valid.has(item));
}

export function getEffectiveAdminModules(user) {
  if (user?.role !== "admin") return [];

  const normalized = normalizeAdminModules(user?.adminModules);
  return normalized.length > 0 ? normalized : [ADMIN_FULL_ACCESS];
}

export function hasAdminModuleAccess(user, moduleKey) {
  const modules = getEffectiveAdminModules(user);
  return (
    modules.includes(ADMIN_FULL_ACCESS) || modules.includes(moduleKey || "")
  );
}

export function canAccessAdminArea(user) {
  return getEffectiveAdminModules(user).length > 0;
}

export function getAdminModuleByPath(pathname) {
  const match = ADMIN_MODULES.find(
    (item) => item.path && pathname.startsWith(item.path)
  );
  return match?.key || null;
}

export function getFirstAllowedAdminPath(user) {
  const first = ADMIN_MODULES.find(
    (item) => item.path && hasAdminModuleAccess(user, item.key)
  );
  return first?.path || "/";
}
