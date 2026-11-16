/**
 * Real REST API Client (/api/v1) for KITS Pharmacy CMS
 * Uses HTTP-only session cookies + XSRF-TOKEN CSRF protection for single-domain cPanel hosting.
 */

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

function getBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return configured && configured.trim().length > 0 ? configured.replace(/\/$/, '') : '/api/v1';
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

let csrfReady = false;

export async function ensureCsrfCookie(force = false): Promise<void> {
  if (csrfReady && !force && readCookie('XSRF-TOKEN')) {
    return;
  }
  try {
    await fetch(`${getBaseUrl()}/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    csrfReady = true;
  } catch {
    // Handled on subsequent request
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    await ensureCsrfCookie();
  }

  const xsrf = readCookie('XSRF-TOKEN');
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const res = await fetch(`${getBaseUrl()}${endpoint}`, {
      ...options,
      method,
      headers,
      credentials: 'include',
    });

    const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

    if (!res.ok) {
      const firstValidationMsg = json?.errors ? Object.values(json.errors).flat()[0] : undefined;
      return {
        ok: false,
        status: res.status,
        code: json?.code,
        errors: json?.errors,
        message: firstValidationMsg || json?.message || `Request failed (${res.status})`,
      };
    }

    return {
      ok: true,
      status: res.status,
      data: (json && 'data' in json ? json.data : (json as unknown as T)),
      message: json?.message,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: err instanceof Error ? err.message : 'Unable to reach backend API server.',
    };
  }
}

export async function apiUpload<T>(endpoint: string, formData: FormData): Promise<ApiResult<T>> {
  await ensureCsrfCookie();
  const xsrf = readCookie('XSRF-TOKEN');

  try {
    const res = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
      },
      body: formData,
    });

    const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: json?.message || `Upload failed (${res.status})`,
      };
    }

    return {
      ok: true,
      status: res.status,
      data: json?.data,
      message: json?.message,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: err instanceof Error ? err.message : 'Media upload failed.',
    };
  }
}
