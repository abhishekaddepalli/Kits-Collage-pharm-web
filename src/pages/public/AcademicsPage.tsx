import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Download, FileText, GraduationCap, ShieldAlert } from 'lucide-react';
import { useCms } from '../../app/providers/CmsContext';

export const AcademicsPage: React.FC = () => {
  const { state } = useCms();
  const { pathname } = useLocation();

  const tabs = [
    { label: 'Overview', path: '/academics' },
    { label: 'Programs', path: '/academics/programs' },
    { label: 'Academic Calendar', path: '/academics/calendar' },
    { label: 'Syllabus', path: '/academics/syllabus' },
    { label: 'Examination Cell', path: '/academics/examination-cell' },
    { label: 'Faculty Directory', path: '/faculty' },
  ];

  const activePrograms = state.programs.filter((p) => p.active);

  return (
    <div>
      <section className="bg-[var(--kits-surface)] border-b border-[var(--kits-border)] py-10">
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-2">
            Academics & Curriculum
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)] mb-4">
            Academic Excellence & University Standards
          </h1>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors whitespace-nowrap ${
                  pathname === tab.path
                    ? 'bg-[var(--kits-primary)] text-white'
                    : 'bg-white border border-[var(--kits-border)] text-[var(--kits-heading)]'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto px-4 sm:px-6 py-12 space-y-12" style={{ maxWidth: 'var(--kits-container-max)' }}>
        {/* Programs List */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[var(--kits-heading)]">Programs Offered</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePrograms.map((prog) => (
              <div
                key={prog.id}
                className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[var(--kits-surface)] text-[var(--kits-primary)] flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--kits-heading)]">{prog.name}</h3>
                      <p className="text-xs text-slate-500">
                        {prog.qualification} · {prog.duration}
                      </p>
                    </div>
                  </div>
                </div>
                {prog.verificationStatus === 'pending_verification' && (
                  <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>
                      Program availability & intake are marked for Admin verification before publishing final admissions figures.
                    </span>
                  </div>
                )}
                <p className="text-sm text-[var(--kits-body)] leading-relaxed">{prog.description}</p>
                <div className="text-xs space-y-1.5 border-t border-[var(--kits-border)] pt-3">
                  <p><strong>Eligibility:</strong> {prog.eligibility}</p>
                  <p><strong>Intake Capacity:</strong> {prog.intakeCapacity}</p>
                  <p><strong>Admission Mode:</strong> {prog.admissionInfo}</p>
                </div>
                <div className="flex gap-3 pt-1">
                  <Link
                    to="/admissions"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[var(--kits-primary)] rounded-full"
                  >
                    Admission Enquiry
                  </Link>
                  <Link
                    to="/downloads"
                    className="px-4 py-2 text-xs font-semibold text-[var(--kits-primary)] border border-[var(--kits-primary)] rounded-full"
                  >
                    Syllabus & Downloads
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Calendar, Syllabus, Exam Cell Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 space-y-3">
            <Calendar className="w-6 h-6 text-[var(--kits-primary)]" />
            <h3 className="text-lg font-bold text-[var(--kits-heading)]">Academic Calendar</h3>
            <p className="text-xs sm:text-sm text-[var(--kits-body)]">
              Semester commencement dates, mid-term sessional exams, practical assessments, and
              JNTUK university examination schedules are published in line with the university
              academic calendar.
            </p>
            <Link to="/downloads" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--kits-primary)] hover:underline">
              <Download className="w-3.5 h-3.5" /> Access Calendar Documents
            </Link>
          </div>

          <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 space-y-3">
            <FileText className="w-6 h-6 text-[var(--kits-primary)]" />
            <h3 className="text-lg font-bold text-[var(--kits-heading)]">Syllabus & PCI Regulations</h3>
            <p className="text-xs sm:text-sm text-[var(--kits-body)]">
              Curriculum follows Pharmacy Council of India (PCI) B.Pharmacy syllabus regulations
              and JNTU Kakinada semester-wise credit frameworks covering theory and laboratory courses.
            </p>
            <Link to="/departments" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--kits-primary)] hover:underline">
              Explore Subject Departments →
            </Link>
          </div>

          <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 space-y-3">
            <GraduationCap className="w-6 h-6 text-[var(--kits-primary)]" />
            <h3 className="text-lg font-bold text-[var(--kits-heading)]">Examination Cell</h3>
            <p className="text-xs sm:text-sm text-[var(--kits-body)]">
              Coordinates internal sessional examinations, university practical schedules, hall ticket
              distribution, and official JNTUK results notifications.
            </p>
            <Link to="/news" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--kits-primary)] hover:underline">
              View Exam Announcements →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
