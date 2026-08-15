import { AppUser } from '../types';
import { logoutSuperAdmin } from './superAdminAuth';

const USER_SESSION_KEY = 'vendeo_user_session';

export const getCurrentSessionUser = (): AppUser | null => {
  try {
    const data = localStorage.getItem(USER_SESSION_KEY);
    if (!data) return null;
    return JSON.parse(data) as AppUser;
  } catch {
    return null;
  }
};

export const setCurrentSessionUser = (user: AppUser | null): void => {
  try {
    if (user) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  } catch {
    // ignore
  }
};

export const clearUserSession = (): void => {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem('vendeo_session_token');
    logoutSuperAdmin();
  } catch {
    // ignore
  }
};
