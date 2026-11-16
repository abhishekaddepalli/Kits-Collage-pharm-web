import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCms } from '../app/providers/CmsContext';
import type {
  AchievementItem,
  CampusLifeItem,
  DownloadDocument,
  GalleryItem,
  NewsEventItem,
  PlacementRecord,
  TestimonialItem,
} from '../types/cms';
import { slugifyText } from '../utils/validation';

export const NewsEventsManager: React.FC = () => {
  const { state, updateState } = useCms();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'news' | 'event' | 'announcement'>('news');

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newItem: NewsEventItem = {
      id: `news-${Date.now()}`,
      type,
      title: title.trim(),
      slug: slugifyText(`${title}-${Date.now().toString().slice(-3)}`),
      excerpt: 'Summary excerpt for news & events listing.',
      content: 'Full article content editable in CMS.',
      featuredImage: state.media[0]?.url || '',
      imageAlt: title.trim(),
      category: type === 'event' ? 'Academic Event' : 'Campus Update',
      eventDate: new Date().toISOString().slice(0, 10),
      venue: 'KITS Campus, Divili',
      author: 'CMS Editor',
      publishedAt: new Date().toISOString().slice(0, 10),
      status: 'published',
      seoTitle: title.trim(),
      seoDescription: title.trim(),
    };
    updateState((prev) => ({ ...prev, newsEvents: [newItem, ...prev.newsEvents] }), {
      action: `Published ${type} "${newItem.title}"`,
      module: 'News & Events',
    });
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#171238]">News, Events & Announcements</h1>
      <form onSubmit={addItem} className="bg-white border border-[#E8DFF5] rounded-2xl p-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline or event title"
          className="flex-1 min-w-[200px] px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg bg-white"
        >
          <option value="news">News</option>
          <option value="event">Event</option>
          <option value="announcement">Announcement</option>
        </select>
        <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-lg cursor-pointer">
          <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Entry
        </button>
      </form>

      <div className="space-y-3">
        {state.newsEvents.map((n) => (
          <div key={n.id} className="bg-white border border-[#E8DFF5] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={n.title}
                onChange={(e) =>
                  updateState((prev) => ({
                    ...prev,
                    newsEvents: prev.newsEvents.map((x) => (x.id === n.id ? { ...x, title: e.target.value } : x)),
                  }))
                }
                className="font-bold text-sm text-[#171238] w-full border-b border-transparent focus:border-[#52128B] focus:outline-none"
              />
              <div className="text-slate-500 mt-0.5">{n.type} · {n.eventDate} · {n.venue}</div>
            </div>
            <select
              value={n.status}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  newsEvents: prev.newsEvents.map((x) =>
                    x.id === n.id ? { ...x, status: e.target.value as NewsEventItem['status'] } : x
                  ),
                }))
              }
              className="px-2.5 py-1 border border-[#E8DFF5] rounded bg-white"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <button
              type="button"
              onClick={() =>
                updateState((prev) => ({ ...prev, newsEvents: prev.newsEvents.filter((x) => x.id !== n.id) }))
              }
              aria-label={`Delete ${n.title}`}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AchievementsManager: React.FC = () => {
  const { state, updateState } = useCms();
  const addItem = () => {
    const item: AchievementItem = {
      id: `ach-${Date.now()}`,
      category: 'Student',
      title: 'New Achievement Entry',
      recipient: 'Verify Student / Faculty Name',
      year: '2026',
      description: 'Achievement details.',
      imageUrl: state.media[0]?.url || '',
      verificationStatus: 'pending_verification',
      active: true,
    };
    updateState((prev) => ({ ...prev, achievements: [item, ...prev.achievements] }), {
      action: 'Added achievement entry',
      module: 'Achievements',
    });
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171238]">Achievements Manager</h1>
        <button type="button" onClick={addItem} className="px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full cursor-pointer">
          + Add Achievement
        </button>
      </div>
      <div className="space-y-3">
        {state.achievements.map((a) => (
          <div key={a.id} className="bg-white border border-[#E8DFF5] rounded-xl p-4 flex flex-wrap gap-3 items-center text-xs">
            <input
              type="text"
              value={a.title}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  achievements: prev.achievements.map((x) => (x.id === a.id ? { ...x, title: e.target.value } : x)),
                }))
              }
              className="flex-1 min-w-[200px] px-3 py-1.5 font-bold border border-[#E8DFF5] rounded"
            />
            <input
              type="text"
              value={a.year}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  achievements: prev.achievements.map((x) => (x.id === a.id ? { ...x, year: e.target.value } : x)),
                }))
              }
              className="w-28 px-3 py-1.5 border border-[#E8DFF5] rounded"
            />
            <button
              type="button"
              onClick={() =>
                updateState((prev) => ({ ...prev, achievements: prev.achievements.filter((x) => x.id !== a.id) }))
              }
              className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PlacementsManager: React.FC = () => {
  const { state, updateState } = useCms();
  const addRecord = () => {
    const rec: PlacementRecord = {
      id: `plc-${Date.now()}`,
      companyName: 'Verified Recruiter Name',
      sector: 'Pharmaceutical Industry',
      roleTitle: 'Graduate Trainee',
      year: '2026',
      notes: 'Verify recruiter details before publishing.',
      verificationStatus: 'pending_verification',
      active: true,
    };
    updateState((prev) => ({ ...prev, placements: [rec, ...prev.placements] }), {
      action: 'Added placement record',
      module: 'Placements',
    });
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171238]">Placements Manager</h1>
        <button type="button" onClick={addRecord} className="px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full cursor-pointer">
          + Add Placement Entry
        </button>
      </div>
      <div className="space-y-3">
        {state.placements.map((p) => (
          <div key={p.id} className="bg-white border border-[#E8DFF5] rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <input
              type="text"
              value={p.companyName}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  placements: prev.placements.map((x) => (x.id === p.id ? { ...x, companyName: e.target.value } : x)),
                }))
              }
              className="px-3 py-1.5 font-bold border border-[#E8DFF5] rounded"
            />
            <input
              type="text"
              value={p.roleTitle}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  placements: prev.placements.map((x) => (x.id === p.id ? { ...x, roleTitle: e.target.value } : x)),
                }))
              }
              className="px-3 py-1.5 border border-[#E8DFF5] rounded"
            />
            <div className="flex justify-end items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  updateState((prev) => ({ ...prev, placements: prev.placements.filter((x) => x.id !== p.id) }))
                }
                className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CampusLifeManager: React.FC = () => {
  const { state, updateState } = useCms();
  const addCampusItem = () => {
    const item: CampusLifeItem = {
      id: `cl-${Date.now()}`,
      slug: `facility-${Date.now().toString().slice(-4)}`,
      title: 'New Campus Facility',
      category: 'Infrastructure',
      summary: 'Summary of campus facility.',
      details: 'Full campus facility details.',
      highlights: ['Student-focused space'],
      imageUrl: state.media[1]?.url || '',
      imageAlt: 'Campus facility',
      active: true,
    };
    updateState((prev) => ({ ...prev, campusLife: [...prev.campusLife, item] }));
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171238]">Campus Life Manager</h1>
        <button type="button" onClick={addCampusItem} className="px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full cursor-pointer">
          + Add Facility
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.campusLife.map((c) => (
          <div key={c.id} className="bg-white border border-[#E8DFF5] rounded-xl p-4 space-y-2 text-xs">
            <input
              type="text"
              value={c.title}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  campusLife: prev.campusLife.map((x) => (x.id === c.id ? { ...x, title: e.target.value } : x)),
                }))
              }
              className="w-full font-bold text-sm border-b border-[#E8DFF5] pb-1 focus:outline-none"
            />
            <textarea
              rows={2}
              value={c.summary}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  campusLife: prev.campusLife.map((x) => (x.id === c.id ? { ...x, summary: e.target.value } : x)),
                }))
              }
              className="w-full px-2 py-1.5 border border-[#E8DFF5] rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const GalleryManager: React.FC = () => {
  const { state, updateState } = useCms();
  const addPhoto = () => {
    const g: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: 'New Gallery Item',
      category: 'Campus',
      mediaType: 'photo',
      url: state.media[0]?.url || '',
      altText: 'KITS campus photograph',
      date: new Date().toISOString().slice(0, 10),
      active: true,
    };
    updateState((prev) => ({ ...prev, gallery: [g, ...prev.gallery] }), {
      action: 'Added gallery item',
      module: 'Gallery',
    });
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171238]">Photo & Video Gallery Manager</h1>
        <button type="button" onClick={addPhoto} className="px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full cursor-pointer">
          + Add Gallery Item
        </button>
      </div>
      <div className="space-y-3">
        {state.gallery.map((g) => (
          <div key={g.id} className="bg-white border border-[#E8DFF5] rounded-xl p-4 flex flex-wrap items-center gap-3 text-xs">
            <input
              type="text"
              value={g.title}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  gallery: prev.gallery.map((x) => (x.id === g.id ? { ...x, title: e.target.value } : x)),
                }))
              }
              className="flex-1 min-w-[180px] px-3 py-1.5 font-semibold border border-[#E8DFF5] rounded"
            />
            <select
              value={g.category}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  gallery: prev.gallery.map((x) =>
                    x.id === g.id ? { ...x, category: e.target.value as GalleryItem['category'] } : x
                  ),
                }))
              }
              className="px-2.5 py-1.5 border border-[#E8DFF5] rounded bg-white"
            >
              {['Campus', 'Laboratories', 'Cultural', 'Sports', 'Seminars', 'Workshops', 'Events'].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                updateState((prev) => ({ ...prev, gallery: prev.gallery.filter((x) => x.id !== g.id) }))
              }
              className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TestimonialsManager: React.FC = () => {
  const { state, updateState } = useCms();
  const addTest = () => {
    const t: TestimonialItem = {
      id: `test-${Date.now()}`,
      studentName: 'Student Name (Approved Record)',
      photoUrl: state.media[5]?.url || '',
      course: 'B.Pharmacy',
      graduationYear: '2026',
      quote: 'Enter approved student testimonial.',
      active: true,
      verificationStatus: 'pending_verification',
    };
    updateState((prev) => ({ ...prev, testimonials: [t, ...prev.testimonials] }));
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171238]">Testimonials Manager</h1>
        <button type="button" onClick={addTest} className="px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full cursor-pointer">
          + Add Testimonial
        </button>
      </div>
      <div className="space-y-3">
        {state.testimonials.map((t) => (
          <div key={t.id} className="bg-white border border-[#E8DFF5] rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between gap-2">
              <input
                type="text"
                value={t.studentName}
                onChange={(e) =>
                  updateState((prev) => ({
                    ...prev,
                    testimonials: prev.testimonials.map((x) =>
                      x.id === t.id ? { ...x, studentName: e.target.value } : x
                    ),
                  }))
                }
                className="font-bold border-b border-[#E8DFF5] flex-1 focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  updateState((prev) => ({ ...prev, testimonials: prev.testimonials.filter((x) => x.id !== t.id) }))
                }
                className="text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={2}
              value={t.quote}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  testimonials: prev.testimonials.map((x) => (x.id === t.id ? { ...x, quote: e.target.value } : x)),
                }))
              }
              className="w-full px-3 py-1.5 border border-[#E8DFF5] rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const DownloadsManager: React.FC = () => {
  const { state, updateState } = useCms();
  const addDoc = () => {
    const doc: DownloadDocument = {
      id: `dl-${Date.now()}`,
      title: 'New Academic Circular',
      category: 'Admissions',
      fileUrl: '/downloads',
      fileSize: '500 KB',
      updatedAt: new Date().toISOString().slice(0, 10),
      active: true,
    };
    updateState((prev) => ({ ...prev, downloads: [doc, ...prev.downloads] }));
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171238]">Downloads & Documents Manager</h1>
        <button type="button" onClick={addDoc} className="px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full cursor-pointer">
          + Add Document
        </button>
      </div>
      <div className="space-y-3">
        {state.downloads.map((d) => (
          <div key={d.id} className="bg-white border border-[#E8DFF5] rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
            <input
              type="text"
              value={d.title}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  downloads: prev.downloads.map((x) => (x.id === d.id ? { ...x, title: e.target.value } : x)),
                }))
              }
              className="flex-1 px-3 py-1.5 font-semibold border border-[#E8DFF5] rounded"
            />
            <button
              type="button"
              onClick={() =>
                updateState((prev) => ({ ...prev, downloads: prev.downloads.filter((x) => x.id !== d.id) }))
              }
              className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
