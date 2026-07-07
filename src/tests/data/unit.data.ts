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

export const UNIT_VALIDATION = {
  nameMinLength: 3,
  nameMaxLength: 60,
};
