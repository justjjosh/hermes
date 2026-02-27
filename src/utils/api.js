const BASE_URL = 'http://localhost:8000';

async function request(method, path, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const res = await fetch(`${BASE_URL}${path}`, options);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `Request failed with status ${res.status}`);
    }
    return res.json();
}

// Profile
export const getProfile = () => request('GET', '/profile');
export const createProfile = (data) => request('POST', '/profile', data);
export const updateProfile = (data) => request('PUT', '/profile', data);

// Brands
export const getBrands = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const qs = query.toString();
    return request('GET', `/brands${qs ? `?${qs}` : ''}`);
};
export const getBrand = (id) => request('GET', `/brands/${id}`);
export const createBrand = (data) => request('POST', '/brands', data);
export const updateBrand = (id, data) => request('PUT', `/brands/${id}`, data);
export const deleteBrand = (id) => request('DELETE', `/brands/${id}`);

// Pitches
export const getPitches = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const qs = query.toString();
    return request('GET', `/pitches${qs ? `?${qs}` : ''}`);
};
export const getPitch = (id) => request('GET', `/pitches/${id}`);
export const generatePitch = (brandId) => request('POST', '/pitches/generate', { brand_id: brandId });
export const updatePitch = (id, data) => request('PUT', `/pitches/${id}`, data);
export const sendPitch = (id) => request('POST', `/pitches/${id}/send`);
export const deletePitch = (id) => request('DELETE', `/pitches/${id}`);
