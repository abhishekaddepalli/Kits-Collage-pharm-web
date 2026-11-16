import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, FlaskConical, Users } from 'lucide-react';
import { useCms } from '../../app/providers/CmsContext';
import { SafeImage } from '../../components/common/SafeImage';

export const DepartmentsPage: React.FC = () => {
  const { state } = useCms();
  const activeDepts = state.departments.filter((d) => d.active);

  return (
    <div>
      <section className="bg-[var(--kits-surface)] border-b border-[var(--kits-border)] py-10">
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-2">
            Academic Divisions
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)]">
            Pharmaceutical Departments
          </h1>
          <p className="text-sm text-[var(--kits-body)] mt-2 max-w-2xl">
            Explore our six specialized departments combining theoretical mastery, modern laboratory
            training, and research mentorship.
          </p>
        </div>
      </section>

      <div className="mx-auto px-4 sm:px-6 py-12" style={{ maxWidth: 'var(--kits-container-max)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeDepts.map((dept) => (
            <Link
              key={dept.id}
              to={`/departments/${dept.slug}`}
              className="group bg-white border border-[var(--kits-border)] hover:border-[var(--kits-primary)] rounded-2xl overflow-hidden flex flex-col transition-all"
            >
              <div className="h-44 overflow-hidden bg-[var(--kits-surface)]">
                <SafeImage
                  src={dept.imageUrl}
                  alt={dept.imageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[var(--kits-heading)] mb-2">{dept.name}</h2>
                  <p className="text-xs sm:text-sm text-[var(--kits-body)] leading-relaxed">
                    {dept.shortDescription}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--kits-primary)]">
                  Explore Department <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export const DepartmentDetailPage: React.FC = () => {
  const { slug } = useParams();
  const { state } = useCms();
  const dept = state.departments.find((d) => d.slug === slug);

  if (!dept) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[var(--kits-heading)]">Department Not Found</h1>
        <Link to="/departments" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--kits-primary)]">
          <ArrowLeft className="w-4 h-4" /> Back to All Departments
        </Link>
      </div>
    );
  }

  const deptFaculty = state.faculty.filter((f) => f.active && f.departmentId === dept.id);

  return (
    <div>
      <section className="bg-[var(--kits-surface)] border-b border-[var(--kits-border)] py-10">
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
          <Link to="/departments" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--kits-primary)] mb-3 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> All Departments
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)]">
            Department of {dept.name}
          </h1>
          <p className="text-sm text-[var(--kits-body)] mt-2 max-w-2xl">{dept.shortDescription}</p>
        </div>
      </section>

      <div className="mx-auto px-4 sm:px-6 py-12 space-y-10" style={{ maxWidth: 'var(--kits-container-max)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-2xl font-bold text-[var(--kits-heading)]">Overview</h2>
            <p className="text-sm sm:text-base text-[var(--kits-body)] leading-relaxed">
              {dept.introduction}
            </p>
          </div>
          <div className="lg:col-span-6 h-64 sm:h-72 rounded-2xl overflow-hidden border border-[var(--kits-border)]">
            <SafeImage src={dept.imageUrl} alt={dept.imageAlt} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 font-bold text-[var(--kits-heading)]">
              <FlaskConical className="w-4 h-4 text-[var(--kits-primary)]" />
              <h3>Laboratories</h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[var(--kits-body)]">
              {dept.laboratories.map((lab) => (
                <li key={lab} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{lab}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-[var(--kits-heading)]">Department Facilities</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[var(--kits-body)]">
              {dept.facilities.map((fac) => (
                <li key={fac} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--kits-primary)] shrink-0 mt-0.5" />
                  <span>{fac}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-[var(--kits-heading)]">Research & Publications</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[var(--kits-body)]">
              {dept.researchAreas.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--kits-accent)] shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-[var(--kits-border)] text-xs text-slate-500">
              {dept.publications[0]}
            </div>
          </div>
        </div>

        {/* Department Faculty */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--kits-heading)] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--kits-primary)]" />
              Department Faculty
            </h2>
            <Link to="/faculty" className="text-xs font-semibold text-[var(--kits-primary)] hover:underline">
              Full Faculty Directory →
            </Link>
          </div>
          {deptFaculty.length === 0 ? (
            <div className="bg-[var(--kits-surface)] border border-[var(--kits-border)] rounded-xl p-5 text-xs text-[var(--kits-body)]">
              Faculty profiles for this department can be assigned in the Admin Faculty Manager.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {deptFaculty.map((f) => (
                <div key={f.id} className="bg-white border border-[var(--kits-border)] rounded-2xl p-5 flex items-center gap-4">
                  <SafeImage src={f.photoUrl} alt={f.photoAlt} className="w-16 h-16 rounded-full object-cover shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[var(--kits-heading)] truncate">{f.name}</h3>
                    <p className="text-xs text-[var(--kits-primary)]">{f.designation}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{f.qualification}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
