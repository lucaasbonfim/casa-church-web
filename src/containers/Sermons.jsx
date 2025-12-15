import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { findAllSermons } from "../services/sermons/sermonsService";

import Loader from "../components/Loader";
import { toastError } from "../utils/toastHelper";

export default function Sermons() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSermons() {
      try {
 const response = await findAllSermons();
setSermons(response.sermons || []);

      } catch (error) {
        toastError("Erro ao carregar sermões");
        console.error(error);
        setSermons([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSermons();
  }, []);

  const handleNavigate = (sermonId) => {
    navigate(`/sermons/${sermonId}`);
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Sermões</h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Acompanhe nossos sermões e aprofunde-se nos ensinamentos através das
            lições disponíveis.
          </p>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="space-y-6">
            <p className="text-white/50">Carregando sermões...</p>
            <Loader />
          </div>
        ) : sermons.length === 0 ? (
          <p className="text-white/60">Nenhum sermão encontrado.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Lista textual (esquerda) */}
            <div className="space-y-6">
              {sermons.map((sermon) => (
                <div
                  key={sermon.id}
                  onClick={() => handleNavigate(sermon.id)}
                  className="
cursor-pointer
rounded-2xl
border border-white/10
bg-white/5
backdrop-blur-sm
p-6
hover:bg-white/10
transition
h-[160px]
flex
flex-col
justify-between
"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                      {sermon.title}
                    </h2>
                    <p className="text-white/60 text-sm line-clamp-3">
                      {sermon.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cards visuais (direita) */}
            <div className="space-y-6">
              {sermons.map((sermon) => (
                <div
                  key={sermon.id}
                  onClick={() => handleNavigate(sermon.id)}
                  className="
cursor-pointer
rounded-2xl
overflow-hidden
border border-white/10
bg-white/5
hover:opacity-90
transition
h-[160px]
"
                >
                  <img
                    src={sermon.image || "https://picsum.photos/600/400"}
                    alt={sermon.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
