import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Maximize2, 
  HelpCircle, 
  PlayCircle, 
  Keyboard, 
  Bell, 
  Sun, 
  Moon, 
  Gift, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  Globe,
  Download,
  Wifi,
  WifiOff
} from 'lucide-react';
import { getLicenseStatus, LicenseStatus } from '../lib/license';
import { AppUser, Language } from '../types';
import { isSuperAdminAuthenticated } from '../lib/superAdminAuth';
import { useLanguage } from '../lib/i18n';
import { usePwaInstall } from '../lib/usePwaInstall';

interface HeaderProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  trialSales?: number;
  darkMode?: boolean;
  theme?: 'light' | 'dark';
  currentUser?: AppUser | null;
  currentLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
  onLogout?: () => void;
  onToggleDarkMode?: () => void;
  onToggleTheme?: () => void;
  onOpenShortcuts?: () => void;
  onOpenTutorials?: () => void;
  onOpenVideos?: () => void;
  onOpenActivation?: () => void;
  onOpenOffer?: () => void;
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm = '',
  onSearchChange = (_val: string) => {},
  darkMode,
  theme = 'light',
  currentUser,
  currentLanguage,
  onLanguageChange,
  onLogout,
  onToggleDarkMode,
  onToggleTheme,
  onOpenShortcuts = () => {},
  onOpenTutorials,
  onOpenVideos,
  onOpenActivation,
  onOpenOffer,
  onOpenHelp = () => {},
}) => {
  const { language: ctxLanguage, setLanguage: ctxSetLanguage, t } = useLanguage();
  const { isInstallable, triggerInstall } = usePwaInstall();
  const activeLanguage = currentLanguage || ctxLanguage;
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>(getLicenseStatus());
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      setLicenseStatus(getLicenseStatus());
    }, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const isDark = darkMode ?? (theme === 'dark');
  const handleToggleDark = onToggleDarkMode || onToggleTheme || (() => {});
  const handleOpenTutorials = onOpenTutorials || onOpenVideos || (() => {});
  const handleOpenActivation = onOpenActivation || onOpenOffer || (() => {});
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 py-2.5 flex items-center justify-between gap-4">
      {/* Search Input & Dynamic Trial/License Badge */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('header.search')}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
        </div>

        {/* License/Trial Status Badge */}
        {isSuperAdminAuthenticated() ? (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>Super Admin - Accès Illimité Gratuit</span>
          </div>
        ) : licenseStatus.isActivated ? (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Licence Active (<strong className="font-bold">{licenseStatus.daysRemaining}j</strong>)</span>
          </div>
        ) : licenseStatus.type === 'trial_active' ? (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-medium whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Essai 48h active (<strong className="font-bold">{licenseStatus.hoursRemaining}h rest.</strong>)</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200/80 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-bold whitespace-nowrap">
            <Lock className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Essai 48h Expiré - Activer Vendeo</span>
          </div>
        )}
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Connection Mode Indicator */}
        <div
          title={isOnline ? "En ligne - Synchronisé" : "Mode Hors-ligne (IndexedDB actif)"}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
            isOnline
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>En ligne</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Hors-ligne (IndexedDB)</span>
            </>
          )}
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          title="Plein écran"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Help Button */}
        <button
          onClick={onOpenHelp}
          title="Aide & Documentation"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Video Guides Button */}
        <button
          onClick={handleOpenTutorials}
          title="Tutoriels Vidéo"
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <PlayCircle className="w-4 h-4 text-red-500 fill-red-500/10" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-sm">
            3
          </span>
        </button>

        {/* Keyboard Shortcuts Button */}
        <button
          onClick={onOpenShortcuts}
          title="Raccourcis clavier"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Notifications Bell */}
        <button
          title="Notifications"
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
        </button>

        {/* PWA Desktop Install Button */}
        {isInstallable && (
          <button
            type="button"
            onClick={triggerInstall}
            title="Installer l'application Vendeo POS sur votre PC / mobile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md text-xs font-extrabold active:scale-95 transition-all animate-pulse"
          >
            <Download className="w-4 h-4" />
            <span className="hidden xl:inline">Installer l'application</span>
          </button>
        )}

        {/* Promo Activation Offer Banner */}
        <button
          onClick={handleOpenActivation}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-600/20 text-xs font-bold transition-all"
        >
          <ShieldCheck className="w-4 h-4 text-cyan-300" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-[10px] opacity-90 font-medium text-blue-100">Clé d'Activation</span>
            <span className="text-xs uppercase font-extrabold tracking-tight">6 000 DZD / an <span className="bg-white/20 px-1 py-0.2 rounded text-[10px] ml-1">-40%</span></span>
          </div>
        </button>

        {/* Language Selector Dropdown */}
        <div className="relative flex items-center ml-1">
          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 absolute left-2.5 pointer-events-none" />
          <select
            value={activeLanguage}
            onChange={(e) => {
              const lang = e.target.value as Language;
              if (onLanguageChange) onLanguageChange(lang);
              ctxSetLanguage(lang);
            }}
            title={t('header.language')}
            className="pl-7 pr-2 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-black text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer transition-all shadow-sm"
          >
            <option value="fr" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">FR 🇫🇷</option>
            <option value="ar" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">العربية 🇩🇿</option>
            <option value="en" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">EN 🇬🇧</option>
          </select>
        </div>

        {/* Dark / Light Toggle */}
        <button
          onClick={handleToggleDark}
          title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Session & Logout Action */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 ml-1">
          <div className="hidden sm:flex flex-col text-right leading-tight">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1">
              {isSuperAdminAuthenticated() ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                  <span>adlen</span>
                </>
              ) : (
                currentUser?.nomComplet || 'coco ben'
              )}
            </span>
            <span className="text-[10px] text-slate-400 font-mono uppercase">
              {isSuperAdminAuthenticated() ? 'SUPER ADMIN' : (currentUser?.role || 'ADMIN')}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Se déconnecter de la session"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/80 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-800 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t('header.logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
