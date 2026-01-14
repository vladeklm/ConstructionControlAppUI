import {apiFetch} from "./http";

export function getProjectTemplates(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return apiFetch(`/projects${queryParams ? `?${queryParams}` : ''}`);
}

export function getProjectTemplateById(projectId)  {
    return apiFetch(`/projects/${projectId}`);
}