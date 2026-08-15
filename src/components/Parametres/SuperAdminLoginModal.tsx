import React, { useState } from 'react';
import { ShieldAlert, KeyRound, User, Lock, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { verifySuperAdminCredentials } from '../../lib/superAdminAuth';

interface SuperAdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SuperAdminLoginModal: React.FC<SuperAdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifySuperAdminCredentials(username, password)) {
      setErrorMsg('');
      setUsername('');
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setErrorMsg('Nom d\'utilisateur ou mot de passe Super Admin incorrect.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl space-y-6">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Connexion Super Admin</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Accès réservé aux administrateurs système
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Utilisateur
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Utilisateur Super Admin"
                className="w-full h-12 pl-10 pr-4 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="••••••••"
                className="w-full h-12 pl-10 pr-4 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>Se Connecter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
