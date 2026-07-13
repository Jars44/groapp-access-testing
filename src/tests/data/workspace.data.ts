export function generateWorkspacePayload(overrides?: Partial<{ name: string }>): { name: string } {
  const timestamp = Date.now();
  return {
    name: `Workspace QA ${timestamp}`,
    ...overrides,
  };
}
