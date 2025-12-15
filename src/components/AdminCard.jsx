import { Edit, Trash2 } from "lucide-react";
import Button from "./Button";

export default function AdminCard({ 
  title, 
  description, 
  image, 
  metadata = [], 
  onEdit, 
  onDelete,
  children 
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        
        {description && (
          <p className="text-white/60 text-sm mb-4 line-clamp-2">
            {description}
          </p>
        )}
        
        {metadata.length > 0 && (
          <div className="text-sm text-white/60 mb-4 space-y-1">
            {metadata.map((item, index) => (
              <p key={index}>{item.label}: {item.value}</p>
            ))}
          </div>
        )}

        {children}
        
        <div className="flex gap-2 mt-4">
          {onEdit && (
            <Button
              onClick={onEdit}
              style={2}
              size="sm"
              className="flex-1"
            >
              <Edit size={16} />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={onDelete}
              style={2}
              size="sm"
              className="text-red-500 hover:bg-red-500/10"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}