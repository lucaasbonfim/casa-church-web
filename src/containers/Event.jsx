import { MapPin, Calendar, Clock, Mail, Phone, ArrowLeft } from "lucide-react";
import Button from "../components/Button";

export default function Event() {
  const churchImages = [
    "photo-1469022563149-aa64dbd37dae",
    "photo-1531573787031-e74ece2cf639",
    "photo-1506905925346-21bda4d32df4",
    "photo-1529505378271-a92247e2b00d",
    "photo-1469074162853-629619ae5161",
    "photo-1506905925346-21bda4d32df4",
    "photo-1469022563149-aa64dbd37dae",
    "photo-1509023464848-18676a857248",
  ];

  const getImageUrl = (eventId) => {
    const randomIndex = eventId % churchImages.length;
    const imageId = churchImages[randomIndex];
    return `https://images.unsplash.com/${imageId}?w=800&h=500&fit=crop&q=80`;
  };

  const event = {
    id: 1,
    title: "Conferência de Liderança",
    subtitle: "Retorno à liderança",
    date: "15 de Junho, 2024",
    time: "19:00 - 18:00",
    location: "Sítio Monte Sião — Xerém",
    latitude: -22.4569,
    longitude: -43.1759,
    fullDescription:
      "A Conferência de Liderança é um evento projetado para inspirar, equipar e conectar líderes de todas as esferas da vida. Durante este retiro, você terá oportunidades de participar de sessões de desenvolvimento de liderança, workshops reflexivos e momentos de networking com outros líderes. Nosso objetivo é fornecer ferramentas práticas e inspiração para que você retorne revitalizado e pronto para liderar com propósito.",
    address: "Sítio Monte Sião — Xerém, Duque de Caxias, RJ",
    phone: "(21) 98765-4321",
    email: "eventos@casachurch.com",
    capacity: "Capacidade: Confira nossa lista",
    languages: "Idiomas e apontadores diversos",
    duration: "1 dia",
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white">
      <main>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button icon="ArrowLeft" iconSize={16} onClick={handleBack} style={1}>
            Voltar
          </Button>
          <p className="text-white/60 text-sm mt-4 select-none">
            <span className="cursor-default transition-colors">Eventos</span>
            {" / "}
            <span className="text-white">{event.title}</span>
          </p>
        </div>

        <section className="max-w-7xl mx-auto px-4 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div
              className="w-full h-80 rounded-xl overflow-hidden border border-white/10"
              style={{
                backgroundImage: `url('${getImageUrl(event.id)}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            <div className="flex flex-col justify-between">
              <div>
                <p className="text-white/60 text-sm mb-2">{event.subtitle}</p>
                <h1 className="text-3xl lg:text-4xl font-bold mb-6">
                  {event.title}
                </h1>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-white/80">
                    <Calendar size={20} className="text-neutral-500 shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <Clock size={20} className="text-neutral-500 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <MapPin size={20} className="text-neutral-500 shrink-0" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <Button size="lg" className="w-full">
                  Inscrever-se no Evento
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Sobre o Evento */}
        <section className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold mb-6">Sobre o Evento</h2>
          <p className="text-white/80 leading-relaxed">
            {event.fullDescription}
          </p>
        </section>

        {/* Localização */}
        <section className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold mb-6">Localização</h2>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-white" />
            </div>
            <span className="text-white/80">{event.address}</span>
          </div>

          {/* Mapa */}
          <div className="w-full h-80 rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDZWYWYZv5TW3lx9tM3PZvF_7Z7G9Z9Z9Z&q=${event.latitude},${event.longitude}`}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        {/* Informações Adicionais */}
        <section className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold mb-8">Informações Adicionais</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-white/80 text-sm font-semibold mb-4 uppercase tracking-wide">
                Detalhes
              </h3>
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-4">
                  <p className="text-white/60 text-sm mb-2">Capacidade</p>
                  <p className="text-white text-sm">{event.capacity}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-2">Duração</p>
                  <p className="text-white text-sm">{event.duration}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white/80 text-sm font-semibold mb-4 uppercase tracking-wide">
                Contatos
              </h3>
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-4">
                  <p className="text-white/60 text-sm mb-2 flex items-center gap-2">
                    <Mail size={16} /> Email
                  </p>
                  <p className="text-white text-sm">{event.email}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-2 flex items-center gap-2">
                    <Phone size={16} /> Telefone
                  </p>
                  <p className="text-white text-sm">{event.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <h3 className="text-white/80 text-sm font-semibold mb-4 uppercase tracking-wide">
              Requisitos
            </h3>
            <p className="text-white/80 text-sm">{event.languages}</p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16 border-t border-white/10">
          <div className="text-left">
            <h2 className="text-3xl font-bold mb-6">Pronto para participar?</h2>
            <Button size="lg">Inscrever-se no Evento</Button>
          </div>
        </section>
      </main>
    </div>
  );
}
