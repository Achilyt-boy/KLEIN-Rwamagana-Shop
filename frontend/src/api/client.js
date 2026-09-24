import axios from "axios";

// One axios instance for the whole app. Base URL comes from an env
// variable so pointing at another server is a one-line change.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

// Attach the JWT from localStorage to every request, if we have one.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("klein_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Pull the backend's error message out so pages can show something
// useful instead of axios internals.
export function errorMessage(
  err,
  fallback = "Something went wrong. Please try again.",
) {
  if (err?.code === "ERR_NETWORK" || !err?.response) {
    return 'KLEIN could not reach the shop service. Start the backend with "npm start" in the backend folder, then try again.';
  }
  return err?.response?.data?.message || err?.message || fallback;
}

export default api;
