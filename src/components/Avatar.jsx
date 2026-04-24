import { useMemo, useState } from "react";

const avatarColors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-red-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-indigo-500",
];

export default function Avatar({
  name = "",
  src = "",
  size = "md",
  className = "",
}) {
  const [failedImageSrc, setFailedImageSrc] = useState("");

  const { initials, bgColor } = useMemo(() => {
    try {
      if (!name) {
        return { initials: "?", bgColor: avatarColors[0] };
      }

      const nameParts = name
        .trim()
        .split(/\s+/)
        .filter((part) => part.length > 0);

      let nextInitials = "?";

      if (nameParts.length >= 2) {
        const firstInitial = nameParts[0][0].toUpperCase();
        const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase();
        nextInitials = firstInitial + lastInitial;
      } else if (nameParts.length === 1) {
        nextInitials = nameParts[0][0].toUpperCase();
      }

      const hash = name.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);

      return {
        initials: nextInitials,
        bgColor: avatarColors[Math.abs(hash) % avatarColors.length],
      };
    } catch (error) {
      console.error("Erro ao processar nome do Avatar:", error);
      return { initials: "?", bgColor: avatarColors[0] };
    }
  }, [name]);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-20 h-20 text-xl",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const shouldShowImage = Boolean(src && failedImageSrc !== src);

  return (
    <div
      className={`${sizeClass} ${bgColor} rounded-full overflow-hidden flex items-center justify-center text-white font-semibold cursor-default select-none transition-transform ${className}`}
      title={name || "Usuario"}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={name || "Usuario"}
          className="w-full h-full object-cover"
          onError={() => setFailedImageSrc(src)}
        />
      ) : (
        initials
      )}
    </div>
  );
}
