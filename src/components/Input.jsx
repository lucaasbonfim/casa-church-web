import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";

export default function Input({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon: IconOverride,
  fullWidth = false,
  className = "",
  allowClear = false,
  onClear,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const isEmail = type === "email";

  const EffectiveIcon =
    IconOverride ?? (isPassword ? Lock : isEmail ? Mail : null);

  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white/90 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {EffectiveIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
            <EffectiveIcon size={20} />
          </div>
        )}

        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={
            isPassword ? "current-password" : isEmail ? "email" : "on"
          }
          className={`w-full bg-white/5 border rounded-lg py-3 px-4 ${
            EffectiveIcon ? "pl-12" : ""
          } ${
            isPassword ? "pr-12" : ""
          } text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:border-neutral-500 focus:bg-white/10 ${
            error ? "border-red-500/50" : "border-white/10"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {!isPassword && allowClear && value && (
          <button
            type="button"
            onClick={() =>
              onClear ? onClear() : onChange?.({ target: { value: "" } })
            }
            aria-label="Limpar"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {error && <p className="text-red-500/80 text-sm mt-2">{error}</p>}
    </div>
  );
}
