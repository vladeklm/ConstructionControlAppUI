import { apiFetch } from './http';

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

