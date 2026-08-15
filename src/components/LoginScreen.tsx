import React, { useState } from 'react';
import {
  Lock,
  User,
  ShieldAlert,
  Store,
  ArrowRight,
  AlertCircle,
  Globe,
  Download,
  HelpCircle,
  X
} from 'lucide-react';
import { AppUser } from '../types';
import { verifySuperAdminCredentials } from '../lib/superAdminAuth';
import { setCurrentSessionUser } from '../lib/authSession';
import { useLanguage } from '../lib/i18n';
import { usePwaInstall } from '../lib/usePwaInstall';

interface LoginScreenProps {
  users: AppUser[];
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLoginSuccess }) => {
  const { language, setLanguage, t } = useLanguage();
  const { isInstallable, triggerInstall } = usePwaInstall();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim();

    if (!trimmedUser) {
      setError("Veuillez saisir votre nom d'utilisateur.");
      return;
    }

    // Check SuperAdmin
    if (trimmedUser.toLowerCase() === 'adlen') {
      if (verifySuperAdminCredentials(trimmedUser, password)) {
        const superAdminUser: AppUser = {
          id: 'u-superadmin',
          nomComplet: 'adlen (SuperAdmin)',
          nomUtilisateur: 'adlen',
          role: 'admin',
          statut: 'actif',
          dateCreation: new Date().toISOString().split('T')[0],
        };
        setCurrentSessionUser(superAdminUser);
        onLoginSuccess(superAdminUser);
        return;
      } else {
        setError('Mot de passe Super Admin incorrect.');
        return;
      }
    }

    // Check regular users
    const foundUser = users.find(
      (u) =>
        u.nomUtilisateur.toLowerCase() === trimmedUser.toLowerCase() ||
        u.nomComplet.toLowerCase() === trimmedUser.toLowerCase()
    );

    if (foundUser) {
      if (foundUser.motDePasse && foundUser.motDePasse !== password) {
        setError('Mot de passe incorrect pour cet utilisateur.');
        return;
      }
      setCurrentSessionUser(foundUser);
      onLoginSuccess(foundUser);
    } else {
      // Default fallback user login
      const fallbackUser: AppUser = {
        id: `u-${Date.now()}`,
        nomComplet: trimmedUser,
        nomUtilisateur: trimmedUser,
        role: 'vendeur',
        statut: 'actif',
        dateCreation: new Date().toISOString().split('T')[0],
      };
      setCurrentSessionUser(fallbackUser);
      onLoginSuccess(fallbackUser);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6 animate-fade-in">
        {/* Language Selection Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>{t('header.language')}:</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLanguage('fr')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                language === 'fr'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              FR 🇫🇷
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                language === 'ar'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              العربية 🇩🇿
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              EN 🇬🇧
            </button>
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 mb-1">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>Vendeo POS</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                v2.4
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t('login.subtitle')}
            </p>

            {isInstallable && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={triggerInstall}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/25 border border-emerald-400/30 transition-all active:scale-95 animate-pulse"
                >
                  <Download className="w-4 h-4" />
                  <span>Installer l'application (PWA)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
              {t('login.username')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="Ex: COCO, adlen, ..."
                className="w-full h-12 pl-10 pr-4 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                {t('login.password')}
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline transition-all"
              >
                {t('login.forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full h-12 pl-10 pr-4 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full h-12 mt-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <span>{t('login.submit')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500">
            © 2026 Vendeo POS System — Session sécurisée et chiffrée
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-amber-400 pt-1">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <HelpCircle className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-extrabold text-white text-base">
                {t('login.forgotPassword')}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {t('login.forgotPasswordDesc')}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
