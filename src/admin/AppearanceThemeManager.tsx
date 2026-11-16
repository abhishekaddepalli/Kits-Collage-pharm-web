import React, { useState } from 'react';
import { Check, Monitor, Palette, RotateCcw, Save, Smartphone, Tablet } from 'lucide-react';
import { useCms } from '../app/providers/CmsContext';
import { PRESET_THEMES } from '../data/defaults/kitsSeedData';
import type { LayoutConfig, ThemePalette, TypographyConfig } from '../types/cms';
import { KitsLogo } from '../components/common/KitsLogo';

const COLOR_FIELDS: { key: keyof ThemePalette; label: string }[] = [
  { key: 'primaryColor', label: 'Primary Color' },
  { key: 'secondaryColor', label: 'Secondary Color' },
  { key: 'accentColor', label: 'Accent / Magenta' },
  { key: 'goldColor', label: 'Champagne Gold' },
  { key: 'backgroundColor', label: 'Background Color' },
  { key: 'surfaceColor', label: 'Soft Surface Color' },
  { key: 'cardBackground', label: 'Card Background' },
  { key: 'headingColor', label: 'Heading Color' },
  { key: 'bodyTextColor', label: 'Body Text Color' },
  { key: 'linkColor', label: 'Link Color' },
  { key: 'buttonBg', label: 'Button Color' },
  { key: 'buttonHover', label: 'Button Hover Color' },
  { key: 'headerBg', label: 'Header Background' },
  { key: 'navBg', label: 'Navigation Background' },
  { key: 'footerBg', label: 'Footer Background' },
  { key: 'borderColor', label: 'Border Color' },
];

export const AppearanceThemeManager: React.FC<{ initialTab?: 'appearance' | 'themes' | 'branding' }> = ({
  initialTab = 'appearance',
}) => {
  const { state, updateState } = useCms();
  const [tab, setTab] = useState<'colors' | 'typography' | 'layout' | 'presets' | 'branding'>(
    initialTab === 'themes' ? 'presets' : initialTab === 'branding' ? 'branding' : 'colors'
  );
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [customThemeName, setCustomThemeName] = useState('');
  const [savedNotice, setSavedNotice] = useState('');

  const { palette, typography, layout, customThemes } = state.appearance;

  const updatePaletteField = (key: keyof ThemePalette, value: string) => {
    updateState(
      (prev) => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          palette: { ...prev.appearance.palette, [key]: value },
        },
        header:
          key === 'headerBg'
            ? { ...prev.header, headerBg: value }
            : key === 'navBg'
              ? { ...prev.header, navBg: value }
              : prev.header,
        footer:
          key === 'footerBg'
            ? { ...prev.footer, backgroundColor: value }
            : prev.footer,
      }),
      { action: `Updated theme color ${key} to ${value}`, module: 'Appearance' }
    );
  };

  const applyPreset = (preset: ThemePalette) => {
    updateState(
      (prev) => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          activeThemeId: preset.id,
          palette: { ...preset },
        },
        header: {
          ...prev.header,
          headerBg: preset.headerBg,
          navBg: preset.navBg,
        },
        footer: {
          ...prev.footer,
          backgroundColor: preset.footerBg,
        },
      }),
      { action: `Applied preset theme "${preset.name}"`, module: 'Themes' }
    );
    setSavedNotice(`Applied "${preset.name}" to live public site.`);
  };

  const saveCustomTheme = () => {
    if (!customThemeName.trim()) return;
    const newTheme: ThemePalette = {
      ...palette,
      id: `custom-${Date.now()}`,
      name: customThemeName.trim(),
    };
    updateState(
      (prev) => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          activeThemeId: newTheme.id,
          customThemes: [newTheme, ...prev.appearance.customThemes],
        },
      }),
      { action: `Saved custom theme "${newTheme.name}"`, module: 'Themes' }
    );
    setCustomThemeName('');
    setSavedNotice(`Saved custom theme "${newTheme.name}".`);
  };

  const updateTypography = (patch: Partial<TypographyConfig>) => {
    updateState(
      (prev) => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          typography: { ...prev.appearance.typography, ...patch },
        },
      }),
      { action: 'Updated website typography settings', module: 'Appearance' }
    );
  };

  const updateLayout = (patch: Partial<LayoutConfig>) => {
    updateState(
      (prev) => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          layout: { ...prev.appearance.layout, ...patch },
        },
      }),
      { action: 'Updated website layout geometry', module: 'Appearance' }
    );
  };

  const resetDefaults = () => {
    applyPreset(PRESET_THEMES[0]);
    setSavedNotice('Theme colors restored to Royal Purple & Gold default.');
  };

  const previewWidthClass =
    previewDevice === 'mobile' ? 'w-[360px]' : previewDevice === 'tablet' ? 'w-[640px]' : 'w-full';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171238]">Website Appearance & Theme Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Changes update CSS variables and the live public website immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={resetDefaults}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#E8DFF5] bg-white rounded-full hover:bg-[#F5F0FC] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset to Default Theme
        </button>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedNotice}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'colors', label: 'Theme Colors' },
          { id: 'presets', label: 'Theme Presets' },
          { id: 'typography', label: 'Typography' },
          { id: 'layout', label: 'Layout & Radius' },
          { id: 'branding', label: 'Logo & Branding' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as typeof tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-full cursor-pointer ${
              tab === item.id
                ? 'bg-[#52128B] text-white'
                : 'bg-white border border-[#E8DFF5] text-[#171238]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Controls Panel */}
        <div className="xl:col-span-6 bg-white border border-[#E8DFF5] rounded-2xl p-6 space-y-5">
          {tab === 'colors' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COLOR_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#171238]">
                    {field.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label={field.label}
                      value={palette[field.key]}
                      onChange={(e) => updatePaletteField(field.key, e.target.value)}
                      className="w-10 h-9 rounded-lg border border-[#E8DFF5] cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={palette[field.key]}
                      onChange={(e) => updatePaletteField(field.key, e.target.value)}
                      className="flex-1 px-3 py-2 text-xs font-mono border border-[#E8DFF5] rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'presets' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...PRESET_THEMES, ...customThemes].map((preset) => {
                  const active = state.appearance.activeThemeId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? 'border-[#52128B] bg-[#F5F0FC]'
                          : 'border-[#E8DFF5] bg-white hover:border-[#52128B]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-[#171238]">{preset.name}</span>
                        {active && <Check className="w-4 h-4 text-[#52128B]" />}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[preset.primaryColor, preset.secondaryColor, preset.accentColor, preset.goldColor, preset.backgroundColor].map(
                          (c, idx) => (
                            <span
                              key={idx}
                              style={{ backgroundColor: c }}
                              className="w-5 h-5 rounded-full border border-black/10"
                            />
                          )
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#E8DFF5] flex gap-2">
                <input
                  type="text"
                  value={customThemeName}
                  onChange={(e) => setCustomThemeName(e.target.value)}
                  placeholder="Save current palette as custom theme..."
                  className="flex-1 px-3.5 py-2 text-xs border border-[#E8DFF5] rounded-lg"
                />
                <button
                  type="button"
                  onClick={saveCustomTheme}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-lg cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Preset
                </button>
              </div>
            </div>
          )}

          {tab === 'typography' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Heading Font</label>
                  <select
                    value={typography.headingFont}
                    onChange={(e) =>
                      updateTypography({ headingFont: e.target.value as TypographyConfig['headingFont'] })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#E8DFF5] rounded-lg bg-white"
                  >
                    <option value="Playfair Display">Playfair Display (Serif)</option>
                    <option value="Cormorant Garamond">Cormorant Garamond (Editorial)</option>
                    <option value="Lora">Lora (Classic Serif)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">Body Font</label>
                  <select
                    value={typography.bodyFont}
                    onChange={(e) =>
                      updateTypography({ bodyFont: e.target.value as TypographyConfig['bodyFont'] })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#E8DFF5] rounded-lg bg-white"
                  >
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="DM Sans">DM Sans</option>
                    <option value="Inter">Inter</option>
                    <option value="Lora">Lora</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Base Font Size ({typography.baseFontSize}px)
                  </label>
                  <input
                    type="range"
                    min={14}
                    max={18}
                    value={typography.baseFontSize}
                    onChange={(e) => updateTypography({ baseFontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Line Height ({typography.lineHeight})
                  </label>
                  <input
                    type="range"
                    min={1.4}
                    max={1.9}
                    step={0.05}
                    value={typography.lineHeight}
                    onChange={(e) => updateTypography({ lineHeight: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 'layout' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Container Max Width</label>
                  <select
                    value={layout.contentWidth}
                    onChange={(e) =>
                      updateLayout({ contentWidth: e.target.value as LayoutConfig['contentWidth'] })
                    }
                    className="w-full px-3 py-2 text-sm border border-[#E8DFF5] rounded-lg bg-white"
                  >
                    <option value="1140px">Compact (1140px)</option>
                    <option value="1280px">Standard University (1280px)</option>
                    <option value="1400px">Wide Portal (1400px)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Card Corner Radius ({layout.cardRadius}px)
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={24}
                    value={layout.cardRadius}
                    onChange={(e) => updateLayout({ cardRadius: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Section Spacing ({layout.sectionSpacing}px)
                  </label>
                  <input
                    type="range"
                    min={32}
                    max={96}
                    step={8}
                    value={layout.sectionSpacing}
                    onChange={(e) => updateLayout({ sectionSpacing: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">Button Style</label>
                  <select
                    value={layout.buttonRadius}
                    onChange={(e) => updateLayout({ buttonRadius: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-[#E8DFF5] rounded-lg bg-white"
                  >
                    <option value={9999}>Pill / Full Rounded</option>
                    <option value={10}>Soft Rounded (10px)</option>
                    <option value={4}>Editorial Sharp (4px)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {tab === 'branding' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Select institutional emblem or upload a local preview logo image. Changes reflect in
                both the header and footer immediately.
              </p>
              <div className="p-4 rounded-xl bg-[#F5F0FC] flex items-center justify-between">
                <KitsLogo
                  logoUrl={state.header.logoUrl}
                  title={state.header.collegeName}
                  subtitle={state.header.collegeSubtitle}
                />
                <button
                  type="button"
                  onClick={() =>
                    updateState(
                      (prev) => ({
                        ...prev,
                        header: { ...prev.header, logoUrl: 'svg-emblem' },
                        footer: { ...prev.footer, logoUrl: 'svg-emblem' },
                      }),
                      { action: 'Restored official SVG institutional emblem', module: 'Branding' }
                    )
                  }
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#E8DFF5] rounded-lg cursor-pointer"
                >
                  Use Default Emblem
                </button>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  Upload Custom Logo (Browser-Local Demo Preview)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = String(reader.result || '');
                      updateState(
                        (prev) => ({
                          ...prev,
                          header: { ...prev.header, logoUrl: dataUrl },
                          footer: { ...prev.footer, logoUrl: dataUrl },
                        }),
                        { action: `Updated logo with local file ${file.name}`, module: 'Branding' }
                      );
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Interactive Preview Panel */}
        <div className="xl:col-span-6 bg-white border border-[#E8DFF5] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E8DFF5]">
            <div className="flex items-center gap-2 text-sm font-bold text-[#171238]">
              <Palette className="w-4 h-4 text-[#52128B]" />
              Live Theme Preview
            </div>
            <div className="flex items-center gap-1 bg-[#F5F0FC] p-1 rounded-lg">
              {[
                { id: 'desktop', icon: Monitor, label: 'Desktop preview' },
                { id: 'tablet', icon: Tablet, label: 'Tablet preview' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile preview' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setPreviewDevice(d.id as typeof previewDevice)}
                  aria-label={d.label}
                  className={`p-1.5 rounded-md cursor-pointer ${
                    previewDevice === d.id ? 'bg-white text-[#52128B] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <d.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto flex justify-center bg-slate-100 rounded-xl p-3">
            <div
              className={`${previewWidthClass} rounded-xl overflow-hidden border border-black/10 shadow-sm transition-all`}
              style={{
                backgroundColor: palette.backgroundColor,
                color: palette.bodyTextColor,
                fontFamily: typography.bodyFont,
              }}
            >
              {/* Simulated Header */}
              <div
                style={{ backgroundColor: palette.headerBg }}
                className="px-4 py-3 flex items-center justify-between border-b"
              >
                <KitsLogo
                  logoUrl={state.header.logoUrl}
                  title={state.header.collegeName}
                  subtitle={state.header.collegeSubtitle}
                  compact
                />
                <span
                  style={{
                    backgroundColor: palette.buttonBg,
                    borderRadius: `${layout.buttonRadius}px`,
                  }}
                  className="px-3 py-1.5 text-[11px] font-semibold text-white"
                >
                  {state.header.applyButtonLabel}
                </span>
              </div>

              {/* Simulated Nav */}
              <div
                style={{ backgroundColor: palette.navBg }}
                className="px-4 py-2 flex gap-4 text-[11px] text-white overflow-hidden"
              >
                <span style={{ color: palette.goldColor }} className="font-semibold">Home</span>
                <span>About Us</span>
                <span>Academics</span>
                <span>Admissions</span>
                <span>Contact</span>
              </div>

              {/* Simulated Hero */}
              <div style={{ backgroundColor: palette.surfaceColor }} className="p-6 space-y-3">
                <h3
                  style={{
                    color: palette.headingColor,
                    fontFamily: typography.headingFont,
                  }}
                  className="text-xl font-bold leading-tight"
                >
                  Empowering Women in{' '}
                  <span style={{ color: palette.accentColor }}>Pharmaceutical Sciences</span>
                </h3>
                <p className="text-xs opacity-85">
                  Quality pharmaceutical education affiliated to JNTU Kakinada and approved by PCI.
                </p>
                <div className="flex gap-2">
                  <span
                    style={{
                      backgroundColor: palette.buttonBg,
                      borderRadius: `${layout.buttonRadius}px`,
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white"
                  >
                    Explore Programs
                  </span>
                  <span
                    style={{
                      backgroundColor: palette.goldColor,
                      borderRadius: `${layout.buttonRadius}px`,
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold text-[#171238]"
                  >
                    Apply Now
                  </span>
                </div>
              </div>

              {/* Simulated Card */}
              <div className="p-5">
                <div
                  style={{
                    backgroundColor: palette.cardBackground,
                    borderColor: palette.borderColor,
                    borderRadius: `${layout.cardRadius}px`,
                  }}
                  className="p-4 border space-y-1"
                >
                  <div style={{ color: palette.primaryColor }} className="text-xs font-bold">
                    B.Pharmacy Program
                  </div>
                  <div className="text-[11px]">
                    4-Year Undergraduate Pharmaceutical Degree · Divili Campus
                  </div>
                </div>
              </div>

              {/* Simulated Footer */}
              <div
                style={{ backgroundColor: palette.footerBg }}
                className="px-4 py-3 text-[10px] text-white/80 flex justify-between"
              >
                <span>KITS College of Pharmacy for Women</span>
                <span>© 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
