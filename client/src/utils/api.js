let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Normalize BASE_URL: remove trailing slash and ensure it ends with `/api`
if (BASE_URL.endsWith('/')) BASE_URL = BASE_URL.slice(0, -1);
if (!BASE_URL.endsWith('/api')) BASE_URL = `${BASE_URL}/api`;

const getToken = () => {
    const user = localStorage.getItem('authUser');
    if (!user) return null;
    try {
        return JSON.parse(user)?.token || null;
    } catch {
        return null;
    }
};

const request = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
};

// Convenience helpers
const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default api;
