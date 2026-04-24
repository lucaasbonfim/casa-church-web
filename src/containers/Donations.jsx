import { useQuery } from "@tanstack/react-query";
import { HeartHandshake, QrCode, ShieldCheck } from "lucide-react";
import PixQrCode from "../assets/qrcode-pix.png";
import { findPageContent } from "../services/pageContent/pageContentService";

const defaultContent = {
  eyebrow: "Contribua com a Casa Church",
  title: "Ofertas e doacoes",
  description:
    "Sua generosidade nos ajuda a continuar cuidando de pessoas, fortalecendo a comunidade e levando a mensagem de Jesus adiante. Se voce deseja contribuir, sera muito bem-vindo.",
  howTitle: "Como ofertar",
  howText:
    "Abra o app do seu banco, escolha a opcao Pix e escaneie o QR Code ao lado para realizar sua contribuicao.",
  freedomTitle: "Contribuicao livre",
  freedomText:
    "O valor fica a seu criterio. O mais importante e que cada gesto seja feito com alegria, liberdade e proposito.",
  note: "Obrigado por caminhar conosco. Cada oferta apoia o trabalho da Casa Church, os encontros, projetos e iniciativas que alcancam vidas dentro e fora da igreja.",
  pixLabel: "Pix",
  pixTitle: "Escaneie para ofertar",
  pixDescription:
    "Confira os dados no aplicativo do seu banco antes de confirmar a transferencia.",
  pixQrCodeUrl: "",
};

export default function Donations() {
  const { data } = useQuery({
    queryKey: ["page-content", "donations"],
    queryFn: () => findPageContent("donations"),
  });
  const content = { ...defaultContent, ...(data || {}) };
  const qrCodeUrl = content.pixQrCodeUrl || PixQrCode;

  return (
    <div className="min-h-screen bg-[#0f1115] text-white">
      <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <section className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              <HeartHandshake size={18} className="text-white" />
              {content.eyebrow}
            </div>

            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                {content.title}
              </h1>
              <p className="mt-5 text-base leading-relaxed text-white/70 md:text-lg">
                {content.description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <QrCode size={22} />
                </div>
                <h2 className="text-lg font-semibold">{content.howTitle}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {content.howText}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck size={22} />
                </div>
                <h2 className="text-lg font-semibold">
                  {content.freedomTitle}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {content.freedomText}
                </p>
              </div>
            </div>

            <p className="max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-white/60">
              {content.note}
            </p>
          </div>

          <aside className="rounded-2xl border border-white/10 bg-white p-5 text-[#0f1115] shadow-2xl shadow-black/20">
            <div className="rounded-xl border border-black/10 bg-white p-4">
              <img
                src={qrCodeUrl}
                alt="QR Code Pix para ofertas e doacoes da Casa Church"
                className="mx-auto aspect-square w-full max-w-[300px] object-contain"
                draggable={false}
              />
            </div>

            <div className="mt-5 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">
                {content.pixLabel}
              </p>
              <h2 className="mt-1 text-2xl font-bold">{content.pixTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-black/60">
                {content.pixDescription}
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
