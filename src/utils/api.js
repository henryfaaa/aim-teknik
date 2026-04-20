import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://aim-teknik-production.up.railway.app";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

export default api;