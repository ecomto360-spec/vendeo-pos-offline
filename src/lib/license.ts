import { isSuperAdminAuthenticated } from './superAdminAuth';

export interface LicenseKey {
  id: string;
  key: string;
  durationDays: number;
  label: string;
  createdAt: string;
  status: 'unused' | 'used';
  usedAt?: string;
}

export interface ActiveLicense {
  isActivated: boolean;
  key: string;
  durationDays: number;
  activatedAt: string;
  expiresAt: string; // ISO string
  typeLabel: string;
}

export type LicenseStatusType = 'active' | 'expired_license' | 'trial_active' | 'trial_expired';

export interface LicenseStatus {
  type: LicenseStatusType;
  isActivated: boolean;
  isTrial: boolean;
  daysRemaining?: number;
  hoursRemaining?: number;
  formattedExpiration?: string;
  license?: ActiveLicense;
  trialExpiresAt?: number;
}

const KEYS_STORAGE_KEY = 'vendeo_keys_db';
const LICENSE_STORAGE_KEY = 'vendeo_active_license';
const FIRST_LAUNCH_KEY = 'vendeo_first_launch';
const TRIAL_DURATION_MS = 48 * 3600 * 1000; // 48 Hours

// Helper to generate key string XXXX-XXXX-XXXX-XXXX
export const generateRandomKeyToken = (prefix: string = 'VNDO'): string => {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${segment()}-${segment()}-${segment()}`;
};

// Get stored keys DB
export const getStoredKeys = (): LicenseKey[] => {
  try {
    const data = localStorage.getItem(KEYS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse keys from localStorage', e);
  }

  // Seed initial demo keys for easy testing
  const initialKeys: LicenseKey[] = [
    {
      id: 'key-1',
      key: '3333-3333-3333-3333',
      durationDays: 3,
      label: 'Clé 3 Jours (Démo)',
      createdAt: new Date().toISOString(),
      status: 'unused',
    },
    {
      id: 'key-2',
      key: '9090-9090-9090-9090',
      durationDays: 90,
      label: 'Clé 90 Jours (3 Mois)',
      createdAt: new Date().toISOString(),
      status: 'unused',
    },
    {
      id: 'key-3',
      key: '3650-3650-3650-3650',
      durationDays: 365,
      label: 'Clé 365 Jours (1 An - Illimité)',
      createdAt: new Date().toISOString(),
      status: 'unused',
    },
  ];

  localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(initialKeys));
  return initialKeys;
};

// Save keys DB
export const saveStoredKeys = (keys: LicenseKey[]) => {
  localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(keys));
};

// Generate a new key by Super Admin
export const createSuperAdminKey = (durationDays: number): LicenseKey => {
  const keys = getStoredKeys();
  const labelMap: Record<number, string> = {
    3: 'Clé 3 Jours',
    90: 'Clé 90 Jours',
    365: 'Clé 365 Jours (1 An - Illimité)',
  };

  const newKey: LicenseKey = {
    id: `key-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    key: generateRandomKeyToken(),
    durationDays,
    label: labelMap[durationDays] || `Clé ${durationDays} Jours`,
    createdAt: new Date().toISOString(),
    status: 'unused',
  };

  const updatedKeys = [newKey, ...keys];
  saveStoredKeys(updatedKeys);
  return newKey;
};

// Get or initialize First Launch timestamp for 48h trial
export const getFirstLaunchTime = (): number => {
  let launch = localStorage.getItem(FIRST_LAUNCH_KEY);
  if (!launch) {
    const now = Date.now();
    localStorage.setItem(FIRST_LAUNCH_KEY, now.toString());
    return now;
  }
  return parseInt(launch, 10) || Date.now();
};

// Get active license object
export const getActiveLicense = (): ActiveLicense | null => {
  try {
    const data = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse active license', e);
  }
  return null;
};

// Get overall license status
export const getLicenseStatus = (): LicenseStatus => {
  if (isSuperAdminAuthenticated()) {
    return {
      type: 'active',
      isActivated: true,
      isTrial: false,
      daysRemaining: 99999,
      formattedExpiration: 'Accès Illimité (Super Admin)',
      license: {
        isActivated: true,
        key: 'SUPER-ADMIN-FREE-ACCESS',
        durationDays: 99999,
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 100 * 365 * 24 * 3600 * 1000).toISOString(),
        typeLabel: 'Accès Super Admin Gratuit & Illimité',
      },
    };
  }

  const activeLicense = getActiveLicense();
  const now = Date.now();

  if (activeLicense) {
    const expiresAtMs = new Date(activeLicense.expiresAt).getTime();
    if (now < expiresAtMs) {
      const diffMs = expiresAtMs - now;
      const daysRemaining = Math.ceil(diffMs / (1000 * 3600 * 24));
      const formattedExpiration = new Date(activeLicense.expiresAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      return {
        type: 'active',
        isActivated: true,
        isTrial: false,
        daysRemaining,
        formattedExpiration,
        license: activeLicense,
      };
    } else {
      return {
        type: 'expired_license',
        isActivated: false,
        isTrial: false,
        daysRemaining: 0,
        formattedExpiration: new Date(activeLicense.expiresAt).toLocaleDateString('fr-FR'),
        license: activeLicense,
      };
    }
  }

  // Check 48h trial
  const firstLaunch = getFirstLaunchTime();
  const trialExpiresAt = firstLaunch + TRIAL_DURATION_MS;
  const remainingTrialMs = trialExpiresAt - now;

  if (remainingTrialMs > 0) {
    const hoursRemaining = Math.floor(remainingTrialMs / (1000 * 3600));
    return {
      type: 'trial_active',
      isActivated: false,
      isTrial: true,
      hoursRemaining,
      trialExpiresAt,
      formattedExpiration: new Date(trialExpiresAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };
  }

  return {
    type: 'trial_expired',
    isActivated: false,
    isTrial: true,
    hoursRemaining: 0,
    trialExpiresAt,
    formattedExpiration: new Date(trialExpiresAt).toLocaleDateString('fr-FR'),
  };
};

// Validate and apply code
export const activateWithCode = (rawCode: string): { success: boolean; message: string; license?: ActiveLicense } => {
  const cleanCode = rawCode.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, message: 'Veuillez saisir un code d\'activation.' };
  }

  const keys = getStoredKeys();
  const foundKeyIndex = keys.findIndex(
    (k) => k.key.toUpperCase() === cleanCode || k.key.replace(/-/g, '').toUpperCase() === cleanCode.replace(/-/g, '')
  );

  let durationDays = 365;
  let typeLabel = 'Licence 1 An (365 jours)';

  if (foundKeyIndex !== -1) {
    const keyObj = keys[foundKeyIndex];
    if (keyObj.status === 'used') {
      return { success: false, message: 'Ce code d\'activation a déjà été utilisé.' };
    }

    durationDays = keyObj.durationDays;
    typeLabel = keyObj.label;

    // Mark as used
    keys[foundKeyIndex].status = 'used';
    keys[foundKeyIndex].usedAt = new Date().toISOString();
    saveStoredKeys(keys);
  } else {
    // If user enters a custom format with 16 characters or 4 groups, allow offline activation for flexibility
    const codeSegments = cleanCode.split('-').join('');
    if (codeSegments.length < 12) {
      return { success: false, message: 'Code d\'activation invalide. Veuillez vérifier votre clé.' };
    }
    // Default fallback duration
    durationDays = 365;
    typeLabel = 'Licence Officielle (365 jours)';
  }

  const now = new Date();
  const expirationDate = new Date(now.getTime() + durationDays * 24 * 3600 * 1000);

  const newLicense: ActiveLicense = {
    isActivated: true,
    key: cleanCode,
    durationDays,
    activatedAt: now.toISOString(),
    expiresAt: expirationDate.toISOString(),
    typeLabel,
  };

  localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(newLicense));

  const formattedExp = expirationDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return {
    success: true,
    message: `Félicitations ! Votre licence est active jusqu'au ${formattedExp}.`,
    license: newLicense,
  };
};
