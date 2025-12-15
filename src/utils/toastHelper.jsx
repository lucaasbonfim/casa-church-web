import React from "react";
import { toast } from "react-toastify";
import Logo from "../assets/logo.png";

// eslint-disable-next-line react-refresh/only-export-components
const ToastContent = ({ message }) => (
  <div className="flex items-center gap-3">
    <img src={Logo} alt="Casa Church" className="w-6 h-6 shrink-0" />
    <div className="flex flex-col gap-1 flex-1">
      <span className="font-semibold text-white text-[10px] uppercase tracking-wide">
        Casa Church
      </span>
      <span className="text-white/90 text-[12px] leading-tight">{message}</span>
    </div>
  </div>
);

const defaultOptions = {
  containerId: "global",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  icon: false,
};

export const toastSuccess = (message, options = {}) =>
  toast.success(<ToastContent message={message} />, {
    ...defaultOptions,
    ...options,
  });

export const toastError = (message, options = {}) =>
  toast.error(<ToastContent message={message} />, {
    ...defaultOptions,
    ...options,
  });

export const toastInfo = (message, options = {}) =>
  toast.info(<ToastContent message={message} />, {
    ...defaultOptions,
    ...options,
  });

export const toastWarn = (message, options = {}) =>
  toast.warn(<ToastContent message={message} />, {
    ...defaultOptions,
    ...options,
  });
