import { Instagram, Facebook, Youtube } from "lucide-react";
import Logo from "../assets/logo.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: "Sobre Nós", href: "/sobre" },
    { label: "Eventos", href: "/eventos" },
    { label: "Sermões", href: "/sermoes" },
    { label: "Contatos", href: "/contatos" },
  ];

  const socialLinks = [
    {
      icon: Instagram,
      url: "https://www.instagram.com/casachurchglobal",
      label: "Instagram",
    },
    { icon: Facebook, url: "https://facebook.com", label: "Facebook" },
    { icon: Youtube, url: "https://youtube.com", label: "YouTube" },
  ];

  return (
    <footer className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-8">
          <img
            src={Logo}
            alt="Logo Casa Church"
            width={74}
            draggable={false}
            className="select-none"
          />

          <nav className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.url}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40 hover:text-white transition-all duration-200"
                  title={social.label}
                  aria-label={social.label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>

          <div className="w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />

          <p className="text-xs text-white/50 text-center">
            Casa Church Global — Todos os direitos reservados © {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}
