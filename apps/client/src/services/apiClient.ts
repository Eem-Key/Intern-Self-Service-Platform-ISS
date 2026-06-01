import type { ApiErrorResponse } from '../types/api.types';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5197/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiClientOptions = {
    method?: HttpMethod;
    body?: unknown;
    token?: string;
};

export async function apiClient<T>(
    endpoint: string,
    options: ApiClientOptions = {}
): Promise<T> {
    const { method = 'GET', body, token } = options;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const errorData = data as ApiErrorResponse | null;

        throw new Error(errorData?.message || 'Something went wrong.');
    }

    return data as T;
}