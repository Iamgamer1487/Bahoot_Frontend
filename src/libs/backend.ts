export const BACKEND_HOSTS = {
  local: "http://localhost:5000",
  prod: "https://backend-bahoot.vercel.app",
};

export const USE_LOCAL_BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_LOCAL === "true" ||
  process.env.NODE_ENV === "development";

export const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (USE_LOCAL_BACKEND ? BACKEND_HOSTS.local : BACKEND_HOSTS.prod);
