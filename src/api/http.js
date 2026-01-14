import {STORAGE_TOKEN_KEY} from "../auth/AuthContext";

const normalizeBaseUrl = baseUrl => {
  if (!baseUrl) return '';
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const normalizePath = path => {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
};

// Базовый URL по умолчанию включает /api
export const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL || 'http://localhost:8088/api');

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
    skipApiPrefix = false, // Новый флаг: убирает /api из URL
    responseType = 'json', // Тип ответа: json, blob, text
    ...rest
  } = options;

  // Логика базового URL: если нужно убрать /api, удаляем суффикс
  let baseUrl = API_BASE_URL;
  if (skipApiPrefix) {
    // Удаляем '/api' в конце строки, если он есть
    baseUrl = API_BASE_URL.replace(/\/api$/, '');
  }

  let url = `${baseUrl}${normalizePath(path)}`;

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

  let data;
  try {
    if (response.status !== 204) {
      // Если запрошен blob или контент это картинка, возвращаем Blob
      if (responseType === 'blob' || contentType.includes('image')) {
        data = await response.blob();
      } else if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    }
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    // Если это blob, текст ошибки можем не получить, попробуем текст из ответа или стандартное сообщение
    let message = 'Request failed';
    if (typeof data === 'string') {
      message = data;
    } else if (data && data.message) {
      message = data.message;
    }

    throw new ApiError(message, { status: response.status, data });
  }

  return data;
}

export { ApiError };