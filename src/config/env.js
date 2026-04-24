const envApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_URL = envApiUrl || "http://localhost:3000";
