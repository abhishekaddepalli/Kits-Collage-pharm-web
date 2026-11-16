import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Grid,
  List,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { useCms } from '../app/providers/CmsContext';
import { SafeImage } from '../components/common/SafeImage';
import type { HeroSlide, MediaItem, PromoBanner } from '../types/cms';
import { reorderItems } from '../utils/cmsStoreLogic';

export const SlidersManager: React.FC = () => {
  const { state, updateState } = useCms();
  const slides = [...state.sliders].sort((a, b) => a.order - b.order);

  const updateSlides = (nextSlides: HeroSlide[], action: string) => {
    const normalized = nextSlides.map((s, idx) => ({ ...s, order: idx + 1 }));
    updateState((prev) => ({ ...prev, sliders: normalized }), { action, module: 'Sliders' });
  };

  const addSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      badge: 'KITS College of Pharmacy for Women',
      heading: 'New Hero Headline',
      highlightedText: 'Pharmaceutical Excellence',
      subheading: 'Academic Excellence',
      description: 'Edit slide description and CTA buttons directly from the Sliders Manager.',
      desktopImage: state.media[0]?.url || '',
      mobileImage: state.media[0]?.url || '',
      imageAlt: 'Pharmacy campus visual',
      primaryCtaLabel: 'Explore Programs',
      primaryCtaLink: '/academics/programs',
      secondaryCtaLabel: 'Apply Now',
      secondaryCtaLink: '/admissions',
      overlayOpacity: 85,
      textPosition: 'left',
      animation: 'fade',
      durationMs: 6500,
      order: slides.length + 1,
      active: true,
    };
    updateSlides([...slides, newSlide], 'Added new hero slide');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171238]">Homepage Sliders Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure headings, images, CTAs, overlays, timing, and slide visibility.
          </p>
        </div>
        <button
          type="button"
          onClick={addSlide}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Slide
        </button>
      </div>

      <div className="space-y-4">
        {slides.map((slide, idx) => (
          <div key={slide.id} className="bg-white border border-[#E8DFF5] rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8DFF5]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#52128B]">Slide #{idx + 1}</span>
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slide.active}
                    onChange={(e) =>
                      updateSlides(
                        slides.map((s) => (s.id === slide.id ? { ...s, active: e.target.checked } : s)),
                        `${e.target.checked ? 'Enabled' : 'Disabled'} slide "${slide.heading}"`
                      )
                    }
                  />
                  Active
                </label>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => idx > 0 && updateSlides(reorderItems(slides, idx, idx - 1), 'Moved slide up')}
                  aria-label="Move slide up"
                  className="p-1.5 rounded hover:bg-[#F5F0FC] cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    idx < slides.length - 1 && updateSlides(reorderItems(slides, idx, idx + 1), 'Moved slide down')
                  }
                  aria-label="Move slide down"
                  className="p-1.5 rounded hover:bg-[#F5F0FC] cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateSlides(slides.filter((s) => s.id !== slide.id), 'Deleted slide')}
                  aria-label="Delete slide"
                  className="p-1.5 rounded text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4">
                <div className="h-40 rounded-xl overflow-hidden border border-[#E8DFF5] mb-2">
                  <SafeImage src={slide.desktopImage} alt={slide.imageAlt} className="w-full h-full object-cover" />
                </div>
                <select
                  aria-label="Choose image from media library"
                  value={slide.desktopImage}
                  onChange={(e) =>
                    updateSlides(
                      slides.map((s) =>
                        s.id === slide.id ? { ...s, desktopImage: e.target.value, mobileImage: e.target.value } : s
                      ),
                      'Updated slide image'
                    )
                  }
                  className="w-full px-3 py-1.5 text-xs border border-[#E8DFF5] rounded-lg bg-white"
                >
                  {state.media
                    .filter((m) => m.type === 'image')
                    .map((m) => (
                      <option key={m.id} value={m.url}>
                        {m.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={slide.heading}
                  onChange={(e) =>
                    updateSlides(
                      slides.map((s) => (s.id === slide.id ? { ...s, heading: e.target.value } : s)),
                      'Updated slide heading'
                    )
                  }
                  placeholder="Heading"
                  className="px-3 py-2 text-xs font-semibold border border-[#E8DFF5] rounded-lg"
                />
                <input
                  type="text"
                  value={slide.highlightedText}
                  onChange={(e) =>
                    updateSlides(
                      slides.map((s) => (s.id === slide.id ? { ...s, highlightedText: e.target.value } : s)),
                      'Updated slide highlight'
                    )
                  }
                  placeholder="Highlighted accent phrase"
                  className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
                />
                <textarea
                  rows={2}
                  value={slide.description}
                  onChange={(e) =>
                    updateSlides(
                      slides.map((s) => (s.id === slide.id ? { ...s, description: e.target.value } : s)),
                      'Updated slide description'
                    )
                  }
                  className="sm:col-span-2 px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
                />
                <input
                  type="text"
                  value={slide.primaryCtaLabel}
                  onChange={(e) =>
                    updateSlides(
                      slides.map((s) => (s.id === slide.id ? { ...s, primaryCtaLabel: e.target.value } : s)),
                      'Updated CTA button'
                    )
                  }
                  placeholder="Primary CTA Label"
                  className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
                />
                <input
                  type="text"
                  value={slide.primaryCtaLink}
                  onChange={(e) =>
                    updateSlides(
                      slides.map((s) => (s.id === slide.id ? { ...s, primaryCtaLink: e.target.value } : s)),
                      'Updated CTA link'
                    )
                  }
                  placeholder="Primary CTA Link"
                  className="px-3 py-2 text-xs font-mono border border-[#E8DFF5] rounded-lg"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BannersManager: React.FC = () => {
  const { state, updateState } = useCms();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');

  const addBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const item: PromoBanner = {
      id: `ban-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || 'Promotional announcement banner',
      ctaLabel: 'Learn More',
      ctaLink: '/admissions',
      imageUrl: state.media[5]?.url || state.media[0]?.url || '',
      active: true,
      placement: 'homepage',
    };
    updateState(
      (prev) => ({ ...prev, banners: [item, ...prev.banners] }),
      { action: `Added promotional banner "${item.title}"`, module: 'Banners' }
    );
    setTitle('');
    setSubtitle('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171238]">Promotional Banners Manager</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage admissions and campaign banners displayed across homepage and academic sections.
        </p>
      </div>

      <form onSubmit={addBanner} className="bg-white border border-[#E8DFF5] rounded-2xl p-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Banner title"
          className="flex-1 min-w-[200px] px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
        />
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Subtitle"
          className="flex-1 min-w-[200px] px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
        />
        <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-lg cursor-pointer">
          Add Banner
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.banners.map((b) => (
          <div key={b.id} className="bg-white border border-[#E8DFF5] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={b.title}
                onChange={(e) =>
                  updateState(
                    (prev) => ({
                      ...prev,
                      banners: prev.banners.map((x) => (x.id === b.id ? { ...x, title: e.target.value } : x)),
                    }),
                    { action: 'Updated banner title', module: 'Banners' }
                  )
                }
                className="font-bold text-sm border-b border-[#E8DFF5] flex-1 mr-3 focus:outline-none"
              />
              <label className="text-xs flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={b.active}
                  onChange={(e) =>
                    updateState(
                      (prev) => ({
                        ...prev,
                        banners: prev.banners.map((x) => (x.id === b.id ? { ...x, active: e.target.checked } : x)),
                      }),
                      { action: 'Toggled banner visibility', module: 'Banners' }
                    )
                  }
                />
                Active
              </label>
            </div>
            <textarea
              rows={2}
              value={b.subtitle}
              onChange={(e) =>
                updateState(
                  (prev) => ({
                    ...prev,
                    banners: prev.banners.map((x) => (x.id === b.id ? { ...x, subtitle: e.target.value } : x)),
                  }),
                  { action: 'Updated banner subtitle', module: 'Banners' }
                )
              }
              className="w-full px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

import { cmsService } from '../services/cms/cmsService';

export const MediaLibraryManager: React.FC = () => {
  const { state, setLocalStateOnly } = useCms();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('All');
  const [uploadFolder, setUploadFolder] = useState('Campus');
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = state.media.filter((m) => {
    const matchFolder = folder === 'All' || m.folder === folder;
    const matchSearch =
      !search.trim() ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.altText.toLowerCase().includes(search.toLowerCase());
    return matchFolder && matchSearch;
  });

  const handleServerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadNotice(null);

    const res = await cmsService.uploadMedia(
      file,
      file.name.replace(/\.[^/.]+$/, ''),
      file.name.replace(/\.[^/.]+$/, ''),
      uploadFolder
    );
    setUploading(false);
    e.target.value = '';

    if (!res.ok || !res.data) {
      setUploadNotice({ ok: false, text: res.message || 'Upload failed.' });
      return;
    }

    setLocalStateOnly((prev) => ({ ...prev, media: [res.data!, ...prev.media] }));
    setUploadNotice({ ok: true, text: `Uploaded "${res.data.title}" to /uploads/${res.data.folder}.` });
  };

  const handleMetadataChange = (m: MediaItem, patch: Partial<MediaItem>) => {
    const nextItem = { ...m, ...patch };
    setLocalStateOnly((prev) => ({
      ...prev,
      media: prev.media.map((x) => (x.id === m.id ? nextItem : x)),
    }));
  };

  const persistMetadata = async (m: MediaItem) => {
    await cmsService.updateMediaMetadata(m.id, {
      title: m.title,
      altText: m.altText,
      folder: m.folder,
    });
  };

  const handleDeleteMedia = async (m: MediaItem) => {
    const res = await cmsService.deleteMedia(m.id);
    if (!res.ok) {
      setUploadNotice({ ok: false, text: res.message || 'Unable to delete media file.' });
      return;
    }
    setLocalStateOnly((prev) => ({
      ...prev,
      media: prev.media.filter((x) => x.id !== m.id),
    }));
  };

  const copyRef = (item: MediaItem) => {
    navigator.clipboard?.writeText(item.url);
    setCopiedId(item.id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171238]">Media Library</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload images and PDF documents directly to server disk storage with metadata indexed in MySQL.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Target upload folder"
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-[#E8DFF5] rounded-full"
          >
            {['Campus', 'Laboratories', 'Banners', 'Documents', 'Faculty', 'Events', 'Logos'].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#52128B] hover:bg-[#32105B] rounded-full cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Uploading...' : 'Upload Media File'}
            <input
              type="file"
              accept="image/*,.pdf"
              disabled={uploading}
              onChange={handleServerUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploadNotice && (
        <div
          className={`p-3 rounded-xl text-xs border ${
            uploadNotice.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {uploadNotice.text}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search media & alt text..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8DFF5] rounded-lg"
            />
          </div>
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-[#E8DFF5] rounded-lg"
          >
            {['All', 'Campus', 'Laboratories', 'Banners', 'Documents', 'Faculty', 'Events', 'Logos'].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-1 bg-white border border-[#E8DFF5] rounded-lg p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            className={`p-1.5 rounded cursor-pointer ${viewMode === 'grid' ? 'bg-[#F5F0FC] text-[#52128B]' : ''}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            className={`p-1.5 rounded cursor-pointer ${viewMode === 'list' ? 'bg-[#F5F0FC] text-[#52128B]' : ''}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <div key={m.id} className="bg-white border border-[#E8DFF5] rounded-2xl overflow-hidden flex flex-col">
              <div className="h-40 bg-[#F5F0FC]">
                {m.type === 'image' ? (
                  <SafeImage src={m.url} alt={m.altText} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs font-bold text-[#52128B]">
                    {m.type.toUpperCase()} DOCUMENT
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2 flex-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{m.folder}</span>
                  <span>{m.fileSize}</span>
                </div>
                <input
                  type="text"
                  value={m.title}
                  onChange={(e) => handleMetadataChange(m, { title: e.target.value })}
                  onBlur={() => void persistMetadata(m)}
                  className="w-full text-xs font-bold text-[#171238] border-b border-[#E8DFF5] pb-1 focus:outline-none"
                />
                <input
                  type="text"
                  value={m.altText}
                  onChange={(e) => handleMetadataChange(m, { altText: e.target.value })}
                  onBlur={() => void persistMetadata(m)}
                  placeholder="Editable alt text"
                  className="w-full text-[11px] text-slate-600 border border-[#E8DFF5] rounded px-2 py-1"
                />
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => copyRef(m)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#52128B] cursor-pointer"
                  >
                    {copiedId === m.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === m.id ? 'Copied' : 'Copy Path'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteMedia(m)}
                    aria-label={`Delete ${m.title}`}
                    className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E8DFF5] rounded-2xl divide-y divide-slate-100">
          {filtered.map((m) => (
            <div key={m.id} className="p-4 flex items-center justify-between gap-4 text-xs">
              <div>
                <div className="font-bold text-[#171238]">{m.title}</div>
                <div className="text-slate-500">Alt: {m.altText} · {m.folder} · {m.fileSize}</div>
              </div>
              <button
                type="button"
                onClick={() => copyRef(m)}
                className="px-3 py-1.5 font-semibold text-[#52128B] bg-[#F5F0FC] rounded-lg cursor-pointer"
              >
                {copiedId === m.id ? 'Copied' : 'Copy Path'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
