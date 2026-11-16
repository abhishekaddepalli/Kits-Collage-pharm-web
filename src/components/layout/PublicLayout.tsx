import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Building2,
  ChevronDown,
  Facebook,
  Globe,
  GraduationCap,
  Home,
  Images,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
  X,
  Youtube,
} from 'lucide-react';
import { useCms } from '../../app/providers/CmsContext';
import { KitsChatbot } from '../chatbot/KitsChatbot';
import { KitsLogo } from '../common/KitsLogo';
import { SeoHead } from '../common/SeoHead';

export const PublicLayout: React.FC = () => {
  const { state, loading, installed, backendError, refreshBootstrap } = useCms();
  const { header, navigation, footer, settings } = state;
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState(header.defaultLanguage || 'English');

  const enabledNav = navigation.filter((n) => n.enabled).sort((a, b) => a.order - b.order);

  if (!loading && !installed) {
    return (
      <div className="min-h-screen bg-[#FCFAFF] flex flex-col items-center justify-center p-6 text-center">
        <SeoHead noIndex />
        <div className="max-w-md bg-white border border-[var(--kits-border)] rounded-2xl p-8 shadow-sm space-y-4">
          <div className="flex justify-center">
            <KitsLogo logoUrl={header.logoUrl} title={header.collegeName} subtitle={header.collegeSubtitle} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--kits-heading)]">Initial Setup Required</h1>
          <p className="text-sm text-[var(--kits-body)]">
            This KITS College of Pharmacy for Women installation is awaiting initial database and administrator configuration.
          </p>
          <Link
            to="/install"
            className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-[var(--kits-primary)] hover:bg-[var(--kits-secondary)] rounded-full"
          >
            Launch Installation Wizard
          </Link>
        </div>
      </div>
    );
  }

  if (backendError) {
    return (
      <div className="min-h-screen bg-[#FCFAFF] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-red-200 rounded-2xl p-8 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-[#171238]">Service Temporarily Unavailable</h1>
          <p className="text-sm text-slate-600">{backendError}</p>
          <button
            type="button"
            onClick={() => void refreshBootstrap()}
            className="px-5 py-2 text-xs font-semibold text-white bg-[var(--kits-primary)] rounded-full cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // If Maintenance Mode is toggled ON in Admin Settings
  if (settings.maintenance.enabled) {
    return (
      <div className="min-h-screen bg-[#FCFAFF] flex flex-col items-center justify-center p-6 text-center">
        <SeoHead noIndex />
        <div className="max-w-lg bg-white border border-[var(--kits-border)] rounded-2xl p-8 shadow-sm">
          <div className="flex justify-center mb-5">
            <KitsLogo
              logoUrl={header.logoUrl}
              title={header.collegeName}
              subtitle={header.collegeSubtitle}
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-2">
            {settings.maintenance.mode === 'coming_soon' ? 'Portal Update' : 'Scheduled Maintenance'}
          </p>
          <h1 className="text-2xl font-bold text-[var(--kits-heading)] mb-3">
            {settings.general.collegeName}
          </h1>
          <p className="text-sm text-[var(--kits-body)] leading-relaxed mb-6">
            {settings.maintenance.message}
          </p>
          <div className="text-xs text-slate-600 space-y-1">
            <p>Phone: {settings.contact.primaryPhone}</p>
            <p>Email: {settings.contact.email}</p>
          </div>
        </div>
      </div>
    );
  }

  const searchResults = searchQuery.trim()
    ? [
        ...state.programs
          .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((p) => ({ title: p.name, category: 'Program', path: '/academics/programs' })),
        ...state.departments
          .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((d) => ({ title: d.name, category: 'Department', path: `/departments/${d.slug}` })),
        ...state.newsEvents
          .filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((n) => ({ title: n.title, category: 'News & Events', path: `/news/${n.slug}` })),
        ...state.campusLife
          .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((c) => ({ title: c.title, category: 'Campus Life', path: `/campus-life/${c.slug}` })),
      ].slice(0, 8)
    : [];

  return (
    <div
      className="min-h-screen flex flex-col bg-[var(--kits-bg)] text-[var(--kits-body)] pb-16 md:pb-0"
      style={{ maxWidth: '100vw', overflowX: 'clip' }}
    >
      <SeoHead />
      {/* Top Information Bar */}
      <div className="bg-[var(--kits-surface)] border-b border-[var(--kits-border)] text-xs text-[var(--kits-heading)]">
        <div
          className="mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between gap-4"
          style={{ maxWidth: 'var(--kits-container-max)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[var(--kits-primary)] shrink-0" />
            <span className="truncate">{header.locationShort}</span>
          </div>

          <div className="hidden lg:flex items-center gap-3.5 shrink-0">
            {header.showAnnouncement && header.announcementText && (
              <Link
                to={header.announcementLink || '/admissions'}
                className="hidden 2xl:inline-block truncate max-w-[300px] text-[var(--kits-accent)] font-semibold hover:underline whitespace-nowrap"
              >
                {header.announcementText}
              </Link>
            )}
            <Link to={header.examPortalUrl} className="hover:text-[var(--kits-primary)] whitespace-nowrap">
              {header.examPortalLabel}
            </Link>
            <Link to={header.studentPortalUrl} className="hover:text-[var(--kits-primary)] whitespace-nowrap">
              {header.studentPortalLabel}
            </Link>
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <Globe className="w-3.5 h-3.5 text-[var(--kits-primary)]" />
              <select
                aria-label="Language selector"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu (Preview)</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Main Header + Navigation Wrapper */}
      <div className={header.sticky ? 'sticky top-0 z-40 shadow-xs' : 'relative z-40'}>
        {/* Main Brand & Institutional Info Header */}
        <header
          style={{ backgroundColor: header.headerBg, color: header.headerTextColor }}
          className="border-b border-[var(--kits-border)]"
        >
          <div
            className="mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4"
            style={{ maxWidth: 'var(--kits-container-max)' }}
          >
            <Link to="/" className="shrink-0">
              <KitsLogo
                logoUrl={header.logoUrl}
                title={header.collegeName}
                subtitle={header.collegeSubtitle}
              />
            </Link>

            {/* Institutional Recognition Markers */}
            <div className="hidden xl:flex items-center gap-5 text-xs">
              <div className="flex items-center gap-2 pl-4 border-l border-[var(--kits-border)]">
                <Award className="w-4 h-4 text-[var(--kits-primary)] shrink-0" />
                <div>
                  <div className="font-semibold text-[var(--kits-heading)] whitespace-nowrap">
                    {header.affiliationText}
                  </div>
                  <div className="text-[11px] text-slate-500">University Affiliation</div>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-4 border-l border-[var(--kits-border)]">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <div className="font-semibold text-[var(--kits-heading)] whitespace-nowrap">
                    {header.approvalText}
                  </div>
                  <div className="text-[11px] text-slate-500">Pharmacy Council of India</div>
                </div>
              </div>
            </div>

            {/* Contact & Apply CTA */}
            <div className="flex items-center gap-4 shrink-0">
              <a
                href={`tel:${header.phone.replace(/\s+/g, '')}`}
                className="hidden md:flex items-center gap-2.5 text-right hover:opacity-85 transition-opacity"
              >
                <span className="w-9 h-9 rounded-full bg-[var(--kits-surface)] text-[var(--kits-primary)] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </span>
                <div className="text-left">
                  <div className="text-sm font-bold text-[var(--kits-heading)] tabular-nums whitespace-nowrap">
                    {header.phone}
                  </div>
                  <div className="text-[11px] text-slate-500 whitespace-nowrap">
                    {header.workingHours}
                  </div>
                </div>
              </a>

              <Link
                to={header.applyButtonPath || '/admissions'}
                style={{
                  backgroundColor: 'var(--kits-btn-bg)',
                  borderRadius: 'var(--kits-radius-btn)',
                }}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                {header.applyButtonLabel}
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                className="lg:hidden p-2 rounded-lg border border-[var(--kits-border)] text-[var(--kits-heading)] hover:bg-[var(--kits-surface)] cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Primary Navigation Bar */}
        <nav
          aria-label="Primary navigation"
          style={{ backgroundColor: header.navBg, color: header.navTextColor }}
          className="hidden lg:block"
        >
          <div
            className="mx-auto px-4 sm:px-6 flex items-center justify-between gap-2"
            style={{ maxWidth: 'var(--kits-container-max)' }}
          >
            <ul className="flex items-center gap-0.5 flex-nowrap">
              {enabledNav.map((item) => {
                const hasChildren = item.children && item.children.some((c) => c.enabled);
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                return (
                  <li
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => hasChildren && setOpenDropdownId(item.id)}
                    onMouseLeave={() => hasChildren && setOpenDropdownId(null)}
                  >
                    <div className="flex items-center">
                      <NavLink
                        to={item.path}
                        target={item.openInNewTab ? '_blank' : undefined}
                        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                        className={`inline-flex items-center gap-1 px-2 xl:px-2.5 py-3 text-[12px] xl:text-[13px] font-medium whitespace-nowrap transition-colors border-b-2 ${
                          isActive
                            ? 'border-[var(--kits-gold)] text-[var(--kits-gold)]'
                            : 'border-transparent text-white/95 hover:text-[var(--kits-gold)]'
                        }`}
                      >
                        {item.label}
                        {hasChildren && <ChevronDown className="w-3 h-3 opacity-80" />}
                      </NavLink>
                    </div>

                    {hasChildren && openDropdownId === item.id && (
                      <div className="absolute left-0 top-full w-60 bg-white text-[var(--kits-heading)] rounded-b-xl shadow-xl border border-[var(--kits-border)] py-2 z-50">
                        {item.children!
                          .filter((c) => c.enabled)
                          .sort((a, b) => a.order - b.order)
                          .map((child) => (
                            <Link
                              key={child.id}
                              to={child.path}
                              onClick={() => setOpenDropdownId(null)}
                              className="block px-4 py-2 text-xs font-medium hover:bg-[var(--kits-surface)] hover:text-[var(--kits-primary)] transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search college website"
                className="p-2 text-white/90 hover:text-[var(--kits-gold)] transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[var(--kits-border)] shadow-lg max-h-[75vh] overflow-y-auto">
            <div className="p-4 space-y-1">
              {enabledNav.map((item) => (
                <div key={item.id} className="border-b border-[var(--kits-border)]/50 pb-1">
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-2 text-sm font-semibold text-[var(--kits-heading)] hover:text-[var(--kits-primary)]"
                  >
                    {item.label}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <div className="pl-4 pb-2 space-y-1">
                      {item.children
                        .filter((c) => c.enabled)
                        .map((child) => (
                          <Link
                            key={child.id}
                            to={child.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1.5 px-2 text-xs text-[var(--kits-body)] hover:text-[var(--kits-primary)]"
                          >
                            {child.label}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-3 flex flex-wrap gap-2">
                <Link
                  to="/admissions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 px-4 text-xs font-semibold text-white bg-[var(--kits-primary)] rounded-full"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <div
          role="dialog"
          aria-label="Search KITS Website"
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[var(--kits-border)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--kits-border)] flex items-center gap-3">
              <Search className="w-5 h-5 text-[var(--kits-primary)]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programs, departments, news, campus facilities..."
                className="flex-1 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-3">
              {!searchQuery.trim() ? (
                <p className="text-xs text-slate-500 p-3">
                  Try searching for &ldquo;Pharmaceutics&rdquo;, &ldquo;B.Pharmacy&rdquo;, &ldquo;Library&rdquo;, or &ldquo;Admissions&rdquo;.
                </p>
              ) : searchResults.length === 0 ? (
                <p className="text-xs text-slate-500 p-3">No matching items found.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {searchResults.map((res, idx) => (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          navigate(res.path);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-[var(--kits-surface)] rounded-lg flex items-center justify-between cursor-pointer"
                      >
                        <span className="text-sm font-medium text-[var(--kits-heading)]">{res.title}</span>
                        <span className="text-xs text-slate-500">{res.category}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Public Route View */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Multi-Column Institutional Footer */}
      <footer
        style={{ backgroundColor: footer.backgroundColor, color: footer.textColor }}
        className="pt-14 pb-8 border-t border-white/10"
      >
        <div
          className="mx-auto px-4 sm:px-6"
          style={{ maxWidth: 'var(--kits-container-max)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-white/10">
            <div className="lg:col-span-4 space-y-4">
              <KitsLogo
                logoUrl={footer.logoUrl}
                title={header.collegeName}
                subtitle={header.collegeSubtitle}
                variant="light"
              />
              <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed max-w-sm">
                {footer.introText}
              </p>
              {footer.customBlockContent && (
                <div className="pt-2 text-xs text-purple-200/80">
                  <div className="font-semibold text-[var(--kits-gold)]">{footer.customBlockTitle}</div>
                  <div>{footer.customBlockContent}</div>
                </div>
              )}
            </div>

            {footer.columns.map((col) => (
              <div key={col.id} className="lg:col-span-2 space-y-3">
                <h3 className="text-sm font-bold text-white font-sans">{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map((lnk) => (
                    <li key={lnk.id}>
                      <Link
                        to={lnk.path}
                        className="text-xs text-purple-100/80 hover:text-[var(--kits-gold)] transition-colors"
                      >
                        {lnk.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-bold text-white font-sans">Get in Touch</h3>
              <ul className="space-y-2.5 text-xs text-purple-100/85">
                <li className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-[var(--kits-gold)] shrink-0 mt-0.5" />
                  <a href={`tel:${footer.phone.replace(/\s+/g, '')}`} className="hover:text-white tabular-nums">
                    {footer.phone}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-[var(--kits-gold)] shrink-0 mt-0.5" />
                  <a href={`mailto:${footer.email}`} className="hover:text-white break-all">
                    {footer.email}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[var(--kits-gold)] shrink-0 mt-0.5" />
                  <span>{footer.address}</span>
                </li>
              </ul>

              <div className="pt-2 flex items-center gap-2">
                {footer.socialLinks.youtube && (
                  <a
                    href={footer.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[var(--kits-accent)] flex items-center justify-center transition-colors"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                )}
                {footer.socialLinks.instagram && (
                  <a
                    href={footer.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[var(--kits-accent)] flex items-center justify-center transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                )}
                {footer.socialLinks.facebook && (
                  <a
                    href={footer.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[var(--kits-accent)] flex items-center justify-center transition-colors"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                  </a>
                )}
                {footer.socialLinks.linkedin && (
                  <a
                    href={footer.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[var(--kits-accent)] flex items-center justify-center transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-purple-200/80">
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-center sm:text-left">
              <p>{footer.copyrightText}</p>
              <span className="hidden sm:inline text-purple-400/60">•</span>
              <p className="flex items-center gap-1 text-purple-200/90 font-medium">
                <span>Designed &amp; Developed by</span>
                <span className="font-semibold text-[#F2C34E] hover:text-amber-300 transition-colors">
                  Infiniforge Technologies
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
              <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom App-Style Navigation Bar */}
      <nav
        aria-label="Mobile quick navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--kits-secondary)] text-white border-t border-white/10 grid grid-cols-5 h-14"
      >
        <Link to="/" className="flex flex-col items-center justify-center gap-0.5 text-[10px]">
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <Link to="/academics/programs" className="flex flex-col items-center justify-center gap-0.5 text-[10px]">
          <BookOpen className="w-4 h-4" />
          <span>Courses</span>
        </Link>
        <Link to="/admissions" className="flex flex-col items-center justify-center gap-0.5 text-[10px] text-[var(--kits-gold)] font-semibold">
          <GraduationCap className="w-4 h-4" />
          <span>Apply</span>
        </Link>
        <Link to="/gallery" className="flex flex-col items-center justify-center gap-0.5 text-[10px]">
          <Images className="w-4 h-4" />
          <span>Gallery</span>
        </Link>
        <Link to="/contact" className="flex flex-col items-center justify-center gap-0.5 text-[10px]">
          <Building2 className="w-4 h-4" />
          <span>Contact</span>
        </Link>
      </nav>

      {/* Floating KITS AI Assistant */}
      <KitsChatbot />
    </div>
  );
};
