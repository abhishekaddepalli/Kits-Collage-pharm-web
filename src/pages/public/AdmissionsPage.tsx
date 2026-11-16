import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, CheckCircle2, FileText, Phone, ShieldCheck } from 'lucide-react';
import { useCms } from '../../app/providers/CmsContext';
import { EnquiryFormCard } from '../../components/common/EnquiryFormCard';

export const AdmissionsPage: React.FC = () => {
  const { state } = useCms();
  const { pathname } = useLocation();
  const adm = state.settings.admissionsConfig;

  const tabs = [
    { label: 'Admissions Overview', path: '/admissions' },
    { label: 'Eligibility Criteria', path: '/admissions/eligibility' },
    { label: 'Admission Process', path: '/admissions/process' },
  ];

  return (
    <div>
      <section className="bg-[var(--kits-surface)] border-b border-[var(--kits-border)] py-10">
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-2">
            Admissions {adm.academicYear}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)] mb-4">
            {adm.headline}
          </h1>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors ${
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
        {/* Important Dates + Eligibility + Process */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-[var(--kits-primary)] font-bold text-base">
                <Calendar className="w-5 h-5" />
                <h2>Important Dates & Schedules</h2>
              </div>
              <dl className="divide-y divide-[var(--kits-border)] text-xs sm:text-sm">
                {adm.importantDates.map((d) => (
                  <div key={d.label} className="py-2.5 flex justify-between gap-4">
                    <dt className="text-slate-600">{d.label}</dt>
                    <dd className="font-semibold text-[var(--kits-heading)] text-right">{d.date}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-[var(--kits-primary)] font-bold text-base">
                <ShieldCheck className="w-5 h-5" />
                <h2>Eligibility & Regulatory Norms</h2>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-[var(--kits-body)]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>B.Pharmacy:</strong> 10+2 (Intermediate) with Physics, Chemistry, and
                    Biology/Mathematics (BiPC/MPC) per AP EAPCET & PCI norms.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Scholarships & Fees:</strong> {adm.scholarshipNote}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-[var(--kits-primary)] shrink-0 mt-0.5" />
                  <span>{adm.feeNote}</span>
                </li>
              </ul>
            </div>

            <div className="bg-[var(--kits-surface)] border border-[var(--kits-border)] rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 font-bold text-[var(--kits-heading)]">
                <Phone className="w-4 h-4 text-[var(--kits-primary)]" />
                <h3>Admissions Helpdesk</h3>
              </div>
              <p className="text-xs text-[var(--kits-body)]">
                Call {state.settings.contact.primaryPhone} or {state.settings.contact.landlinePhone} ({state.settings.contact.workingHours})
              </p>
              <Link
                to="/downloads"
                className="inline-block text-xs font-semibold text-[var(--kits-primary)] hover:underline"
              >
                Download Prospectus & Information Sheet →
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--kits-heading)] mb-2">
                Online Admission Enquiry
              </h2>
              <p className="text-xs sm:text-sm text-[var(--kits-body)]">
                Complete the form below to receive program counseling, eligibility guidance, and campus visit details.
              </p>
            </div>
            <EnquiryFormCard />
          </div>
        </section>

        {/* Application Process Steps */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[var(--kits-heading)]">Application Process</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {adm.processSteps.map((step) => (
              <div
                key={step.step}
                className="bg-white border border-[var(--kits-border)] rounded-2xl p-5 space-y-2"
              >
                <span className="text-xs font-mono font-bold text-[var(--kits-accent)]">
                  Step {step.step}
                </span>
                <h3 className="text-base font-bold text-[var(--kits-heading)] font-sans">{step.title}</h3>
                <p className="text-xs text-[var(--kits-body)] leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
