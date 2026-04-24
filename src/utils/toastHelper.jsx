import React from "react";
import { toast } from "react-toastify";
import Logo from "../assets/logo.png";

// eslint-disable-next-line react-refresh/only-export-components
const ToastContent = ({ message }) => (
  <div className="cc-toast-content">
    <img src={Logo} alt="Casa Church" className="cc-toast-logo" />
    <div className="cc-toast-copy">
      <span className="cc-toast-brand">
        Casa Church
      </span>
      <span className="cc-toast-message">{message}</span>
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
