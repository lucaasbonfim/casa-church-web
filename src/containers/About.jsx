import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f1115] text-white px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">Sobre a Casa Church</h1>
          <p className="text-white/60 text-lg">
            Mais do que uma igreja, somos uma comunidade construída sobre fé,
            conexão e propósito.
          </p>
        </div>

        {/* Quem somos */}
        <div
          className="
            rounded-2xl
            border border-white/10
            bg-white/5
            backdrop-blur-sm
            p-8
          "
        >
          <h2 className="text-2xl font-semibold mb-4">Quem somos</h2>
          <p className="text-white/70 leading-relaxed max-w-4xl">
            A Casa Church nasceu com o desejo de ser um lugar onde pessoas se
            sintam em casa. Acreditamos em uma fé viva, prática e acessível, que
            se expressa no cuidado com o próximo, na comunhão e na transformação
            de vidas.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <div
            className="
              rounded-2xl
              border border-white/10
              bg-white/5
              backdrop-blur-sm
              p-6
            "
          >
            <h3 className="text-xl font-semibold mb-3">Nossa visão</h3>
            <p className="text-white/70">
              Construir uma comunidade sólida, acolhedora e relevante para o
              tempo em que vivemos.
            </p>
          </div>

          <div
            className="
              rounded-2xl
              border border-white/10
              bg-white/5
              backdrop-blur-sm
              p-6
            "
          >
            <h3 className="text-xl font-semibold mb-3">Nosso propósito</h3>
            <p className="text-white/70">
              Amar pessoas, ensinar princípios que transformam vidas e caminhar
              juntos em fé e crescimento.
            </p>
          </div>

          <div
            className="
              rounded-2xl
              border border-white/10
              bg-white/5
              backdrop-blur-sm
              p-6
            "
          >
            <h3 className="text-xl font-semibold mb-3">Nossa essência</h3>
            <p className="text-white/70">
              Simplicidade, conexão, serviço e compromisso com aquilo em que
              acreditamos.
            </p>
          </div>
        </div>

        {/* Igreja além das paredes */}
        <div
          className="
            rounded-2xl
            border border-white/10
            bg-white/5
            backdrop-blur-sm
            p-8
          "
        >
          <h2 className="text-2xl font-semibold mb-4">
            Igreja além das paredes
          </h2>
          <p className="text-white/70 leading-relaxed max-w-4xl">
            Entendemos que a igreja não se limita a um espaço físico. Por isso, a
            Casa Church também vive no digital, utilizando a tecnologia como uma
            ponte para alcançar, ensinar e conectar pessoas.
          </p>
        </div>

        {/* CTA */}
        <div
          className="
            rounded-2xl
            border border-white/10
            bg-white/5
            backdrop-blur-sm
            p-8
            flex
            flex-col
            md:flex-row
            items-start
            md:items-center
            justify-between
            gap-6
          "
        >
          <div>
            <h3 className="text-2xl font-semibold mb-2">
              Quer caminhar com a gente?
            </h3>
            <p className="text-white/60">
              Entre em contato e saiba mais sobre a Casa Church.
            </p>
          </div>

          <button
            onClick={() => navigate("/contatos")}
            className="
              px-6
              py-3
              rounded-xl
              bg-white/10
              hover:bg-white/20
              transition
              text-white
              font-medium
            "
          >
            Fale com a gente
          </button>
        </div>
      </div>
    </div>
  );
}
