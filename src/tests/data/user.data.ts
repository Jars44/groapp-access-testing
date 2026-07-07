export function generateInvitationPayload(overrides?: Partial<{ email: string; roleId: string }>): {
  email: string;
  roleId: string;
} {
  const timestamp = Date.now();
  return {
    email: `invited.${timestamp}@groapp.id`,
    roleId: 'default-role-id',
    ...overrides,
  };
}
