import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Award, Building2, CheckCircle2, Compass, ShieldCheck, Users } from 'lucide-react';
import { useCms } from '../../app/providers/CmsContext';
import { SafeImage } from '../../components/common/SafeImage';

export const AboutPage: React.FC = () => {
  const { state } = useCms();
  const { pathname } = useLocation();

  const tabs = [
    { label: 'Overview', path: '/about' },
    { label: 'History', path: '/about/history' },
    { label: 'Vision & Mission', path: '/about/vision-mission' },
    { label: "Principal's Message", path: '/about/principal-message' },
    { label: 'Governance', path: '/about/governance' },
  ];

  return (
    <div>
      {/* Header Banner */}
      <section className="bg-[var(--kits-surface)] border-b border-[var(--kits-border)] py-10">
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-2">
            About Institution
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)] mb-4">
            KITS College of Pharmacy for Women
          </h1>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[var(--kits-primary)] text-white'
                      : 'bg-white border border-[var(--kits-border)] text-[var(--kits-heading)] hover:bg-white/80'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto px-4 sm:px-6 py-12 space-y-12" style={{ maxWidth: 'var(--kits-container-max)' }}>
        {/* Overview & Campus */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--kits-heading)]">
              Dedicated to Women&apos;s Pharmaceutical Education
            </h2>
            <p className="text-sm sm:text-base text-[var(--kits-body)] leading-relaxed">
              Established in 2019 in Tirupati (V), Divili, Peddapuram Mandal, Kakinada District,
              KITS College of Pharmacy for Women provides a focused, safe, and academically rigorous
              environment empowering women to excel as pharmacists, researchers, and healthcare leaders.
            </p>
            <p className="text-sm text-[var(--kits-body)] leading-relaxed">
              The college is approved by the Pharmacy Council of India (PCI) and affiliated to
              Jawaharlal Nehru Technological University Kakinada (JNTUK), ensuring curriculum fidelity,
              laboratory standards, and university recognition.
            </p>
          </div>
          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-[var(--kits-border)] h-72 sm:h-80">
            <SafeImage
              src={state.media.find((m) => m.id === 'med-2')?.url}
              alt="KITS College of Pharmacy for Women campus building"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Vision & Mission */}
        <section id="vision-mission" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--kits-surface)] text-[var(--kits-primary)] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--kits-heading)]">Our Vision</h2>
            <p className="text-sm text-[var(--kits-body)] leading-relaxed">
              To emerge as a premier women&apos;s institution in pharmaceutical sciences, cultivating
              competent, ethical, and compassionate healthcare professionals who serve society and
              advance pharmaceutical knowledge.
            </p>
          </div>

          <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--kits-surface)] text-[var(--kits-accent)] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--kits-heading)]">Our Mission</h2>
            <ul className="space-y-2 text-sm text-[var(--kits-body)]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Deliver high-standard undergraduate pharmacy education aligned with PCI & JNTUK norms.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Strengthen practical laboratory skills, critical thinking, and research curiosity.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Promote ethical healthcare practices, community outreach, and women&apos;s leadership.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Principal's Message & Governance */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[var(--kits-surface)] border border-[var(--kits-border)] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-[var(--kits-heading)]">Principal&apos;s Message</h2>
              <span className="text-xs text-amber-700 font-medium">Editable in Admin CMS</span>
            </div>
            <p className="text-sm text-[var(--kits-body)] leading-relaxed italic">
              &ldquo;At KITS College of Pharmacy for Women, we believe pharmaceutical education is
              both a rigorous scientific discipline and a noble calling to serve human health. Our
              faculty strive to guide every student toward technical competence, integrity, and
              lifelong learning.&rdquo;
            </p>
            <div className="text-xs text-slate-600 pt-2">
              Office of the Principal · KITS College of Pharmacy for Women, Divili
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-[var(--kits-border)] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-[var(--kits-heading)]">Quick Institutional Facts</h2>
            <dl className="divide-y divide-[var(--kits-border)] text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Established</dt>
                <dd className="font-semibold text-[var(--kits-heading)] tabular-nums">2019</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Approval</dt>
                <dd className="font-semibold text-[var(--kits-heading)]">PCI New Delhi</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Affiliation</dt>
                <dd className="font-semibold text-[var(--kits-heading)]">JNTU Kakinada</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Campus Type</dt>
                <dd className="font-semibold text-[var(--kits-heading)]">Women Only</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
};
