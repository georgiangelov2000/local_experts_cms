import config from '../config';

export async function fetchCategories(token) {
  const res = await fetch(`${config.API_BASE}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data || [];
}

export async function fetchServiceCategories(token) {
  const res = await fetch(`${config.API_BASE}/service-categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data || [];
}

export async function fetchWorkstations(token) {
  const res = await fetch(`${config.API_BASE}/workspaces`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data || [];
}

export async function fetchServices(token) {
  const res = await fetch(`${config.API_BASE}/services`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data || [];
} 