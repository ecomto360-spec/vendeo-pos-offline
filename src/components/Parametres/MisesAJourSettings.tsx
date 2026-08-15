import React, { useState, useEffect } from 'react';
import { 
  CloudCheck, 
  RefreshCw, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  Globe, 
  ArrowUpCircle,
  Clock,
  ShieldCheck,
  Info
} from 'lucide-react';

export const MisesAJourSettings: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for Service Worker waiting state
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          setUpdateAvailable(true);
          setStatusMessage('Une nouvelle version avec vos corrections Vercel est prête !');
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCheckForUpdates = async () => {
    setChecking(true);
    setStatusMessage('');

    try {
      if (!navigator.onLine) {
        setStatusMessage('Vous êtes hors-ligne. Veuillez vous connecter à Internet pour vérifier les mises à jour.');
        setChecking(false);
        return;
      }

      // 1. Service Worker update check
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          if (reg.waiting || reg.installing) {
            setUpdateAvailable(true);
            setStatusMessage('Nouvelle mise à jour détectée ! Vos corrections sur Vercel sont prêtes à être appliquées.');
            setChecking(false);
            setLastCheckTime(new Date().toLocaleTimeString());
            return;
          }
        }
      }

      // 2. Fetch manifest.json with cache bust
      const res = await fetch(`/manifest.json?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        setLastCheckTime(new Date().toLocaleTimeString());
        setUpdateAvailable(true); // Offer instant reload & cache purge option
        setStatusMessage('Vérification réussie avec Vercel. Cliquez ci-dessous pour forcer le chargement de la dernière version.');
      } else {
        setStatusMessage('Impossible de contacter le serveur Vercel. Réessayez dans un moment.');
      }
    } catch (e) {
      console.error('[Update] Check failed:', e);
      setStatusMessage('Erreur lors de la vérification. Assurez-vous d’être connecté à Internet.');
    } finally {
      setChecking(false);
    }
  };

  const handleApplyUpdate = async () => {
    setUpdating(true);
    try {
      // 1. Send CLEAR_CACHE & SKIP_WAITING to Service Worker
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          if (reg.active) {
            reg.active.postMessage({ type: 'CLEAR_CACHE' });
            reg.active.postMessage({ type: 'SKIP_WAITING' });
          }
          await reg.unregister();
        }
      }

      // 2. Purge browser caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }

      // 3. Force hard reload from server
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      console.error('[Update] Purge failed:', e);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Header */}
      <div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-blue-500" />
          <span>Mise à jour Système</span>
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Synchronisez et appliquez instantanément les dernières corrections apportées depuis Google AI Studio & Vercel.
        </p>
      </div>

      {/* Main Status Container */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-8">
        {/* Status Badge Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-700/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CloudCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Version de l'application
              </p>
              <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Vendeo POS v2.5</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  PWA / Live
                </span>
              </h4>
            </div>
          </div>

          {/* Network status chip */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Connecté à Vercel</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Mode Hors-ligne</span>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Status Display Box */}
        <div className="text-center space-y-4 py-4">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              {updating ? (
                <RefreshCw className="w-10 h-10 animate-spin" />
              ) : updateAvailable ? (
                <Sparkles className="w-10 h-10 text-amber-300 animate-bounce" />
              ) : (
                <ShieldCheck className="w-10 h-10" />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">
              {updating
                ? 'Installation des modifications...'
                : updateAvailable
                ? 'Mise à jour disponible !'
                : 'Votre application est prête'}
            </h4>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {updateAvailable
                ? 'Cliquez sur le bouton ci-dessous pour recharger l’application avec la dernière version Vercel.'
                : 'Chaque modification faite dans Google AI Studio et envoyée sur GitHub / Vercel peut être appliquée en 1-clic.'}
            </p>
          </div>

          {statusMessage && (
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 py-2.5 px-4 rounded-2xl max-w-lg mx-auto">
              <Info className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {lastCheckTime && (
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Dernière vérification à {lastCheckTime}</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Check Button */}
          <button
            type="button"
            onClick={handleCheckForUpdates}
            disabled={checking || updating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-sm shadow-sm active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Vérification en cours...' : 'Vérifier sur Vercel'}</span>
          </button>

          {/* Apply / Force Update Button */}
          <button
            type="button"
            onClick={handleApplyUpdate}
            disabled={updating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {updating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Actualisation...</span>
              </>
            ) : (
              <>
                <ArrowUpCircle className="w-5 h-5 text-blue-200" />
                <span>Mettre à jour & Appliquer les corrections</span>
              </>
            )}
          </button>
        </div>

        {/* Informative Guide Footer */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Comment fonctionnent les mises à jour ?</span>
          </p>
          <ol className="list-decimal list-inside space-y-1 pl-1 leading-relaxed">
            <li>Vous faites vos modifications ou corrections dans <strong>Google AI Studio</strong>.</li>
            <li>Vous exportez vers votre dépôt GitHub <code>ecomto360-spec/vendeo-pos-offline</code>.</li>
            <li><strong>Vercel</strong> déploie automatiquement la nouvelle version sur <code>vendeo-pos.vercel.app</code>.</li>
            <li>Sur votre application, cliquez sur <strong>"Mettre à jour & Appliquer les corrections"</strong> pour vider le cache local et afficher immédiatement la nouvelle version !</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
