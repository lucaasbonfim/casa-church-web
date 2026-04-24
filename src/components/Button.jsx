import * as LucideIcons from "lucide-react";
import Loader from "./Loader";

export default function Button({
  children,
  onClick,
  type = "button",
  style = 1,
  size = "md",
  disabled = false,
  className = "",
  icon = null,
  iconPosition = "left",
  iconSize = 18,
  iconStrokeWidth = 2,
  fullWidth = false,
  loading = false,
  loaderType = "ClipLoader",
  loaderSize = null,
}) {
  const baseStyles =
    "font-medium transition-all duration-300 cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  const variants = {
    1: "bg-white text-black hover:bg-gray-100 focus:ring-white",
    2: "bg-white/10 text-white hover:bg-white/20",
    3: "text-white hover:text-gray-300 underline focus:ring-white",
  };

const sizes = {
  sm: "py-0.5 px-2 text-[11px] md:py-1.5 md:px-3 md:text-sm",
  md: "py-1 px-2.5 text-xs md:py-2 md:px-4 md:text-base",
  lg: "py-1.5 px-3 text-sm md:py-3 md:px-6 md:text-lg",
};


const iconOnlySizes = {
  sm: "p-1 md:p-1.5",
  md: "p-1.5 md:p-2",
  lg: "p-2 md:p-3",
};



  const loaderSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const loaderColors = {
    1: "#000000",
    2: "#ffffff",
    3: "#ffffff",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const variantClass = variants[style] || variants[1];
  const sizeClass = children ? sizes[size] || sizes.md : iconOnlySizes[size];

  const renderIcon = () => {
    if (!icon) return null;

    if (typeof icon === "string") {
      const IconComponent = LucideIcons[icon];
      if (!IconComponent) {
        console.warn(`Ícone "${icon}" não encontrado no lucide-react`);
        return null;
      }
      return <IconComponent size={iconSize} strokeWidth={iconStrokeWidth} />;
    }

    return icon;
  };

  const iconElement = renderIcon();

  const renderContent = () => {
    if (loading) {
      return (
        <Loader
          type={loaderType}
          color={loaderColors[style] || loaderColors[1]}
          size={loaderSize || loaderSizes[size] || loaderSizes.md}
        />
      );
    }

    if (!children) {
      return iconElement;
    }

    if (iconElement) {
      return iconPosition === "left" ? (
        <>
          {iconElement}
          {children}
        </>
      ) : (
        <>
          {children}
          {iconElement}
        </>
      );
    }

    return children;
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      title={!children && icon ? `${icon} button` : ""}
    >
      {renderContent()}
    </button>
  );
}
