import { API } from "./api";

export async function apiFetch(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    credentials: "include",
    ...options,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}