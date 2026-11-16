import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, Download, FileText, Mail, MapPin, Phone } from 'lucide-react';
import { useCms } from '../../app/providers/CmsContext';
import { EnquiryFormCard } from '../../components/common/EnquiryFormCard';
import { SafeImage } from '../../components/common/SafeImage';
import { cmsService } from '../../services/cms/cmsService';

export const ContactPage: React.FC = () => {
  const { state } = useCms();
  const c = state.settings.contact;

  return (
    <div>
      <section className="bg-[var(--kits-surface)] border-b border-[var(--kits-border)] py-10">
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-2">
            Reach Our Campus
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)]">
            Contact Us & Directions
          </h1>
        </div>
      </section>

      <div className="mx-auto px-4 sm:px-6 py-12 space-y-10" style={{ maxWidth: 'var(--kits-container-max)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-[var(--kits-heading)]">
                KITS College of Pharmacy for Women
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[var(--kits-primary)] shrink-0 mt-1" />
                  <p className="text-xs sm:text-sm text-[var(--kits-body)]">{c.address}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[var(--kits-primary)] shrink-0 mt-1" />
                  <div className="text-xs sm:text-sm tabular-nums space-y-0.5">
                    <div>
                      Mobile:{' '}
                      <a href={`tel:${c.primaryPhone.replace(/\s+/g, '')}`} className="font-semibold text-[var(--kits-primary)] hover:underline">
                        {c.primaryPhone}
                      </a>
                    </div>
                    <div>Landline: {c.landlinePhone}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[var(--kits-primary)] shrink-0 mt-1" />
                  <a href={`mailto:${c.email}`} className="text-xs sm:text-sm text-[var(--kits-primary)] hover:underline">
                    {c.email}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[var(--kits-primary)] shrink-0 mt-1" />
                  <p className="text-xs sm:text-sm text-[var(--kits-body)]">Working Hours: {c.workingHours}</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href={`tel:${c.primaryPhone.replace(/\s+/g, '')}`}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[var(--kits-primary)] rounded-full"
                >
                  Call Admissions
                </a>
                <a
                  href={`https://wa.me/${c.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-full"
                >
                  WhatsApp Chat
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(c.mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold text-[var(--kits-primary)] border border-[var(--kits-primary)] rounded-full"
                >
                  Open Directions
                </a>
              </div>
            </div>

            <div className="bg-white border border-[var(--kits-border)] rounded-2xl overflow-hidden h-64">
              <iframe
                title="KITS College of Pharmacy Location Map"
                src={c.mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <h2 className="text-2xl font-bold text-[var(--kits-heading)] mb-4">
              Send an Admission or General Enquiry
            </h2>
            <EnquiryFormCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DownloadsPage: React.FC = () => {
  const { state } = useCms();
  const docs = state.downloads.filter((d) => d.active);

  return (
    <div className="mx-auto px-4 sm:px-6 py-12 space-y-6" style={{ maxWidth: 'var(--kits-container-max)' }}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--kits-accent)] mb-1">
          Academic Resources
        </p>
        <h1 className="text-3xl font-bold text-[var(--kits-heading)]">Downloads & Circulars</h1>
      </div>

      <div className="bg-white border border-[var(--kits-border)] rounded-2xl divide-y divide-[var(--kits-border)]">
        {docs.map((doc) => (
          <div key={doc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-[var(--kits-primary)] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[var(--kits-heading)] font-sans">{doc.title}</h2>
                <p className="text-xs text-slate-500">
                  {doc.category} · {doc.fileSize} · Updated {doc.updatedAt}
                </p>
              </div>
            </div>
            <Link
              to={doc.fileUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--kits-primary)] rounded-full self-start sm:self-center whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" /> View Document
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FeedbackPage: React.FC = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Student');
  const [comments, setComments] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--kits-heading)]">Stakeholder Feedback</h1>
        <p className="text-sm text-[var(--kits-body)] mt-1">
          Students, parents, faculty, and alumni can share constructive feedback with institutional leadership.
        </p>
      </div>
      {sent ? (
        <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-8 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-[var(--kits-heading)]">Feedback Recorded</h2>
          <p className="text-sm text-[var(--kits-body)]">Thank you for helping us improve KITS College of Pharmacy for Women.</p>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setName('');
              setComments('');
            }}
            className="px-5 py-2 text-xs font-semibold text-white bg-[var(--kits-primary)] rounded-full cursor-pointer"
          >
            Submit Another
          </button>
        </div>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim() || !comments.trim()) return;
            setError(null);
            setSubmitting(true);
            const res = await cmsService.submitFeedback({
              name: name.trim(),
              role,
              rating: 5,
              comments: comments.trim(),
            });
            setSubmitting(false);
            if (!res.ok) {
              setError(res.message || 'Unable to submit feedback.');
              return;
            }
            setSent(true);
          }}
          className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 space-y-4"
        >
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
          )}
          <div>
            <label className="block text-xs font-semibold mb-1">Full Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-[var(--kits-border)] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Stakeholder Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-[var(--kits-border)] rounded-lg bg-white"
            >
              <option>Student</option>
              <option>Parent / Guardian</option>
              <option>Alumni</option>
              <option>Faculty / Staff</option>
              <option>Employer / Visitor</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Feedback Comments *</label>
            <textarea
              required
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-[var(--kits-border)] rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--kits-primary)] rounded-full cursor-pointer"
          >
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-4">
    <h1 className="text-3xl font-bold text-[var(--kits-heading)]">Privacy Policy</h1>
    <p className="text-sm text-[var(--kits-body)] leading-relaxed">
      KITS College of Pharmacy for Women respects the privacy of prospective students, parents,
      current learners, and visitors. Information submitted via admission enquiry forms is used
      solely for academic counseling and institutional communication.
    </p>
    <p className="text-sm text-[var(--kits-body)] leading-relaxed">
      Personal details entered into enquiry and feedback forms are transmitted securely over HTTPS and
      stored strictly in our institutional database for academic guidance and regulatory compliance.
    </p>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-4">
    <h1 className="text-3xl font-bold text-[var(--kits-heading)]">Terms & Conditions</h1>
    <p className="text-sm text-[var(--kits-body)] leading-relaxed">
      Academic program details, fee regulations, and admission schedules follow Pharmacy Council of
      India (PCI), JNTU Kakinada, and Andhra Pradesh State Council of Higher Education (APSCHE)
      notifications. Prospective applicants should verify current-year circulars with the college office.
    </p>
  </div>
);

export const SitemapPage: React.FC = () => {
  const { state } = useCms();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-[var(--kits-heading)]">Website Sitemap</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {state.navigation.filter((n) => n.enabled).map((item) => (
          <div key={item.id} className="bg-white border border-[var(--kits-border)] rounded-2xl p-5 space-y-2">
            <Link to={item.path} className="text-sm font-bold text-[var(--kits-primary)] hover:underline">
              {item.label}
            </Link>
            {item.children && (
              <ul className="space-y-1 pl-3 border-l border-[var(--kits-border)]">
                {item.children.filter((c) => c.enabled).map((child) => (
                  <li key={child.id}>
                    <Link to={child.path} className="text-xs text-[var(--kits-body)] hover:text-[var(--kits-primary)]">
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const DynamicCmsPage: React.FC = () => {
  const { slug } = useParams();
  const { state } = useCms();
  const page = state.pages.find(
    (p) => p.slug === `/p/${slug}` || p.slug === `/${slug}` || p.slug === slug
  );

  if (!page || !page.enabled || page.status !== 'published') {
    return <NotFoundPage />;
  }

  return (
    <div className="mx-auto px-4 sm:px-6 py-12 space-y-8" style={{ maxWidth: 'var(--kits-container-max)' }}>
      <h1 className="text-3xl sm:text-4xl font-bold text-[var(--kits-heading)]">{page.title}</h1>
      {page.sections
        .filter((s) => !s.hidden)
        .sort((a, b) => a.order - b.order)
        .map((sec) => (
          <section key={sec.id} className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-2xl font-bold text-[var(--kits-heading)]">{sec.title}</h2>
            {sec.subtitle && <p className="text-sm text-[var(--kits-accent)] font-medium">{sec.subtitle}</p>}
            {sec.imageUrl && (
              <SafeImage src={sec.imageUrl} alt={sec.imageAlt || sec.title} className="w-full max-h-80 object-cover rounded-xl" />
            )}
            {sec.body && <p className="text-sm text-[var(--kits-body)] leading-relaxed">{sec.body}</p>}
          </section>
        ))}
    </div>
  );
};

export const NotFoundPage: React.FC = () => (
  <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
    <p className="text-xs font-mono font-bold text-[var(--kits-accent)]">404 · PAGE NOT FOUND</p>
    <h1 className="text-3xl font-bold text-[var(--kits-heading)]">The requested page could not be found</h1>
    <p className="text-sm text-[var(--kits-body)]">
      Please return to the KITS homepage or explore our academic programs and departments.
    </p>
    <div className="pt-2 flex justify-center gap-3">
      <Link to="/" className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--kits-primary)] rounded-full">
        Return Home
      </Link>
      <Link to="/contact" className="px-5 py-2.5 text-sm font-semibold text-[var(--kits-primary)] border border-[var(--kits-primary)] rounded-full">
        Contact Us
      </Link>
    </div>
  </div>
);
