const fs = require("node:fs");
const path = require("node:path");

const distDir = path.resolve(__dirname, "..", "dist");
const indexPath = path.join(distDir, "index.html");
const fallbackPath = path.join(distDir, "404.html");

fs.copyFileSync(indexPath, fallbackPath);

const spaRoutes = [
  "sobre",
  "eventos",
  "contatos",
  "cis",
  "devocional",
  "social",
  "sermoes",
  "doacoes",
  "oferta",
  "ofertas",
  "galeria",
  "perfil",
  "confirmar-email",
  "login",
  "registrar",
  "esqueci-senha",
  "redefinir-senha",
  "admin",
  "admin/dashboard",
  "admin/inicio",
  "admin/paginas",
  "admin/eventos",
  "admin/devocionais",
  "admin/sermoes",
  "admin/cis",
  "admin/contatos",
  "admin/licoes",
  "admin/posts",
  "admin/usuarios",
  "admin/atividades",
  "admin/doacoes",
];

for (const route of spaRoutes) {
  const routeDir = path.join(distDir, ...route.split("/"));
  fs.mkdirSync(routeDir, { recursive: true });
  fs.copyFileSync(indexPath, path.join(routeDir, "index.html"));
}

console.log(
  `Created SPA fallbacks for 404.html and ${spaRoutes.length} static routes.`,
);
