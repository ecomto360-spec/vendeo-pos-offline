import React, { useState } from 'react';
import { 
  UserCheck, 
  SlidersHorizontal, 
  FileText, 
  Network, 
  ArrowLeftRight, 
  ShieldCheck, 
  ShieldAlert,
  Smartphone, 
  RefreshCw,
  Lock,
  LogOut,
  KeyRound
} from 'lucide-react';
import { ParametresTab, AppSettings } from '../../types';
import { CompteSettings } from './CompteSettings';
import { GeneralSettings } from './GeneralSettings';
import { FacturesSettings } from './FacturesSettings';
import { ReseauSettings } from './ReseauSettings';
import { ImportExportSettings } from './ImportExportSettings';
import { ActivationSettings } from './ActivationSettings';
import { SuperAdminPanel } from './SuperAdminPanel';
import { MobileAppSettings } from './MobileAppSettings';
import { MisesAJourSettings } from './MisesAJourSettings';
import { isSuperAdminAuthenticated, logoutSuperAdmin } from '../../lib/superAdminAuth';
import { SuperAdminLoginModal } from './SuperAdminLoginModal';

interface ParametresViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const ParametresView: React.FC<ParametresViewProps> = ({ settings, onUpdateSettings }) => {
  const [activeTab, setActiveTab] = useState<ParametresTab>('generaux');
  const [isSuperAdmin, setIsSuperAdmin] = useState(isSuperAdminAuthenticated());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogoutSuperAdmin = () => {
    logoutSuperAdmin();
    setIsSuperAdmin(false);
    if (activeTab === 'super-admin') {
      setActiveTab('generaux');
    }
  };

  const handleLoginSuccess = () => {
    setIsSuperAdmin(true);
    setActiveTab('super-admin');
  };

  // Base tabs available to all users
  const baseTabs: { id: ParametresTab; label: string; icon: React.ReactNode }[] = [
    { id: 'compte', label: 'Compte', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'generaux', label: 'Paramètres généraux', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'factures', label: 'Factures', icon: <FileText className="w-4 h-4" /> },
    { id: 'reseau', label: 'Réseau', icon: <Network className="w-4 h-4" /> },
    { id: 'import-export', label: 'Import/Export', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'activation', label: 'Activation de l\'Application', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  // Super Admin tab (ONLY added when authenticated as adlen / blidsi@0808@)
  const superAdminTab = {
    id: 'super-admin' as ParametresTab,
    label: 'Super Admin',
    icon: <ShieldAlert className="w-4 h-4 text-blue-500 animate-pulse" />,
  };

  const endTabs: { id: ParametresTab; label: string; icon: React.ReactNode }[] = [
    { id: 'mobile', label: 'Application Mobile', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'mises-a-jour', label: 'Mises à jour', icon: <RefreshCw className="w-4 h-4" /> },
  ];

  const tabs = [
    ...baseTabs,
    ...(isSuperAdmin ? [superAdminTab] : []),
    ...endTabs,
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Section Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Paramètres
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestion de Magasin Vendeo</p>
        </div>

        {/* Super Admin Login / Badge Button */}
        {isSuperAdmin ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Connecté (adlen)</span>
            <button
              type="button"
              onClick={handleLogoutSuperAdmin}
              title="Déconnexion Super Admin"
              className="ml-1 p-1 rounded-lg hover:bg-blue-900 text-slate-300 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
            title="Connexion Administrateur"
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Accès Super Admin</span>
          </button>
        )}
      </div>

      {/* Sub-tabs Nav Pill Container */}
      <div className="bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Active View */}
      <div className="pt-2">
        {activeTab === 'compte' && <CompteSettings />}
        {activeTab === 'generaux' && (
          <GeneralSettings settings={settings} onUpdateSettings={onUpdateSettings} />
        )}
        {activeTab === 'factures' && (
          <FacturesSettings settings={settings} onUpdateSettings={onUpdateSettings} />
        )}
        {activeTab === 'reseau' && (
          <ReseauSettings settings={settings} onUpdateSettings={onUpdateSettings} />
        )}
        {activeTab === 'import-export' && <ImportExportSettings />}
        {activeTab === 'activation' && <ActivationSettings onOpenSuperAdminLogin={() => setIsLoginModalOpen(true)} />}
        {activeTab === 'super-admin' && isSuperAdmin && <SuperAdminPanel onLogout={handleLogoutSuperAdmin} />}
        {activeTab === 'mobile' && <MobileAppSettings />}
        {activeTab === 'mises-a-jour' && <MisesAJourSettings />}
      </div>

      {/* Super Admin Login Modal */}
      <SuperAdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

