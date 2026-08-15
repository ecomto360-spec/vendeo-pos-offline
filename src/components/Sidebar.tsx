import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShoppingBag, 
  Package, 
  Boxes, 
  Tag, 
  Truck, 
  ShoppingCart, 
  Users, 
  UserCheck, 
  FileSpreadsheet, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles,
  Calculator,
  Wallet,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { NavigationPage, Language } from '../types';
import { getLicenseStatus, LicenseStatus } from '../lib/license';
import { isSuperAdminAuthenticated, logoutSuperAdmin } from '../lib/superAdminAuth';
import { useLanguage } from '../lib/i18n';

interface SidebarProps {
  currentPage?: NavigationPage | string;
  onPageChange?: (page: NavigationPage | string) => void;
  currentView?: string;
  onViewChange?: (view: string) => void;
  collapsed?: boolean;
  currentLanguage?: Language;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  currentView,
  onViewChange,
  currentLanguage = 'fr',
  onLogout,
}) => {
  const { t } = useLanguage();
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>(getLicenseStatus());
  const [isSuperAdmin, setIsSuperAdmin] = useState(isSuperAdminAuthenticated());
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setLicenseStatus(getLicenseStatus());
      setIsSuperAdmin(isSuperAdminAuthenticated());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (isSuperAdminAuthenticated()) {
      logoutSuperAdmin();
      setIsSuperAdmin(false);
    }
    if (onLogout) {
      onLogout();
    } else {
      setLogoutMessage('Déconnexion effectuée');
      setTimeout(() => setLogoutMessage(null), 3000);
    }
  };

  const activePage = currentPage || currentView || 'parametres';

  const handlePageChange = (page: string) => {
    if (onPageChange) {
      onPageChange(page);
    }
    if (onViewChange) {
      onViewChange(page);
    }
  };

  const isSelected = (page: string) => activePage === page;

  const getItemClass = (page: string) => `
    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer text-left w-full
    ${isSelected(page)
      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold' 
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
    }
  `;

  return (
    <aside className="w-64 bg-slate-50/90 dark:bg-slate-900/90 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none overflow-y-auto custom-scrollbar">
      {/* App Header & Branding */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Boxes className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Vendeo POS</h1>
              </div>
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300/50 dark:border-purple-700/50">
                  <CheckCircle2 className="w-2.5 h-2.5 text-purple-600" />
                  Accès Illimité (Super Admin)
                </span>
              ) : licenseStatus.isActivated ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300/50 dark:border-blue-700/50">
                  <CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />
                  Licence Active
                </span>
              ) : licenseStatus.type === 'trial_active' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                  Essai 48h ({licenseStatus.hoursRemaining}h)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                  <Lock className="w-2.5 h-2.5 text-red-500" />
                  Essai Expiré
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-6">
          {/* Main Sales / POS Section */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              {t('nav.group.ventes')}
            </p>
            <div className="space-y-1">
              <button
                onClick={() => handlePageChange('pos')}
                className={getItemClass('pos')}
              >
                <Calculator className="w-4 h-4" />
                <span>{t('nav.pos')}</span>
              </button>
              <button
                onClick={() => handlePageChange('journal-ventes')}
                className={getItemClass('journal-ventes')}
              >
                <FileText className="w-4 h-4" />
                <span>{t('nav.journalVentes')}</span>
              </button>
              <button
                onClick={() => handlePageChange('caisse')}
                className={getItemClass('caisse')}
              >
                <Wallet className="w-4 h-4" />
                <span>{t('nav.caisse')}</span>
              </button>
            </div>
          </div>

          {/* Stock & Products Section */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              {t('nav.group.stock')}
            </p>
            <div className="space-y-1">
              <button
                onClick={() => handlePageChange('stock')}
                className={getItemClass('stock')}
              >
                <Package className="w-4 h-4" />
                <span>{t('nav.stock')}</span>
              </button>
              <button
                onClick={() => handlePageChange('packs')}
                className={getItemClass('packs')}
              >
                <Boxes className="w-4 h-4" />
                <span>{t('nav.packs')}</span>
              </button>
              <button
                onClick={() => handlePageChange('promotions')}
                className={getItemClass('promotions')}
              >
                <Tag className="w-4 h-4" />
                <span>{t('nav.promotions')}</span>
              </button>
            </div>
          </div>

          {/* Tiers & Comptes Section */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              {t('nav.group.tiers')}
            </p>
            <div className="space-y-1">
              <button
                onClick={() => handlePageChange('fournisseurs')}
                className={getItemClass('fournisseurs')}
              >
                <Truck className="w-4 h-4" />
                <span>{t('nav.fournisseurs')}</span>
              </button>
              <button
                onClick={() => handlePageChange('achats')}
                className={getItemClass('achats')}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('nav.achats')}</span>
              </button>
              <button
                onClick={() => handlePageChange('clients')}
                className={getItemClass('clients')}
              >
                <Users className="w-4 h-4" />
                <span>{t('nav.clients')}</span>
              </button>
              <button
                onClick={() => handlePageChange('utilisateurs')}
                className={getItemClass('utilisateurs')}
              >
                <UserCheck className="w-4 h-4" />
                <span>{t('nav.utilisateurs')}</span>
              </button>
            </div>
          </div>

          {/* Finance & Rapports Section */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              {t('nav.group.finance')}
            </p>
            <div className="space-y-1">
              <button
                onClick={() => handlePageChange('pro-formas')}
                className={getItemClass('pro-formas')}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{t('nav.proformas')}</span>
              </button>
              <button
                onClick={() => handlePageChange('bons-commande')}
                className={getItemClass('bons-commande')}
              >
                <ClipboardList className="w-4 h-4" />
                <span>{t('nav.bonsCommande')}</span>
              </button>
              <button
                onClick={() => handlePageChange('statistiques')}
                className={getItemClass('statistiques')}
              >
                <BarChart3 className="w-4 h-4" />
                <span>{t('nav.statistiques')}</span>
              </button>
            </div>
          </div>

          {/* Système Section */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              {t('nav.group.systeme')}
            </p>
            <div className="space-y-1">
              <button
                onClick={() => handlePageChange('parametres')}
                className={getItemClass('parametres')}
              >
                <Settings className="w-4 h-4" />
                <span>{t('nav.parametres')}</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* User Footer Card & Logout Action */}
      <div className="p-3 m-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-sm">
        {logoutMessage && (
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-[11px] font-extrabold text-center animate-fade-in">
            {logoutMessage}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              title="Se déconnecter"
              className="w-9 h-9 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-950/60 dark:hover:bg-red-900/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-sm border border-red-200 dark:border-red-800 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                {isSuperAdmin ? 'adlen' : 'coco ben'}
              </p>
              <span className={`inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded mt-0.5 ${
                isSuperAdmin 
                  ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/80 text-red-600 dark:text-red-400 text-xs font-bold transition-all border border-red-200 dark:border-red-900"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
};
