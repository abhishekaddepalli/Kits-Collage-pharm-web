import React, { useState } from 'react';
import { Download, Plus, Search, Trash2, X } from 'lucide-react';
import { useCms } from '../app/providers/CmsContext';
import type {
  AcademicProgram,
  AdmissionEnquiry,
  Department,
  EnquiryStatus,
  FacultyMember,
} from '../types/cms';
import { filterEnquiries } from '../utils/cmsStoreLogic';
import { slugifyText } from '../utils/validation';

export const ProgramsManager: React.FC = () => {
  const { state, updateState } = useCms();

  const addProgram = () => {
    const item: AcademicProgram = {
      id: `prog-${Date.now()}`,
      name: 'New Pharmacy Program',
      code: 'PHARM',
      level: 'UG',
      qualification: 'Degree / Diploma',
      duration: '4 Years',
      eligibility: 'Verify regulatory eligibility norms',
      description: 'Program description editable in Admin.',
      intakeCapacity: 'Verify Official Intake',
      admissionInfo: 'Follows APSCHE & PCI norms',
      brochureUrl: '/downloads',
      verificationStatus: 'pending_verification',
      active: true,
    };
    updateState((prev) => ({ ...prev, programs: [...prev.programs, item] }), {
      action: 'Added academic program',
      module: 'Programs',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171238]">Academic Programs Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify approvals and intake details before publishing.
          </p>
        </div>
        <button
          type="button"
          onClick={addProgram}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Program
        </button>
      </div>

      <div className="space-y-4">
        {state.programs.map((prog) => (
          <div key={prog.id} className="bg-white border border-[#E8DFF5] rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <input
                type="text"
                value={prog.name}
                onChange={(e) =>
                  updateState(
                    (prev) => ({
                      ...prev,
                      programs: prev.programs.map((p) => (p.id === prog.id ? { ...p, name: e.target.value } : p)),
                    }),
                    { action: `Renamed program to "${e.target.value}"`, module: 'Programs' }
                  )
                }
                className="font-bold text-base text-[#171238] border-b border-[#E8DFF5] flex-1 mr-3 focus:outline-none"
              />
              <select
                value={prog.verificationStatus}
                onChange={(e) =>
                  updateState(
                    (prev) => ({
                      ...prev,
                      programs: prev.programs.map((p) =>
                        p.id === prog.id
                          ? { ...p, verificationStatus: e.target.value as AcademicProgram['verificationStatus'] }
                          : p
                      ),
                    }),
                    { action: 'Updated program verification flag', module: 'Programs' }
                  )
                }
                className="px-2.5 py-1 text-xs border border-[#E8DFF5] rounded bg-white"
              >
                <option value="verified">Verified</option>
                <option value="pending_verification">Pending Verification</option>
              </select>
              <label className="text-xs flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prog.active}
                  onChange={(e) =>
                    updateState(
                      (prev) => ({
                        ...prev,
                        programs: prev.programs.map((p) => (p.id === prog.id ? { ...p, active: e.target.checked } : p)),
                      }),
                      { action: 'Toggled program visibility', module: 'Programs' }
                    )
                  }
                />
                Visible
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                value={prog.duration}
                onChange={(e) =>
                  updateState((prev) => ({
                    ...prev,
                    programs: prev.programs.map((p) => (p.id === prog.id ? { ...p, duration: e.target.value } : p)),
                  }))
                }
                placeholder="Duration"
                className="px-3 py-2 border border-[#E8DFF5] rounded-lg"
              />
              <input
                type="text"
                value={prog.intakeCapacity}
                onChange={(e) =>
                  updateState((prev) => ({
                    ...prev,
                    programs: prev.programs.map((p) => (p.id === prog.id ? { ...p, intakeCapacity: e.target.value } : p)),
                  }))
                }
                placeholder="Intake Capacity"
                className="px-3 py-2 border border-[#E8DFF5] rounded-lg"
              />
              <textarea
                rows={2}
                value={prog.eligibility}
                onChange={(e) =>
                  updateState((prev) => ({
                    ...prev,
                    programs: prev.programs.map((p) => (p.id === prog.id ? { ...p, eligibility: e.target.value } : p)),
                  }))
                }
                className="md:col-span-2 px-3 py-2 border border-[#E8DFF5] rounded-lg"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DepartmentsManager: React.FC = () => {
  const { state, updateState } = useCms();

  const addDepartment = () => {
    const name = 'New Department';
    const dept: Department = {
      id: `dept-${Date.now()}`,
      slug: slugifyText(`${name}-${Date.now().toString().slice(-3)}`),
      name,
      shortDescription: 'Department summary',
      introduction: 'Detailed department overview.',
      iconName: 'FlaskConical',
      imageUrl: state.media[0]?.url || '',
      imageAlt: 'Department lab',
      facilities: ['Laboratory Station'],
      laboratories: ['Main Teaching Lab'],
      researchAreas: ['Applied Pharmaceutical Studies'],
      publications: ['Managed in Admin'],
      active: true,
      verificationStatus: 'pending_verification',
    };
    updateState((prev) => ({ ...prev, departments: [...prev.departments, dept] }), {
      action: 'Added new department',
      module: 'Departments',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#171238]">Departments Manager</h1>
        <button
          type="button"
          onClick={addDepartment}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.departments.map((d) => (
          <div key={d.id} className="bg-white border border-[#E8DFF5] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={d.name}
                onChange={(e) =>
                  updateState(
                    (prev) => ({
                      ...prev,
                      departments: prev.departments.map((x) => (x.id === d.id ? { ...x, name: e.target.value } : x)),
                    }),
                    { action: `Updated department "${e.target.value}"`, module: 'Departments' }
                  )
                }
                className="font-bold text-sm border-b border-[#E8DFF5] flex-1 focus:outline-none"
              />
              <label className="text-xs flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={d.active}
                  onChange={(e) =>
                    updateState(
                      (prev) => ({
                        ...prev,
                        departments: prev.departments.map((x) =>
                          x.id === d.id ? { ...x, active: e.target.checked } : x
                        ),
                      }),
                      { action: `Toggled department "${d.name}"`, module: 'Departments' }
                    )
                  }
                />
                Active
              </label>
            </div>
            <textarea
              rows={2}
              value={d.shortDescription}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  departments: prev.departments.map((x) =>
                    x.id === d.id ? { ...x, shortDescription: e.target.value } : x
                  ),
                }))
              }
              className="w-full px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
            />
            <div className="text-[11px] text-slate-500 font-mono">Route: /departments/{d.slug}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FacultyManager: React.FC = () => {
  const { state, updateState } = useCms();

  const addFaculty = () => {
    const firstDept = state.departments[0];
    const member: FacultyMember = {
      id: `fac-${Date.now()}`,
      name: 'New Faculty Profile (Update Name)',
      photoUrl: state.media[5]?.url || state.media[0]?.url || '',
      photoAlt: 'Faculty profile portrait',
      designation: 'Assistant Professor',
      departmentId: firstDept?.id || 'dept-pharmaceutics',
      departmentName: firstDept?.name || 'Pharmaceutics',
      qualification: 'M.Pharm (Verify Credentials)',
      experience: 'Update Years',
      biography: 'Enter verified biography and teaching focus.',
      email: 'kitspharmacollege@gmail.com',
      researchInterests: ['Pharmaceutical Sciences'],
      publicationsCount: 0,
      order: state.faculty.length + 1,
      active: true,
      verificationStatus: 'pending_verification',
    };
    updateState((prev) => ({ ...prev, faculty: [member, ...prev.faculty] }), {
      action: 'Added new faculty profile slot',
      module: 'Faculty',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171238]">Faculty & Staff Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Replace placeholder records only with verified institutional faculty names & qualifications.
          </p>
        </div>
        <button
          type="button"
          onClick={addFaculty}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Faculty
        </button>
      </div>

      <div className="space-y-3">
        {state.faculty.map((f) => (
          <div key={f.id} className="bg-white border border-[#E8DFF5] rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <input
              type="text"
              value={f.name}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  faculty: prev.faculty.map((x) => (x.id === f.id ? { ...x, name: e.target.value } : x)),
                }))
              }
              className="px-3 py-2 text-xs font-semibold border border-[#E8DFF5] rounded-lg"
            />
            <input
              type="text"
              value={f.designation}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  faculty: prev.faculty.map((x) => (x.id === f.id ? { ...x, designation: e.target.value } : x)),
                }))
              }
              className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
            />
            <select
              value={f.departmentName}
              onChange={(e) => {
                const dept = state.departments.find((d) => d.name === e.target.value);
                updateState((prev) => ({
                  ...prev,
                  faculty: prev.faculty.map((x) =>
                    x.id === f.id
                      ? { ...x, departmentName: e.target.value, departmentId: dept?.id || x.departmentId }
                      : x
                  ),
                }));
              }}
              className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg bg-white"
            >
              {state.departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
            <div className="flex items-center justify-end gap-2">
              <label className="text-xs flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={f.active}
                  onChange={(e) =>
                    updateState((prev) => ({
                      ...prev,
                      faculty: prev.faculty.map((x) => (x.id === f.id ? { ...x, active: e.target.checked } : x)),
                    }))
                  }
                />
                Active
              </label>
              <button
                type="button"
                onClick={() =>
                  updateState(
                    (prev) => ({ ...prev, faculty: prev.faculty.filter((x) => x.id !== f.id) }),
                    { action: `Removed faculty entry "${f.name}"`, module: 'Faculty' }
                  )
                }
                aria-label={`Delete ${f.name}`}
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

export const AdmissionsManager: React.FC = () => {
  const { state, updateState } = useCms();
  const adm = state.settings.admissionsConfig;

  const updateAdm = (patch: Partial<typeof adm>) => {
    updateState(
      (prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          admissionsConfig: { ...prev.settings.admissionsConfig, ...patch },
        },
      }),
      { action: 'Updated admissions campaign configuration', module: 'Admissions' }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171238]">Admissions Campaign Manager</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Control academic session headline, dates, scholarship notes, and admissions status.
        </p>
      </div>

      <div className="bg-white border border-[#E8DFF5] rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Academic Year</label>
            <input
              type="text"
              value={adm.academicYear}
              onChange={(e) => updateAdm({ academicYear: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Admissions Headline</label>
            <input
              type="text"
              value={adm.headline}
              onChange={(e) => updateAdm({ headline: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1">Admissions Description</label>
            <textarea
              rows={2}
              value={adm.subtext}
              onChange={(e) => updateAdm({ subtext: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1">Scholarship Note</label>
            <textarea
              rows={2}
              value={adm.scholarshipNote}
              onChange={(e) => updateAdm({ scholarshipNote: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const EnquiriesManager: React.FC = () => {
  const { state, updateEnquiryStatus } = useCms();
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<AdmissionEnquiry | null>(null);

  const filtered = filterEnquiries(state.enquiries, search, programFilter, statusFilter);

  const exportCsv = () => {
    const base = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '/api/v1';
    window.location.assign(`${base}/admin/enquiries/export`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171238]">Admission Enquiries</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track, filter, annotate, and export prospective student enquiries from MySQL.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, parent, city, or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8DFF5] rounded-lg"
          />
        </div>
        <select
          aria-label="Filter by program"
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-[#E8DFF5] rounded-lg"
        >
          <option value="All">All Programs</option>
          {state.programs.map((p) => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-[#E8DFF5] rounded-lg"
        >
          {['All', 'New', 'Contacted', 'Interested', 'Follow-up', 'Converted', 'Not Interested'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-[#E8DFF5] rounded-2xl overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No matching admission enquiries found.
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="border-b border-[#E8DFF5] text-slate-500 bg-[#FCFAFF]">
              <tr>
                <th className="py-3 px-4">Student & Parent</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#171238]">{e.studentName}</div>
                    <div className="text-slate-500">C/O {e.parentName || '—'}</div>
                  </td>
                  <td className="py-3 px-4 tabular-nums">
                    <div>{e.mobile}</div>
                    <div className="text-slate-500">{e.email || '—'}</div>
                  </td>
                  <td className="py-3 px-4">{e.interestedProgram}</td>
                  <td className="py-3 px-4">{e.city || '—'}</td>
                  <td className="py-3 px-4">
                    <select
                      aria-label={`Status for ${e.studentName}`}
                      value={e.status}
                      onChange={(ev) => void updateEnquiryStatus(e.id, ev.target.value as EnquiryStatus)}
                      className="px-2 py-1 text-xs border border-[#E8DFF5] rounded bg-white"
                    >
                      {['New', 'Contacted', 'Interested', 'Follow-up', 'Converted', 'Not Interested'].map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(e)}
                      className="px-3 py-1.5 font-semibold text-[#52128B] bg-[#F5F0FC] rounded-lg cursor-pointer"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 space-y-4 border border-[#E8DFF5] shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#171238]">{selected.studentName}</h2>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close enquiry modal" className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs space-y-1 text-slate-600">
              <p><strong>Parent:</strong> {selected.parentName || '—'}</p>
              <p><strong>Qualification:</strong> {selected.qualification || '—'}</p>
              <p><strong>Location:</strong> {selected.city || '—'}, {selected.state}</p>
              <p><strong>Message:</strong> {selected.message || '—'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Follow-up Date</label>
              <input
                type="date"
                value={selected.followUpDate}
                onChange={(ev) => {
                  const val = ev.target.value;
                  setSelected({ ...selected, followUpDate: val });
                  void updateEnquiryStatus(selected.id, selected.status, selected.notes, val);
                }}
                className="w-full px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Internal Counselor Notes</label>
              <textarea
                rows={3}
                value={selected.notes}
                onChange={(ev) => {
                  const val = ev.target.value;
                  setSelected({ ...selected, notes: val });
                  void updateEnquiryStatus(selected.id, selected.status, val, selected.followUpDate);
                }}
                className="w-full px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
