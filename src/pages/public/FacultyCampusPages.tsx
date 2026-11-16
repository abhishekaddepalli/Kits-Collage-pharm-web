import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Mail, Search, ShieldAlert, X } from 'lucide-react';
import { useCms } from '../../app/providers/CmsContext';
import { SafeImage } from '../../components/common/SafeImage';
import type { FacultyMember } from '../../types/cms';

export const FacultyPage: React.FC = () => {
  const { state } = useCms();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selected, setSelected] = useState<FacultyMember | null>(null);

  const activeFaculty = state.faculty
    .filter((f) => f.active)
    .sort((a, b) => a.order - b.order)
    .filter((f) => {
      const matchDept = deptFilter === 'All' || f.departmentName === deptFilter;
      const matchSearch =
        !search.trim() ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.designation.toLowerCase().includes(search.toLowerCase()) ||
        f.departmentName.toLowerCase().includes(search.toLowerCase());
      return matchDept && matchSearch;
    });

  return (
    <div>
      <section className="bg-[var(--kits-surface)] border-b border-[var(--kits-border)] py-10">
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-2">
            Academic Leadership & Educators
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)]">
            Faculty & Staff Directory
          </h1>
          <p className="text-xs sm:text-sm text-[var(--kits-body)] mt-2 max-w-2xl">
            Faculty profiles are managed through the CMS. Sample and placeholder entries are clearly
            marked for verification by the College Administration.
          </p>
        </div>
      </section>

      <div className="mx-auto px-4 sm:px-6 py-10 space-y-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty by name, designation, or department..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[var(--kits-border)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--kits-primary)]"
            />
          </div>
          <select
            aria-label="Filter by department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-4 py-2.5 text-sm bg-white border border-[var(--kits-border)] rounded-full focus:outline-none"
          >
            <option value="All">All Departments</option>
            {state.departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeFaculty.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 flex flex-col justify-between gap-4"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <SafeImage
                    src={member.photoUrl}
                    alt={member.photoAlt}
                    className="w-16 h-16 rounded-full object-cover border border-[var(--kits-border)] shrink-0"
                  />
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-[var(--kits-heading)] font-sans leading-snug">
                      {member.name}
                    </h2>
                    <p className="text-xs font-semibold text-[var(--kits-primary)]">
                      {member.designation}
                    </p>
                    <p className="text-xs text-slate-500">{member.departmentName}</p>
                  </div>
                </div>

                {member.verificationStatus !== 'verified' && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {member.verificationStatus === 'pending_verification'
                        ? 'Placeholder — Verify Name & Credentials in Admin'
                        : 'Sample Demo Profile — Replace with Verified Roster'}
                    </span>
                  </div>
                )}

                <p className="text-xs text-[var(--kits-body)] line-clamp-3 leading-relaxed">
                  {member.biography}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--kits-border)] text-xs">
                <span className="text-slate-500 truncate">{member.qualification}</span>
                <button
                  type="button"
                  onClick={() => setSelected(member)}
                  className="font-semibold text-[var(--kits-primary)] hover:underline whitespace-nowrap ml-2 cursor-pointer"
                >
                  View Profile →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div
          role="dialog"
          aria-label={selected.name}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xl border border-[var(--kits-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <SafeImage
                  src={selected.photoUrl}
                  alt={selected.photoAlt}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-[var(--kits-heading)]">{selected.name}</h3>
                  <p className="text-xs font-semibold text-[var(--kits-primary)]">
                    {selected.designation} · {selected.departmentName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close profile"
                className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[var(--kits-body)] leading-relaxed">{selected.biography}</p>
            <div className="text-xs space-y-1.5 border-t border-[var(--kits-border)] pt-3">
              <p><strong>Qualification:</strong> {selected.qualification}</p>
              <p><strong>Experience:</strong> {selected.experience}</p>
              <p><strong>Research Interests:</strong> {selected.researchInterests.join(', ')}</p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[var(--kits-primary)]" />
                <span>{selected.email}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CampusLifePage: React.FC = () => {
  const { state } = useCms();
  const { slug } = useParams();
  const activeItems = state.campusLife.filter((c) => c.active);
  const focused = slug ? activeItems.find((c) => c.slug === slug) : activeItems[0];

  return (
    <div>
      <section className="bg-[var(--kits-surface)] border-b border-[var(--kits-border)] py-10">
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-2">
            Student Life & Facilities
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)] mb-4">
            Campus Life @ KITS
          </h1>
          <div className="flex flex-wrap gap-2">
            {activeItems.map((item) => (
              <Link
                key={item.id}
                to={`/campus-life/${item.slug}`}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors ${
                  focused?.id === item.id
                    ? 'bg-[var(--kits-primary)] text-white'
                    : 'bg-white border border-[var(--kits-border)] text-[var(--kits-heading)]'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto px-4 sm:px-6 py-12 space-y-12" style={{ maxWidth: 'var(--kits-container-max)' }}>
        {focused && (
          <section className="bg-white border border-[var(--kits-border)] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-6 min-h-[260px]">
              <SafeImage src={focused.imageUrl} alt={focused.imageAlt} className="w-full h-full object-cover" />
            </div>
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--kits-accent)]">
                {focused.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--kits-heading)]">
                {focused.title}
              </h2>
              <p className="text-sm text-[var(--kits-body)] leading-relaxed">{focused.details}</p>
              <ul className="space-y-2 pt-2">
                {focused.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs sm:text-sm text-[var(--kits-heading)]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeItems.map((item) => (
            <Link
              key={item.id}
              to={`/campus-life/${item.slug}`}
              className="bg-white border border-[var(--kits-border)] hover:border-[var(--kits-primary)] rounded-2xl overflow-hidden flex flex-col transition-all"
            >
              <div className="h-44 overflow-hidden">
                <SafeImage src={item.imageUrl} alt={item.imageAlt} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 space-y-2">
                <span className="text-[11px] font-semibold text-[var(--kits-accent)]">{item.category}</span>
                <h3 className="text-lg font-bold text-[var(--kits-heading)] font-sans">{item.title}</h3>
                <p className="text-xs text-[var(--kits-body)]">{item.summary}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
};
