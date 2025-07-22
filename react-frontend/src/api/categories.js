import config from '../config';

/**
 * Fetch paginated categories
 */
export async function fetchCategoriesPaginated(token, page = 1, pageSize = 10, filters = {}) {
    const url = new URL(`${config.API_BASE}/categories`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', pageSize);

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

/**
 * Create a category
 */
export async function createCategory(token, data) {
    const response = await fetch(`${config.API_BASE}/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

/**
 * Update a category
 */
export async function updateCategory(token, id, data) {
    const response = await fetch(`${config.API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

/**
 * Delete a category
 */
export async function deleteCategory(token, id) {
    const response = await fetch(`${config.API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.status === 204 ? { success: true } : response.json();
}

/**
 * Fetch service categories by category ID
 */
export async function fetchServiceCategoriesByCategory(token, categoryId) {
    const response = await fetch(`${config.API_BASE}/categories/${categoryId}/service-categories`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
}
