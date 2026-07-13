export function generateUnitPayload(overrides?: Partial<{
  name: string;
  unitType: string;
  provinceId: string;
  cityId: string;
  districtId: string;
  subdistrictId: string;
}>): {
  name: string;
  unitType: string;
  provinceId?: string;
  cityId?: string;
  districtId?: string;
  subdistrictId?: string;
} {
  const timestamp = Date.now();
  return {
    name: `Unit QA ${timestamp}`,
    unitType: 'cabang',
    ...overrides,
  };
}
