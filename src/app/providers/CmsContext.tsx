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

function mergeBootstrap(base: CmsState, incoming: Partial<CmsState> & { cms?: Partial<CmsState> }): CmsState {
  const inc = incoming?.cms ? { ...incoming.cms, ...incoming } : (incoming || {});
  return {
    ...base,
    ...inc,
    pages: inc.pages || base.pages || [],
    programs: inc.programs || base.programs || [],
    departments: inc.departments || base.departments || [],
    faculty: inc.faculty || base.faculty || [],
    enquiries: inc.enquiries || base.enquiries || [],
    newsEvents: inc.newsEvents || base.newsEvents || [],
    achievements: inc.achievements || base.achievements || [],
    placements: inc.placements || base.placements || [],
    campusLife: inc.campusLife || base.campusLife || [],
    gallery: inc.gallery || base.gallery || [],
    testimonials: inc.testimonials || base.testimonials || [],
    downloads: inc.downloads || base.downloads || [],
    sliders: inc.sliders || base.sliders || [],
    banners: inc.banners || base.banners || [],
    media: inc.media || base.media || [],
    forms: inc.forms || base.forms || [],
    roles: inc.roles || base.roles || [],
    users: inc.users || base.users || [],
    notifications: inc.notifications || base.notifications || [],
    activityLogs: inc.activityLogs || base.activityLogs || [],
    appearance: {
      ...base.appearance,
      ...(inc.appearance || {}),
      palette: { ...base.appearance?.palette, ...(inc.appearance?.palette || {}) },
      typography: { ...base.appearance?.typography, ...(inc.appearance?.typography || {}) },
      layout: { ...base.appearance?.layout, ...(inc.appearance?.layout || {}) },
    },
    header: { ...base.header, ...(inc.header || {}) },
    footer: {
      ...base.footer,
      ...(inc.footer || {}),
      socialLinks: { ...base.footer?.socialLinks, ...(inc.footer?.socialLinks || {}) },
    },
    chatbot: { ...base.chatbot, ...(inc.chatbot || {}) },
    seo: { ...base.seo, ...(inc.seo || {}) },
    settings: {
      ...base.settings,
      ...(inc.settings || {}),
      general: { ...base.settings?.general, ...(inc.settings?.general || {}) },
      branding: { ...base.settings?.branding, ...(inc.settings?.branding || {}) },
      contact: { ...base.settings?.contact, ...(inc.settings?.contact || {}) },
      social: { ...base.settings?.social, ...(inc.settings?.social || {}) },
      integrations: { ...base.settings?.integrations, ...(inc.settings?.integrations || {}) },
      maintenance: { ...base.settings?.maintenance, ...(inc.settings?.maintenance || {}) },
      admissionsConfig: {
        ...base.settings?.admissionsConfig,
        ...(inc.settings?.admissionsConfig || {}),
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
