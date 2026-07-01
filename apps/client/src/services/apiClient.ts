import type { ApiErrorResponse } from '../../../shared/types/api.types';
import { supabase } from '../config/supabase.ts'

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5137/api';

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
    const { method = 'GET', body } = options;

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            // Pass the token to the backend
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