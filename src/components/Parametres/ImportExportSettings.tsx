import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Package,
  BarChart2,
  Users,
  Truck,
  RotateCcw,
  CloudUpload,
  Clock,
  Trash2,
  X,
} from 'lucide-react';
import { initialProducts, initialSales, initialCustomers, initialSuppliers } from '../../mockData';

export const ImportExportSettings: React.FC = () => {
  // DB Backup state
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Excel Products state
  const [productImportMode, setProductImportMode] = useState<'merge' | 'replace'>('merge');
  const [exportingProducts, setExportingProducts] = useState(false);
  const [importingProducts, setImportingProducts] = useState(false);

  // Financial Reports state
  const [salesStartDate, setSalesStartDate] = useState('');
  const [salesEndDate, setSalesEndDate] = useState('');
  const [exportingSales, setExportingSales] = useState(false);

  // Clients state
  const [clientImportMode, setClientImportMode] = useState<'merge' | 'replace'>('merge');
  const [exportingClients, setExportingClients] = useState(false);
  const [importingClients, setImportingClients] = useState(false);

  // Suppliers state
  const [supplierImportMode, setSupplierImportMode] = useState<'merge' | 'replace'>('merge');
  const [exportingSuppliers, setExportingSuppliers] = useState(false);
  const [importingSuppliers, setImportingSuppliers] = useState(false);

  // Danger Zone Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper for downloading CSV/Text
  const downloadFile = (filename: string, content: string, mimeType: string = 'text/csv;charset=utf-8;') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Export Full ZIP / DB Backup
  const handleExportBackup = () => {
    setDownloadingZip(true);
    setTimeout(() => {
      setDownloadingZip(false);
      const backupData = {
        version: '1.5.1',
        backupDate: new Date().toISOString(),
        products: initialProducts,
        sales: initialSales,
        customers: initialCustomers,
        suppliers: initialSuppliers,
      };
      const now = new Date();
      const formattedDate = `${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      setLastBackupDate(formattedDate);
      downloadFile(
        `vendeo_pos_backup_${now.toISOString().slice(0, 10)}.json`,
        JSON.stringify(backupData, null, 2),
        'application/json'
      );
      showToast('Sauvegarde complète exportée avec succès !');
    }, 1000);
  };

  // Restore DB File
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRestoreSuccess(true);
      showToast(`Base de données restaurée depuis "${file.name}"`);
      setTimeout(() => setRestoreSuccess(false), 4000);
    }
  };

  // 2. Export Products Excel/CSV
  const handleExportProducts = () => {
    setExportingProducts(true);
    setTimeout(() => {
      setExportingProducts(false);
      const headers = 'ID,Nom,CodeBarres,Categorie,PrixAchat,PrixVente,Quantite,MinStock\n';
      const rows = initialProducts
        .map((p) => `${p.id},"${p.nom}",${p.codeBarre || ''},"${p.categorie}",${p.prixAchat},${p.prixVente},${p.quantite},${p.minStock}`)
        .join('\n');
      downloadFile(`produits_vendeo_pos_${new Date().toISOString().slice(0, 10)}.csv`, headers + rows);
      showToast('Liste des produits exportée en Excel/CSV');
    }, 800);
  };

  // Download Product Excel Template
  const handleDownloadProductTemplate = () => {
    const template = 'Nom,CodeBarres,Categorie,PrixAchat,PrixVente,Quantite,MinStock\nExemple Produit,123456789,Alimentation,100,150,50,10';
    downloadFile('modele_import_produits.csv', template);
    showToast('Modèle Excel de produits téléchargé');
  };

  const handleImportProducts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportingProducts(true);
      setTimeout(() => {
        setImportingProducts(false);
        showToast(`Importation de ${file.name} terminée (Mode: ${productImportMode === 'merge' ? 'Fusion' : 'Remplacement'})`);
      }, 1000);
    }
  };

  // 3. Export Sales Journal
  const handleExportSales = () => {
    setExportingSales(true);
    setTimeout(() => {
      setExportingSales(false);
      const headers = 'ID,Date,Client,Total,Statut,MethodePaiement\n';
      const rows = initialSales
        .map((s) => `${s.id},"${s.date}","${s.clientNom || 'Client Passage'}",${s.total},${s.statut},${s.methodePaiement}`)
        .join('\n');
      downloadFile(`journal_ventes_${new Date().toISOString().slice(0, 10)}.csv`, headers + rows);
      showToast('Journal des ventes exporté avec succès');
    }, 800);
  };

  // 4. Clients Export & Import
  const handleExportClients = () => {
    setExportingClients(true);
    setTimeout(() => {
      setExportingClients(false);
      const headers = 'ID,Nom,Telephone,Adresse,DetteTotale,FacturesOuvertes\n';
      const rows = initialCustomers
        .map((c) => `${c.id},"${c.nom}",${c.telephone || ''},"${c.adresse || ''}",${c.detteTotale || 0},${c.facturesOuvertes || 0}`)
        .join('\n');
      downloadFile(`clients_vendeo_${new Date().toISOString().slice(0, 10)}.csv`, headers + rows);
      showToast('Liste des clients exportée');
    }, 800);
  };

  const handleDownloadClientTemplate = () => {
    const template = 'Nom,Telephone,Adresse,DetteTotale\nNom Client,0550000000,Alger,0';
    downloadFile('modele_import_clients.csv', template);
    showToast('Modèle d\'import clients téléchargé');
  };

  const handleImportClients = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportingClients(true);
      setTimeout(() => {
        setImportingClients(false);
        showToast(`Importation des clients depuis "${file.name}" réussie`);
      }, 1000);
    }
  };

  // 5. Suppliers Export & Import
  const handleExportSuppliers = () => {
    setExportingSuppliers(true);
    setTimeout(() => {
      setExportingSuppliers(false);
      const headers = 'ID,Nom,Entreprise,Telephone,DetteTotale,FacturesOuvertes\n';
      const rows = initialSuppliers
        .map((s) => `${s.id},"${s.nom}","${s.entreprise || ''}",${s.telephone || ''},${s.detteTotale || 0},${s.facturesOuvertes || 0}`)
        .join('\n');
      downloadFile(`fournisseurs_vendeo_${new Date().toISOString().slice(0, 10)}.csv`, headers + rows);
      showToast('Liste des fournisseurs exportée');
    }, 800);
  };

  const handleDownloadSupplierTemplate = () => {
    const template = 'Nom,Entreprise,Telephone,DetteTotale\nNom Fournisseur,Societe SARL,0551111111,0';
    downloadFile('modele_import_fournisseurs.csv', template);
    showToast('Modèle d\'import fournisseurs téléchargé');
  };

  const handleImportSuppliers = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportingSuppliers(true);
      setTimeout(() => {
        setImportingSuppliers(false);
        showToast(`Importation des fournisseurs depuis "${file.name}" réussie`);
      }, 1000);
    }
  };

  // 6. Factory Reset
  const handleConfirmReset = () => {
    if (resetConfirmText.trim().toUpperCase() === 'EFFACER') {
      setShowResetModal(false);
      setResetSuccess(true);
      setResetConfirmText('');
      showToast('Le système a été réinitialisé à l\'état d\'usine avec succès', 'error');
      setTimeout(() => setResetSuccess(false), 5000);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-bold animate-bounce-short ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-red-600 text-white border-red-500'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Gestion des Données & Importation
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centre de contrôle pour les sauvegardes et rapports financiers
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <CloudUpload className="w-6 h-6" />
        </div>
      </div>

      {restoreSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Base de données restaurée avec succès !</span>
        </div>
      )}

      {resetSuccess && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>Système réinitialisé à l'état d'usine. Toutes les données locales ont été effacées.</span>
        </div>
      )}

      {/* SECTION 1: Base de Données et Système (ZIP) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-lg">
            Base de Données et Système (ZIP)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Box */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-slate-900 dark:text-white text-lg">Exporter une Sauvegarde</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Enregistrer une copie complète du système (produits, ventes, clients) au format ZIP.
              </p>

              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Vu pour la dernière fois: <strong className="text-slate-800 dark:text-slate-100">{lastBackupDate || 'غير متوفر'}</strong>
                  </span>
                </span>
              </div>
            </div>

            <button
              onClick={handleExportBackup}
              disabled={downloadingZip}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingZip ? 'Exportation en cours...' : 'Sauvegarder Maintenant'}</span>
            </button>
          </div>

          {/* Import Box */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Upload className="w-6 h-6 text-red-500" />
              </div>
              <h5 className="font-bold text-slate-900 dark:text-white text-lg">Restaurer les Données</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Remplacer la base de données actuelle par un fichier précédent.
              </p>

              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold pt-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="underline">Les données actuelles seront définitivement supprimées !</span>
              </div>
            </div>

            <label className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-black dark:bg-slate-950 dark:hover:bg-slate-900 text-white font-extrabold text-sm shadow-md cursor-pointer active:scale-95 transition-all">
              <Upload className="w-4 h-4" />
              <span>Importer et restaurer</span>
              <input type="file" accept=".zip,.json" onChange={handleRestoreFile} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 2: Inventaire et Produits (Excel) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-lg">
            Inventaire et Produits (Excel)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Products Card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-slate-900 dark:text-white text-lg">Exporter les Produits</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Télécharger la liste complète du stock avec coûts, prix de vente et quantités actuelles.
              </p>
            </div>

            <button
              onClick={handleExportProducts}
              disabled={exportingProducts}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{exportingProducts ? 'Exportation...' : 'Exporter vers un fichier'}</span>
            </button>
          </div>

          {/* Import Products Card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-slate-900 dark:text-white text-lg">Importer depuis Excel</h5>
            </div>

            {/* Radio Mode Selection */}
            <div className="space-y-2">
              <label
                onClick={() => setProductImportMode('merge')}
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  productImportMode === 'merge'
                    ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="productImportMode"
                  checked={productImportMode === 'merge'}
                  onChange={() => setProductImportMode('merge')}
                  className="mt-0.5 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Fusionner et Mettre à jour
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ajouter de nouvelles quantités aux produits existants.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setProductImportMode('replace')}
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  productImportMode === 'replace'
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="productImportMode"
                  checked={productImportMode === 'replace'}
                  onChange={() => setProductImportMode('replace')}
                  className="mt-0.5 text-red-600 focus:ring-red-500"
                />
                <div>
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">
                    Remplacement Complet
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tout effacer avant de commencer (Option Gérant).
                  </p>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <label className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md shadow-orange-600/30 cursor-pointer active:scale-95 transition-all text-center">
                <Upload className="w-4 h-4" />
                <span>{importingProducts ? 'Importation en cours...' : 'Démarrer l\'importation'}</span>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleImportProducts} className="hidden" />
              </label>

              <button
                type="button"
                onClick={handleDownloadProductTemplate}
                className="w-full text-center text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center gap-1.5 py-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger le Modèle Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Rapports Financiers (Excel) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-lg">
            Rapports Financiers (Excel)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Journal des Ventes */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white text-base">Journal des Ventes</h5>
              </div>

              {/* Date Filters */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={salesStartDate}
                  onChange={(e) => setSalesStartDate(e.target.value)}
                  placeholder="jj/mm/aaaa"
                  className="w-full h-10 px-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <input
                  type="date"
                  value={salesEndDate}
                  onChange={(e) => setSalesEndDate(e.target.value)}
                  placeholder="jj/mm/aaaa"
                  className="w-full h-10 px-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <p className="text-[11px] text-slate-400 italic">Laissez la date vide pour tout exporter</p>
            </div>

            <button
              type="button"
              onClick={handleExportSales}
              disabled={exportingSales}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exportingSales ? 'Exportation...' : 'Exporter Excel'}</span>
            </button>
          </div>

          {/* 2. Liste des Clients */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white text-base">Liste des Clients</h5>
              </div>

              <button
                type="button"
                onClick={handleExportClients}
                disabled={exportingClients}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Exporter Excel</span>
              </button>

              {/* Radio selection */}
              <div className="space-y-1.5 pt-1">
                <label
                  onClick={() => setClientImportMode('merge')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-xs transition-all ${
                    clientImportMode === 'merge'
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="clientImportMode"
                    checked={clientImportMode === 'merge'}
                    onChange={() => setClientImportMode('merge')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Fusionner et Mettre à jour</p>
                    <p className="text-[10px] text-slate-400">Mettre à jour + ajouter les nouveaux</p>
                  </div>
                </label>

                <label
                  onClick={() => setClientImportMode('replace')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-xs transition-all ${
                    clientImportMode === 'replace'
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="clientImportMode"
                    checked={clientImportMode === 'replace'}
                    onChange={() => setClientImportMode('replace')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <p className="font-bold text-red-600 dark:text-red-400">Remplacement Complet</p>
                    <p className="text-[10px] text-slate-400">Supprimer tous les clients avant</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer active:scale-95 transition-all text-center">
                <Upload className="w-4 h-4" />
                <span>{importingClients ? 'Importation...' : 'Démarrer l\'importation'}</span>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleImportClients} className="hidden" />
              </label>

              <button
                type="button"
                onClick={handleDownloadClientTemplate}
                className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Télécharger le Modèle Excel</span>
              </button>
            </div>
          </div>

          {/* 3. Liste des Fournisseurs */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white text-base">Liste des Fournisseurs</h5>
              </div>

              <button
                type="button"
                onClick={handleExportSuppliers}
                disabled={exportingSuppliers}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Exporter Excel</span>
              </button>

              {/* Radio selection */}
              <div className="space-y-1.5 pt-1">
                <label
                  onClick={() => setSupplierImportMode('merge')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-xs transition-all ${
                    supplierImportMode === 'merge'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="supplierImportMode"
                    checked={supplierImportMode === 'merge'}
                    onChange={() => setSupplierImportMode('merge')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Fusionner et Mettre à jour</p>
                    <p className="text-[10px] text-slate-400">Mettre à jour + ajouter les nouveaux</p>
                  </div>
                </label>

                <label
                  onClick={() => setSupplierImportMode('replace')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-xs transition-all ${
                    supplierImportMode === 'replace'
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="supplierImportMode"
                    checked={supplierImportMode === 'replace'}
                    onChange={() => setSupplierImportMode('replace')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <p className="font-bold text-red-600 dark:text-red-400">Remplacement Complet</p>
                    <p className="text-[10px] text-slate-400">Supprimer tous les fournisseurs avant</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/30 cursor-pointer active:scale-95 transition-all text-center">
                <Upload className="w-4 h-4" />
                <span>{importingSuppliers ? 'Importation...' : 'Démarrer l\'importation'}</span>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleImportSuppliers} className="hidden" />
              </label>

              <button
                type="button"
                onClick={handleDownloadSupplierTemplate}
                className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Télécharger le Modèle Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Zone de danger (actions sensibles) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-base">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Zone de danger (actions sensibles)</span>
        </div>

        <div className="bg-red-50/60 dark:bg-red-950/30 rounded-3xl p-6 sm:p-8 border border-red-200 dark:border-red-900/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h5 className="font-extrabold text-red-800 dark:text-red-300 text-base">
              Réinitialisation d'Usine (Effacer les Données)
            </h5>
            <p className="text-xs text-red-600/90 dark:text-red-400 max-w-xl leading-relaxed">
              Cette opération effacera toutes les données. Utilisez uniquement si vous souhaitez réinitialiser le système.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 active:scale-95 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Réinitialiser le Système Maintenant</span>
          </button>
        </div>
      </div>

      {/* Factory Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <h4 className="font-extrabold text-lg">Attention : Action irréversible</h4>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Vous êtes sur le point d'effacer tous les produits, ventes, clients, fournisseurs et paramètres. Pour confirmer cette action, tapez <strong className="text-red-600 dark:text-red-400 font-mono">EFFACER</strong> ci-dessous :
            </p>

            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="Tapez EFFACER"
              className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono font-bold text-center text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetConfirmText.trim().toUpperCase() !== 'EFFACER'}
                className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all"
              >
                Confirmer la Réinitialisation
              </button>
            </div>
          </div>
        </div>
      )}

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
