import { secureStore } from './secure-store';

// Default URLs: On physical devices via Expo Go, you should set EXPO_PUBLIC_WEB_URL or EXPO_PUBLIC_BACKEND_URL
// to your machine's local network IP (e.g., http://192.168.1.x:3000)
export const config = {
  webUrl: process.env.EXPO_PUBLIC_WEB_URL || 'http://localhost:3000',
  backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001',
};

interface RequestOptions extends RequestInit {
  endpoint: string;
  baseUrl?: string;
}

export async function request<T = any>({
  endpoint,
  baseUrl = config.webUrl,
  ...options
}: RequestOptions): Promise<{ data: T; status: number }> {
  const token = await secureStore.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const message =
        typeof data === 'object' && data?.message
          ? data.message
          : `Request failed with status ${res.status}`;
      throw new ApiError(message, res.status, data);
    }

    return { data, status: res.status };
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err?.message || 'Network request failed', 0, null);
  }
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}
