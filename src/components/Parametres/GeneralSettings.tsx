import React, { useState } from 'react';
import {
  Globe,
  Tag,
  Plus,
  X,
  Upload,
  Save,
  CheckCircle2,
  Store,
  Calculator,
  Edit3,
  Landmark,
  PackageX,
  ShieldAlert,
  Sigma,
  Receipt,
} from 'lucide-react';
import { AppSettings } from '../../types';

interface GeneralSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, onUpdateSettings }) => {
  // Local form states
  const [langue, setLangue] = useState<'fr' | 'ar' | 'en'>(settings.langue);
  const [categories, setCategories] = useState<string[]>(settings.categoriesDepenses || []);
  const [newCat, setNewCat] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl || null);

  // Store information state
  const [nomMagasin, setNomMagasin] = useState(settings.nomMagasin || 'لومينا ديجيتال سيرفيس');
  const [descriptionMagasin, setDescriptionMagasin] = useState(settings.descriptionMagasin || '');
  const [adresseMagasin, setAdresseMagasin] = useState(settings.adresseMagasin || 'Exemple : Rue Didouche Mourad, Alger');
  const [telephoneMagasin, setTelephoneMagasin] = useState(settings.telephoneMagasin || '05XX XX XX');
  const [telephoneFixe, setTelephoneFixe] = useState(settings.telephoneFixe || '021 XX XX XX');
  const [emailMagasin, setEmailMagasin] = useState(settings.emailMagasin || 'contact@example.com');
  const [rc, setRc] = useState(settings.rc || '');
  const [nif, setNif] = useState(settings.nif || '');
  const [ai, setAi] = useState(settings.ai || '');
  const [nis, setNis] = useState(settings.nis || '');
  const [tvaGlobal, setTvaGlobal] = useState<number>(settings.tvaGlobal ?? 0);

  // Point of Sale Settings
  const [venteRapide, setVenteRapide] = useState<boolean>(settings.venteRapide ?? true);
  const [modeComptabiliteFinanciere, setModeComptabiliteFinanciere] = useState<boolean>(
    settings.modeComptabiliteFinanciere ?? false
  );
  const [autoriserStockNegatif, setAutoriserStockNegatif] = useState<boolean>(
    settings.autoriserStockNegatif ?? false
  );
  const [demanderConfirmationVenteSansStock, setDemanderConfirmationVenteSansStock] = useState<boolean>(
    settings.demanderConfirmationVenteSansStock ?? true
  );
  const [tarificationPrixMoyen, setTarificationPrixMoyen] = useState<boolean>(
    settings.tarificationPrixMoyen ?? false
  );
  const [activerDroitDeTimbre, setActiverDroitDeTimbre] = useState<boolean>(
    settings.activerDroitDeTimbre ?? false
  );

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    if (!categories.includes(newCat.trim())) {
      setCategories([...categories, newCat.trim()]);
      setNewCat('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleSave = () => {
    onUpdateSettings({
      langue,
      categoriesDepenses: categories,
      logoUrl: logoPreview || undefined,
      nomMagasin,
      descriptionMagasin,
      adresseMagasin,
      telephoneMagasin,
      telephoneFixe,
      emailMagasin,
      rc,
      nif,
      ai,
      nis,
      tvaGlobal,
      venteRapide,
      modeComptabiliteFinanciere,
      autoriserStockNegatif,
      demanderConfirmationVenteSansStock,
      tarificationPrixMoyen,
      activerDroitDeTimbre,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Paramètres généraux</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Langue, informations de la boutique, logo et imprimante
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Vos modifications ont été enregistrées avec succès !</span>
        </div>
      )}

      {/* Top Section: Language & Expenses (Left 2 cols), Logo & Save (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language Selection Card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Paramètres de langue</h4>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Sélectionner la Langue de l'Interface
              </label>
              <select
                value={langue}
                onChange={(e) => {
                  const newLang = e.target.value as 'fr' | 'ar' | 'en';
                  setLangue(newLang);
                  onUpdateSettings({ langue: newLang });
                }}
                className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
              >
                <option value="fr">Français (French)</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="en">English (US)</option>
              </select>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Le changement de langue sera appliqué immédiatement.
              </p>
            </div>
          </div>

          {/* Expense Categories Card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Catégories de dépenses</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Liste partagée utilisée pour « Dépense de caisse » et « Ajouter une dépense ».
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                placeholder="Nom de la nouvelle catégorie..."
                className="flex-1 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
              <button
                onClick={handleAddCategory}
                type="button"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>

            {/* Category Tag Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-600/80"
                >
                  <span>{cat}</span>
                  <button
                    onClick={() => handleRemoveCategory(cat)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Logo Upload & Save Button */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4 text-center">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">
              LOGO DU MAGASIN
            </h4>

            <label className="block border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-6 cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 transition-all group">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              {logoPreview ? (
                <div className="space-y-3">
                  <img
                    src={logoPreview}
                    alt="Logo Magasin"
                    className="w-24 h-24 object-contain mx-auto rounded-xl shadow-md border border-slate-200 dark:border-slate-700"
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    Cliquer pour changer le logo
                  </p>
                </div>
              ) : (
                <div className="space-y-3 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Faites glisser le logo ici ou cliquez pour importer
                    </p>
                    <p className="text-[10px] text-slate-400">
                      (PNG, JPG max 2MB)
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>

          {/* Main Save Button */}
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            <Save className="w-5 h-5" />
            <span>Enregistrer les Données</span>
          </button>
        </div>
      </div>

      {/* Middle Section: Informations du Magasin */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Informations du Magasin</h4>
        </div>

        <div className="space-y-5">
          {/* Nom du magasin */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              NOM DU MAGASIN
            </label>
            <input
              type="text"
              value={nomMagasin}
              onChange={(e) => setNomMagasin(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Description du magasin */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              DESCRIPTION DU MAGASIN
            </label>
            <input
              type="text"
              value={descriptionMagasin}
              onChange={(e) => setDescriptionMagasin(e.target.value)}
              placeholder="Saisissez une brève description de votre magasin..."
              className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Adresse */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              ADRESSE
            </label>
            <input
              type="text"
              value={adresseMagasin}
              onChange={(e) => setAdresseMagasin(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Téléphone & Téléphone Fixe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                TÉLÉPHONE
              </label>
              <input
                type="text"
                value={telephoneMagasin}
                onChange={(e) => setTelephoneMagasin(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                TÉLÉPHONE FIXE
              </label>
              <input
                type="text"
                value={telephoneFixe}
                onChange={(e) => setTelephoneFixe(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          {/* Email & RC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                EMAIL
              </label>
              <input
                type="email"
                value={emailMagasin}
                onChange={(e) => setEmailMagasin(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                RC (REGISTRE DE COMMERCE)
              </label>
              <input
                type="text"
                value={rc}
                onChange={(e) => setRc(e.target.value)}
                placeholder="Ex: 16/00-1234567B19"
                className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          {/* NIF & AI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                NIF (NUMÉRO D'IDENTIFICATION FISCALE)
              </label>
              <input
                type="text"
                value={nif}
                onChange={(e) => setNif(e.target.value)}
                placeholder="Ex: 001916012345678"
                className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                AI (ARTICLE D'IMPOSITION)
              </label>
              <input
                type="text"
                value={ai}
                onChange={(e) => setAi(e.target.value)}
                placeholder="Ex: 16012345678"
                className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          {/* NIS & TVA Global */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                NIS (NUMÉRO D'IDENTIFICATION STATISTIQUE)
              </label>
              <input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Ex: 001916012345678"
                className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                TAUX DE TVA GLOBAL (%)
              </label>
              <input
                type="number"
                value={tvaGlobal}
                onChange={(e) => setTvaGlobal(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Paramètres du point de vente */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Paramètres du point de vente</h4>
        </div>

        <div className="space-y-3">
          {/* Toggle 1: Vente rapide */}
          <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-start sm:items-center justify-between gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Edit3 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">Vente rapide</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  Masquer la confirmation de vente rapide lorsqu'aucun client n'est sélectionné et valider directement l'opération.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVenteRapide(!venteRapide)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                venteRapide ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  venteRapide ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Mode comptabilité financière uniquement */}
          <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-start sm:items-center justify-between gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">Mode comptabilité financière uniquement</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  Désactiver entièrement le suivi du stock : aucune vérification de disponibilité ni déduction de quantité lors de la vente. Seul l'aspect financier est enregistré.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModeComptabiliteFinanciere(!modeComptabiliteFinanciere)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                modeComptabiliteFinanciere ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  modeComptabiliteFinanciere ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Autoriser le stock négatif */}
          <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-start sm:items-center justify-between gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <PackageX className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                  Autoriser le stock négatif (vendre avant réapprovisionnement)
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  Autoriser la finalisation d'une vente même si le stock n'a pas encore été saisi. Les quantités manquantes sont enregistrées comme « dette de stock » et régularisées automatiquement lors de l'ajout d'un nouveau lot.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoriserStockNegatif(!autoriserStockNegatif)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoriserStockNegatif ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  autoriserStockNegatif ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 4: Demander confirmation pour les ventes sans stock */}
          <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-start sm:items-center justify-between gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                  Demander confirmation pour les ventes sans stock
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  Afficher un message de confirmation avant de finaliser toute vente entraînant un stock négatif.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDemanderConfirmationVenteSansStock(!demanderConfirmationVenteSansStock)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                demanderConfirmationVenteSansStock ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  demanderConfirmationVenteSansStock ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 5: Tarification au prix moyen */}
          <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-start sm:items-center justify-between gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Sigma className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                  Tarification au prix moyen (au lieu de lot par lot)
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  Une fois activé, le prix de vente est calculé comme une moyenne pondérée par la quantité sur tous les lots disponibles, au lieu de vendre au prix du lot le plus ancien jusqu'à épuisement. N'affecte ni le coût, ni les bénéfices, ni la déduction du stock (qui restent en FIFO).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTarificationPrixMoyen(!tarificationPrixMoyen)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                tarificationPrixMoyen ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  tarificationPrixMoyen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 6: Activer le Droit de Timbre */}
          <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-start sm:items-center justify-between gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">Activer le Droit de Timbre</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  Selon la loi algérienne : 1% du TTC sur les factures payées en espèces (minimum 5 DA, maximum 2500 DA). Désactivez-le si votre activité est exonérée ou si vous ne souhaitez pas l'afficher.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiverDroitDeTimbre(!activerDroitDeTimbre)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                activerDroitDeTimbre ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  activerDroitDeTimbre ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
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
