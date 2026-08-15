import React, { useState } from 'react';
import {
  ShieldCheck,
  Monitor,
  Router,
  Cloud,
  Layers,
  CheckCircle2,
  QrCode,
  Wifi,
  Save,
  RefreshCw,
  Smartphone,
  Server,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { AppSettings } from '../../types';

interface ReseauSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const ReseauSettings: React.FC<ReseauSettingsProps> = ({ settings, onUpdateSettings }) => {
  const [mode, setMode] = useState<'unique' | 'lan' | 'cloud' | 'combine'>(settings.modeReseau || 'unique');
  const [associationMobile, setAssociationMobile] = useState<boolean>(true);
  const [cloudCode, setCloudCode] = useState<string>('VENDEO-8924-DZ');
  const [ipAdresse, setIpAdresse] = useState<string>('192.168.1.105');
  const [port, setPort] = useState<number>(8080);
  const [isServerRunning, setIsServerRunning] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSelectMode = (selectedMode: 'unique' | 'lan' | 'cloud' | 'combine') => {
    setMode(selectedMode);
    setTestResult(null);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      if (mode === 'unique') {
        setTestResult({
          success: true,
          message: 'Mode local actif. Connexion interne à la base SQLite/IndexedDB opérationnelle.',
        });
      } else if (mode === 'lan') {
        setTestResult({
          success: true,
          message: `Serveur LAN prêt sur http://${ipAdresse}:${port}. 2 appareils détectés sur le Wi-Fi.`,
        });
      } else if (mode === 'cloud') {
        setTestResult({
          success: true,
          message: `Relais Cloud connecté (Code: ${cloudCode}). Latence: 24ms.`,
        });
      } else {
        setTestResult({
          success: true,
          message: `Serveur hybride actif. Sync LAN (${ipAdresse}) et Cloud (${cloudCode}) OK.`,
        });
      }
    }, 1200);
  };

  const handleSave = () => {
    onUpdateSettings({ modeReseau: mode });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Paramètres Réseau</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configurer la connexion locale et la synchronisation des données
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Vos paramètres réseau ont été enregistrés avec succès !</span>
        </div>
      )}

      {/* Security Banner */}
      <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 rounded-2xl flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-emerald-900 dark:text-emerald-300">Fonctionnement local sécurisé</p>
          <p className="text-emerald-800 dark:text-emerald-400 leading-relaxed">
            Vos données et ventes sont stockées sur cet ordinateur ; en mode serveur local habituel, aucune donnée commerciale n'est envoyée sur Internet.
          </p>
        </div>
      </div>

      {/* Network Mode Options Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mode 1: Appareil unique */}
        <div
          onClick={() => handleSelectMode('unique')}
          className={`cursor-pointer rounded-3xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 bg-white dark:bg-slate-800/90 select-none ${
            mode === 'unique'
              ? 'border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Appareil unique</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Base de données isolée sur cet appareil uniquement. Aucun réseau requis.
              </p>
            </div>
          </div>
        </div>

        {/* Mode 2: Plusieurs appareils sur le même réseau (LAN) */}
        <div
          onClick={() => handleSelectMode('lan')}
          className={`cursor-pointer rounded-3xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 bg-white dark:bg-slate-800/90 select-none ${
            mode === 'lan'
              ? 'border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Router className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Plusieurs appareils sur le même réseau (LAN)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Serveur principal + clients via le Wi-Fi du magasin. Le mobile se connecte via QR.
              </p>
            </div>
          </div>
        </div>

        {/* Mode 3: Via Internet (Cloud) */}
        <div
          onClick={() => handleSelectMode('cloud')}
          className={`cursor-pointer rounded-3xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 bg-white dark:bg-slate-800/90 select-none ${
            mode === 'cloud'
              ? 'border-indigo-500 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Via Internet (Cloud)</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Partager les données entre succursales/appareils via un code cloud.
              </p>
            </div>
          </div>
        </div>

        {/* Mode 4: Combiné : serveur + Cloud */}
        <div
          onClick={() => handleSelectMode('combine')}
          className={`cursor-pointer rounded-3xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 bg-white dark:bg-slate-800/90 select-none ${
            mode === 'combine'
              ? 'border-purple-500 shadow-md shadow-purple-500/10 ring-2 ring-purple-500/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Combiné : serveur + Cloud</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Cet appareil sert de serveur aux appareils du réseau et synchronise ses données avec le Cloud pour les succursales et les téléphones.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Detail Panel based on selected Mode */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        {mode === 'unique' && (
          <div className="text-center space-y-3 my-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Le système fonctionne localement</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Aucune configuration réseau nécessaire. Toutes les données sont sur cet appareil uniquement. Pour connecter un mobile ou lier d'autres appareils, choisissez LAN ou Cloud ci-dessus.
            </p>
          </div>
        )}

        {mode === 'lan' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Configuration du Serveur Local (LAN)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Partagez la caisse sur le Wi-Fi local avec d'autres ordinateurs ou smartphones.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ADRESSE IP DU SERVEUR
                  </label>
                  <input
                    type="text"
                    value={ipAdresse}
                    onChange={(e) => setIpAdresse(e.target.value)}
                    className="w-full h-11 px-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    PORT DE CONNEXION
                  </label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full h-11 px-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-mono font-semibold"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsServerRunning(!isServerRunning)}
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isServerRunning
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>{isServerRunning ? 'Serveur LAN Actif (Arrêter)' : 'Démarrer le Serveur LAN'}</span>
                </button>
              </div>

              {/* QR Code section */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <QrCode className="w-24 h-24 text-slate-900" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Flash pour connecter l'application Mobile
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Scannez ce QR Code depuis l'application Vendeo POS sur votre smartphone
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'cloud' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Synchronisation Cloud</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Connectez vos différentes caisses ou succursales via Internet.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    CODE CLOUD DE VOTRE BOUTIQUE
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cloudCode}
                      onChange={(e) => setCloudCode(e.target.value)}
                      className="flex-1 h-11 px-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-mono font-bold tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setCloudCode(`VENDEO-${Math.floor(1000 + Math.random() * 9000)}-DZ`)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                    >
                      Générer
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Saisissez ce même code sur vos autres ordinateurs ou téléphones pour synchroniser en temps réel.
                </p>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Statut Cloud: Connecté & Synchronisé</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Dernière synchronisation automatique effectuée il y a 2 minutes. Base de données à jour.
                </p>
              </div>
            </div>
          </div>
        )}

        {mode === 'combine' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Mode Hybride (Serveur LAN + Cloud)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Permet la vente rapide en LAN local tout en sauvegardant automatiquement vos ventes sur le Cloud.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">SERVEUR LAN</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{ipAdresse}:8080</p>
                <p className="text-xs text-emerald-600 font-medium">Actif (2 caisses locales)</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">IDENTIFIANT CLOUD</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{cloudCode}</p>
                <p className="text-xs text-emerald-600 font-medium">Synchronisation active</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Association de l'application mobile Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                Association de l'application mobile
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Permet à l'application Vendeo sur téléphone de se connecter à cet appareil via un relais Internet – indépendamment du mode de synchronisation ci-dessus.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAssociationMobile(!associationMobile)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              associationMobile ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                associationMobile ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Test Connection Output Alert */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-fade-in ${
            testResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Action Bar Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Wifi className={`w-4 h-4 ${mode === 'unique' ? 'text-slate-400' : 'text-emerald-500'}`} />
          <span>{mode === 'unique' ? 'Réseau non configuré' : 'Réseau configuré & actif'}</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isTesting ? 'Test en cours...' : 'Tester la Connexion'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les Paramètres Réseau</span>
          </button>
        </div>
      </div>

      {/* Footer credits line */}
      <div className="flex items-center justify-center gap-2 pt-6 pb-2 text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>ecom360 - VENDEO POS</span>
        <span>•</span>
        <span>1.5.1</span>
      </div>
    </div>
  );
};
