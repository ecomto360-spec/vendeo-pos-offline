import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  RefreshCw,
  Printer,
  Rocket,
  Send,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  Clock,
  Key,
  Plus,
  AlertCircle,
  Lock,
  Calendar,
} from 'lucide-react';
import {
  getLicenseStatus,
  getStoredKeys,
  createSuperAdminKey,
  activateWithCode,
  LicenseKey,
  LicenseStatus,
} from '../../lib/license';
import { isSuperAdminAuthenticated } from '../../lib/superAdminAuth';

interface ActivationSettingsProps {
  onOpenSuperAdminLogin?: () => void;
}

export const ActivationSettings: React.FC<ActivationSettingsProps> = ({
  onOpenSuperAdminLogin,
}) => {
  // HWID State
  const hwid = 'a9e72959-7727-4051-bdd3-e8349932e511';
  const [copiedHwid, setCopiedHwid] = useState(false);

  // License & Key State
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>(getLicenseStatus());
  const [keysList, setKeysList] = useState<LicenseKey[]>(getStoredKeys());
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);

  const handleToggleSuperAdmin = () => {
    if (!isSuperAdminAuthenticated()) {
      if (onOpenSuperAdminLogin) {
        onOpenSuperAdminLogin();
      } else {
        alert('Accès réservé au Super Admin (adlen). Veuillez vous connecter.');
      }
    } else {
      setShowSuperAdmin(!showSuperAdmin);
    }
  };

  // Activation Code State
  const [activationCode, setActivationCode] = useState('');
  const [activationError, setActivationError] = useState('');
  const [activationSuccessMsg, setActivationSuccessMsg] = useState('');
  const [, setOfflineModalOpen] = useState(false);

  // Purchase Request Form State
  const [storeName, setStoreName] = useState('فانديو ديجيتال سيرفيس');
  const [phone, setPhone] = useState('055...');
  const [wilaya, setWilaya] = useState('');
  const [commune, setCommune] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Countdown Timer State
  const [timerSeconds, setTimerSeconds] = useState(8423); // ~ 2h 20m 23s

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      // Refresh license status dynamically
      setLicenseStatus(getLicenseStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `02:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const handleCopyHwid = () => {
    navigator.clipboard.writeText(hwid);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2500);
  };

  const handleActivateNow = (e: React.FormEvent) => {
    e.preventDefault();
    const res = activateWithCode(activationCode);
    if (res.success) {
      setActivationError('');
      setActivationSuccessMsg(res.message);
      setLicenseStatus(getLicenseStatus());
      setKeysList(getStoredKeys());
    } else {
      setActivationSuccessMsg('');
      setActivationError(res.message);
    }
  };

  const handleGenerateKey = (days: number) => {
    createSuperAdminKey(days);
    setKeysList(getStoredKeys());
  };

  const handleCopyAndUseKey = (keyObj: LicenseKey) => {
    navigator.clipboard.writeText(keyObj.key);
    setCopiedKeyId(keyObj.id);
    setActivationCode(keyObj.key);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleSendPurchaseRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseSuccess(true);
    setTimeout(() => setPurchaseSuccess(false), 5000);
  };

  const handleOfflineFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const res = activateWithCode('VNDO-OFFLINE-FILE-KEY');
      if (res.success) {
        setActivationSuccessMsg(res.message);
        setLicenseStatus(getLicenseStatus());
      }
      setOfflineModalOpen(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Activation de l'Application
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Veuillez saisir le code d'activation que vous avez reçu pour activer la version complète Vendeo POS.
          </p>
        </div>
        <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0" />
      </div>

      {/* Main Hero Container (Blue Theme with Offer & Purchase Request) */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Promotion & Key Features */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-700/80 text-blue-100 border border-blue-400/30 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                <span>LOGICIEL DE CAISSE #1 EN ALGÉRIE</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
                Rejoignez plus de 500 commerçants qui utilisent Vendeo POS
              </h2>

              <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
                Profitez d'un tarif préférentiel annuel avec toutes les mises à jour et le support technique inclus.
              </p>
            </div>

            {/* Exclusive Launch Offer Card */}
            <div className="bg-blue-950/80 border border-blue-400/30 rounded-2xl p-5 relative overflow-hidden shadow-inner">
              {/* Red Discount Ribbon Top Right */}
              <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-[11px] px-3 py-1 rounded-bl-2xl shadow-md tracking-wider">
                OFFRE -40%
              </div>

              <p className="text-xs font-extrabold text-blue-200 tracking-wide uppercase">
                Abonnement Annuel Officiel
              </p>

              <div className="flex flex-wrap items-baseline gap-3 mt-2">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  6,000 <span className="text-xl font-bold text-blue-200">DZD / an</span>
                </span>
                <span className="text-sm text-blue-300/70 line-through font-semibold">
                  10,000 DZD
                </span>
              </div>

              {/* Countdown Timer */}
              <div className="mt-4 inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-blue-900/90 border border-blue-400/30 text-xs font-mono font-bold text-amber-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-blue-100 font-sans text-xs">Offre limitée : se termine dans</span>
                <span className="text-amber-300 font-extrabold tracking-wider text-sm">
                  {formatCountdown(timerSeconds)}
                </span>
              </div>
            </div>

            {/* 4 Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold pt-1">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-amber-300" />
                </div>
                <span>Facturation ultra-rapide</span>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 text-cyan-300" />
                </div>
                <span>Mises à jour gratuites</span>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4 text-blue-300" />
                </div>
                <span>Toutes les imprimantes supportées</span>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Rocket className="w-4 h-4 text-sky-300" />
                </div>
                <span>Fonctionne 100% hors-ligne</span>
              </div>
            </div>
          </div>

          {/* Right Column: Send Purchase Request Form */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
              <div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  Demander une clé d'activation
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Envoyez vos coordonnées pour obtenir votre clé d'activation officielle.
                </p>
              </div>

              {purchaseSuccess ? (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold space-y-1 animate-fade-in text-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto" />
                  <p className="text-sm font-extrabold text-blue-900">Demande envoyée avec succès !</p>
                  <p className="text-slate-600 font-normal">Notre équipe commerciale ECOM360 vous contactera rapidement par téléphone.</p>
                </div>
              ) : (
                <form onSubmit={handleSendPurchaseRequest} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                      NOM / MAGASIN
                    </label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Nom du magasin"
                      className="w-full h-11 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                      TÉLÉPHONE
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="055..."
                      className="w-full h-11 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                        WILAYA
                      </label>
                      <input
                        type="text"
                        value={wilaya}
                        onChange={(e) => setWilaya(e.target.value)}
                        placeholder="Wilaya"
                        className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                        COMMUNE
                      </label>
                      <input
                        type="text"
                        value={commune}
                        onChange={(e) => setCommune(e.target.value)}
                        placeholder="Commune"
                        className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Envoyer la demande</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Divider */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
        <span className="flex-shrink mx-4 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-800">
          Entrez votre code d'activation
        </span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
      </div>

      {/* Activation Code & HWID Box */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        {/* HWID Device ID */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            ID DE L'APPAREIL (HWID)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={hwid}
              className="flex-1 h-12 px-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs sm:text-sm font-bold focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyHwid}
              title="Copier l'ID de l'appareil"
              className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 transition-all active:scale-95"
            >
              {copiedHwid ? <Check className="w-5 h-5 text-blue-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Activation Code Form & Status */}
        {isSuperAdminAuthenticated() ? (
          <div className="p-5 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center justify-between gap-4 text-purple-900 dark:text-purple-100 shadow-sm">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-8 h-8 text-purple-600 shrink-0" />
              <div>
                <p className="font-extrabold text-base">Accès Super Admin - Gratuit & Illimité !</p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5 font-medium">
                  Vous êtes connecté en tant que Super Admin. Vous avez un accès complet, gratuit et permanent à l'ensemble de l'application sans aucune limitation de durée ni version d'essai.
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-extrabold text-xs shrink-0 shadow-sm">
              Accès Illimité
            </span>
          </div>
        ) : licenseStatus.isActivated ? (
          <div className="p-5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between gap-4 text-blue-900 dark:text-blue-100">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-8 h-8 text-blue-600 shrink-0" />
              <div>
                <p className="font-extrabold text-base">Licence Active avec Succès !</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5 font-medium">
                  Votre licence Vendeo POS est active jusqu'au <span className="font-bold underline">{licenseStatus.formattedExpiration}</span> ({licenseStatus.daysRemaining} jours restants).
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs shrink-0 shadow-sm">
              Licence Active
            </span>
          </div>
        ) : (
          <form onSubmit={handleActivateNow} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                CODE D'ACTIVATION
              </label>
              <input
                type="text"
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value);
                  setActivationError('');
                  setActivationSuccessMsg('');
                }}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full h-12 px-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-500/70 dark:border-blue-500 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              />
            </div>

            {activationError && (
              <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200 dark:border-red-900">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{activationError}</span>
              </div>
            )}

            {activationSuccessMsg && (
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
                <span>{activationSuccessMsg}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Activer Maintenant</span>
              </button>

              {licenseStatus.type === 'trial_active' ? (
                <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Version d'Essai (48h) : {licenseStatus.hoursRemaining}h restantes</span>
                </span>
              ) : (
                <span className="text-xs font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-red-500" />
                  <span>Essai 48h Expiré - Activation Requise</span>
                </span>
              )}
            </div>
          </form>
        )}

        {/* Offline File Activation Link */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Activer via Fichier (Hors Ligne)</span>
            <input
              type="file"
              accept=".lic,.key,.json"
              onChange={handleOfflineFileSelect}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleToggleSuperAdmin}
            className="text-xs font-extrabold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-blue-600" />
            <span>{showSuperAdmin ? 'Masquer Panneau Super Admin' : 'Panneau Super Admin (Générateur)'}</span>
          </button>
        </div>
      </div>

      {/* SUPER ADMIN KEY GENERATION PANEL */}
      {showSuperAdmin && (
        <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-400" />
                <span>Espace Super Admin — Génération de Clés d'Activation</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Générez des tokens de licence sécurisés pour vos clients Vendeo POS.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
              MODE ADMINISTRATEUR
            </span>
          </div>

          {/* 3 Preset Generation Buttons */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
              Générer une nouvelle clé :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleGenerateKey(3)}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all active:scale-95 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white group-hover:text-blue-400">Générer Clé 3 jours</span>
                  <Plus className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Durée : 3 Jours (Test rapide)</p>
              </button>

              <button
                type="button"
                onClick={() => handleGenerateKey(90)}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all active:scale-95 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white group-hover:text-blue-400">Générer Clé 90 jours</span>
                  <Plus className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Durée : 90 Jours (3 Mois)</p>
              </button>

              <button
                type="button"
                onClick={() => handleGenerateKey(365)}
                className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-left transition-all active:scale-95 shadow-md shadow-blue-600/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm">Générer Clé 365 jours</span>
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <p className="text-[11px] text-blue-100 mt-1">Durée : 1 An (Postes illimités)</p>
              </button>
            </div>
          </div>

          {/* Table / List of Generated Keys */}
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Registre des Clés Générées ({keysList.length})</span>
            </h5>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {keysList.map((k) => (
                <div
                  key={k.id}
                  className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-blue-300 tracking-wider">
                        {k.key}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          k.status === 'used'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {k.status === 'used' ? 'UTILISÉE' : 'DISPONIBLE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{k.label}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(k.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyAndUseKey(k)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
                  >
                    {copiedKeyId === k.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Copiée !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier & Remplir</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Credits Line */}
      <div className="flex items-center justify-center gap-2 pt-4 pb-2 text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
        <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
        <span>ecom360 - VENDEO POS</span>
        <span>•</span>
        <span>1.5.1</span>
      </div>
    </div>
  );
};
