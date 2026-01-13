import { apiFetch, API_BASE_URL } from './http';
import { STORAGE_TOKEN_KEY } from '../auth/AuthContext';

export function createOrder(orderData) {
    return apiFetch('/orders', {
        method: 'POST',
        body: orderData,
    });
}

export function getOrders(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return apiFetch(`/orders${queryParams ? `?${queryParams}` : ''}`);
}

export function getOrderById(orderId) {
    return apiFetch(`/orders/${orderId}`);
}

export function getProjectTemplates(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return apiFetch(`/projects${queryParams ? `?${queryParams}` : ''}`);
}

export function getProjectById(projectId) {
    return apiFetch(`/projects/${projectId}`);
}

export function getProjectMaterials() {
    return apiFetch('/projects/materials');
}

export function createProject(projectData) {
    return apiFetch('/projects', {
        method: 'POST',
        body: projectData,
    });
}

export async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem(STORAGE_TOKEN_KEY) || '';
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/uploads`, {
        method: 'POST',
        headers,
        body: formData,
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    let data;
    try {
        data = isJson ? await response.json() : await response.text();
    } catch {
        data = undefined;
    }

    if (!response.ok) {
        const message = (typeof data === 'string' ? data : data?.message || data?.detail) || response.statusText || 'Upload failed';
        throw new Error(message);
    }

    return data;
}

