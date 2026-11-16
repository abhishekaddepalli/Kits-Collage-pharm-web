import React, { useEffect, useState } from 'react';
import { Check, Plus, Shield, Trash2 } from 'lucide-react';
import { useCms } from '../app/providers/CmsContext';
import { apiRequest } from '../services/api/apiClient';
import { authService } from '../services/auth/authService';
import { cmsService } from '../services/cms/cmsService';
import type { AdminRoleName } from '../types/cms';

export const SeoManager: React.FC = () => {
  const { state, updateState } = useCms();
  const seo = state.seo;

  const updateSeo = (patch: Partial<typeof seo>) => {
    updateState(
      (prev) => ({ ...prev, seo: { ...prev.seo, ...patch } }),
      { action: 'Updated SEO configuration', module: 'SEO' }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171238]">SEO & Search Preview Manager</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage metadata, Schema.org structured JSON-LD, search indexing rules, and public XML sitemap output.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E8DFF5] rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Default Website Title</label>
            <input
              type="text"
              value={seo.siteTitle}
              onChange={(e) => updateSeo({ siteTitle: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Meta Description</label>
            <textarea
              rows={3}
              value={seo.siteDescription}
              onChange={(e) => updateSeo({ siteDescription: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-[#E8DFF5] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Keywords</label>
            <input
              type="text"
              value={seo.defaultKeywords}
              onChange={(e) => updateSeo({ defaultKeywords: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-[#E8DFF5] rounded-lg"
            />
          </div>
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={seo.robotsIndex}
                onChange={(e) => updateSeo({ robotsIndex: e.target.checked })}
              />
              Allow Search Indexing
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={seo.enableSitemap}
                onChange={(e) => updateSeo({ enableSitemap: e.target.checked })}
              />
              Enable Sitemap (/sitemap.xml)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={seo.enableStructuredData}
                onChange={(e) => updateSeo({ enableStructuredData: e.target.checked })}
              />
              Schema.org Structured Data
            </label>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E8DFF5] rounded-2xl p-6 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Live Search Result Preview
          </div>
          <div className="p-4 rounded-xl bg-[#FCFAFF] border border-[#E8DFF5] space-y-1">
            <div className="text-xs text-emerald-700 truncate">{state.settings.general.websiteUrl}</div>
            <div className="text-base font-semibold text-blue-800 hover:underline">{seo.siteTitle}</div>
            <div className="text-xs text-slate-600 leading-relaxed">{seo.siteDescription}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactSocialManager: React.FC = () => {
  const { state, updateState } = useCms();
  const c = state.settings.contact;
  const s = state.settings.social;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#171238]">Contact & Social Links</h1>
      <div className="bg-white border border-[#E8DFF5] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="md:col-span-2">
          <label className="block font-semibold mb-1">Campus Address</label>
          <input
            type="text"
            value={c.address}
            onChange={(e) =>
              updateState((prev) => ({
                ...prev,
                settings: { ...prev.settings, contact: { ...prev.settings.contact, address: e.target.value } },
                footer: { ...prev.footer, address: e.target.value },
              }))
            }
            className="w-full px-3 py-2 border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Primary Phone</label>
          <input
            type="text"
            value={c.primaryPhone}
            onChange={(e) =>
              updateState((prev) => ({
                ...prev,
                settings: { ...prev.settings, contact: { ...prev.settings.contact, primaryPhone: e.target.value } },
                header: { ...prev.header, phone: e.target.value },
                footer: { ...prev.footer, phone: e.target.value },
              }))
            }
            className="w-full px-3 py-2 border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Official Email</label>
          <input
            type="text"
            value={c.email}
            onChange={(e) =>
              updateState((prev) => ({
                ...prev,
                settings: { ...prev.settings, contact: { ...prev.settings.contact, email: e.target.value } },
                header: { ...prev.header, email: e.target.value },
                footer: { ...prev.footer, email: e.target.value },
              }))
            }
            className="w-full px-3 py-2 border border-[#E8DFF5] rounded-lg"
          />
        </div>
        {(['facebook', 'instagram', 'youtube', 'linkedin', 'x'] as const).map((platform) => (
          <div key={platform}>
            <label className="block font-semibold mb-1 capitalize">{platform} URL</label>
            <input
              type="url"
              value={s[platform]}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    social: { ...prev.settings.social, [platform]: e.target.value },
                  },
                  footer: {
                    ...prev.footer,
                    socialLinks: { ...prev.footer.socialLinks, [platform]: e.target.value },
                  },
                }))
              }
              className="w-full px-3 py-2 border border-[#E8DFF5] rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const FormsManager: React.FC = () => {
  const { state, updateState } = useCms();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#171238]">Forms Manager</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.forms.map((form) => (
          <div key={form.id} className="bg-white border border-[#E8DFF5] rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#171238] font-sans">{form.name}</h2>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    updateState((prev) => ({
                      ...prev,
                      forms: prev.forms.map((f) => (f.id === form.id ? { ...f, active: e.target.checked } : f)),
                    }))
                  }
                />
                Active
              </label>
            </div>
            <p className="text-slate-600">{form.description}</p>
            <div className="space-y-1">
              <div className="font-semibold">Configured Fields ({form.fields.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {form.fields.map((fld) => (
                  <span key={fld.id} className="px-2 py-0.5 bg-[#F5F0FC] text-[#52128B] rounded">
                    {fld.label}{fld.required ? ' *' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const UsersRolesManager: React.FC = () => {
  const { state, session, setLocalStateOnly } = useCms();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRoleName>('Content Editor');
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [creating, setCreating] = useState(false);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim() || password.length < 8) {
      setNotice({
        ok: false,
        text: 'Please provide full name, username (min 3 chars), email, and a password of at least 8 characters.',
      });
      return;
    }

    setCreating(true);
    setNotice(null);
    const res = await cmsService.createUser({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
      role,
      active: true,
    });
    setCreating(false);

    if (!res.ok || !res.data) {
      setNotice({ ok: false, text: res.message || 'Failed to create user.' });
      return;
    }

    setLocalStateOnly((prev) => ({ ...prev, users: [res.data!, ...prev.users] }));
    setNotice({ ok: true, text: `Administrator account "${res.data.username}" created.` });
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  const handleUpdateUser = async (id: string, patch: { role?: AdminRoleName; active?: boolean }) => {
    const res = await cmsService.updateUser(id, patch);
    if (!res.ok) {
      setNotice({ ok: false, text: res.message || 'Unable to update user.' });
      return;
    }
    setLocalStateOnly((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }));
  };

  const handleDeleteUser = async (id: string, targetName: string) => {
    const res = await cmsService.deleteUser(id);
    if (!res.ok) {
      setNotice({ ok: false, text: res.message || 'Unable to delete user.' });
      return;
    }
    setLocalStateOnly((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
    }));
    setNotice({ ok: true, text: `Removed user "${targetName}".` });
  };

  const handleTriggerReset = async (targetEmail: string) => {
    const res = await authService.forgotPassword(targetEmail);
    setNotice({ ok: res.ok, text: res.message });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171238]">Users & Role Permissions</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Server-enforced RBAC with salted password hashing and per-permission API checks.
        </p>
      </div>

      {notice && (
        <div
          className={`px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border ${
            notice.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <Check className="w-4 h-4 shrink-0" /> {notice.text}
        </div>
      )}

      <form onSubmit={addUser} className="bg-white border border-[#E8DFF5] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
        />
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username (e.g. editor_kits)"
          className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Initial password (8+ chars)"
          className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as AdminRoleName)}
          className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg bg-white"
        >
          {state.roles.map((r) => (
            <option key={r.id} value={r.name}>{r.name}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#52128B] hover:bg-[#32105B] rounded-lg cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 inline mr-1" /> {creating ? 'Saving...' : 'Create User'}
        </button>
      </form>

      <div className="bg-white border border-[#E8DFF5] rounded-2xl overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="border-b border-[#E8DFF5] bg-[#FCFAFF] text-slate-500">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {state.users.map((u) => {
              const isSelf = session?.id === u.id;
              return (
                <tr key={u.id}>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#171238]">
                      {u.name} {isSelf && <span className="text-[10px] text-[#52128B]">(You)</span>}
                    </div>
                    <div className="text-slate-500">@{u.username} · {u.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      aria-label={`Role for ${u.name}`}
                      value={u.role}
                      disabled={isSelf}
                      onChange={(e) => void handleUpdateUser(u.id, { role: e.target.value as AdminRoleName })}
                      className="px-2 py-1 border border-[#E8DFF5] rounded bg-white disabled:opacity-60"
                    >
                      {state.roles.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={u.active}
                        disabled={isSelf}
                        onChange={(e) => void handleUpdateUser(u.id, { active: e.target.checked })}
                      />
                      {u.active ? 'Active' : 'Suspended'}
                    </label>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => void handleTriggerReset(u.email)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#52128B] bg-[#F5F0FC] rounded cursor-pointer"
                    >
                      Send Reset Email
                    </button>
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => void handleDeleteUser(u.id, u.name)}
                        aria-label={`Delete ${u.name}`}
                        className="p-1 text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Role Permission Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.roles.map((r) => (
          <div key={r.id} className="bg-white border border-[#E8DFF5] rounded-xl p-4 space-y-2 text-xs">
            <div className="font-bold text-[#171238] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#52128B]" /> {r.name}
            </div>
            <p className="text-slate-500">{r.description}</p>
            <div className="flex flex-wrap gap-1 pt-1">
              {r.permissions.map((perm) => (
                <span key={perm} className="px-2 py-0.5 bg-[#F5F0FC] text-[#52128B] rounded text-[10px]">
                  {perm.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const NotificationsManager: React.FC = () => {
  const { state, setLocalStateOnly } = useCms();

  const handleMarkAllRead = async () => {
    const res = await cmsService.markAllNotificationsRead();
    if (res.ok) {
      setLocalStateOnly((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, read: true })),
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171238]">Notifications</h1>
        <button
          type="button"
          onClick={() => void handleMarkAllRead()}
          className="px-4 py-2 text-xs font-semibold text-[#52128B] bg-white border border-[#E8DFF5] rounded-full cursor-pointer"
        >
          Mark All Read
        </button>
      </div>
      <div className="bg-white border border-[#E8DFF5] rounded-2xl divide-y divide-slate-100">
        {state.notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">No notifications recorded.</div>
        ) : (
          state.notifications.map((n) => (
            <div key={n.id} className="p-4 flex items-center justify-between gap-4 text-xs">
              <div>
                <div className="font-bold text-[#171238]">
                  {n.title} {!n.read && <span className="text-[#B21A83]">(Unread)</span>}
                </div>
                <div className="text-slate-600 mt-0.5">{n.message}</div>
              </div>
              <span className="text-slate-400 whitespace-nowrap">{n.createdAt}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const WebsiteSettingsManager: React.FC = () => {
  const { state, updateState } = useCms();
  const s = state.settings;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#171238]">Website Settings & Maintenance</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E8DFF5] rounded-2xl p-6 space-y-4 text-xs">
          <h2 className="text-base font-bold text-[#171238] font-sans">General Settings</h2>
          <div>
            <label className="block font-semibold mb-1">Website Name</label>
            <input
              type="text"
              value={s.general.websiteName}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, general: { ...prev.settings.general, websiteName: e.target.value } },
                }))
              }
              className="w-full px-3 py-2 border border-[#E8DFF5] rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Timezone</label>
            <input
              type="text"
              value={s.general.timezone}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, general: { ...prev.settings.general, timezone: e.target.value } },
                }))
              }
              className="w-full px-3 py-2 border border-[#E8DFF5] rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Google Analytics Measurement ID</label>
            <input
              type="text"
              value={s.integrations.googleAnalyticsId}
              placeholder="G-XXXXXXXXXX"
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    integrations: { ...prev.settings.integrations, googleAnalyticsId: e.target.value },
                  },
                }))
              }
              className="w-full px-3 py-2 border border-[#E8DFF5] rounded-lg"
            />
          </div>
        </div>

        <div className="bg-white border border-[#E8DFF5] rounded-2xl p-6 space-y-4 text-xs">
          <h2 className="text-base font-bold text-[#171238] font-sans">Maintenance Mode</h2>
          <label className="flex items-center gap-2 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={s.maintenance.enabled}
              onChange={(e) =>
                updateState(
                  (prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      maintenance: { ...prev.settings.maintenance, enabled: e.target.checked },
                    },
                  }),
                  { action: `${e.target.checked ? 'Enabled' : 'Disabled'} maintenance mode`, module: 'Settings' }
                )
              }
            />
            Enable Public Maintenance Screen
          </label>
          <textarea
            rows={3}
            value={s.maintenance.message}
            onChange={(e) =>
              updateState((prev) => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  maintenance: { ...prev.settings.maintenance, message: e.target.value },
                },
              }))
            }
            className="w-full px-3 py-2 border border-[#E8DFF5] rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

interface InstallInfoPayload {
  installed: boolean;
  appVersion: string;
  installedAt?: string | null;
  installedByEmail?: string | null;
  adminLoginPath: string;
  adminPanelPath: string;
  phpVersion: string;
  databaseHost: string;
  databaseName: string;
}

export const InstallInfoManager: React.FC = () => {
  const { state, adminLoginPath, adminPanelPath } = useCms();
  const [liveInfo, setLiveInfo] = useState<InstallInfoPayload | null>(null);

  useEffect(() => {
    void apiRequest<InstallInfoPayload>('/admin/install-info').then((res) => {
      if (res.ok && res.data) {
        setLiveInfo(res.data);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171238]">Installation & Environment Info</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          The installation wizard is permanently locked once initial Super Administrator provisioning completes.
        </p>
      </div>
      <div className="bg-white border border-[#E8DFF5] rounded-2xl p-6">
        <dl className="divide-y divide-[#E8DFF5] text-xs sm:text-sm">
          <div className="py-3 flex justify-between">
            <dt className="text-slate-500">Installer Status</dt>
            <dd className="font-semibold text-emerald-700">
              {liveInfo?.installed ? 'Installed & Locked' : 'Active'}
            </dd>
          </div>
          <div className="py-3 flex justify-between">
            <dt className="text-slate-500">Server Runtime</dt>
            <dd className="font-mono">{liveInfo?.phpVersion || 'PHP / Backend'}</dd>
          </div>
          <div className="py-3 flex justify-between">
            <dt className="text-slate-500">Database Host / Schema</dt>
            <dd className="font-mono">
              {liveInfo?.databaseHost || state.installInfo.databaseHost} · {liveInfo?.databaseName || state.installInfo.databaseName}
            </dd>
          </div>
          <div className="py-3 flex justify-between">
            <dt className="text-slate-500">Configured Admin Login Path</dt>
            <dd className="font-mono">{liveInfo?.adminLoginPath || adminLoginPath}</dd>
          </div>
          <div className="py-3 flex justify-between">
            <dt className="text-slate-500">Configured Control Panel Path</dt>
            <dd className="font-mono">{liveInfo?.adminPanelPath || adminPanelPath}</dd>
          </div>
          <div className="py-3 flex justify-between">
            <dt className="text-slate-500">App Version</dt>
            <dd className="font-mono">{liveInfo?.appVersion || state.installInfo.appVersion}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export const ActivityLogsManager: React.FC = () => {
  const { state } = useCms();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#171238]">Activity Logs</h1>
      <div className="bg-white border border-[#E8DFF5] rounded-2xl overflow-x-auto">
        {state.activityLogs.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">No audit entries recorded yet.</div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="border-b border-[#E8DFF5] bg-[#FCFAFF] text-slate-500">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.activityLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-3 px-4 tabular-nums text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-4 font-semibold">{log.actor}</td>
                  <td className="py-3 px-4 text-[#52128B] font-medium">{log.module}</td>
                  <td className="py-3 px-4">{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
