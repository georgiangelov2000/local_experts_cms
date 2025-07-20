const API_BASE = 'http://localhost:81/api/v1';

export async function fetchCategories(token) {
  const res = await fetch(`${API_BASE}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data || [];
}

export async function fetchServiceCategories(token) {
  const res = await fetch(`${API_BASE}/service-categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data || [];
}

export async function fetchWorkstations(token) {
  const res = await fetch(`${API_BASE}/workspaces`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data || [];
}

export async function fetchServices(token) {
  const res = await fetch(`${API_BASE}/services`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data || [];
} 