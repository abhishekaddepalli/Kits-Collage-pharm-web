import React, { useMemo, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Award,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileCode2,
  FileText,
  FolderOpen,
  Globe,
  GraduationCap,
  HelpCircle,
  Image,
  Images,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LayoutPanelTop,
  Link2,
  Loader2,
  LogOut,
  Menu,
  MessageSquareQuote,
  Navigation,
  Newspaper,
  Palette,
  PanelBottom,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Trees,
  UserCog,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useCms } from '../app/providers/CmsContext';
import { KitsLogo } from '../components/common/KitsLogo';
import { SeoHead } from '../components/common/SeoHead';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { authService } from '../services/auth/authService';
import type { PermissionKey } from '../types/cms';

interface SidebarItem {
  label: string;
  subPath: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  permission?: PermissionKey;
}

const SIDEBAR_GROUPS: { group: string; items: SidebarItem[] }[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', subPath: '', icon: LayoutDashboard, end: true },
      { label: 'Notifications', subPath: '/notifications', icon: Bell },
      { label: 'Activity Logs', subPath: '/activity-logs', icon: Activity, permission: 'system_settings' },
    ],
  },
  {
    group: 'Design & Structure',
    items: [
      { label: 'Website Appearance', subPath: '/appearance', icon: Palette, permission: 'appearance_management' },
      { label: 'Theme & Colors', subPath: '/themes', icon: Sparkles, permission: 'appearance_management' },
      { label: 'Logo & Branding', subPath: '/branding', icon: Award, permission: 'appearance_management' },
      { label: 'Header Manager', subPath: '/header', icon: LayoutPanelTop, permission: 'website_management' },
      { label: 'Navigation Menus', subPath: '/navigation', icon: Navigation, permission: 'website_management' },
      { label: 'Footer Manager', subPath: '/footer', icon: PanelBottom, permission: 'website_management' },
    ],
  },
  {
    group: 'Content & Media',
    items: [
      { label: 'Pages & Builder', subPath: '/pages', icon: FileText, permission: 'page_management' },
      { label: 'Sliders & Banners', subPath: '/sliders', icon: Images, permission: 'website_management' },
      { label: 'Promo Banners', subPath: '/banners', icon: SlidersHorizontal, permission: 'website_management' },
      { label: 'Media Library', subPath: '/media', icon: FolderOpen, permission: 'website_management' },
      { label: 'News & Events', subPath: '/news', icon: Newspaper, permission: 'news' },
      { label: 'Gallery', subPath: '/gallery', icon: Image, permission: 'academic_content' },
      { label: 'Testimonials', subPath: '/testimonials', icon: MessageSquareQuote, permission: 'academic_content' },
      { label: 'Downloads', subPath: '/downloads', icon: Download, permission: 'academic_content' },
    ],
  },
  {
    group: 'Academics & Admissions',
    items: [
      { label: 'Programs', subPath: '/programs', icon: GraduationCap, permission: 'academic_content' },
      { label: 'Departments', subPath: '/departments', icon: Building2, permission: 'academic_content' },
      { label: 'Faculty & Staff', subPath: '/faculty', icon: Users, permission: 'academic_content' },
      { label: 'Admissions', subPath: '/admissions', icon: BookOpen, permission: 'admissions' },
      { label: 'Enquiries', subPath: '/enquiries', icon: Inbox, permission: 'admissions' },
      { label: 'Achievements', subPath: '/achievements', icon: Award, permission: 'academic_content' },
      { label: 'Placements', subPath: '/placements', icon: Briefcase, permission: 'academic_content' },
      { label: 'Campus Life', subPath: '/campus-life', icon: Trees, permission: 'academic_content' },
    ],
  },
  {
    group: 'Engagement & System',
    items: [
      { label: 'Chatbot Manager', subPath: '/chatbot', icon: Bot, permission: 'chatbot' },
      { label: 'Chatbot FAQs', subPath: '/chatbot/faqs', icon: HelpCircle, permission: 'chatbot' },
      { label: 'SEO Manager', subPath: '/seo', icon: Globe, permission: 'website_management' },
      { label: 'Contact & Social Links', subPath: '/contact-social', icon: Link2, permission: 'website_management' },
      { label: 'Forms Manager', subPath: '/forms', icon: FileCode2, permission: 'website_management' },
      { label: 'Users & Roles', subPath: '/users', icon: Shield, permission: 'user_management' },
      { label: 'Website Settings', subPath: '/settings', icon: Settings, permission: 'system_settings' },
      { label: 'Installation Info', subPath: '/install-info', icon: Wrench, permission: 'system_settings' },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const {
    state,
    session,
    authChecked,
    syncStatus,
    syncError,
    adminLoginPath,
    adminPanelPath,
    hasPermission,
    logout,
    setSessionUser,
  } = useCms();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarFilter, setSidebarFilter] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const visibleGroups = useMemo(() => {
    return SIDEBAR_GROUPS.map((grp) => ({
      ...grp,
      items: grp.items
        .filter((item) => !item.permission || hasPermission(item.permission))
        .filter(
          (item) =>
            !sidebarFilter.trim() || item.label.toLowerCase().includes(sidebarFilter.toLowerCase())
        ),
    })).filter((grp) => grp.items.length > 0);
  }, [hasPermission, sidebarFilter]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F7F5FC] flex items-center justify-center p-6">
        <SeoHead noIndex pageTitle="Verifying Session | KITS CMS" />
        <div className="flex items-center gap-2 text-sm font-medium text-[#52128B]">
          <Loader2 className="w-4 h-4 animate-spin" /> Verifying administrator session...
        </div>
      </div>
    );
  }

  if (!session?.isAuthenticated) {
    return <Navigate to={adminLoginPath} replace />;
  }

  const unreadCount = (state.notifications || []).filter((n) => !n.read).length;
  const newEnquiriesCount = (state.enquiries || []).filter((e) => e.status === 'New').length;

  const baseSegments = adminPanelPath.split('/').filter(Boolean).length;
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const activeSeg = pathSegments[baseSegments];
  const currentBreadcrumb = activeSeg
    ? activeSeg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Dashboard';

  const openProfileModal = () => {
    setProfileName(session.displayName);
    setProfileEmail(session.email);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setProfileMsg(null);
    setProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authService.updateProfile(profileName.trim(), profileEmail.trim());
    if (!res.ok || !res.user) {
      setProfileMsg({ ok: false, text: res.message || 'Unable to update profile.' });
      return;
    }
    setSessionUser(res.user);
    setProfileMsg({ ok: true, text: res.message || 'Profile updated.' });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setProfileMsg({ ok: false, text: 'Password confirmation does not match.' });
      return;
    }
    const res = await authService.changePassword({
      currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    });
    if (!res.ok) {
      setProfileMsg({ ok: false, text: res.message || 'Unable to change password.' });
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setProfileMsg({ ok: true, text: res.message || 'Password updated securely.' });
  };

  return (
    <div className="min-h-screen bg-[#F7F5FC] text-[#171238] flex">
      <SeoHead
        noIndex
        pageTitle={`${currentBreadcrumb} · KITS Control Panel`}
        pageDescription="Institutional CMS administration interface."
      />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#1E103A] text-white shrink-0 transition-all duration-200 ${
          collapsed ? 'w-20' : 'w-68'
        }`}
      >
        <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between gap-2">
          {!collapsed ? (
            <Link to={adminPanelPath} className="min-w-0">
              <KitsLogo title="KITS CMS" subtitle="Control Panel" variant="light" compact />
            </Link>
          ) : (
            <Link to={adminPanelPath} className="mx-auto font-display font-bold text-lg text-[#F2C34E]">
              K
            </Link>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg hover:bg-white/10 text-purple-200 cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={sidebarFilter}
                onChange={(e) => setSidebarFilter(e.target.value)}
                placeholder="Filter admin modules..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/10 text-white placeholder:text-purple-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F2C34E]"
              />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {visibleGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              {!collapsed && (
                <div className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-purple-300/75">
                  {grp.group}
                </div>
              )}
              {grp.items.map((item) => {
                const fullPath = `${adminPanelPath}${item.subPath}`;
                return (
                  <NavLink
                    key={fullPath}
                    to={fullPath}
                    end={item.end}
                    title={item.label}
                    className={({ isActive }) =>
                      `flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#52128B] text-white shadow-xs'
                          : 'text-purple-100/80 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <item.icon className="w-4 h-4 shrink-0 text-[#F2C34E]" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </span>
                    {!collapsed && item.subPath === '/enquiries' && newEnquiriesCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#B21A83] text-white rounded-full tabular-nums">
                        {newEnquiriesCount}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className="p-3 border-t border-white/10 text-center bg-black/15 shrink-0">
            <p className="text-[10px] text-purple-300/60 uppercase tracking-wider font-semibold">Engineering &amp; Design</p>
            <p className="text-xs font-semibold text-[#F2C34E] tracking-wide mt-0.5">Infiniforge Technologies</p>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex">
          <div className="w-72 bg-[#1E103A] text-white h-full flex flex-col">
            <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-display font-bold text-base">KITS Control Panel</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
                className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {visibleGroups.map((grp) => (
                <div key={grp.group} className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-purple-300/75">
                    {grp.group}
                  </div>
                  {grp.items.map((item) => {
                    const fullPath = `${adminPanelPath}${item.subPath}`;
                    return (
                      <NavLink
                        key={fullPath}
                        to={fullPath}
                        end={item.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                            isActive ? 'bg-[#52128B] text-white' : 'text-purple-100/80 hover:bg-white/10'
                          }`
                        }
                      >
                        <item.icon className="w-4 h-4 text-[#F2C34E]" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Header */}
        <header className="h-16 bg-white border-b border-[#E8DFF5] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open admin menu"
              className="lg:hidden p-2 rounded-lg border border-[#E8DFF5] cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 truncate">
              <Link to={adminPanelPath} className="hover:text-[#52128B] font-medium">
                Control Panel
              </Link>
              <span>/</span>
              <span className="font-semibold text-[#171238] truncate">{currentBreadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {syncStatus === 'saving' && (
              <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#52128B]" /> Saving...
              </span>
            )}
            {syncStatus === 'saved' && (
              <span className="hidden md:inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="hidden md:inline-flex items-center gap-1 text-xs text-red-700 font-medium" title={syncError || ''}>
                Sync failed
              </span>
            )}

            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#52128B] bg-[#F5F0FC] hover:bg-[#EAE0FA] rounded-full transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Public Site</span>
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
                className="relative p-2 rounded-full hover:bg-[#F5F0FC] cursor-pointer"
              >
                <Bell className="w-4 h-4 text-[#171238]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B21A83]" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#E8DFF5] rounded-xl shadow-xl z-50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Notifications ({unreadCount})</span>
                    <Link
                      to={`${adminPanelPath}/notifications`}
                      onClick={() => setNotifOpen(false)}
                      className="text-[#52128B] hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {(state.notifications || []).length === 0 ? (
                      <div className="py-3 text-xs text-slate-500 text-center">No notifications yet.</div>
                    ) : (
                      (state.notifications || []).slice(0, 4).map((n) => (
                        <div key={n.id} className="py-2 text-xs">
                          <div className="font-semibold text-[#171238]">{n.title}</div>
                          <div className="text-slate-500">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-[#E8DFF5]">
              <button
                type="button"
                onClick={openProfileModal}
                aria-label="Manage administrator profile"
                className="hidden md:flex flex-col text-right hover:opacity-80 cursor-pointer"
              >
                <span className="text-xs font-bold text-[#171238]">{session.displayName}</span>
                <span className="text-[10px] text-slate-500">{session.role}</span>
              </button>
              <button
                type="button"
                onClick={openProfileModal}
                aria-label="Account profile and password"
                title="Account & Password"
                className="p-2 rounded-lg hover:bg-[#F5F0FC] text-[#52128B] cursor-pointer"
              >
                <UserCog className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate(adminLoginPath, { replace: true });
                }}
                aria-label="Sign out"
                title="Sign out"
                className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Active Admin Module Viewport */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <ErrorBoundary fallbackTitle="Module View Recovered">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Profile & Change Password Modal */}
      {profileOpen && (
        <div
          role="dialog"
          aria-label="Administrator Profile and Password"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-[#E8DFF5] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#171238]">My Profile & Security</h2>
              <button type="button" onClick={() => setProfileOpen(false)} aria-label="Close modal" className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {profileMsg && (
              <div
                className={`p-3 rounded-xl text-xs border ${
                  profileMsg.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs border-b border-[#E8DFF5] pb-5">
              <div className="font-bold text-[#52128B]">Account Information</div>
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFF5] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFF5] rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full cursor-pointer"
              >
                Update Profile
              </button>
            </form>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div className="font-bold text-[#52128B] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> Change Password
              </div>
              <div>
                <label className="block font-semibold mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFF5] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#171238] rounded-full cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
