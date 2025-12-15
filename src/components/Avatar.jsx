import { useState, useEffect } from "react";

export default function Avatar({ name = "", size = "md", className = "" }) {
  const [initials, setInitials] = useState("");
  const [bgColor, setBgColor] = useState("bg-blue-500");

  useEffect(() => {
    try {
      if (name) {
        const nameParts = name
          .trim()
          .split(/\s+/)
          .filter((part) => part.length > 0);

        if (nameParts.length >= 2) {
          const firstInitial = nameParts[0][0].toUpperCase();
          const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase();
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setInitials(firstInitial + lastInitial);
        } else if (nameParts.length === 1) {
          setInitials(nameParts[0][0].toUpperCase());
        } else {
          setInitials("?");
        }

        // Gera cor consistente baseada no nome
        const hash = name.split("").reduce((acc, char) => {
          return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);

        const colors = [
          "bg-blue-500",
          "bg-purple-500",
          "bg-pink-500",
          "bg-red-500",
          "bg-orange-500",
          "bg-green-500",
          "bg-teal-500",
          "bg-indigo-500",
        ];

        setBgColor(colors[Math.abs(hash) % colors.length]);
      } else {
        setInitials("?");
      }
    } catch (error) {
      console.error("Erro ao processar nome do Avatar:", error);
      setInitials("?");
    }
  }, [name]);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold cursor-default select-none transition-transform ${className}`}
      title={name || "Usuário"}
    >
      {initials}
    </div>
  );
}
