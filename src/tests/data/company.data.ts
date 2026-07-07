export function generateCompanyPayload(overrides?: Partial<{
  workspaceId: string;
  name: string;
  businessType: string;
  countryCode: string;
  currencyCode: string;
}>): {
  workspaceId: string;
  name: string;
  businessType: string;
  countryCode: string;
  currencyCode: string;
} {
  const timestamp = Date.now();
  return {
    workspaceId: 'default',
    name: `PT Test QA ${timestamp}`,
    businessType: 'jasa',
    countryCode: 'ID',
    currencyCode: 'IDR',
    ...overrides,
  };
}

export const COMPANY_VALIDATION = {
  nameMinLength: 3,
  nameMaxLength: 60,
  postalCodeMaxLength: 5,
  phoneMaxLength: 13,
  emailMaxLength: 50,
  npwpLength: 16,
  nibLength: 13,
  logoMaxSizeMB: 2,
  nameAllowedPattern: /^[A-Za-z0-9., ]+$/,
};
