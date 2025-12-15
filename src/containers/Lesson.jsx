import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { findLessonById } from "../services/lessons/lessonsService";
import {
  createLessonProgress,
  getLessonProgress,
} from "../services/lessons/lessonsProgressService";

import Loader from "../components/Loader";
import { toastError, toastSuccess } from "../utils/toastHelper";

export default function Lesson() {
  const { lessonId } = useParams();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [lessonData, progressData] = await Promise.all([
          findLessonById(lessonId),
          getLessonProgress({ lessonId }),
        ]);

        setLesson(lessonData);

        const alreadyCompleted = progressData?.data?.some(
          (p) => p.userId === userId
        );

        setCompleted(Boolean(alreadyCompleted));
      } catch (error) {
        console.error(error);
        toastError("Erro ao carregar a aula");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [lessonId, userId]);

  async function handleMarkAsCompleted() {
    try {
      setSaving(true);

      await createLessonProgress({
        userId,
        lessonId,
      });

      setCompleted(true);
      toastSuccess("Aula marcada como concluída");
    } catch (error) {
      console.error(error);
      toastError("Erro ao marcar aula como concluída");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white px-4 pt-16 pb-24">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto mb-6 text-sm text-white/40">
        Sermões / {lesson?.sermon?.title ?? "Sermão"} / {lesson.title}
      </div>

      {/* Conteúdo central */}
      <div className="max-w-3xl mx-auto text-center">
        {/* Título */}
        <h1 className="text-4xl font-bold mb-3">{lesson.title}</h1>

        {/* Descrição */}
        <p className="text-white/60 text-base mb-10">{lesson.description}</p>
      </div>

      {/* Vídeo */}
      {lesson.videoLink && (
        <div className="max-w-4xl mx-auto mb-10">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10">
            <iframe
              src={lesson.videoLink}
              title={lesson.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Botão de progresso */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleMarkAsCompleted}
          disabled={completed || saving}
          className={`
px-8 py-3 rounded-xl font-medium transition
${
  completed
    ? "bg-green-600 text-white cursor-default"
    : "bg-purple-600 hover:bg-purple-700"
}
${saving ? "opacity-60 cursor-wait" : ""}
`}
        >
          {completed ? "Aula concluída" : "Marcar como concluída"}
        </button>
      </div>
    </div>
  );
}
