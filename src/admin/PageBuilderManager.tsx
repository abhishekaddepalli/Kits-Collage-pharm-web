import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCms } from '../app/providers/CmsContext';
import type { CmsPage, PageSection, SectionType } from '../types/cms';
import { normalizeSectionOrder, reorderItems } from '../utils/cmsStoreLogic';
import { slugifyText } from '../utils/validation';

const SECTION_TYPES: { value: SectionType; label: string }[] = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'image_text', label: 'Image with Text' },
  { value: 'text', label: 'Rich Text Section' },
  { value: 'stats', label: 'Statistics Strip' },
  { value: 'card_grid', label: 'Card Grid' },
  { value: 'programs', label: 'Program Cards' },
  { value: 'departments', label: 'Department Cards' },
  { value: 'gallery', label: 'Photo Gallery' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'news', label: 'News List' },
  { value: 'events', label: 'Event List' },
  { value: 'cta_banner', label: 'CTA Banner' },
  { value: 'contact', label: 'Contact Section' },
  { value: 'faq', label: 'FAQ Block' },
  { value: 'video', label: 'Video Section' },
  { value: 'custom', label: 'Custom Content Block' },
];

export const PagesListManager: React.FC = () => {
  const { state, updateState, adminPanelPath } = useCms();
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState('');

  const createPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const slug = `/p/${slugifyText(newTitle)}`;
    const newPage: CmsPage = {
      id: `page-${Date.now()}`,
      title: newTitle.trim(),
      slug,
      status: 'draft',
      enabled: true,
      seoTitle: `${newTitle.trim()} | KITS College of Pharmacy`,
      seoDescription: '',
      updatedAt: new Date().toISOString().slice(0, 10),
      sections: [
        {
          id: `sec-${Date.now()}`,
          type: 'text',
          title: newTitle.trim(),
          body: 'Edit this section content inside the Visual Section Builder.',
          background: 'white',
          paddingY: 'md',
          hidden: false,
          order: 1,
        },
      ],
    };
    updateState(
      (prev) => ({ ...prev, pages: [newPage, ...prev.pages] }),
      { action: `Created CMS page "${newPage.title}"`, module: 'Pages' }
    );
    setNewTitle('');
    navigate(`${adminPanelPath}/pages/${newPage.id}`);
  };

  const duplicatePage = (page: CmsPage) => {
    const copy: CmsPage = {
      ...page,
      id: `page-${Date.now()}`,
      title: `${page.title} (Copy)`,
      slug: `/p/${slugifyText(page.title)}-copy-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      isSystemRoute: false,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    updateState(
      (prev) => ({ ...prev, pages: [copy, ...prev.pages] }),
      { action: `Duplicated page "${page.title}"`, module: 'Pages' }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171238]">Pages & Content Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Create custom pages, manage publication statuses, and open the visual section builder.
        </p>
      </div>

      <form onSubmit={createPage} className="bg-white border border-[#E8DFF5] rounded-2xl p-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New page title (e.g. Research Cell)"
          className="flex-1 min-w-[200px] px-3.5 py-2 text-xs border border-[#E8DFF5] rounded-lg"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-lg cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Create Page
        </button>
      </form>

      <div className="bg-white border border-[#E8DFF5] rounded-2xl overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="border-b border-[#E8DFF5] text-slate-500 bg-[#FCFAFF]">
            <tr>
              <th className="py-3 px-4">Page Title</th>
              <th className="py-3 px-4">URL Slug</th>
              <th className="py-3 px-4">Sections</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Updated</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {state.pages.map((p) => (
              <tr key={p.id}>
                <td className="py-3 px-4 font-bold text-[#171238]">{p.title}</td>
                <td className="py-3 px-4 font-mono text-slate-600">{p.slug}</td>
                <td className="py-3 px-4 tabular-nums">{p.sections.length}</td>
                <td className="py-3 px-4">
                  <select
                    aria-label={`Status for ${p.title}`}
                    value={p.status}
                    onChange={(e) =>
                      updateState(
                        (prev) => ({
                          ...prev,
                          pages: prev.pages.map((pg) =>
                            pg.id === p.id ? { ...pg, status: e.target.value as CmsPage['status'] } : pg
                          ),
                        }),
                        { action: `Changed page "${p.title}" status to ${e.target.value}`, module: 'Pages' }
                      )
                    }
                    className="px-2 py-1 text-xs border border-[#E8DFF5] rounded bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </td>
                <td className="py-3 px-4 tabular-nums text-slate-500">{p.updatedAt}</td>
                <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                  <Link
                    to={`${adminPanelPath}/pages/${p.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#52128B] rounded-lg"
                  >
                    Open Builder
                  </Link>
                  <button
                    type="button"
                    onClick={() => duplicatePage(p)}
                    aria-label={`Duplicate ${p.title}`}
                    className="p-1.5 text-slate-600 hover:bg-[#F5F0FC] rounded cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {!p.isSystemRoute && (
                    <button
                      type="button"
                      onClick={() =>
                        updateState(
                          (prev) => ({ ...prev, pages: prev.pages.filter((pg) => pg.id !== p.id) }),
                          { action: `Deleted page "${p.title}"`, module: 'Pages' }
                        )
                      }
                      aria-label={`Delete ${p.title}`}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const PageBuilderDetail: React.FC = () => {
  const { id } = useParams();
  const { state, updateState, adminPanelPath } = useCms();
  const page = state.pages.find((p) => p.id === id);
  const [newSectionType, setNewSectionType] = useState<SectionType>('text');

  if (!page) {
    return (
      <div className="p-6 bg-white rounded-xl border border-[#E8DFF5] space-y-3">
        <p className="text-sm font-semibold">Page not found.</p>
        <Link to={`${adminPanelPath}/pages`} className="text-xs text-[#52128B] font-semibold">← Back to Pages</Link>
      </div>
    );
  }

  const updatePage = (patch: Partial<CmsPage>, actionMsg: string) => {
    updateState(
      (prev) => ({
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === page.id
            ? { ...p, ...patch, updatedAt: new Date().toISOString().slice(0, 10) }
            : p
        ),
      }),
      { action: actionMsg, module: 'Page Builder' }
    );
  };

  const addSection = () => {
    const newSec: PageSection = {
      id: `sec-${Date.now()}`,
      type: newSectionType,
      title: `New ${SECTION_TYPES.find((t) => t.value === newSectionType)?.label || 'Section'}`,
      body: 'Add content here without writing HTML or CSS.',
      background: 'white',
      paddingY: 'md',
      hidden: false,
      order: page.sections.length + 1,
    };
    updatePage({ sections: [...page.sections, newSec] }, `Added section "${newSec.title}"`);
  };

  const sortedSections = [...page.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to={`${adminPanelPath}/pages`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#52128B] hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Pages
          </Link>
          <h1 className="text-2xl font-bold text-[#171238]">Visual Section Builder: {page.title}</h1>
        </div>
        <Link
          to={page.slug}
          target="_blank"
          className="px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full"
        >
          Preview Page →
        </Link>
      </div>

      {/* Page Metadata */}
      <div className="bg-white border border-[#E8DFF5] rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Page Title</label>
          <input
            type="text"
            value={page.title}
            onChange={(e) => updatePage({ title: e.target.value }, `Updated page title`)}
            className="w-full px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Page URL Slug</label>
          <input
            type="text"
            value={page.slug}
            onChange={(e) => updatePage({ slug: e.target.value }, `Updated page slug`)}
            className="w-full px-3 py-2 text-xs font-mono border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">SEO Meta Title</label>
          <input
            type="text"
            value={page.seoTitle}
            onChange={(e) => updatePage({ seoTitle: e.target.value }, `Updated page SEO title`)}
            className="w-full px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
          />
        </div>
      </div>

      {/* Add Section Bar */}
      <div className="bg-white border border-[#E8DFF5] rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <select
          value={newSectionType}
          onChange={(e) => setNewSectionType(e.target.value as SectionType)}
          className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg bg-white"
        >
          {SECTION_TYPES.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addSection}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-lg cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Section Block
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sortedSections.map((sec, idx) => (
          <div key={sec.id} className="bg-white border border-[#E8DFF5] rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E8DFF5]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#52128B]">#{idx + 1}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F5F0FC] text-[#52128B]">
                  {sec.type}
                </span>
                {sec.hidden && <span className="text-xs text-amber-700 font-semibold">(Hidden)</span>}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    idx > 0 &&
                    updatePage(
                      { sections: normalizeSectionOrder(reorderItems(sortedSections, idx, idx - 1)) },
                      `Moved section "${sec.title}" up`
                    )
                  }
                  aria-label="Move section up"
                  className="p-1.5 rounded hover:bg-[#F5F0FC] cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    idx < sortedSections.length - 1 &&
                    updatePage(
                      { sections: normalizeSectionOrder(reorderItems(sortedSections, idx, idx + 1)) },
                      `Moved section "${sec.title}" down`
                    )
                  }
                  aria-label="Move section down"
                  className="p-1.5 rounded hover:bg-[#F5F0FC] cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updatePage(
                      {
                        sections: sortedSections.map((s) =>
                          s.id === sec.id ? { ...s, hidden: !s.hidden } : s
                        ),
                      },
                      `Toggled visibility for "${sec.title}"`
                    )
                  }
                  aria-label="Toggle visibility"
                  className="p-1.5 rounded hover:bg-[#F5F0FC] cursor-pointer"
                >
                  {sec.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updatePage(
                      {
                        sections: normalizeSectionOrder([
                          ...sortedSections,
                          { ...sec, id: `sec-${Date.now()}`, title: `${sec.title} (Copy)` },
                        ]),
                      },
                      `Duplicated section "${sec.title}"`
                    )
                  }
                  aria-label="Duplicate section"
                  className="p-1.5 rounded hover:bg-[#F5F0FC] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updatePage(
                      { sections: normalizeSectionOrder(sortedSections.filter((s) => s.id !== sec.id)) },
                      `Deleted section "${sec.title}"`
                    )
                  }
                  aria-label="Delete section"
                  className="p-1.5 rounded text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={sec.title}
                onChange={(e) =>
                  updatePage(
                    {
                      sections: sortedSections.map((s) =>
                        s.id === sec.id ? { ...s, title: e.target.value } : s
                      ),
                    },
                    `Updated section title`
                  )
                }
                className="px-3 py-2 text-xs font-semibold border border-[#E8DFF5] rounded-lg"
                placeholder="Section title"
              />
              <input
                type="text"
                value={sec.subtitle || ''}
                onChange={(e) =>
                  updatePage(
                    {
                      sections: sortedSections.map((s) =>
                        s.id === sec.id ? { ...s, subtitle: e.target.value } : s
                      ),
                    },
                    `Updated section subtitle`
                  )
                }
                className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
                placeholder="Optional subtitle"
              />
              <textarea
                rows={2}
                value={sec.body || ''}
                onChange={(e) =>
                  updatePage(
                    {
                      sections: sortedSections.map((s) =>
                        s.id === sec.id ? { ...s, body: e.target.value } : s
                      ),
                    },
                    `Updated section body`
                  )
                }
                className="md:col-span-2 px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
                placeholder="Section prose content"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
