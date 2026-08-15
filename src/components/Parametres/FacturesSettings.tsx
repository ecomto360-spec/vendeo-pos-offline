import React, { useState } from 'react';
import {
  FileText,
  Receipt,
  Printer,
  Barcode,
  Zap,
  Save,
  CheckCircle2,
  Check,
  Archive,
  QrCode,
  Scale,
} from 'lucide-react';
import { AppSettings } from '../../types';

interface FacturesSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const FacturesSettings: React.FC<FacturesSettingsProps> = ({ settings, onUpdateSettings }) => {
  // Invoice settings
  const [modelFacture, setModelFacture] = useState<'design1' | 'design2' | 'design3'>(
    settings.modelFacture || 'design1'
  );
  const [langueImpressionFacture, setLangueImpressionFacture] = useState<'fr' | 'ar' | 'en'>(
    settings.langueImpression || 'fr'
  );

  // Ticket / Receipt settings
  const [modelTicketDesign, setModelTicketDesign] = useState<'design1' | 'design2' | 'design3' | 'design4'>(
    settings.modelTicketDesign || 'design1'
  );
  const [langueImpressionRecu, setLangueImpressionRecu] = useState<'fr' | 'ar' | 'en'>(
    settings.langueImpressionRecu || 'fr'
  );
  const [afficherCodeBarreRecu, setAfficherCodeBarreRecu] = useState<boolean>(
    settings.afficherCodeBarreRecu ?? true
  );

  // Direct printing settings
  const [impressionSilencieuse, setImpressionSilencieuse] = useState<boolean>(
    settings.impressionSilencieuse ?? true
  );
  const [imprimanteParDefaut, setImprimanteParDefaut] = useState<string>(
    settings.imprimanteParDefaut || 'default'
  );
  const [imprimanteTicket, setImprimanteTicket] = useState<string>(
    settings.imprimanteTicket || 'default'
  );
  const [imprimanteCodeBarre, setImprimanteCodeBarre] = useState<string>(
    settings.imprimanteCodeBarre || 'default'
  );

  // Cash drawer
  const [activerTiroirCaisse, setActiverTiroirCaisse] = useState<boolean>(
    settings.activerTiroirCaisse ?? false
  );

  // Barcode Label settings
  const [etiquetteLargeur, setEtiquetteLargeur] = useState<number>(settings.etiquetteLargeur ?? 50);
  const [etiquetteHauteur, setEtiquetteHauteur] = useState<number>(settings.etiquetteHauteur ?? 30);
  const [etiquetteHauteurCodeBarres, setEtiquetteHauteurCodeBarres] = useState<number>(
    settings.etiquetteHauteurCodeBarres ?? 10
  );
  const [etiquetteAutoHauteur, setEtiquetteAutoHauteur] = useState<boolean>(
    settings.etiquetteAutoHauteur ?? true
  );

  const [etiquetteChamps, setEtiquetteChamps] = useState({
    nomMagasin: settings.etiquetteChamps?.nomMagasin ?? false,
    nomProduit: settings.etiquetteChamps?.nomProduit ?? true,
    prix: settings.etiquetteChamps?.prix ?? false,
    typePrix: settings.etiquetteChamps?.typePrix ?? false,
    codeBarre: settings.etiquetteChamps?.codeBarre ?? true,
    variantes: settings.etiquetteChamps?.variantes ?? false,
    remise: settings.etiquetteChamps?.remise ?? false,
  });

  // Scale settings
  const [activerBalanceElectronique, setActiverBalanceElectronique] = useState<boolean>(
    settings.activerBalanceElectronique ?? false
  );

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggleChamp = (key: keyof typeof etiquetteChamps) => {
    setEtiquetteChamps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onUpdateSettings({
      modelFacture,
      langueImpression: langueImpressionFacture,
      modelTicketDesign,
      langueImpressionRecu,
      afficherCodeBarreRecu,
      impressionSilencieuse,
      imprimanteParDefaut,
      imprimanteTicket,
      imprimanteCodeBarre,
      activerTiroirCaisse,
      etiquetteLargeur,
      etiquetteHauteur,
      etiquetteHauteurCodeBarres,
      etiquetteAutoHauteur,
      etiquetteChamps,
      activerBalanceElectronique,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Factures & Tickets</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Modèles de factures et tickets, paramètres du point de vente et étiquettes code-barres
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Vos modifications ont été enregistrées avec succès !</span>
        </div>
      )}

      {/* 1. Modèle de Facture Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Modèle de Facture</h4>
        </div>

        {/* Invoice Templates grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Design 1 */}
          <div
            onClick={() => setModelFacture('design1')}
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col items-center justify-center min-h-[220px] bg-slate-50/50 dark:bg-slate-900/50 ${
              modelFacture === 'design1'
                ? 'border-blue-600 dark:border-blue-500 shadow-md shadow-blue-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            {modelFacture === 'design1' && (
              <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </span>
            )}
            <div className="w-36 h-40 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 p-2 space-y-2 mb-3 shadow-inner">
              <div className="w-12 h-2.5 bg-slate-400 rounded"></div>
              <div className="w-full h-5 bg-slate-100 dark:bg-slate-700 rounded"></div>
              <div className="w-full h-14 border border-slate-200 dark:border-slate-700 rounded"></div>
              <div className="w-10 h-2 bg-slate-300 dark:bg-slate-600 ml-auto rounded"></div>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              DESIGN 1 (BASE)
            </span>
          </div>

          {/* Design 2 */}
          <div
            onClick={() => setModelFacture('design2')}
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col items-center justify-center min-h-[220px] bg-slate-50/50 dark:bg-slate-900/50 ${
              modelFacture === 'design2'
                ? 'border-blue-600 dark:border-blue-500 shadow-md shadow-blue-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            {modelFacture === 'design2' && (
              <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </span>
            )}
            <div className="w-36 h-40 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 p-2 space-y-2 mb-3 shadow-inner">
              <div className="w-full h-4 bg-slate-700 dark:bg-slate-500 rounded-sm"></div>
              <div className="w-full h-12 border border-slate-200 dark:border-slate-700 rounded"></div>
              <div className="w-12 h-2.5 bg-slate-300 dark:bg-slate-600 ml-auto rounded"></div>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              DESIGN 2 (SIMPLE)
            </span>
          </div>

          {/* Design 3 */}
          <div
            onClick={() => setModelFacture('design3')}
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col items-center justify-center min-h-[220px] bg-slate-50/50 dark:bg-slate-900/50 ${
              modelFacture === 'design3'
                ? 'border-blue-600 dark:border-blue-500 shadow-md shadow-blue-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            {modelFacture === 'design3' && (
              <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </span>
            )}
            <div className="w-36 h-40 border-2 border-slate-400 dark:border-slate-500 rounded bg-white dark:bg-slate-800 p-2 space-y-2 mb-3 shadow-inner">
              <div className="grid grid-cols-2 gap-1">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="w-full h-14 border border-slate-300 dark:border-slate-600 rounded"></div>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              DESIGN 3 (ENCADRÉ)
            </span>
          </div>
        </div>

        {/* Invoice Language Selection */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
            Langue d'impression des factures :
          </label>
          <select
            value={langueImpressionFacture}
            onChange={(e) => setLangueImpressionFacture(e.target.value as 'fr' | 'ar' | 'en')}
            className="w-full sm:w-80 h-11 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer leading-normal"
          >
            <option value="fr">الفرنسية (Français)</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="en">English (English)</option>
          </select>
        </div>
      </div>

      {/* 2. Modèle de Ticket Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Modèle de Ticket</h4>
        </div>

        {/* Ticket Templates grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ticket Design 1 */}
          <div
            onClick={() => setModelTicketDesign('design1')}
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col items-center justify-center min-h-[200px] bg-slate-50/50 dark:bg-slate-900/50 ${
              modelTicketDesign === 'design1'
                ? 'border-emerald-500 dark:border-emerald-500 shadow-md shadow-emerald-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="w-28 h-32 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 p-2 space-y-2 mb-3 shadow-inner">
              <div className="w-10 h-2 bg-slate-400 rounded mx-auto"></div>
              <div className="w-full h-8 border border-slate-200 dark:border-slate-700 rounded"></div>
              <div className="w-full h-8 border border-slate-200 dark:border-slate-700 rounded"></div>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Ticket (Design 1)</span>
          </div>

          {/* Ticket Design 2 */}
          <div
            onClick={() => setModelTicketDesign('design2')}
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col items-center justify-center min-h-[200px] bg-slate-50/50 dark:bg-slate-900/50 ${
              modelTicketDesign === 'design2'
                ? 'border-emerald-500 dark:border-emerald-500 shadow-md shadow-emerald-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="w-28 h-32 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 p-2 space-y-2 mb-3 shadow-inner">
              <div className="w-full h-3 bg-slate-700 rounded-sm"></div>
              <div className="w-full h-8 border border-slate-200 dark:border-slate-700 rounded"></div>
              <div className="w-full h-8 border border-slate-200 dark:border-slate-700 rounded"></div>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Ticket (Design 2)</span>
          </div>

          {/* Ticket Design 3 */}
          <div
            onClick={() => setModelTicketDesign('design3')}
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col items-center justify-center min-h-[200px] bg-slate-50/50 dark:bg-slate-900/50 ${
              modelTicketDesign === 'design3'
                ? 'border-emerald-500 dark:border-emerald-500 shadow-md shadow-emerald-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="w-28 h-32 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 p-2 space-y-2 mb-3 shadow-inner flex flex-col justify-between">
              <div className="w-full h-3 bg-black rounded-sm"></div>
              <div className="w-full h-10 border border-slate-200 dark:border-slate-700 rounded"></div>
              <div className="w-full h-4 bg-black rounded-sm"></div>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Ticket (Design 3)</span>
          </div>

          {/* Design 4: Bon de livraison A4 */}
          <div
            onClick={() => setModelTicketDesign('design4')}
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col items-center justify-center min-h-[200px] bg-slate-50/50 dark:bg-slate-900/50 ${
              modelTicketDesign === 'design4'
                ? 'border-emerald-500 dark:border-emerald-500 shadow-md shadow-emerald-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="w-28 h-32 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 p-2 space-y-2 mb-3 shadow-inner">
              <div className="flex justify-between items-center">
                <div className="w-8 h-2 bg-slate-600 rounded"></div>
                <div className="w-4 h-4 rounded-full border border-slate-400"></div>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded"></div>
              <div className="w-full h-12 border border-slate-200 dark:border-slate-700 rounded"></div>
              <div className="w-10 h-2 bg-slate-300 ml-auto rounded"></div>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Bon de livraison A4 (Design 4)</span>
          </div>
        </div>

        {/* Ticket Language Selection */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
            Langue d'impression des reçus :
          </label>
          <select
            value={langueImpressionRecu}
            onChange={(e) => setLangueImpressionRecu(e.target.value as 'fr' | 'ar' | 'en')}
            className="w-full sm:w-80 h-11 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer leading-normal"
          >
            <option value="fr">الفرنسية (Français)</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="en">English (English)</option>
          </select>
        </div>

        {/* Barcode on receipt toggle */}
        <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white text-sm">Afficher le code-barres sur le reçu</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Imprimer un code-barres unique pour le numéro de commande au bas du reçu pour faciliter la recherche.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAfficherCodeBarreRecu(!afficherCodeBarreRecu)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              afficherCodeBarreRecu ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                afficherCodeBarreRecu ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Paramètres d'Impression Directe Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Paramètres d'Impression Directe</h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Silent print toggle card */}
          <div className="p-5 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">Impression Silencieuse Directe</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Contourner l'aperçu et imprimer directement sur l'imprimante par défaut
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setImpressionSilencieuse(!impressionSilencieuse)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                impressionSilencieuse ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  impressionSilencieuse ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Printer Dropdowns with clean height and line-height so text is NEVER cut off */}
          <div className="space-y-4">
            {/* Default Printer */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                Imprimante par défaut pour tous les documents
              </label>
              <select
                value={imprimanteParDefaut}
                onChange={(e) => setImprimanteParDefaut(e.target.value)}
                className="w-full h-12 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer leading-normal"
              >
                <option value="default">Imprimante par Défaut du Système</option>
                <option value="pdf">Microsoft Print to PDF</option>
                <option value="pos80">POS-80 Series Thermal Printer</option>
                <option value="xp365">Xprinter XP-365B Label Printer</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Utilisée pour tous les types de documents (factures, bons, reçus de paiement, rapports...).
              </p>
            </div>

            {/* Receipt Printer */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                Imprimante du ticket de caisse
              </label>
              <select
                value={imprimanteTicket}
                onChange={(e) => setImprimanteTicket(e.target.value)}
                className="w-full h-12 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer leading-normal"
              >
                <option value="default">Utiliser l'imprimante par défaut ci-dessus</option>
                <option value="pos80">POS-80 Thermal Printer</option>
                <option value="xp365">Xprinter XP-365B</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Imprimante dédiée uniquement au ticket de caisse (ex. imprimante thermique). Si vide, l'imprimante ci-dessus est utilisée.
              </p>
            </div>

            {/* Barcode Printer */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                Imprimante de code-barres
              </label>
              <select
                value={imprimanteCodeBarre}
                onChange={(e) => setImprimanteCodeBarre(e.target.value)}
                className="w-full h-12 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer leading-normal"
              >
                <option value="default">Utiliser l'imprimante par défaut ci-dessus</option>
                <option value="xp365">Xprinter XP-365B Label Printer</option>
                <option value="pos80">POS-80 Series</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Imprimante dédiée uniquement aux étiquettes code-barres (ex. imprimante d'étiquettes thermique). Si vide, l'imprimante ci-dessus est utilisée.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tiroir-caisse Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Archive className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Tiroir-caisse</h4>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Connecter le programme au tiroir-caisse pour l'ouvrir manuellement (touche Échap) ou automatiquement après chaque vente.
        </p>

        <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white text-sm">Activer le tiroir-caisse</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Autoriser l'ouverture du tiroir depuis le programme
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiverTiroirCaisse(!activerTiroirCaisse)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              activerTiroirCaisse ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                activerTiroirCaisse ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 5. Paramètres de l'étiquette code-barres Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Paramètres de l'étiquette code-barres</h4>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Dimensions et contenu par défaut affichés automatiquement à chaque impression.
        </p>

        {/* Dimensions Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              LARGEUR (MM)
            </label>
            <input
              type="number"
              value={etiquetteLargeur}
              onChange={(e) => setEtiquetteLargeur(Number(e.target.value))}
              className="w-full h-11 px-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              HAUTEUR (MM)
            </label>
            <input
              type="number"
              value={etiquetteHauteur}
              onChange={(e) => setEtiquetteHauteur(Number(e.target.value))}
              className="w-full h-11 px-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                HAUTEUR DU CODE-BARRES (MM)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-blue-600 dark:text-blue-400">
                <input
                  type="checkbox"
                  checked={etiquetteAutoHauteur}
                  onChange={(e) => setEtiquetteAutoHauteur(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Auto</span>
              </label>
            </div>
            <input
              type="number"
              value={etiquetteHauteurCodeBarres}
              onChange={(e) => setEtiquetteHauteurCodeBarres(Number(e.target.value))}
              disabled={etiquetteAutoHauteur}
              className="w-full h-11 px-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-50"
            />
            <p className="text-[10px] text-slate-400">
              Choisit automatiquement la meilleure hauteur pour remplir l'espace restant tout en gardant le code-barres lisible.
            </p>
          </div>
        </div>

        {/* Checkboxes Card Grid */}
        <div className="p-5 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'nomMagasin', label: 'Nom du magasin' },
              { key: 'nomProduit', label: 'Nom du produit' },
              { key: 'prix', label: 'Prix' },
              { key: 'typePrix', label: 'Type de prix' },
              { key: 'codeBarre', label: 'Numéro du code-barres' },
              { key: 'variantes', label: 'Variantes' },
              { key: 'remise', label: 'Remise' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer select-none py-1 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={etiquetteChamps[key as keyof typeof etiquetteChamps]}
                  onChange={() => handleToggleChamp(key as keyof typeof etiquetteChamps)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Paramètres de la balance électronique Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Paramètres de la balance électronique</h4>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiverBalanceElectronique(!activerBalanceElectronique)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              activerBalanceElectronique ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                activerBalanceElectronique ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Lorsque cette option est activée, le système analyse les étiquettes de balance (PLU + poids/prix) lors du scan et ajoute le produit au panier automatiquement.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          type="button"
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
        >
          <Save className="w-5 h-5" />
          <span>Enregistrer les factures</span>
        </button>
      </div>

      {/* Footer credits line */}
      <div className="flex items-center justify-center gap-2 pt-4 pb-2 text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>ecom360 - VENDEO POS</span>
        <span>•</span>
        <span>1.5.1</span>
      </div>
    </div>
  );
};
