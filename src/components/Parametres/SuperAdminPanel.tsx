import React, { useState } from 'react';
import {
  ShieldAlert,
  Key,
  Copy,
  Check,
  Plus,
  Lock,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  Zap,
  Trash2,
  Download,
  Terminal,
  LogOut,
} from 'lucide-react';
import {
  getStoredKeys,
  createSuperAdminKey,
  saveStoredKeys,
  LicenseKey,
} from '../../lib/license';
import { logoutSuperAdmin } from '../../lib/superAdminAuth';

interface SuperAdminPanelProps {
  onLogout?: () => void;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ onLogout }) => {
  const [keysList, setKeysList] = useState<LicenseKey[]>(getStoredKeys());
  const [lastGeneratedKey, setLastGeneratedKey] = useState<LicenseKey | null>(null);
  const [encryptedToken, setEncryptedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleLogoutClick = () => {
    logoutSuperAdmin();
    if (onLogout) {
      onLogout();
    }
  };

  // Helper to construct a encrypted token representation
  const generateEncryptedTokenString = (keyObj: LicenseKey) => {
    const rawData = `${keyObj.key}:${keyObj.durationDays}:${keyObj.createdAt}:VENDEO_POS_SALT_2026`;
    // Simple hex encoding for visual crypto representation
    const hexEnc = Array.from(rawData)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
    return `ENC-VNDO-${keyObj.durationDays}D-${hexEnc.substring(0, 16).toUpperCase()}-${keyObj.key}`;
  };

  const handleGenerateKey = (durationDays: number) => {
    const newKey = createSuperAdminKey(durationDays);
    const updated = getStoredKeys();
    setKeysList(updated);
    setLastGeneratedKey(newKey);
    const tokenStr = generateEncryptedTokenString(newKey);
    setEncryptedToken(tokenStr);
    setCopiedToken(false);
  };

  const handleCopyEncryptedToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleCopyKeyOnly = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleDeleteKey = (id: string) => {
    const updated = keysList.filter((k) => k.id !== id);
    saveStoredKeys(updated);
    setKeysList(updated);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-blue-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            <span>ACCÈS ADMINISTRATEUR — adlen</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            SuperAdminPanel
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Génération et administration des clés d'activation cryptées pour Vendeo POS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogoutClick}
            className="px-5 py-3 rounded-2xl bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-500/40 text-xs font-extrabold flex items-center gap-2 transition-all active:scale-95 shadow-lg"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Se Déconnecter</span>
          </button>
          <Key className="w-10 h-10 text-blue-400 shrink-0 hidden sm:block" />
        </div>
      </div>

      {/* Main Action Card with 3 Requested Buttons */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-6">
        <div>
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Générer un Token / Clé d'Activation</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choisissez la durée de validité ci-dessous pour générer un token crypté instantanément :
          </p>
        </div>

        {/* 3 Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleGenerateKey(3)}
            className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-left transition-all active:scale-95 group shadow-sm flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                VERSION TEST
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Générer Clé 3 jours
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Valable 72 heures pour tests d'évaluation
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-extrabold text-blue-600 dark:text-blue-400">
              <Plus className="w-4 h-4" />
              <span>Générer maintenant</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleGenerateKey(90)}
            className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-left transition-all active:scale-95 group shadow-sm flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                ABONNEMENT TRIMESTRIEL
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Générer Clé 90 jours
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Valable 3 mois (90 jours consécutifs)
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-extrabold text-blue-600 dark:text-blue-400">
              <Plus className="w-4 h-4" />
              <span>Générer maintenant</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleGenerateKey(365)}
            className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-left transition-all active:scale-95 group shadow-lg shadow-blue-600/25 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-100 uppercase tracking-wider">
                OFFICIEL ANNUEL
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-white">
                Générer Clé 365 jours
              </p>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Licence officielle 1 an (Accès complet)
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-xs font-extrabold text-white">
              <Plus className="w-4 h-4" />
              <span>Générer maintenant</span>
            </div>
          </button>
        </div>

        {/* Display Generated Token Box */}
        {lastGeneratedKey && encryptedToken && (
          <div className="mt-6 p-6 rounded-2xl bg-slate-900 text-white border-2 border-blue-500 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                <h5 className="font-extrabold text-sm text-blue-300">
                  TOKEN CRYPTÉ GÉNÉRÉ AVEC SUCCÈS
                </h5>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
                {lastGeneratedKey.durationDays} JOURS
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                TOKEN CRYPTÉ COMPLET :
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={encryptedToken}
                  className="flex-1 h-12 px-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs font-bold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopyEncryptedToken(encryptedToken)}
                  className="h-12 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shrink-0"
                >
                  {copiedToken ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copier Token</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Clé standard à fournir au client :</span>
                <p className="font-mono font-bold text-base text-amber-300">
                  {lastGeneratedKey.key}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Statut de la clé :</span>
                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Prête à être activée
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated Keys History List */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Registre Général des Clés ({keysList.length})</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historique complet de toutes les clés d'activation générées.
            </p>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
          {keysList.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">
              Aucune clé générée pour le moment.
            </p>
          ) : (
            keysList.map((k) => (
              <div
                key={k.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white tracking-wider">
                      {k.key}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        k.status === 'used'
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {k.status === 'used' ? 'UTILISÉE' : 'DISPONIBLE'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{k.label}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Créée le {new Date(k.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyKeyOnly(k.key, k.id)}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    {copiedKeyId === k.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                        <span>Copiée</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteKey(k.id)}
                    title="Supprimer la clé"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
