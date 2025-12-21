import {STORAGE_TOKEN_KEY} from "../auth/AuthContext";

const normalizeBaseUrl = baseUrl => {
  if (!baseUrl) return '';
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const normalizePath = path => {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
};

export const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api');

class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const extractErrorMessage = data => {
  if (!data) return '';
  if (typeof data === 'string') return data;
  return data.message || data.detail || data.error || '';
};

export async function apiFetch(path, options = {}) {
  const {
    method = 'GET',
    body,
    params,
    headers: extraHeaders,
    ...rest
  } = options;

  let url = `${API_BASE_URL}${normalizePath(path)}`;

  if (params) {
    const queryParams = new URLSearchParams(params).toString();
    url += url.includes('?') ? `&${queryParams}` : `?${queryParams}`;
  }

  const headers = {
    Accept: 'application/json',
    ...(extraHeaders || {}),
  };

  const token = localStorage.getItem(STORAGE_TOKEN_KEY) || '';

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const hasBody = body !== undefined && body !== null;
  const requestInit = {
    method,
    headers,
    ...rest,
  };

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(url, requestInit);

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  let data;
  try {
    if (response.status !== 204) {
      data = isJson ? await response.json() : await response.text();
    }
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    const message = extractErrorMessage(data) || (typeof data === 'string' ? data : '') || response.statusText || 'Request failed';
    throw new ApiError(message, { status: response.status, data });
  }

  return data;
}

export { ApiError };
