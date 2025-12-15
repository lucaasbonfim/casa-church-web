import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function HomePage() {
  const navigate = useNavigate();

  const tiles = [
    {
      title: "Nossa História",
      image:
        "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      to: "/sobre",
    },
    {
      title: "Nossa Comunidade",
      image:
        "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      to: "/social",
    },
    {
      title: "Contatos",
      image:
        "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1200&auto=format&fit=crop",
      to: "/contatos",
    },
    {
      title: "Localização",
      image:
        "https://images.unsplash.com/photo-1599818539518-c5d59a0e2a08?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      to: "/localizacao",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] text-white mx-auto px-4 pb-16">
      <main>
        <section className="max-w-7xl mx-auto py-8">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1569759276108-31b8e7e43e7b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Interior de igreja"
              className="w-full h-[360px] sm:h-[420px] lg:h-[520px] object-cover select-none"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent select-none" />
            <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-12 select-none">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                Bem-vindo à Casa Church Global
              </h1>
              <p className="my-3 text-white/80 text-sm sm:text-base">
                Seja muito bem-vindo, esta casa também é sua!
              </p>
              <Button
                onClick={() => {
                  navigate("/sobre");
                }}
                style={2}
                size="lg"
              >
                Junte-se a nós
              </Button>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <p className="text-white/80 text-sm">Próximo evento</p>
              <h3 className="mt-2 mb-3 text-lg font-semibold">
                Descubra o que está acontecendo
              </h3>
              <Button onClick={() => navigate("/eventos")} style={2}>
                Ver detalhes
              </Button>
            </div>

            <div className="md:col-span-2 rounded-xl overflow-hidden border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop"
                alt="Convite de evento"
                className="w-full h-56 md:h-48 lg:h-56 object-cover"
              />
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiles.map((t) => (
              <Link
                key={t.title}
                to={t.to}
                className="group rounded-xl overflow-hidden border border-white/10 bg-white/5"
              >
                <div className="h-40">
                  <img
                    src={t.image}
                    alt={t.title}
                    className="w-full h-full object-cover hover:scale-110 duration-200 select-none"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium group-hover:text-white">
                    {t.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-base font-semibold">Dias de Culto</h4>
            <ul className="mt-3 space-y-2 text-white/80">
              <li>Quarta-feira — 19h30</li>
              <li>Domingo — 9h e 18h</li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-semibold">Localização</h4>
            <p className="mt-3 text-white/80">Taquara — Duque de Caxias, RJ</p>
          </div>
        </section>
      </main>
    </div>
  );
}
