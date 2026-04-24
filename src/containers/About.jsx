import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { findPageContent } from "../services/pageContent/pageContentService";

const defaultContent = {
  heroTitle: "Sobre a Casa Church",
  heroSubtitle:
    "Mais do que uma igreja, somos uma comunidade construida sobre fe, conexao e proposito.",
  introTitle: "Quem somos",
  introText:
    "A Casa Church nasceu com o desejo de ser um lugar onde pessoas se sintam em casa. Acreditamos em uma fe viva, pratica e acessivel, que se expressa no cuidado com o proximo, na comunhao e na transformacao de vidas.",
  cards: [
    {
      title: "Nossa visao",
      text: "Construir uma comunidade solida, acolhedora e relevante para o tempo em que vivemos.",
    },
    {
      title: "Nosso proposito",
      text: "Amar pessoas, ensinar principios que transformam vidas e caminhar juntos em fe e crescimento.",
    },
    {
      title: "Nossa essencia",
      text: "Simplicidade, conexao, servico e compromisso com aquilo em que acreditamos.",
    },
  ],
  sectionTitle: "Igreja alem das paredes",
  sectionText:
    "Entendemos que a igreja nao se limita a um espaco fisico. Por isso, a Casa Church tambem vive no digital, utilizando a tecnologia como uma ponte para alcancar, ensinar e conectar pessoas.",
  ctaTitle: "Quer caminhar com a gente?",
  ctaText: "Entre em contato e saiba mais sobre a Casa Church.",
  ctaButtonText: "Fale com a gente",
  ctaButtonLink: "/contatos",
};

export default function About() {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["page-content", "about"],
    queryFn: () => findPageContent("about"),
  });
  const content = { ...defaultContent, ...(data || {}) };
  const cards = content.cards?.length ? content.cards : defaultContent.cards;

  return (
    <div className="min-h-screen bg-[#0f1115] px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-16">
        <div className="max-w-3xl">
          <h1 className="mb-4 text-5xl font-bold">{content.heroTitle}</h1>
          <p className="text-lg text-white/60">{content.heroSubtitle}</p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-semibold">{content.introTitle}</h2>
          <p className="max-w-4xl leading-relaxed text-white/70">
            {content.introText}
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-3">
          {cards.map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <h3 className="mb-3 text-xl font-semibold">{card.title}</h3>
              <p className="text-white/70">{card.text}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-semibold">
            {content.sectionTitle}
          </h2>
          <p className="max-w-4xl leading-relaxed text-white/70">
            {content.sectionText}
          </p>
        </section>

        <section className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm md:flex-row md:items-center">
          <div>
            <h3 className="mb-2 text-2xl font-semibold">{content.ctaTitle}</h3>
            <p className="text-white/60">{content.ctaText}</p>
          </div>

          <button
            onClick={() => navigate(content.ctaButtonLink || "/contatos")}
            className="rounded-xl bg-white/10 px-6 py-3 font-medium text-white transition hover:bg-white/20"
          >
            {content.ctaButtonText}
          </button>
        </section>
      </div>
    </div>
  );
}
