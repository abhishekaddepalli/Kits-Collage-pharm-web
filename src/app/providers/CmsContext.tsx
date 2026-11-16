import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createInitialCmsState } from '../../data/defaults/kitsSeedData';
import { authService, type AuthUserSession } from '../../services/auth/authService';
import { cmsService } from '../../services/cms/cmsService';
import { installService } from '../../services/installation/installService';
import type {
  AdmissionEnquiry,
  CmsState,
  EnquiryStatus,
  PermissionKey,
} from '../../types/cms';
import { computeThemeCssVariables } from '../../utils/cmsStoreLogic';

interface CmsContextValue {
  state: CmsState;
  session: AuthUserSession | null;
  authChecked: boolean;
  loading: boolean;
  installed: boolean;
  backendError: string | null;
  syncStatus: 'idle' | 'saving' | 'saved' | 'error';
  syncError: string | null;
  adminLoginPath: string;
  adminPanelPath: string;
  hasPermission: (key: PermissionKey) => boolean;
  refreshBootstrap: () => Promise<void>;
  updateState: (updater: (prev: CmsState) => CmsState, logAction?: { action: string; module: string }) => void;
  setLocalStateOnly: (updater: (prev: CmsState) => CmsState) => void;
  submitEnquiry: (
    payload: Omit<AdmissionEnquiry, 'id' | 'status' | 'assignedTo' | 'notes' | 'followUpDate' | 'createdAt'>
  ) => Promise<{ ok: boolean; referenceCode?: string; error?: string }>;
  updateEnquiryStatus: (id: string, status: EnquiryStatus, notes?: string, followUpDate?: string) => Promise<void>;
  login: (identifier: string, password: string, remember?: boolean) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  setSessionUser: (user: AuthUserSession | null) => void;
}

const CmsContext = createContext<CmsContextValue | null>(null);

function mergeBootstrap(base: CmsState, incoming: Partial<CmsState>): CmsState {
  return {
    ...base,
    ...incoming,
    appearance: {
      ...base.appearance,
      ...(incoming.appearance || {}),
      palette: { ...base.appearance.palette, ...(incoming.appearance?.palette || {}) },
      typography: { ...base.appearance.typography, ...(incoming.appearance?.typography || {}) },
      layout: { ...base.appearance.layout, ...(incoming.appearance?.layout || {}) },
    },
    header: { ...base.header, ...(incoming.header || {}) },
    footer: {
      ...base.footer,
      ...(incoming.footer || {}),
      socialLinks: { ...base.footer.socialLinks, ...(incoming.footer?.socialLinks || {}) },
    },
    chatbot: { ...base.chatbot, ...(incoming.chatbot || {}) },
    seo: { ...base.seo, ...(incoming.seo || {}) },
    settings: {
      ...base.settings,
      ...(incoming.settings || {}),
      general: { ...base.settings.general, ...(incoming.settings?.general || {}) },
      branding: { ...base.settings.branding, ...(incoming.settings?.branding || {}) },
      contact: { ...base.settings.contact, ...(incoming.settings?.contact || {}) },
      social: { ...base.settings.social, ...(incoming.settings?.social || {}) },
      integrations: { ...base.settings.integrations, ...(incoming.settings?.integrations || {}) },
      maintenance: { ...base.settings.maintenance, ...(incoming.settings?.maintenance || {}) },
      admissionsConfig: {
        ...base.settings.admissionsConfig,
        ...(incoming.settings?.admissionsConfig || {}),
      },
    },
  };
}

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CmsState>(() => createInitialCmsState());
  const [session, setSession] = useState<AuthUserSession | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [installed, setInstalled] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const syncTimerRef = useRef<number | null>(null);
  const pendingPrevRef = useRef<CmsState | null>(null);

  const loadBootstrap = useCallback(async () => {
    setLoading(true);
    setBackendError(null);

    const statusRes = await installService.getStatus();
    if (statusRes.ok && statusRes.data && !statusRes.data.installed) {
      setInstalled(false);
      setAuthChecked(true);
      setLoading(false);
      return;
    }

    const pubRes = await cmsService.fetchPublicBootstrap();
    if (!pubRes.ok) {
      if (pubRes.code === 'NOT_INSTALLED' || pubRes.status === 503) {
        setInstalled(false);
        setAuthChecked(true);
        setLoading(false);
        return;
      }
      setBackendError(pubRes.message || 'Unable to connect to KITS backend API.');
      setAuthChecked(true);
      setLoading(false);
      return;
    }

    setInstalled(pubRes.data?.installed ?? true);
    if (pubRes.data) {
      setState((prev) => mergeBootstrap(prev, pubRes.data!));
    }

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const loginPath = pubRes.data?.runtimeConfig?.adminLoginPath || '/admin-login';
    const panelPath = pubRes.data?.runtimeConfig?.adminPanelPath || '/control-panel';
    const shouldCheckAuth =
      currentPath.startsWith(panelPath) ||
      currentPath.startsWith(loginPath) ||
      currentPath.startsWith('/admin');

    if (shouldCheckAuth) {
      const user = await authService.fetchCurrentUser();
      setSession(user);
      if (user) {
        const admRes = await cmsService.fetchAdminBootstrap();
        if (admRes.ok && admRes.data) {
          setState((prev) => mergeBootstrap(prev, admRes.data!));
        }
      }
    }

    setAuthChecked(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadBootstrap();
  }, [loadBootstrap]);

  // Apply live CSS theme variables and typography
  useEffect(() => {
    const vars = computeThemeCssVariables(state.appearance);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    root.style.fontSize = `${state.appearance.typography.baseFontSize}px`;
  }, [state.appearance]);

  const setLocalStateOnly = useCallback((updater: (prev: CmsState) => CmsState) => {
    setState((prev) => updater(prev));
  }, []);

  const updateState = useCallback(
    (updater: (prev: CmsState) => CmsState, _logAction?: { action: string; module: string }) => {
      if (!pendingPrevRef.current) {
        pendingPrevRef.current = stateRef.current;
      }
      setState((prev) => updater(prev));
      setSyncStatus('saving');
      setSyncError(null);

      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }

      syncTimerRef.current = window.setTimeout(async () => {
        const snapshotPrev = pendingPrevRef.current;
        pendingPrevRef.current = null;
        if (!snapshotPrev) return;

        const res = await cmsService.syncModuleChanges(snapshotPrev, stateRef.current);
        if (res.ok) {
          setSyncStatus('saved');
          window.setTimeout(() => setSyncStatus((cur) => (cur === 'saved' ? 'idle' : cur)), 2000);
        } else {
          setSyncStatus('error');
          setSyncError(res.error || 'Failed to persist changes to database.');
        }
      }, 280);
    },
    []
  );

  const submitEnquiry = async (
    payload: Omit<AdmissionEnquiry, 'id' | 'status' | 'assignedTo' | 'notes' | 'followUpDate' | 'createdAt'>
  ) => {
    const res = await cmsService.submitPublicEnquiry(payload);
    if (!res.ok || !res.data) {
      return { ok: false, error: res.message || 'Unable to submit enquiry.' };
    }
    return { ok: true, referenceCode: res.data.referenceCode };
  };

  const updateEnquiryStatus = async (
    id: string,
    status: EnquiryStatus,
    notes?: string,
    followUpDate?: string
  ) => {
    setState((prev) => ({
      ...prev,
      enquiries: prev.enquiries.map((e) =>
        e.id === id
          ? {
              ...e,
              status,
              notes: notes !== undefined ? notes : e.notes,
              followUpDate: followUpDate !== undefined ? followUpDate : e.followUpDate,
            }
          : e
      ),
    }));
    setSyncStatus('saving');
    const res = await cmsService.updateEnquiry(id, status, notes, followUpDate);
    setSyncStatus(res.ok ? 'saved' : 'error');
    if (!res.ok) setSyncError(res.message || 'Failed to update enquiry.');
  };

  const login = async (identifier: string, password: string, remember = false) => {
    const res = await authService.login(identifier, password, remember);
    if (!res.ok || !res.user) {
      return { ok: false, error: res.error || 'Invalid credentials.' };
    }
    setSession(res.user);
    const admRes = await cmsService.fetchAdminBootstrap();
    if (admRes.ok && admRes.data) {
      setState((prev) => mergeBootstrap(prev, admRes.data!));
    }
    return { ok: true };
  };

  const logout = async () => {
    await authService.logout();
    setSession(null);
  };

  const adminLoginPath =
    state.runtimeConfig?.adminLoginPath ||
    (import.meta.env.VITE_ADMIN_LOGIN_PATH as string | undefined) ||
    '/admin-login';
  const adminPanelPath =
    state.runtimeConfig?.adminPanelPath ||
    (import.meta.env.VITE_ADMIN_PANEL_PATH as string | undefined) ||
    '/control-panel';

  const hasPermission = (key: PermissionKey): boolean => {
    if (!session) return false;
    if (session.role === 'Super Administrator') return true;
    return session.permissions.includes(key);
  };

  return (
    <CmsContext.Provider
      value={{
        state,
        session,
        authChecked,
        loading,
        installed,
        backendError,
        syncStatus,
        syncError,
        adminLoginPath,
        adminPanelPath,
        hasPermission,
        refreshBootstrap: loadBootstrap,
        updateState,
        setLocalStateOnly,
        submitEnquiry,
        updateEnquiryStatus,
        login,
        logout,
        setSessionUser: setSession,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export function useCms(): CmsContextValue {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return ctx;
}
