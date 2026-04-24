import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Facebook,
  Instagram,
  MapPin,
  Youtube,
} from "lucide-react";
import Logo from "../assets/logo.png";
import { findHomeContent } from "../services/homeContent/homeContentService";

const FALLBACK_FOOTER_CONTENT = {
  footerWelcomePhrase: "Você é bem vindo a casa!",
  footerServiceDays: "Domingos, 10h e 19h",
  footerAddress: "Endereço da Casa Church",
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const { data: homeContent } = useQuery({
    queryKey: ["home-content-public"],
    queryFn: findHomeContent,
  });

  const footerContent = {
    footerWelcomePhrase:
      homeContent?.footerWelcomePhrase ||
      FALLBACK_FOOTER_CONTENT.footerWelcomePhrase,
    footerServiceDays:
      homeContent?.footerServiceDays ||
      FALLBACK_FOOTER_CONTENT.footerServiceDays,
    footerAddress:
      homeContent?.footerAddress || FALLBACK_FOOTER_CONTENT.footerAddress,
  };

  const navLinks = [
    { label: "Sobre Nós", href: "/sobre" },
    { label: "Devocional", href: "/devocional" },
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
    <footer className="border-t border-white/10 bg-[#0f1115]">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={Logo}
                alt="Logo Casa Church"
                width={74}
                draggable={false}
                className="select-none shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                  Casa Church Global
                </p>
                <p className="mt-2 text-xl font-semibold leading-tight text-white sm:text-2xl md:text-3xl">
                  {footerContent.footerWelcomePhrase}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-white/55">
                  <CalendarDays size={17} />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                    Cultos
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {footerContent.footerServiceDays}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-white/55">
                  <MapPin size={17} />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                    Endereço
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {footerContent.footerAddress}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8 lg:items-end">
            <nav className="grid grid-cols-2 gap-x-16 gap-y-4 text-center text-sm sm:flex sm:flex-wrap sm:justify-center sm:gap-6 lg:justify-end">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center justify-center gap-4">
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
          </div>

          <div className="w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent lg:col-span-2" />

          <p className="text-xs text-white/50 text-center lg:col-span-2">
            Casa Church Global — Todos os direitos reservados © {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}
