import React, { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { useCms } from '../../app/providers/CmsContext';
import { enquirySchema } from '../../utils/validation';

interface EnquiryFormCardProps {
  compact?: boolean;
  defaultProgram?: string;
}

export const EnquiryFormCard: React.FC<EnquiryFormCardProps> = ({
  compact = false,
  defaultProgram = 'Bachelor of Pharmacy (B.Pharmacy)',
}) => {
  const { state, submitEnquiry } = useCms();
  const activePrograms = state.programs.filter((p) => p.active);

  const [form, setForm] = useState({
    studentName: '',
    parentName: '',
    mobile: '',
    email: '',
    interestedProgram: defaultProgram,
    qualification: '',
    city: '',
    state: 'Andhra Pradesh',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const parsed = enquirySchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || 'form');
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const res = await submitEnquiry(parsed.data);
    setSubmitting(false);

    if (!res.ok || !res.referenceCode) {
      setSubmitError(res.error || 'Could not submit your enquiry. Please try again.');
      return;
    }

    setSubmittedId(res.referenceCode);
    setForm({
      studentName: '',
      parentName: '',
      mobile: '',
      email: '',
      interestedProgram: defaultProgram,
      qualification: '',
      city: '',
      state: 'Andhra Pradesh',
      message: '',
    });
  };

  if (submittedId) {
    return (
      <div className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-[var(--kits-heading)] mb-2">
          Admission Enquiry Submitted
        </h3>
        <p className="text-sm text-[var(--kits-body)] max-w-md mx-auto mb-5">
          Thank you for contacting KITS College of Pharmacy for Women. Reference ID:{' '}
          <span className="font-mono font-semibold">{submittedId}</span>. Our admissions desk will
          reach out during working hours ({state.settings.contact.workingHours}).
        </p>
        <button
          type="button"
          onClick={() => setSubmittedId(null)}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--kits-primary)] hover:bg-[var(--kits-secondary)] rounded-full transition-colors cursor-pointer"
        >
          Submit Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white border border-[var(--kits-border)] rounded-2xl p-6 sm:p-8 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="enq-student" className="block text-xs font-semibold text-[var(--kits-heading)] mb-1.5">
            Student Name *
          </label>
          <input
            id="enq-student"
            type="text"
            value={form.studentName}
            onChange={(e) => setForm({ ...form, studentName: e.target.value })}
            placeholder="Full name of student"
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--kits-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--kits-primary)]"
          />
          {errors.studentName && <p className="text-xs text-red-600 mt-1">{errors.studentName}</p>}
        </div>

        <div>
          <label htmlFor="enq-parent" className="block text-xs font-semibold text-[var(--kits-heading)] mb-1.5">
            Parent / Guardian Name *
          </label>
          <input
            id="enq-parent"
            type="text"
            value={form.parentName}
            onChange={(e) => setForm({ ...form, parentName: e.target.value })}
            placeholder="Parent or guardian name"
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--kits-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--kits-primary)]"
          />
          {errors.parentName && <p className="text-xs text-red-600 mt-1">{errors.parentName}</p>}
        </div>

        <div>
          <label htmlFor="enq-mobile" className="block text-xs font-semibold text-[var(--kits-heading)] mb-1.5">
            Mobile Number *
          </label>
          <input
            id="enq-mobile"
            type="tel"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            placeholder="+91 98765 43210"
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--kits-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--kits-primary)]"
          />
          {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
        </div>

        <div>
          <label htmlFor="enq-email" className="block text-xs font-semibold text-[var(--kits-heading)] mb-1.5">
            Email Address *
          </label>
          <input
            id="enq-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="student@example.com"
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--kits-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--kits-primary)]"
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="enq-program" className="block text-xs font-semibold text-[var(--kits-heading)] mb-1.5">
            Interested Program *
          </label>
          <select
            id="enq-program"
            value={form.interestedProgram}
            onChange={(e) => setForm({ ...form, interestedProgram: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--kits-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--kits-primary)]"
          >
            {activePrograms.map((prog) => (
              <option key={prog.id} value={prog.name}>
                {prog.name}
              </option>
            ))}
          </select>
          {errors.interestedProgram && (
            <p className="text-xs text-red-600 mt-1">{errors.interestedProgram}</p>
          )}
        </div>

        <div>
          <label htmlFor="enq-qual" className="block text-xs font-semibold text-[var(--kits-heading)] mb-1.5">
            Qualification *
          </label>
          <input
            id="enq-qual"
            type="text"
            value={form.qualification}
            onChange={(e) => setForm({ ...form, qualification: e.target.value })}
            placeholder="e.g. Intermediate BiPC / MPC"
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--kits-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--kits-primary)]"
          />
          {errors.qualification && <p className="text-xs text-red-600 mt-1">{errors.qualification}</p>}
        </div>

        <div>
          <label htmlFor="enq-city" className="block text-xs font-semibold text-[var(--kits-heading)] mb-1.5">
            City / Town *
          </label>
          <input
            id="enq-city"
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="e.g. Kakinada"
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--kits-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--kits-primary)]"
          />
          {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="enq-state" className="block text-xs font-semibold text-[var(--kits-heading)] mb-1.5">
            State *
          </label>
          <input
            id="enq-state"
            type="text"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            placeholder="Andhra Pradesh"
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--kits-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--kits-primary)]"
          />
          {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
        </div>
      </div>

      {!compact && (
        <div>
          <label htmlFor="enq-msg" className="block text-xs font-semibold text-[var(--kits-heading)] mb-1.5">
            Message or Specific Question (Optional)
          </label>
          <textarea
            id="enq-msg"
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Share questions about hostel facilities, AP EAPCET counseling, or campus tour timing..."
            className="w-full px-3.5 py-2.5 text-sm border border-[var(--kits-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--kits-primary)]"
          />
        </div>
      )}

      {submitError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <p className="text-xs text-[var(--kits-body)] opacity-80">
          Our Admissions Cell responds within one working day ({state.settings.contact.workingHours}).
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[var(--kits-primary)] hover:bg-[var(--kits-secondary)] disabled:opacity-60 rounded-full transition-colors cursor-pointer whitespace-nowrap"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting...' : 'Submit Enquiry'}
        </button>
      </div>
    </form>
  );
};
