import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { findAllLessons } from "../services/lessons/lessonsService";

import { findSermonById } from "../services/sermons/sermonsService";

import Loader from "../components/Loader";

import { toastError } from "../utils/toastHelper";

import { Play, Check, Video, FileText } from "lucide-react";

export default function Lessons() {
  const { sermonId } = useParams();

  const navigate = useNavigate();

  const [sermon, setSermon] = useState(null);

  const [lessons, setLessons] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sermonData, lessonsData] = await Promise.all([
          findSermonById(sermonId),

          findAllLessons({
            sermonId,

            orderDirection: "ASC",
          }),
        ]);

        setSermon(sermonData);

        setLessons(lessonsData?.lessons || []);
      } catch (error) {
        console.error(error);

        toastError("Erro ao carregar as aulas");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sermonId]);

  const handleNavigate = (lessonId) => {
    navigate(`/sermons/${sermonId}/aulas/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white">
      <div className="px-4 pt-14 pb-24">
        {/* Container mais largo */}

        <div className="max-w-5xl mx-auto">
          {/* Header com mais respiro */}

          <div className="mb-12">
            <h1 className="text-4xl font-semibold mb-2">
              Sermão: {sermon?.title}
            </h1>

            <p className="text-white/50 text-sm">
              Selecione uma aula para continuar seus estudos.
            </p>
          </div>

          {/* Lista ocupa visualmente o corpo */}

          {lessons.length === 0 ? (
            <p className="text-white/50">
              Nenhuma aula encontrada para este sermão.
            </p>
          ) : (
            <div className="space-y-6">
              {lessons.map((lesson, index) => {
                const hasVideo = Boolean(lesson.videoLink);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleNavigate(lesson.id)}
                    className="group cursor-pointer flex items-center justify-between gap-6 rounded-2xl border border-white/10 bg-white/5 px-8 py-6 hover:bg-white/10 transition"
                  >
                    {/* Esquerda */}

                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        {hasVideo ? (
                          <Video size={20} className="text-white/80" />
                        ) : (
                          <FileText size={20} className="text-white/80" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base font-medium truncate">
                          Aula {index + 1}: {lesson.title}
                        </h3>

                        <p className="text-sm text-white/50 truncate">
                          {lesson.description}
                        </p>
                      </div>
                    </div>

                    {/* Direita */}

                    <div className="flex items-center gap-4 shrink-0">
                      <Check size={18} className="text-green-500 opacity-80" />

                      <Play
                        size={18}
                        className="text-white/50 group-hover:text-white transition"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
