import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Atom,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Pill,
  Play,
  ShieldCheck,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useCms } from '../../app/providers/CmsContext';
import { EnquiryFormCard } from '../../components/common/EnquiryFormCard';
import { SafeImage } from '../../components/common/SafeImage';

const DEPT_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Pill,
  FlaskConical,
  Atom,
  Leaf,
  BarChart3,
  HeartPulse,
};

export const HomePage: React.FC = () => {
  const { state } = useCms();
  const activeSlides = state.sliders.filter((s) => s.active).sort((a, b) => a.order - b.order);
  const [slideIndex, setSlideIndex] = useState(0);
  const [tourModalOpen, setTourModalOpen] = useState(false);

  const safeIndex = activeSlides.length > 0 ? slideIndex % activeSlides.length : 0;
  const currentSlide = activeSlides[safeIndex];

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const duration = currentSlide?.durationMs || 6500;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % activeSlides.length);
    }, duration);
    return () => window.clearInterval(timer);
  }, [activeSlides.length, currentSlide?.durationMs]);

  const activeDepartments = state.departments.filter((d) => d.active);
  const activePrograms = state.programs.filter((p) => p.active);
  const activeCampus = state.campusLife.filter((c) => c.active);
  const publishedNews = state.newsEvents.filter((n) => n.status === 'published').slice(0, 3);
  const activeTestimonials = state.testimonials.filter((t) => t.active);
  const admBanner = state.banners.find((b) => b.active && b.placement === 'homepage');

  return (
    <div>
      {/* HERO SLIDER */}
      {currentSlide && (
        <section className="relative bg-[var(--kits-surface)] overflow-hidden">
          <div className="relative min-h-[450px] lg:min-h-[540px] flex items-center">
            {/* Background Photography */}
            <div className="absolute inset-0">
              <SafeImage
                src={currentSlide.desktopImage}
                alt={currentSlide.imageAlt}
                loading="eager"
                className="w-full h-full object-cover object-center"
              />
              {/* Strong Mobile Contrast Scrim */}
              <div className="absolute inset-0 bg-[#F5F0FC]/82 md:hidden" />
              {/* Measured Light-to-Transparent Editorial Scrim matching mockup */}
              <div
                className="hidden md:block absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(245,240,252,0.98) 0%, rgba(252,250,255,0.92) 44%, rgba(252,250,255,0.35) 72%, rgba(23,18,56,0.18) 100%)',
                }}
              />
            </div>

            {/* Laurel Trust Seal on Top Right */}
            <div className="hidden md:flex absolute top-6 right-8 z-10 flex-col items-center justify-center w-24 h-24 rounded-full bg-white/90 border-2 border-[var(--kits-gold)] shadow-sm text-center p-2">
              <Award className="w-5 h-5 text-[var(--kits-gold)] mb-0.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Since</span>
              <span className="text-base font-bold text-[var(--kits-heading)] font-display tabular-nums">2019</span>
            </div>

            <div
              className="relative z-10 w-full mx-auto px-4 sm:px-14 lg:px-12 pt-10 pb-16 lg:pt-14 lg:pb-20"
              style={{ maxWidth: 'var(--kits-container-max)' }}
            >
              <div className={currentSlide.textPosition === 'center' ? 'max-w-2xl mx-auto text-center' : 'max-w-xl'}>
                {currentSlide.badge && (
                  <p className="inline-block text-xs sm:text-sm font-semibold text-[var(--kits-primary)] bg-white/90 px-3.5 py-1.5 rounded-full border border-[var(--kits-border)] mb-4">
                    {currentSlide.badge}
                  </p>
                )}

                <h1 className="text-3xl sm:text-4xl lg:text-[52px] font-bold text-[var(--kits-heading)] leading-[1.12] text-balance mb-4">
                  {currentSlide.heading}{' '}
                  {currentSlide.highlightedText && (
                    <span className="text-[var(--kits-accent)]">{currentSlide.highlightedText}</span>
                  )}
                </h1>

                <p className="text-sm sm:text-base text-[var(--kits-body)] leading-relaxed max-w-lg mb-7">
                  {currentSlide.description}
                </p>

                <div
                  className={`flex flex-wrap items-center gap-3 ${
                    currentSlide.textPosition === 'center' ? 'justify-center' : ''
                  }`}
                >
                  <Link
                    to={currentSlide.primaryCtaLink || '/academics/programs'}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[var(--kits-primary)] hover:bg-[var(--kits-secondary)] rounded-full transition-colors whitespace-nowrap"
                  >
                    {currentSlide.primaryCtaLabel}
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setTourModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[var(--kits-heading)] bg-white/95 hover:bg-white border border-[var(--kits-border)] rounded-full transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-[var(--kits-accent)]" />
                    {currentSlide.secondaryCtaLabel === 'Apply Now' ? 'Watch Campus Tour' : currentSlide.secondaryCtaLabel}
                  </button>
                </div>
              </div>
            </div>

            {/* Slide Prev / Next */}
            {activeSlides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSlideIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
                  aria-label="Previous slide"
                  className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[var(--kits-heading)] items-center justify-center shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSlideIndex((prev) => (prev + 1) % activeSlides.length)}
                  aria-label="Next slide"
                  className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[var(--kits-heading)] items-center justify-center shadow-sm cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                  {activeSlides.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSlideIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === safeIndex
                          ? 'w-7 bg-[var(--kits-primary)]'
                          : 'w-2 bg-[var(--kits-primary)]/30'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Institutional Highlights Ribbon */}
          <div
            className="relative z-20 mx-auto px-4 sm:px-6 -mt-6 mb-8"
            style={{ maxWidth: 'var(--kits-container-max)' }}
          >
            <div className="bg-white border border-[var(--kits-border)] rounded-2xl shadow-md grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-[var(--kits-border)]">
              {[
                { icon: GraduationCap, title: 'B.Pharmacy', sub: 'UG Degree Program' },
                { icon: BookOpen, title: 'M.Pharmacy', sub: 'PG Degree Specialization' },
                { icon: ShieldCheck, title: 'PCI Approved', sub: 'Pharmacy Council of India' },
                { icon: Building2, title: 'JNTUK Affiliated', sub: 'JNTU Kakinada' },
                { icon: Calendar, title: 'Established 2019', sub: 'Divili, AP Campus' },
                { icon: Users, title: 'Women Only', sub: 'Dedicated Empowerment' },
              ].map((item) => (
                <div key={item.title} className="px-4 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--kits-surface)] text-[var(--kits-primary)] flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-[var(--kits-heading)] truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MOBILE QUICK ACTION GRID (Matches Mobile Mockup) */}
      <section className="md:hidden px-4 py-4">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'B.Pharm', to: '/academics/programs', icon: GraduationCap },
            { label: 'M.Pharm', to: '/academics/programs', icon: BookOpen },
            { label: 'Admissions', to: '/admissions', icon: Building2 },
            { label: 'Departments', to: '/departments', icon: FlaskConical },
            { label: 'Campus Life', to: '/campus-life', icon: Leaf },
            { label: 'Contact', to: '/contact', icon: Phone },
          ].map((tile) => (
            <Link
              key={tile.label}
              to={tile.to}
              className="bg-white border border-[var(--kits-border)] rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5"
            >
              <tile.icon className="w-5 h-5 text-[var(--kits-primary)]" />
              <span className="text-xs font-semibold text-[var(--kits-heading)]">{tile.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ABOUT KITS + ADMISSIONS CAMPAIGN BANNER */}
      <section
        className="mx-auto px-4 sm:px-6 py-10 lg:py-14"
        style={{ maxWidth: 'var(--kits-container-max)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* About KITS Split */}
          <div className="lg:col-span-7 bg-white border border-[var(--kits-border)] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-stretch">
            <div className="md:w-5/12 rounded-xl overflow-hidden bg-[var(--kits-surface)] min-h-[220px]">
              <SafeImage
                src={state.media.find((m) => m.id === 'med-2')?.url}
                alt="KITS College of Pharmacy for Women campus building"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-7/12 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-1">
                  Institutional Profile
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--kits-heading)] mb-3">
                  About <span className="text-[var(--kits-primary)]">KITS</span>
                </h2>
                <p className="text-sm text-[var(--kits-body)] leading-relaxed">
                  KITS College of Pharmacy for Women is a dedicated institution committed to
                  excellence in pharmaceutical education, research, and professional development of
                  women, located in Tirupati (V), Divili, Peddapuram Mandal, Kakinada District,
                  Andhra Pradesh.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[var(--kits-border)]">
                <div>
                  <div className="text-lg font-bold text-[var(--kits-primary)] tabular-nums">2019</div>
                  <div className="text-[11px] text-slate-500">Established</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[var(--kits-primary)] tabular-nums">
                    {activeDepartments.length}
                  </div>
                  <div className="text-[11px] text-slate-500">Departments</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[var(--kits-primary)]">PCI</div>
                  <div className="text-[11px] text-slate-500">Approved</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[var(--kits-primary)]">JNTUK</div>
                  <div className="text-[11px] text-slate-500">Affiliated</div>
                </div>
              </div>

              <div>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-[var(--kits-primary)] border border-[var(--kits-primary)] hover:bg-[var(--kits-primary)] hover:text-white rounded-full transition-colors"
                >
                  Know More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Admissions Open Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#F5F0FC] to-[#ECE2FA] border border-[var(--kits-border)] rounded-2xl p-6 sm:p-8 flex items-center justify-between gap-4 overflow-hidden">
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--kits-primary)]">
                <GraduationCap className="w-4 h-4" />
                <span>{state.settings.admissionsConfig.academicYear}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--kits-heading)] text-balance">
                {admBanner?.title || state.settings.admissionsConfig.headline}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--kits-body)] leading-relaxed">
                {admBanner?.subtitle || state.settings.admissionsConfig.subtext}
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <Link
                  to={admBanner?.ctaLink || '/admissions'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#171238] bg-[var(--kits-gold)] hover:brightness-95 rounded-full transition-all shadow-xs"
                >
                  {admBanner?.ctaLabel || 'Apply Now'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/admissions/eligibility"
                  className="inline-flex items-center px-4 py-2.5 text-xs font-semibold text-[var(--kits-primary)] bg-white/80 hover:bg-white rounded-full transition-colors"
                >
                  Eligibility Info
                </Link>
              </div>
            </div>
            <div className="hidden sm:block w-36 h-48 rounded-xl overflow-hidden shrink-0 border border-white/80 shadow-sm">
              <SafeImage
                src={admBanner?.imageUrl || state.media.find((m) => m.id === 'med-6')?.url}
                alt="Pharmacy student with textbooks"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ACADEMIC DEPARTMENTS + WHY CHOOSE KITS */}
      <section className="bg-[var(--kits-surface)] py-12 lg:py-16 border-y border-[var(--kits-border)]">
        <div
          className="mx-auto px-4 sm:px-6"
          style={{ maxWidth: 'var(--kits-container-max)' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 6 Departments */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--kits-heading)]">
                    Our Academic <span className="text-[var(--kits-primary)]">Departments</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--kits-body)] mt-1">
                    Six specialized pharmaceutical divisions with dedicated laboratories
                  </p>
                </div>
                <Link
                  to="/departments"
                  className="text-xs sm:text-sm font-semibold text-[var(--kits-primary)] hover:underline whitespace-nowrap"
                >
                  Explore All →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {activeDepartments.map((dept) => {
                  const IconComp = DEPT_ICONS[dept.iconName] || FlaskConical;
                  return (
                    <Link
                      key={dept.id}
                      to={`/departments/${dept.slug}`}
                      className="group bg-white border border-[var(--kits-border)] hover:border-[var(--kits-primary)] rounded-2xl p-5 text-center transition-all hover:-translate-y-0.5"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[var(--kits-surface)] text-[var(--kits-primary)] group-hover:bg-[var(--kits-primary)] group-hover:text-white flex items-center justify-center mx-auto mb-3 transition-colors">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-[var(--kits-heading)] font-sans leading-snug">
                        {dept.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {dept.shortDescription}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Why Choose KITS */}
            <div className="lg:col-span-5 bg-white border border-[var(--kits-border)] rounded-2xl p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--kits-heading)]">
                    Why Choose <span className="text-[var(--kits-accent)]">KITS?</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Focused academic ecosystem for women pharmacists
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>

              <ul className="space-y-3 text-sm text-[var(--kits-heading)]">
                {[
                  'Women-Centric, Safe & Supportive Learning Environment',
                  'PCI-Approved Curriculum Affiliated to JNTU Kakinada',
                  'Practical Laboratory Learning & Analytical Instrumentation',
                  'Central Library, Pharmacopeias & Botanical Medicinal Garden',
                  'Faculty Mentorship, Seminars & Career Guidance Cell',
                  'Holistic Personality, Leadership & Community Outreach',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm leading-snug">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ACADEMIC PROGRAMS */}
      <section
        className="mx-auto px-4 sm:px-6 py-12 lg:py-16"
        style={{ maxWidth: 'var(--kits-container-max)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-1">
              Academic Offerings
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--kits-heading)]">
              Pharmaceutical Programs
            </h2>
          </div>
          <Link
            to="/academics/programs"
            className="text-sm font-semibold text-[var(--kits-primary)] hover:underline"
          >
            View Syllabus & Calendar →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activePrograms.map((prog) => (
            <div
              key={prog.id}
              className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-[var(--kits-primary)]">
                    {prog.level} · {prog.duration}
                  </span>
                  {prog.verificationStatus === 'pending_verification' && (
                    <span className="text-amber-700 font-medium">
                      Verify Active Approval in Admin
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[var(--kits-heading)] mb-2">{prog.name}</h3>
                <p className="text-xs sm:text-sm text-[var(--kits-body)] leading-relaxed mb-4">
                  {prog.description}
                </p>
                <div className="text-xs text-slate-600 space-y-1.5 border-t border-[var(--kits-border)] pt-3">
                  <p>
                    <strong className="text-[var(--kits-heading)]">Eligibility:</strong> {prog.eligibility}
                  </p>
                  <p>
                    <strong className="text-[var(--kits-heading)]">Intake Capacity:</strong> {prog.intakeCapacity}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/academics/programs"
                  className="px-4 py-2 text-xs font-semibold text-[var(--kits-primary)] border border-[var(--kits-primary)] rounded-full hover:bg-[var(--kits-surface)] transition-colors"
                >
                  Learn More
                </Link>
                <Link
                  to="/admissions"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[var(--kits-primary)] hover:bg-[var(--kits-secondary)] rounded-full transition-colors"
                >
                  Enquire Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CAMPUS LIFE @ KITS */}
      <section className="bg-[var(--kits-surface)] py-12 lg:py-16 border-y border-[var(--kits-border)]">
        <div
          className="mx-auto px-4 sm:px-6"
          style={{ maxWidth: 'var(--kits-container-max)' }}
        >
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--kits-heading)]">
                Campus Life <span className="text-[var(--kits-accent)]">@ KITS</span>
              </h2>
              <p className="text-xs sm:text-sm text-[var(--kits-body)] mt-1">
                Explore laboratories, library, medicinal garden, hostel support, and student activities
              </p>
            </div>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[var(--kits-primary)] bg-white border border-[var(--kits-border)] rounded-full hover:bg-[var(--kits-primary)] hover:text-white transition-colors whitespace-nowrap"
            >
              View Gallery
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {activeCampus.map((item) => (
              <Link
                key={item.id}
                to={`/campus-life/${item.slug}`}
                className="group relative h-44 rounded-2xl overflow-hidden border border-[var(--kits-border)] bg-white"
              >
                <SafeImage
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171238]/90 via-[#171238]/25 to-transparent flex flex-col justify-end p-3.5">
                  <span className="text-[10px] text-[var(--kits-gold)] font-medium">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-white font-sans">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS & TESTIMONIALS */}
      <section
        className="mx-auto px-4 sm:px-6 py-12 lg:py-16"
        style={{ maxWidth: 'var(--kits-container-max)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold text-[var(--kits-heading)]">
                Latest News & Events
              </h2>
              <Link to="/news" className="text-xs font-semibold text-[var(--kits-primary)] hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {publishedNews.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.slug}`}
                  className="flex flex-col sm:flex-row gap-4 bg-white border border-[var(--kits-border)] rounded-2xl p-4 hover:border-[var(--kits-primary)] transition-colors"
                >
                  <div className="sm:w-36 h-24 rounded-xl overflow-hidden shrink-0">
                    <SafeImage
                      src={item.featuredImage}
                      alt={item.imageAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[var(--kits-accent)]">{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{item.eventDate}</span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--kits-heading)] font-sans line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--kits-body)] mt-1 line-clamp-2">
                      {item.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold text-[var(--kits-heading)]">
                Student Voices
              </h2>
              <span className="text-xs text-slate-500">Demo Review Records</span>
            </div>
            <div className="space-y-4">
              {activeTestimonials.slice(0, 2).map((t) => (
                <div
                  key={t.id}
                  className="bg-[var(--kits-surface)] border border-[var(--kits-border)] rounded-2xl p-5"
                >
                  <p className="text-xs sm:text-sm text-[var(--kits-heading)] italic leading-relaxed mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src={t.photoUrl}
                      alt={t.studentName}
                      className="w-10 h-10 rounded-full object-cover border border-white"
                    />
                    <div>
                      <div className="text-xs font-bold text-[var(--kits-heading)]">{t.studentName}</div>
                      <div className="text-[11px] text-slate-500">
                        {t.course} · {t.graduationYear}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT & ADMISSION ENQUIRY */}
      <section className="bg-[var(--kits-surface)] py-12 lg:py-16 border-t border-[var(--kits-border)]">
        <div
          className="mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          style={{ maxWidth: 'var(--kits-container-max)' }}
        >
          <div className="lg:col-span-5 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-1">
                Campus & Admissions Desk
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--kits-heading)]">
                Connect with KITS Pharmacy
              </h2>
            </div>

            <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--kits-primary)] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[var(--kits-heading)]">Campus Address</div>
                  <div className="text-xs text-[var(--kits-body)] mt-0.5">
                    {state.settings.contact.address}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[var(--kits-primary)] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[var(--kits-heading)]">Phone & Landline</div>
                  <div className="text-xs text-[var(--kits-body)] mt-0.5 tabular-nums">
                    <a href={`tel:${state.settings.contact.primaryPhone.replace(/\s+/g, '')}`} className="hover:underline">
                      {state.settings.contact.primaryPhone}
                    </a>{' '}
                    · {state.settings.contact.landlinePhone}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[var(--kits-primary)] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[var(--kits-heading)]">Email</div>
                  <a
                    href={`mailto:${state.settings.contact.email}`}
                    className="text-xs text-[var(--kits-primary)] hover:underline"
                  >
                    {state.settings.contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[var(--kits-primary)] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[var(--kits-heading)]">Working Hours</div>
                  <div className="text-xs text-[var(--kits-body)] mt-0.5">
                    {state.settings.contact.workingHours}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/${state.settings.contact.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-full transition-colors"
                >
                  WhatsApp Admissions
                </a>
                <Link
                  to="/contact"
                  className="px-4 py-2 text-xs font-semibold text-[var(--kits-primary)] border border-[var(--kits-primary)] rounded-full hover:bg-[var(--kits-surface)] transition-colors"
                >
                  View Campus Map
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h3 className="text-xl font-bold text-[var(--kits-heading)] mb-4">
              Quick Admission Enquiry
            </h3>
            <EnquiryFormCard compact />
          </div>
        </div>
      </section>

      {/* Campus Tour Modal */}
      {tourModalOpen && (
        <div
          role="dialog"
          aria-label="Campus Tour Preview"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setTourModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-[var(--kits-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[var(--kits-border)] flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--kits-heading)]">
                KITS Campus & Facilities Overview
              </h3>
              <button
                type="button"
                onClick={() => setTourModalOpen(false)}
                aria-label="Close modal"
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                <SafeImage
                  src={state.media.find((m) => m.id === 'med-2')?.url}
                  alt="KITS campus aerial view"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs sm:text-sm text-[var(--kits-body)]">
                Explore our Divili campus classrooms, laboratories, central library, and medicinal
                garden. Administrators can attach an official YouTube campus tour URL via the
                Gallery or Sliders Manager.
              </p>
              <div className="flex justify-end gap-2">
                <Link
                  to="/gallery"
                  onClick={() => setTourModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[var(--kits-primary)] rounded-full"
                >
                  Open Photo & Video Gallery
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
