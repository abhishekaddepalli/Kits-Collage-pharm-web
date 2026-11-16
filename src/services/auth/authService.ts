import type { AdminRoleName, PermissionKey } from '../../types/cms';
import { apiRequest, ensureCsrfCookie } from '../api/apiClient';

export interface AuthUserSession {
  id: string;
  isAuthenticated: boolean;
  username: string;
  displayName: string;
  email: string;
  role: AdminRoleName;
  permissions: PermissionKey[];
  lastLogin?: string;
}

interface AuthResponsePayload {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    role: AdminRoleName;
    permissions: PermissionKey[];
    lastLogin?: string;
  };
}

function mapUser(u: AuthResponsePayload['user']): AuthUserSession {
  return {
    id: u.id,
    isAuthenticated: true,
    username: u.username,
    displayName: u.name,
    email: u.email,
    role: u.role,
    permissions: u.permissions || [],
    lastLogin: u.lastLogin,
  };
}

export const authService = {
  async fetchCurrentUser(): Promise<AuthUserSession | null> {
    const res = await apiRequest<AuthResponsePayload>('/auth/me');
    if (!res.ok || !res.data?.user) {
      return null;
    }
    return mapUser(res.data.user);
  },

  async login(
    identifier: string,
    password: string,
    remember = false
  ): Promise<{ ok: boolean; user?: AuthUserSession; error?: string }> {
    await ensureCsrfCookie(true);
    const res = await apiRequest<AuthResponsePayload>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, remember }),
    });
    if (!res.ok || !res.data?.user) {
      return { ok: false, error: res.message || 'Authentication failed.' };
    }
    return { ok: true, user: mapUser(res.data.user) };
  },

  async logout(): Promise<void> {
    await apiRequest('/auth/logout', { method: 'POST' });
  },

  async forgotPassword(email: string): Promise<{ ok: boolean; message: string }> {
    const res = await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return { ok: res.ok, message: res.message || 'Request submitted.' };
  },

  async resetPassword(payload: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ ok: boolean; message: string }> {
    const res = await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, message: res.message || (res.ok ? 'Password updated.' : 'Reset failed.') };
  },

  async updateProfile(name: string, email: string): Promise<{ ok: boolean; user?: AuthUserSession; message?: string }> {
    const res = await apiRequest<AuthResponsePayload>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    });
    if (!res.ok || !res.data?.user) {
      return { ok: false, message: res.message };
    }
    return { ok: true, user: mapUser(res.data.user), message: res.message };
  },

  async changePassword(payload: {
    currentPassword: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ ok: boolean; message?: string }> {
    const res = await apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, message: res.message };
  },
};
