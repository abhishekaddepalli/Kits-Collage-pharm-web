import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveChatbotReply } from './chatbotEngine';
import {
  buildCsvContent,
  enquirySchema,
  evaluatePasswordStrength,
  slugifyText,
} from './validation';
import {
  computeThemeCssVariables,
  filterEnquiries,
  normalizeNavOrder,
  reorderItems,
  summarizeEnquiriesByStatus,
} from './cmsStoreLogic';
import { createInitialCmsState } from '../data/defaults/kitsSeedData';
import type { AdmissionEnquiry } from '../types/cms';

test('seed data removes all demo administrator accounts, sample enquiries, and admin links', () => {
  const seed = createInitialCmsState();
  assert.equal(seed.users.length, 0);
  assert.equal(seed.enquiries.length, 0);
  assert.equal(seed.notifications.length, 0);
  assert.equal(seed.activityLogs.length, 0);
  assert.equal(seed.header.staffPortalUrl, '');
  assert.equal(seed.header.staffPortalLabel, '');
  assert.equal(seed.installInfo.isInstalledDemo, false);

  const footerPaths = seed.footer.columns.flatMap((c) => c.links.map((l) => l.path));
  assert.equal(footerPaths.some((p) => p.includes('admin') || p.includes('install')), false);
});

test('chatbot engine matches verified FAQ keywords and falls back politely', () => {
  const seed = createInitialCmsState();
  const contact = {
    phone: seed.settings.contact.primaryPhone,
    email: seed.settings.contact.email,
    address: seed.settings.contact.address,
    workingHours: seed.settings.contact.workingHours,
  };

  const eligResult = resolveChatbotReply('What is the B.Pharm eligibility?', seed.chatbot, contact);
  assert.equal(eligResult.matched, true);
  assert.match(eligResult.response, /10\+2/i);

  const fallbackResult = resolveChatbotReply('What is the quantum physics syllabus on Mars?', seed.chatbot, contact);
  assert.equal(fallbackResult.matched, false);
  assert.match(fallbackResult.response, /\+91 97015 18708/);
  assert.match(fallbackResult.response, /kitspharmacollege@gmail.com/);
});

test('validation schemas validate admission enquiries and password strength', () => {
  const bad = enquirySchema.safeParse({
    studentName: 'A',
    parentName: '',
    mobile: '123',
    email: 'not-an-email',
    interestedProgram: '',
    qualification: '',
    city: '',
    state: '',
  });
  assert.equal(bad.success, false);

  const good = enquirySchema.safeParse({
    studentName: 'Keerthi Sharma',
    parentName: 'Mohan Sharma',
    mobile: '+91 9876543210',
    email: 'keerthi@example.com',
    interestedProgram: 'Bachelor of Pharmacy (B.Pharmacy)',
    qualification: 'Intermediate BiPC',
    city: 'Kakinada',
    state: 'Andhra Pradesh',
    message: 'Interested in campus visit.',
  });
  assert.equal(good.success, true);

  const weak = evaluatePasswordStrength('abc');
  assert.equal(weak.score, 0);
  const strong = evaluatePasswordStrength('Kits@2026Pharmacy!');
  assert.equal(strong.score, 4);
  assert.equal(strong.label, 'Very Strong');

  assert.equal(slugifyText('Pharmaceutical Analysis & QC!'), 'pharmaceutical-analysis-qc');
  const csv = buildCsvContent(['Name', 'Note'], [['Ananya', 'Hello, "KITS"']]);
  assert.equal(csv, 'Name,Note\nAnanya,"Hello, ""KITS"""');
});

test('cms store logic reorders nav, filters enquiries, and computes theme CSS vars', () => {
  const seed = createInitialCmsState();
  const reordered = normalizeNavOrder(reorderItems(seed.navigation, 0, 2));
  assert.equal(reordered[2].id, 'nav-home');
  assert.equal(reordered[0].order, 1);
  assert.equal(reordered[2].order, 3);

  const sampleEnquiries: AdmissionEnquiry[] = [
    {
      id: 'ENQ-001',
      studentName: 'Lakshmi Devi',
      parentName: 'Ramesh',
      mobile: '+91 9848011111',
      email: 'lakshmi@example.com',
      interestedProgram: 'Bachelor of Pharmacy (B.Pharmacy)',
      qualification: 'Intermediate BiPC',
      city: 'Kakinada',
      state: 'Andhra Pradesh',
      message: 'Hostel info',
      status: 'New',
      assignedTo: '',
      notes: '',
      followUpDate: '',
      createdAt: '2026-10-15T09:00:00Z',
    },
    {
      id: 'ENQ-002',
      studentName: 'Harika Rao',
      parentName: 'Suresh Rao',
      mobile: '+91 9848022222',
      email: 'harika@example.com',
      interestedProgram: 'Master of Pharmacy (M.Pharmacy)',
      qualification: 'B.Pharmacy',
      city: 'Rajahmundry',
      state: 'Andhra Pradesh',
      message: 'PG admissions',
      status: 'Contacted',
      assignedTo: '',
      notes: '',
      followUpDate: '',
      createdAt: '2026-10-16T09:00:00Z',
    },
  ];

  const filtered = filterEnquiries(sampleEnquiries, 'Kakinada', 'All', 'New');
  assert.equal(filtered.length, 1);

  const summary = summarizeEnquiriesByStatus(sampleEnquiries);
  assert.equal(summary.New, 1);
  assert.equal(summary.Contacted, 1);

  const cssVars = computeThemeCssVariables(seed.appearance);
  assert.equal(cssVars['--kits-primary'], '#52128B');
  assert.equal(cssVars['--kits-gold'], '#F2C34E');
});
