import config from "../config";

export async function fetchUser(token, id) {
  const res = await fetch(`${config.API_BASE}/providers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    // Throw error so React Query triggers onError
    throw new Error(`Failed to fetch user: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}
