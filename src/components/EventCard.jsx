import { useNavigate } from "react-router-dom";

// components
import Button from "../components/Button";

// utils
import { formatDate } from "../utils/utils";

export default function EventCard({ event }) {
  const navigate = useNavigate();

  const formatTimeRange = (startDate, endDate) => {
    if (startDate === endDate) {
      return formatDate(startDate);
    }

    return `De ${formatDate(startDate)} até ${formatDate(endDate)}`;
  };

  const getDateLabel = (startDate, endDate) => {
    return startDate === endDate ? "Data:" : "Período:";
  };

  return (
    <div className="group rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:border-white/20 flex flex-col h-full">
      <div
        className="h-48 group-hover:scale-105 duration-300 transition-transform shrink-0 bg-cover bg-center relative overflow-hidden"
        style={{
          backgroundImage: `url('${event.image || ""}')`,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/30" />
      </div>
      <div className="p-4 flex flex-col grow">
        <p className="text-lg font-semibold group-hover:text-white transition-colors mb-2">
          {event.title}
        </p>
        <p className="text-xs text-white/60 mb-4 line-clamp-2">
          {event.description}
        </p>
        <div className="text-xs text-white/70 mb-4 grow">
          <p className="mb-1">
            <span className="text-white/50">
              {getDateLabel(event.startDate, event.endDate)}
            </span>{" "}
            {formatTimeRange(event.startDate, event.endDate)}
          </p>
        </div>
        <Button onClick={() => navigate(`/evento/${event.id}`)} size="sm">
          Ver detalhes
        </Button>
      </div>
    </div>
  );
}
