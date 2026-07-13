import { requireEnv } from '../utils/env';

export function generateRegisterPayload(overrides?: Partial<{
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}>): {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
} {
  const timestamp = Date.now();
  const nameLetters = String(timestamp)
    .split('')
    .map((d) => String.fromCharCode(97 + Number(d)))
    .join('');
  return {
    name: `Test User ${nameLetters}`,
    email: `test.${timestamp}@groapp.id`,
    countryCode: '+62',
    phone: `8${String(timestamp).slice(-10)}`,
    password: 'StrongP@ss1',
    confirmPassword: 'StrongP@ss1',
    agreeToTerms: true,
    ...overrides,
  };
}

export const VALID_CREDENTIALS = {
  email: requireEnv('TEST_USER_EMAIL'),
  password: requireEnv('TEST_USER_PASSWORD'),
};

export const INVALID_CREDENTIALS = {
  wrongPassword: 'WrongPass1!',
  unregisteredEmail: 'unregistered@test.com',
  invalidEmail: 'not-an-email',
  emptyEmail: '',
  emptyPassword: '',
};
