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
