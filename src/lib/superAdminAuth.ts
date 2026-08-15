const SUPERADMIN_KEY = 'vendeo_superadmin_auth';

export const isSuperAdminAuthenticated = (): boolean => {
  try {
    return localStorage.getItem(SUPERADMIN_KEY) === 'true';
  } catch {
    return false;
  }
};

export const verifySuperAdminCredentials = (username: string, pass: string): boolean => {
  if (username.trim() === 'adlen' && pass === 'blidsi@0808@') {
    localStorage.setItem(SUPERADMIN_KEY, 'true');
    return true;
  }
  return false;
};

export const logoutSuperAdmin = (): void => {
  try {
    localStorage.removeItem(SUPERADMIN_KEY);
  } catch {
    // ignore
  }
};
