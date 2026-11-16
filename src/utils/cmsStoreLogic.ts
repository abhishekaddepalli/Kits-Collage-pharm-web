import type {
  AdmissionEnquiry,
  AppearanceConfig,
  EnquiryStatus,
  NavItem,
  PageSection,
} from '../types/cms';

export function reorderItems<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length ||
    fromIndex === toIndex
  ) {
    return list;
  }
  const copy = [...list];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}

export function normalizeNavOrder(items: NavItem[]): NavItem[] {
  return items.map((item, index) => ({
    ...item,
    order: index + 1,
    children: item.children ? normalizeNavOrder(item.children) : undefined,
  }));
}

export function normalizeSectionOrder(sections: PageSection[]): PageSection[] {
  return sections.map((sec, index) => ({
    ...sec,
    order: index + 1,
  }));
}

export function filterEnquiries(
  enquiries: AdmissionEnquiry[],
  search: string,
  programFilter: string,
  statusFilter: string
): AdmissionEnquiry[] {
  const q = search.trim().toLowerCase();
  return enquiries.filter((item) => {
    const matchesSearch =
      !q ||
      item.studentName.toLowerCase().includes(q) ||
      item.parentName.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.mobile.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q);
    const matchesProgram =
      programFilter === 'All' || item.interestedProgram === programFilter;
    const matchesStatus =
      statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesProgram && matchesStatus;
  });
}

export function summarizeEnquiriesByStatus(
  enquiries: AdmissionEnquiry[]
): Record<EnquiryStatus, number> {
  const counts: Record<EnquiryStatus, number> = {
    New: 0,
    Contacted: 0,
    Interested: 0,
    'Follow-up': 0,
    Converted: 0,
    'Not Interested': 0,
  };
  for (const e of enquiries) {
    counts[e.status] = (counts[e.status] || 0) + 1;
  }
  return counts;
}

export function computeThemeCssVariables(appearance: AppearanceConfig): Record<string, string> {
  const { palette, typography, layout } = appearance;
  const headingFontStack =
    typography.headingFont === 'Playfair Display' ||
    typography.headingFont === 'Cormorant Garamond' ||
    typography.headingFont === 'Lora'
      ? `"${typography.headingFont}", Georgia, serif`
      : `"${typography.headingFont}", system-ui, sans-serif`;

  const bodyFontStack =
    typography.bodyFont === 'Lora'
      ? `"Lora", Georgia, serif`
      : `"${typography.bodyFont}", system-ui, sans-serif`;

  return {
    '--kits-primary': palette.primaryColor,
    '--kits-secondary': palette.secondaryColor,
    '--kits-accent': palette.accentColor,
    '--kits-gold': palette.goldColor,
    '--kits-bg': palette.backgroundColor,
    '--kits-surface': palette.surfaceColor,
    '--kits-card': palette.cardBackground,
    '--kits-heading': palette.headingColor,
    '--kits-body': palette.bodyTextColor,
    '--kits-link': palette.linkColor,
    '--kits-btn-bg': palette.buttonBg,
    '--kits-btn-hover': palette.buttonHover,
    '--kits-header-bg': palette.headerBg,
    '--kits-nav-bg': palette.navBg,
    '--kits-footer-bg': palette.footerBg,
    '--kits-border': palette.borderColor,
    '--kits-font-heading': headingFontStack,
    '--kits-font-body': bodyFontStack,
    '--kits-radius-card': `${layout.cardRadius}px`,
    '--kits-radius-btn': `${layout.buttonRadius}px`,
    '--kits-container-max': layout.contentWidth,
    '--kits-section-py': `${layout.sectionSpacing}px`,
  };
}
