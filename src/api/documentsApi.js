import {apiFetch} from "./http";

export function getStageDocuments(stageId) {
    return apiFetch(`/stages/${stageId}/documents`);
}

export function getDocumentChecklist(objectId, stage) {
    const params = new URLSearchParams({ stage }).toString();
    return apiFetch(`/objects/${objectId}/document-checklist?${params}`);
}

export function getDocument(documentId) {
    return apiFetch(`/documents/${documentId}`);
}

export function signDocument(documentId, comment = null) {
    return apiFetch(`/documents/${documentId}/sign`, {
        method: 'POST',
        body: comment ? { comment } : null,
    });
}

export function rejectDocument(documentId, reason) {
    return apiFetch(`/documents/${documentId}/reject`, {
        method: 'POST',
        body: { reason },
    });
}

export function getDocumentHistory(documentId) {
    return apiFetch(`/documents/${documentId}/history`);
}

// export function uploadDocument(stageId, documentData) {
//     return apiFetch(`/stages/${stageId}/documents/upload`, {
//         method: 'POST',
//         body: documentData,
//     });
// }
//
// export function updateDocument(documentId, documentData) {
//     return apiFetch(`/documents/${documentId}`, {
//         method: 'PUT',
//         body: documentData,
//     });
// }
//
// export function deleteDocument(documentId) {
//     return apiFetch(`/documents/${documentId}`, {
//         method: 'DELETE',
//     });
// }
//
// export function downloadDocument(documentId) {
//     return apiFetch(`/documents/${documentId}/download`, {
//         method: 'GET',
//         headers: {
//             'Accept': 'application/octet-stream',
//         },
//     });
// }