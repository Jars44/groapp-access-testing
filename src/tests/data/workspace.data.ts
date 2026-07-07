export function generateWorkspacePayload(overrides?: Partial<{ name: string }>): { name: string } {
  const timestamp = Date.now();
  return {
    name: `Workspace QA ${timestamp}`,
    ...overrides,
  };
}

export const WORKSPACE_VALIDATION = {
  nameMinLength: 3,
  nameMaxLength: 60,
  nameAllowedPattern: /^[A-Za-z0-9., ]+$/,
};
