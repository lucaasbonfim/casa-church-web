import { Construction } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UnderConstruction({
  title = "Em desenvolvimento",
  description = "Esta funcionalidade ainda está sendo construída. Em breve teremos novidades por aqui.",
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f1115] text-white px-4 py-12 flex items-center">
      <div className="max-w-xl mx-auto w-full">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <Construction size={28} />
            </div>
          </div>

          <h1 className="text-3xl font-bold">{title}</h1>

          <p className="text-white/60">{description}</p>

          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
