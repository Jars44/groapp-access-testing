import { requireEnv } from '../utils/env';

export const TEST_USER = {
  email: requireEnv('TEST_USER_EMAIL'),
  password: requireEnv('TEST_USER_PASSWORD'),
  name: 'QA Tester',
  phone: '81234567890',
  countryCode: '+62',
} as const;

export const TIMEOUTS = {
  navigation: 30000,
  toast: 10000,
  api: 15000,
  animation: 1000,
} as const;

export const VALIDATION = {
  companyNameMaxLength: 60,
  companyNameMinLength: 3,
  postalCodeMaxLength: 5,
  phoneMaxLength: 13,
  npwpLength: 16,
  workspaceNameMaxLength: 60,
  workspaceNameMinLength: 3,
  passwordMinLength: 8,
  logoMaxSizeMB: 2,
} as const;

export const ROUTES = {
  login: '/auth/login',
  register: '/auth/register',
  dashboard: '/dashboard',
  workspaces: '/workspaces',
  onboarding: '/onboarding',
} as const;
