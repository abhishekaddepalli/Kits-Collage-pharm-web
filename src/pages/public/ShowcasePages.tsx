import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, Calendar, MapPin, Play, ShieldAlert, Trophy, X } from 'lucide-react';
import { useCms } from '../../app/providers/CmsContext';
import { SafeImage } from '../../components/common/SafeImage';
import type { GalleryItem } from '../../types/cms';

export const AchievementsPage: React.FC = () => {
  const { state } = useCms();
  const [cat, setCat] = useState('All');
  const items = state.achievements.filter((a) => a.active && (cat === 'All' || a.category === cat));

  return (
    <div>
      <section className="bg-[var(--kits-surface)] border-b border-[var(--kits-border)] py-10">
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-2">
            Recognitions & Milestones
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)]">
            Institutional & Student Achievements
          </h1>
        </div>
      </section>

      <div className="mx-auto px-4 sm:px-6 py-10 space-y-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
        <div className="flex flex-wrap gap-2">
          {['All', 'Institutional', 'Student', 'Faculty', 'Research'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`px-4 py-2 text-xs font-semibold rounded-full cursor-pointer ${
                cat === c
                  ? 'bg-[var(--kits-primary)] text-white'
                  : 'bg-white border border-[var(--kits-border)] text-[var(--kits-heading)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-[var(--kits-border)] rounded-2xl overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-44 h-44 sm:h-auto shrink-0">
                <SafeImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Trophy className="w-3.5 h-3.5 text-[var(--kits-gold)]" />
                  <span className="font-semibold text-[var(--kits-primary)]">{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.year}</span>
                </div>
                <h2 className="text-lg font-bold text-[var(--kits-heading)] font-sans">{item.title}</h2>
                <p className="text-xs font-medium text-slate-600">{item.recipient}</p>
                <p className="text-xs sm:text-sm text-[var(--kits-body)] leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PlacementsPage: React.FC = () => {
  const { state } = useCms();
  const items = state.placements.filter((p) => p.active);

  return (
    <div>
      <section className="bg-[var(--kits-surface)] border-b border-[var(--kits-border)] py-10">
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-2">
            Career Guidance & Training Cell
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)]">
            Placements & Career Readiness
          </h1>
          <p className="text-sm text-[var(--kits-body)] mt-2 max-w-2xl">
            Supporting pharmacy students with soft-skills training, regulatory knowledge, GPAT
            orientation, and career placement support.
          </p>
        </div>
      </section>

      <div className="mx-auto px-4 sm:px-6 py-12 space-y-8" style={{ maxWidth: 'var(--kits-container-max)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((rec) => (
            <div key={rec.id} className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--kits-primary)]">
                  <Briefcase className="w-4 h-4" />
                  {rec.companyName}
                </span>
                <span className="text-xs text-slate-500 tabular-nums">{rec.year}</span>
              </div>
              <div className="text-base font-bold text-[var(--kits-heading)]">{rec.roleTitle}</div>
              <div className="text-xs font-medium text-slate-600">{rec.sector}</div>
              <p className="text-xs sm:text-sm text-[var(--kits-body)] leading-relaxed">{rec.notes}</p>
              {rec.verificationStatus === 'pending_verification' && (
                <div className="flex items-center gap-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Recruiter slot placeholder — add verified recruiter & placement data in Admin.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const NewsEventsPage: React.FC = () => {
  const { state } = useCms();
  const { slug } = useParams();
  const [filterType, setFilterType] = useState<'all' | 'news' | 'event' | 'announcement'>('all');

  if (slug) {
    const item = state.newsEvents.find((n) => n.slug === slug);
    if (!item) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold">Article Not Found</h1>
          <Link to="/news" className="text-sm font-semibold text-[var(--kits-primary)]">← Back to News & Events</Link>
        </div>
      );
    }
    return (
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <Link to="/news" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--kits-primary)] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to News & Events
        </Link>
        <div className="space-y-3">
          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--kits-accent)]">{item.category}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{item.eventDate}</span>
            <span aria-hidden="true">·</span>
            <span>{item.author}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)]">{item.title}</h1>
          {item.venue && (
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--kits-primary)]" /> Venue: {item.venue}
            </p>
          )}
        </div>
        <div className="h-72 sm:h-96 rounded-2xl overflow-hidden border border-[var(--kits-border)]">
          <SafeImage src={item.featuredImage} alt={item.imageAlt} className="w-full h-full object-cover" />
        </div>
        <p className="text-base text-[var(--kits-body)] leading-relaxed">{item.content}</p>
      </article>
    );
  }

  const published = state.newsEvents.filter(
    (n) => n.status === 'published' && (filterType === 'all' || n.type === filterType)
  );

  return (
    <div>
      <section className="bg-[var(--kits-surface)] border-b border-[var(--kits-border)] py-10">
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-2">
            Campus Updates
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)]">
            News, Events & Announcements
          </h1>
        </div>
      </section>

      <div className="mx-auto px-4 sm:px-6 py-10 space-y-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Updates' },
            { id: 'announcement', label: 'Announcements' },
            { id: 'event', label: 'Events' },
            { id: 'news', label: 'News' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as typeof filterType)}
              className={`px-4 py-2 text-xs font-semibold rounded-full cursor-pointer ${
                filterType === tab.id
                  ? 'bg-[var(--kits-primary)] text-white'
                  : 'bg-white border border-[var(--kits-border)] text-[var(--kits-heading)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {published.map((item) => (
            <Link
              key={item.id}
              to={`/news/${item.slug}`}
              className="bg-white border border-[var(--kits-border)] hover:border-[var(--kits-primary)] rounded-2xl overflow-hidden flex flex-col transition-all"
            >
              <div className="h-44 overflow-hidden">
                <SafeImage src={item.featuredImage} alt={item.imageAlt} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-[var(--kits-accent)]">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Calendar className="w-3 h-3" /> {item.eventDate}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[var(--kits-heading)] font-sans">{item.title}</h2>
                  <p className="text-xs text-[var(--kits-body)] mt-1.5 line-clamp-3">{item.excerpt}</p>
                </div>
                <span className="text-xs font-semibold text-[var(--kits-primary)]">Read More →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export const GalleryPage: React.FC = () => {
  const { state } = useCms();
  const [cat, setCat] = useState('All');
  const [activeMedia, setActiveMedia] = useState<GalleryItem | null>(null);

  const items = state.gallery.filter((g) => g.active && (cat === 'All' || g.category === cat));

  return (
    <div>
      <section className="bg-[var(--kits-surface)] border-b border-[var(--kits-border)] py-10">
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-2">
            Visual Showcase
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)]">
            Photo & Video Gallery
          </h1>
        </div>
      </section>

      <div className="mx-auto px-4 sm:px-6 py-10 space-y-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
        <div className="flex flex-wrap gap-2">
          {['All', 'Campus', 'Laboratories', 'Cultural', 'Sports', 'Seminars', 'Workshops', 'Events'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`px-4 py-2 text-xs font-semibold rounded-full cursor-pointer ${
                cat === c
                  ? 'bg-[var(--kits-primary)] text-white'
                  : 'bg-white border border-[var(--kits-border)] text-[var(--kits-heading)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveMedia(item)}
              className="group text-left bg-white border border-[var(--kits-border)] rounded-2xl overflow-hidden cursor-pointer"
            >
              <div className="relative h-52 overflow-hidden">
                <SafeImage
                  src={item.url}
                  alt={item.altText}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.mediaType === 'video' && (
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-white text-[var(--kits-primary)] flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 ml-0.5" />
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="text-[11px] text-slate-500 mb-1">
                  {item.category} · <span className="tabular-nums">{item.date}</span>
                </div>
                <h2 className="text-sm font-bold text-[var(--kits-heading)] font-sans">{item.title}</h2>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeMedia && (
        <div
          role="dialog"
          aria-label={activeMedia.title}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setActiveMedia(null)}
        >
          <div
            className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-[var(--kits-border)] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--kits-heading)]">{activeMedia.title}</h3>
              <button
                type="button"
                onClick={() => setActiveMedia(null)}
                aria-label="Close preview"
                className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              {activeMedia.mediaType === 'video' && activeMedia.youtubeId ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    title={activeMedia.title}
                    src={`https://www.youtube.com/embed/${activeMedia.youtubeId}`}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <SafeImage
                  src={activeMedia.url}
                  alt={activeMedia.altText}
                  className="w-full max-h-[70vh] object-contain rounded-xl bg-slate-50"
                />
              )}
              <p className="text-xs text-slate-500 mt-3">{activeMedia.altText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
