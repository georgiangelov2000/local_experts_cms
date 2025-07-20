const API_BASE = 'http://localhost:81/api/v1';

export async function fetchUsers(token) {
  const res = await fetch(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data || [];
}

export async function fetchUsersDataTable(token, params) {
  const url = new URL(`${API_BASE}/users`);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchUsersPaginated(token, page = 1, pageSize = 10, filters = {}) {
  const url = new URL('http://localhost:81/api/v1/users');
  url.searchParams.append('start', (page - 1) * pageSize);
  url.searchParams.append('length', pageSize);

  // Add filters as query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
} 