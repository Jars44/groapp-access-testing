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
  return {
    name: `Test User ${timestamp}`,
    email: `test.${timestamp}@groapp.id`,
    countryCode: '+62',
    phone: `8${String(timestamp).slice(0, 10)}`,
    password: 'StrongP@ss1',
    confirmPassword: 'StrongP@ss1',
    agreeToTerms: true,
    ...overrides,
  };
}

export const VALID_CREDENTIALS = {
  email: process.env.TEST_USER_EMAIL || 'REDACTED_EMAIL',
  password: process.env.TEST_USER_PASSWORD || 'REDACTED_PASSWORD',
};

export const INVALID_CREDENTIALS = {
  wrongPassword: 'WrongPass1!',
  unregisteredEmail: 'unregistered@test.com',
  invalidEmail: 'not-an-email',
  emptyEmail: '',
  emptyPassword: '',
};
