import { ToastContainer } from "react-toastify";
import { X } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  return (
    <ToastContainer
      containerId="global"
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      closeButton={CloseButton}
      icon={false}
      className="cc-toast-container"
      toastClassName="cc-toast"
      bodyClassName="cc-toast-body"
      progressClassName="cc-toast-progress"
      style={{ zIndex: 9999 }}
      toastStyle={{
        background: "#0f1115",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "1rem",
        padding: "0.875rem 0.9375rem",
        minHeight: "auto",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        cursor: "default",
      }}
      bodyStyle={{
        padding: 0,
        margin: 0,
        color: "#fff",
        fontSize: "0.875rem",
      }}
    />
  );
}

function CloseButton({ closeToast }) {
  return (
    <button
      onClick={closeToast}
      aria-label="Fechar"
      className="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer hover:bg-white/10 transition-colors shrink-0 ml-2"
      type="button"
    >
      <X size={16} className="text-white/70" />
    </button>
  );
}
