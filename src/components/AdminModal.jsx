import { X } from "lucide-react";
import Button from "./Button";

export default function AdminModal({
  isOpen,
  onClose,
  title,
  onSubmit,
  children,
  isLoading = false,
  submitText = "Salvar",
  cancelText = "Cancelar",
  containerClassName = "",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-[#1a1d24] rounded-2xl border border-white/10 w-full max-h-[90vh] overflow-y-auto max-w-2xl ${containerClassName}`}
      >
        <div className="sticky top-0 bg-[#1a1d24] border-b border-white/10 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {children}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              style={2}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={isLoading}
            >
              {submitText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
