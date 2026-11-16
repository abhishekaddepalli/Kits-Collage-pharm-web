import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCms } from '../app/providers/CmsContext';
import type { NavItem } from '../types/cms';
import { normalizeNavOrder, reorderItems } from '../utils/cmsStoreLogic';

export const HeaderManager: React.FC = () => {
  const { state, updateState } = useCms();
  const h = state.header;

  const updateHeader = (patch: Partial<typeof h>) => {
    updateState(
      (prev) => ({
        ...prev,
        header: { ...prev.header, ...patch },
      }),
      { action: 'Updated header configuration', module: 'Header' }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171238]">Header Manager</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Edit college title, top bar portals, announcement strip, sticky header, and CTA button.
        </p>
      </div>

      <div className="bg-white border border-[#E8DFF5] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">College Short Title</label>
          <input
            type="text"
            value={h.collegeName}
            onChange={(e) => updateHeader({ collegeName: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">College Subtitle</label>
          <input
            type="text"
            value={h.collegeSubtitle}
            onChange={(e) => updateHeader({ collegeSubtitle: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Affiliation Text</label>
          <input
            type="text"
            value={h.affiliationText}
            onChange={(e) => updateHeader({ affiliationText: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Approval Text</label>
          <input
            type="text"
            value={h.approvalText}
            onChange={(e) => updateHeader({ approvalText: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Header Phone</label>
          <input
            type="text"
            value={h.phone}
            onChange={(e) => updateHeader({ phone: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Working Hours</label>
          <input
            type="text"
            value={h.workingHours}
            onChange={(e) => updateHeader({ workingHours: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">Top Bar Location</label>
          <input
            type="text"
            value={h.locationShort}
            onChange={(e) => updateHeader({ locationShort: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">Top Announcement Text</label>
          <input
            type="text"
            value={h.announcementText}
            onChange={(e) => updateHeader({ announcementText: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">CTA Button Label</label>
          <input
            type="text"
            value={h.applyButtonLabel}
            onChange={(e) => updateHeader({ applyButtonLabel: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">CTA Target Route</label>
          <input
            type="text"
            value={h.applyButtonPath}
            onChange={(e) => updateHeader({ applyButtonPath: e.target.value })}
            className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
          <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={h.sticky}
              onChange={(e) => updateHeader({ sticky: e.target.checked })}
            />
            Enable Sticky Header on Scroll
          </label>
          <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={h.showAnnouncement}
              onChange={(e) => updateHeader({ showAnnouncement: e.target.checked })}
            />
            Show Top Announcement Shortcut
          </label>
        </div>
      </div>
    </div>
  );
};

export const NavigationManager: React.FC = () => {
  const { state, updateState } = useCms();
  const [newLabel, setNewLabel] = useState('');
  const [newPath, setNewPath] = useState('/');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const navItems = [...state.navigation].sort((a, b) => a.order - b.order);

  const commitNav = (items: NavItem[], action: string) => {
    updateState(
      (prev) => ({
        ...prev,
        navigation: normalizeNavOrder(items),
      }),
      { action, module: 'Navigation' }
    );
  };

  const addMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    const item: NavItem = {
      id: `nav-${Date.now()}`,
      label: newLabel.trim(),
      path: newPath.trim() || '/',
      order: navItems.length + 1,
      enabled: true,
    };
    commitNav([...navItems, item], `Added menu item "${item.label}"`);
    setNewLabel('');
    setNewPath('/');
  };

  const addSubItem = (parentId: string) => {
    const updated = navItems.map((item) => {
      if (item.id !== parentId) return item;
      const children = item.children || [];
      return {
        ...item,
        children: [
          ...children,
          {
            id: `sub-${Date.now()}`,
            label: 'New Submenu',
            path: item.path,
            order: children.length + 1,
            enabled: true,
          },
        ],
      };
    });
    commitNav(updated, `Added submenu item under ${parentId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171238]">Navigation & Menu Manager</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Drag and drop or use arrows to reorder menus, create nested dropdowns, or toggle visibility.
        </p>
      </div>

      <form onSubmit={addMenu} className="bg-white border border-[#E8DFF5] rounded-2xl p-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="New menu label (e.g. Research)"
          className="flex-1 min-w-[180px] px-3.5 py-2 text-xs border border-[#E8DFF5] rounded-lg"
        />
        <input
          type="text"
          value={newPath}
          onChange={(e) => setNewPath(e.target.value)}
          placeholder="/path"
          className="w-48 px-3.5 py-2 text-xs font-mono border border-[#E8DFF5] rounded-lg"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-lg cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Menu Item
        </button>
      </form>

      <div className="space-y-3">
        {navItems.map((item, idx) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDragIndex(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex === null) return;
              commitNav(reorderItems(navItems, dragIndex, idx), `Reordered menu "${item.label}"`);
              setDragIndex(null);
            }}
            className="bg-white border border-[#E8DFF5] rounded-xl p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-3">
              <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
              <input
                type="text"
                value={item.label}
                aria-label={`Menu label ${item.label}`}
                onChange={(e) =>
                  commitNav(
                    navItems.map((n) => (n.id === item.id ? { ...n, label: e.target.value } : n)),
                    `Renamed menu to "${e.target.value}"`
                  )
                }
                className="px-2.5 py-1.5 text-xs font-semibold border border-[#E8DFF5] rounded-lg w-40"
              />
              <input
                type="text"
                value={item.path}
                aria-label={`Menu path ${item.label}`}
                onChange={(e) =>
                  commitNav(
                    navItems.map((n) => (n.id === item.id ? { ...n, path: e.target.value } : n)),
                    `Updated link for "${item.label}"`
                  )
                }
                className="px-2.5 py-1.5 text-xs font-mono border border-[#E8DFF5] rounded-lg flex-1 min-w-[140px]"
              />
              <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) =>
                    commitNav(
                      navItems.map((n) => (n.id === item.id ? { ...n, enabled: e.target.checked } : n)),
                      `${e.target.checked ? 'Enabled' : 'Disabled'} menu "${item.label}"`
                    )
                  }
                />
                Visible
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!item.openInNewTab}
                  onChange={(e) =>
                    commitNav(
                      navItems.map((n) => (n.id === item.id ? { ...n, openInNewTab: e.target.checked } : n)),
                      `Updated new-tab flag for "${item.label}"`
                    )
                  }
                />
                New Tab
              </label>

              <div className="flex items-center gap-1 ml-auto">
                <button
                  type="button"
                  onClick={() => idx > 0 && commitNav(reorderItems(navItems, idx, idx - 1), `Moved ${item.label} up`)}
                  aria-label={`Move ${item.label} up`}
                  className="p-1.5 rounded hover:bg-[#F5F0FC] cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    idx < navItems.length - 1 &&
                    commitNav(reorderItems(navItems, idx, idx + 1), `Moved ${item.label} down`)
                  }
                  aria-label={`Move ${item.label} down`}
                  className="p-1.5 rounded hover:bg-[#F5F0FC] cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => addSubItem(item.id)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#52128B] bg-[#F5F0FC] rounded-lg cursor-pointer"
                >
                  + Submenu
                </button>
                <button
                  type="button"
                  onClick={() => commitNav(navItems.filter((n) => n.id !== item.id), `Deleted menu "${item.label}"`)}
                  aria-label={`Delete ${item.label}`}
                  className="p-1.5 rounded text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {item.children && item.children.length > 0 && (
              <div className="pl-8 space-y-2 border-l-2 border-[#E8DFF5] ml-2">
                {item.children.map((sub) => (
                  <div key={sub.id} className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={sub.label}
                      onChange={(e) =>
                        commitNav(
                          navItems.map((n) =>
                            n.id === item.id
                              ? {
                                  ...n,
                                  children: n.children?.map((c) =>
                                    c.id === sub.id ? { ...c, label: e.target.value } : c
                                  ),
                                }
                              : n
                          ),
                          `Edited submenu "${e.target.value}"`
                        )
                      }
                      className="px-2.5 py-1 text-xs border border-[#E8DFF5] rounded w-44"
                    />
                    <input
                      type="text"
                      value={sub.path}
                      onChange={(e) =>
                        commitNav(
                          navItems.map((n) =>
                            n.id === item.id
                              ? {
                                  ...n,
                                  children: n.children?.map((c) =>
                                    c.id === sub.id ? { ...c, path: e.target.value } : c
                                  ),
                                }
                              : n
                          ),
                          `Updated submenu path`
                        )
                      }
                      className="px-2.5 py-1 text-xs font-mono border border-[#E8DFF5] rounded flex-1"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        commitNav(
                          navItems.map((n) =>
                            n.id === item.id
                              ? { ...n, children: n.children?.filter((c) => c.id !== sub.id) }
                              : n
                          ),
                          `Removed submenu "${sub.label}"`
                        )
                      }
                      aria-label={`Delete submenu ${sub.label}`}
                      className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const FooterManager: React.FC = () => {
  const { state, updateState } = useCms();
  const f = state.footer;

  const updateFooter = (patch: Partial<typeof f>) => {
    updateState(
      (prev) => ({
        ...prev,
        footer: { ...prev.footer, ...patch },
      }),
      { action: 'Updated footer settings', module: 'Footer' }
    );
  };

  const addColumn = () => {
    updateFooter({
      columns: [
        ...f.columns,
        {
          id: `fc-${Date.now()}`,
          title: 'New Column',
          links: [{ id: `fl-${Date.now()}`, label: 'Home', path: '/' }],
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171238]">Footer Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage footer columns, links, contact details, copyright, and colors.
          </p>
        </div>
        <button
          type="button"
          onClick={addColumn}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Footer Column
        </button>
      </div>

      <div className="bg-white border border-[#E8DFF5] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">Institutional Intro Text</label>
          <textarea
            rows={2}
            value={f.introText}
            onChange={(e) => updateFooter({ introText: e.target.value })}
            className="w-full px-3.5 py-2 text-xs border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Footer Phone</label>
          <input
            type="text"
            value={f.phone}
            onChange={(e) => updateFooter({ phone: e.target.value })}
            className="w-full px-3.5 py-2 text-xs border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Footer Email</label>
          <input
            type="text"
            value={f.email}
            onChange={(e) => updateFooter({ email: e.target.value })}
            className="w-full px-3.5 py-2 text-xs border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">Copyright Text</label>
          <input
            type="text"
            value={f.copyrightText}
            onChange={(e) => updateFooter({ copyrightText: e.target.value })}
            className="w-full px-3.5 py-2 text-xs border border-[#E8DFF5] rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {f.columns.map((col) => (
          <div key={col.id} className="bg-white border border-[#E8DFF5] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={col.title}
                onChange={(e) =>
                  updateFooter({
                    columns: f.columns.map((c) => (c.id === col.id ? { ...c, title: e.target.value } : c)),
                  })
                }
                className="font-bold text-sm border-b border-[#E8DFF5] focus:outline-none flex-1"
              />
              <button
                type="button"
                onClick={() => updateFooter({ columns: f.columns.filter((c) => c.id !== col.id) })}
                aria-label={`Remove ${col.title}`}
                className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {col.links.map((lnk) => (
                <div key={lnk.id} className="flex gap-1.5 items-center">
                  <input
                    type="text"
                    value={lnk.label}
                    onChange={(e) =>
                      updateFooter({
                        columns: f.columns.map((c) =>
                          c.id === col.id
                            ? {
                                ...c,
                                links: c.links.map((l) =>
                                  l.id === lnk.id ? { ...l, label: e.target.value } : l
                                ),
                              }
                            : c
                        ),
                      })
                    }
                    className="w-1/2 px-2 py-1 text-xs border border-[#E8DFF5] rounded"
                  />
                  <input
                    type="text"
                    value={lnk.path}
                    onChange={(e) =>
                      updateFooter({
                        columns: f.columns.map((c) =>
                          c.id === col.id
                            ? {
                                ...c,
                                links: c.links.map((l) =>
                                  l.id === lnk.id ? { ...l, path: e.target.value } : l
                                ),
                              }
                            : c
                        ),
                      })
                    }
                    className="w-1/2 px-2 py-1 text-xs font-mono border border-[#E8DFF5] rounded"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                updateFooter({
                  columns: f.columns.map((c) =>
                    c.id === col.id
                      ? {
                          ...c,
                          links: [...c.links, { id: `fl-${Date.now()}`, label: 'New Link', path: '/' }],
                        }
                      : c
                  ),
                })
              }
              className="text-xs font-semibold text-[#52128B] hover:underline cursor-pointer"
            >
              + Add Link
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
