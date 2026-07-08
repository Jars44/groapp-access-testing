export const SEL = {
  form: {
    name: 'input[name="name"]',
    email: 'input[name="email"]',
    phone: 'input[name="phone"]',
    password: 'input[name="password"]',
    confirmPassword: 'input[name="confirmPassword"]',
    search: 'input[type="search"], input[placeholder*="cari" i], input[placeholder*="search" i]',
  },
  button: {
    submit: 'button[type="submit"]',
    tambah: /tambah|buat|create/i,
    simpan: /simpan|save/i,
    hapus: /hapus|delete/i,
    batal: /batal|cancel/i,
    lanjut: /lanjut|next|selanjutnya/i,
    kembali: /kembali|back/i,
  },
  toast: {
    root: '[role="status"]',
    message: '[data-toast-message], [role="status"] p',
  },
  modal: {
    root: '[role="dialog"]',
    title: '[role="dialog"] [role="heading"]',
  },
  state: {
    loading: '[data-loading="true"]',
    empty: '[data-testid="empty-data"]',
    error: '[data-helper-text], [data-error], .text-app-pr-info-critical-600, [aria-invalid="true"]',
    skeleton: '[data-testid="skeleton"]',
  },
  indicator: {
    passwordSecurity: '[data-input-group-password-security="true"]',
    badge: '[data-testid="notification-badge"]',
    stepper: '[data-testid="stepper"]',
  },
} as const;
