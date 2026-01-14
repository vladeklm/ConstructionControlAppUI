import {apiFetch} from "./http";

export function getStagesForObject(objectId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return apiFetch(`/objects/${objectId}/stages${queryParams ? `?${queryParams}` : ''}`);
}

export function getStageDetails(stageId) {
    return apiFetch(`/stages/${stageId}`);
}

export function getStageReports(stageId,) {
    return apiFetch(`/stages/${stageId}/reports`);
}

export function completeStage(stageId, comment = null) {
    return apiFetch(`/stages/${stageId}/complete`, {
        method: 'POST',
        body: comment ? { comment } : null,
    });
}

export function approveByCustomer(stageId, comment = null) {
    return apiFetch(`/stages/${stageId}/approve-by-customer`, {
        method: 'POST',
        body: comment ? { comment } : null,
    });
}

export function rejectByCustomer(stageId, comment = null) {
    return apiFetch(`/stages/${stageId}/reject-by-customer`, {
        method: 'POST',
        body: comment ? { comment } : null,
    });
}