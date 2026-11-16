import { z } from 'zod';

export const enquirySchema = z.object({
  studentName: z.string().trim().min(2, 'Please enter student full name (at least 2 characters).'),
  parentName: z.string().trim().min(2, 'Please enter parent or guardian name.'),
  mobile: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{10,15}$/, 'Please enter a valid 10-digit mobile number.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  interestedProgram: z.string().trim().min(1, 'Please select a program of interest.'),
  qualification: z.string().trim().min(2, 'Please enter current qualification (e.g., Intermediate BiPC/MPC).'),
  city: z.string().trim().min(2, 'Please enter city or town.'),
  state: z.string().trim().min(2, 'Please enter state.'),
  message: z.string().trim().max(1000, 'Message must be under 1000 characters.').optional().default(''),
});

export type EnquiryFormData = z.infer<typeof enquirySchema>;

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  checks: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  let passed = 0;
  if (checks.minLength) passed++;
  if (checks.hasUpper && checks.hasLower) passed++;
  if (checks.hasNumber) passed++;
  if (checks.hasSpecial) passed++;

  const labels: PasswordStrengthResult['label'][] = [
    'Very Weak',
    'Weak',
    'Fair',
    'Strong',
    'Very Strong',
  ];

  return {
    score: passed,
    label: labels[passed],
    checks,
  };
}

export function slugifyText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function escapeCsvCell(value: string): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsvContent(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCsvCell).join(',');
  const dataLines = rows.map((row) => row.map(escapeCsvCell).join(','));
  return [headerLine, ...dataLines].join('\n');
}
