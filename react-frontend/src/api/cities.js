import config from '../config';

export async function fetchCitiesPaginatied(token, page = 1, pageSize = 10, filters = {}) {
    const url = new URL(`${config.API_BASE}/cities`);
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

export async function updateCity(token, id, data) {
    const response = await fetch(`http://localhost:80/api/cms/v1/cities/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  