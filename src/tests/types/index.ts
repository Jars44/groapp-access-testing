export interface RegisterPayload {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CompanyCreatePayload {
  workspaceId: string;
  name: string;
  businessType: 'jasa' | 'retail' | 'manufaktur';
  countryCode: string;
  currencyCode: string;
  provinceId?: string;
  cityId?: string;
  districtId?: string;
  villageId?: string;
  postalCode?: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  npwp?: string;
  nib?: string;
  pkpStatus?: boolean;
}

export interface WorkspacePayload {
  name: string;
}

export interface InvitationPayload {
  email: string;
  roleId: string;
}

export interface UnitPayload {
  name: string;
  unitType: string;
  provinceId?: string;
  cityId?: string;
  districtId?: string;
  subdistrictId?: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationFilter {
  category?: string;
  isRead?: boolean;
}
