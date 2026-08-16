import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  PlusCircle,
  ArrowLeft,
  Save,
  Search,
  Barcode,
  Trash2,
  Printer,
  Calendar,
  Building2,
  DollarSign,
  Package,
  AlertCircle,
  X,
  CheckCircle2,
  Info,
  Layers,
  Tag,
  Upload,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Percent,
  SlidersHorizontal,
} from 'lucide-react';
import { PurchaseInvoice, PurchaseInvoiceItem, Supplier, Product } from '../../types';
import { useLanguage } from '../../lib/i18n';
import { CreatableSelect } from '../common/CreatableSelect';

interface AchatsViewProps {
  invoices: PurchaseInvoice[];
  suppliers: Supplier[];
  products: Product[];
  categories: string[];
  onAddInvoice: (invoice: PurchaseInvoice) => void;
  onAddProduct: (product: Product) => void;
}

export const AchatsView: React.FC<AchatsViewProps> = ({
  invoices,
  suppliers,
  products,
  categories,
  onAddInvoice,
  onAddProduct,
}) => {
  const { t, isRTL } = useLanguage();
  // Mode: 'journal' | 'create'
  const [viewMode, setViewMode] = useState<'journal' | 'create'>('journal');

  // Pagination for journal table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // New Invoice State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [receptionDate, setReceptionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [tvaTax, setTvaTax] = useState<number>(0);
  const [transportCost, setTransportCost] = useState<number>(0);
  const [amountPaidNow, setAmountPaidNow] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');

  // Selected items in current creation invoice
  const [invoiceItems, setInvoiceItems] = useState<PurchaseInvoiceItem[]>([]);

  // Product search inside creation form
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // New Product Modal State
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState<
    'base' | 'properties' | 'variants'
  >('base');

  // New Product Form State
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [extraBarcodes, setExtraBarcodes] = useState<string[]>([]);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdFamily, setNewProdFamily] = useState('');
  const [newProdSupplier, setNewProdSupplier] = useState('');
  const [newProdMinStock, setNewProdMinStock] = useState<number>(5);
  const [newProdShelf, setNewProdShelf] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdQty, setNewProdQty] = useState<number>(0);
  const [newProdBuyPrice, setNewProdBuyPrice] = useState<number>(0);
  const [newProdMargin, setNewProdMargin] = useState<number>(20);
  const [newProdSellPrice, setNewProdSellPrice] = useState<number>(0);
  const [newProdWholesalePrice, setNewProdWholesalePrice] = useState<number>(0);
  const [newProdExpiry, setNewProdExpiry] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('Pièce');
  const [newProdWeight, setNewProdWeight] = useState('');
  const [newProdColor, setNewProdColor] = useState('');
  const [newProdWholesaleUnit, setNewProdWholesaleUnit] = useState('');
  const [newProdBaseQtyInMajor, setNewProdBaseQtyInMajor] = useState('');
  const [hasVariants, setHasVariants] = useState(false);
  const [modalFormError, setModalFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Helper to open create view
  const openCreateInvoice = () => {
    setSelectedSupplierId(suppliers[0]?.id || '');
    setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setReceptionDate(new Date().toISOString().split('T')[0]);
    setTvaTax(0);
    setTransportCost(0);
    setAmountPaidNow(0);
    setDueDate('');
    setInvoiceItems([]);
    setProductSearchTerm('');
    setViewMode('create');
  };

  // Add existing product from search to invoice items
  const handleSelectProductForInvoice = (p: Product) => {
    // Check if already in items
    const existingIndex = invoiceItems.findIndex((item) => item.productId === p.id);
    if (existingIndex >= 0) {
      const updated = [...invoiceItems];
      updated[existingIndex].quantite += 1;
      updated[existingIndex].sousTotal =
        updated[existingIndex].quantite * updated[existingIndex].prixAchatUnitaire;
      setInvoiceItems(updated);
    } else {
      const margin = p.prixAchat > 0 ? Math.round(((p.prixVente - p.prixAchat) / p.prixAchat) * 100) : 20;
      const newItem: PurchaseInvoiceItem = {
        productId: p.id,
        codeBarre: p.codeBarre,
        nom: p.nom,
        quantite: 1,
        prixAchatUnitaire: p.prixAchat || 0,
        margePourcent: margin > 0 ? margin : 20,
        prixVenteSuggere: p.prixVente || 0,
        prixGros: 0,
        sousTotal: p.prixAchat || 0,
      };
      setInvoiceItems([...invoiceItems, newItem]);
    }
    setProductSearchTerm('');
    setShowProductDropdown(false);
  };

  // Update Item in invoice creation
  const handleUpdateItem = (
    index: number,
    field: keyof PurchaseInvoiceItem,
    val: number
  ) => {
    const updated = [...invoiceItems];
    const item = { ...updated[index], [field]: val };

    if (field === 'prixAchatUnitaire' || field === 'margePourcent') {
      const buy = field === 'prixAchatUnitaire' ? val : item.prixAchatUnitaire;
      const margin = field === 'margePourcent' ? val : item.margePourcent;
      item.prixVenteSuggere = Math.round(buy * (1 + margin / 100));
    } else if (field === 'prixVenteSuggere') {
      if (item.prixAchatUnitaire > 0) {
        item.margePourcent = Math.round(
          ((val - item.prixAchatUnitaire) / item.prixAchatUnitaire) * 100
        );
      }
    }

    item.sousTotal = item.quantite * item.prixAchatUnitaire;
    updated[index] = item;
    setInvoiceItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotalItems = invoiceItems.reduce((acc, item) => acc + item.sousTotal, 0);
  const totalAmount = subtotalItems + Number(tvaTax) + Number(transportCost);
  const remainingDebt = Math.max(0, totalAmount - Number(amountPaidNow));

  // Save Invoice
  const handleSaveInvoice = () => {
    if (invoiceItems.length === 0) {
      alert('Veuillez ajouter au moins un produit à la facture.');
      return;
    }

    const supplierObj = suppliers.find((s) => s.id === selectedSupplierId);

    const newInv: PurchaseInvoice = {
      id: `inv_${Date.now()}`,
      numeroFacture: invoiceNumber || `INV-${Date.now()}`,
      fournisseurId: selectedSupplierId,
      fournisseurNom: supplierObj ? supplierObj.nom : 'Fournisseur Général',
      dateReception: receptionDate,
      items: invoiceItems,
      taxeTva: Number(tvaTax),
      transportExtras: Number(transportCost),
      montantPaye: Number(amountPaidNow),
      dateEcheanceDette: dueDate,
      montantTotal: totalAmount,
      detteRestante: remainingDebt,
      statut:
        remainingDebt === 0
          ? 'paye'
          : amountPaidNow > 0
          ? 'partiel'
          : 'non_paye',
    };

    onAddInvoice(newInv);
    setViewMode('journal');
  };

  // Open New Product Modal
  const openNewProductModal = () => {
    const randomBarcode = `2026${Math.floor(10000000 + Math.random() * 90000000)}`;
    setNewProdBarcode(randomBarcode);
    setExtraBarcodes([]);
    setNewProdName('');
    setNewProdCategory('');
    setNewProdFamily('');
    setNewProdSupplier(suppliers[0]?.nom || '');
    setNewProdMinStock(5);
    setNewProdShelf('');
    setNewProdDescription('');
    setNewProdQty(0);
    setNewProdBuyPrice(0);
    setNewProdMargin(20);
    setNewProdSellPrice(0);
    setNewProdWholesalePrice(0);
    setNewProdExpiry('');
    setNewProdUnit('Pièce');
    setNewProdWeight('');
    setNewProdColor('');
    setNewProdWholesaleUnit('');
    setNewProdBaseQtyInMajor('');
    setHasVariants(false);
    setModalFormError('');
    setActiveProductTab('base');
    setShowNewProductModal(true);
  };

  // Generate Barcode
  const generateNewBarcode = () => {
    setNewProdBarcode(`2026${Math.floor(10000000 + Math.random() * 90000000)}`);
  };

  // Margin Preset Pill Click
  const handleMarginPreset = (pct: number) => {
    setNewProdMargin(pct);
    if (newProdBuyPrice > 0) {
      setNewProdSellPrice(Math.round(newProdBuyPrice * (1 + pct / 100)));
    }
  };

  // Save New Product
  const handleSaveProductFromModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      setModalFormError('Le nom du produit est obligatoire.');
      return;
    }

    const createdProd: Product = {
      id: `p_${Date.now()}`,
      codeBarre: newProdBarcode || `2026${Date.now().toString().slice(-8)}`,
      nom: newProdName.trim(),
      categorie: newProdCategory,
      prixAchat: Number(newProdBuyPrice),
      prixVente: Number(newProdSellPrice),
      quantite: Number(newProdQty),
      minStock: Number(newProdMinStock),
      datePeremption: newProdExpiry || undefined,
    };

    onAddProduct(createdProd);

    // Automatically add to current invoice items if in create view
    if (viewMode === 'create') {
      handleSelectProductForInvoice(createdProd);
    }

    setShowNewProductModal(false);
  };

  // Filter products for invoice search
  const filteredSearchProducts = products.filter(
    (p) =>
      p.nom.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      p.codeBarre.includes(productSearchTerm)
  );

  // Pagination for journal
  const totalPages = Math.ceil(invoices.length / itemsPerPage) || 1;
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* ================= MODE 1: JOURNAL DES FACTURES D'ACHAT ================= */}
      {viewMode === 'journal' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                <ShoppingBag className="w-7 h-7 text-emerald-600" />
                <span>{t('achats.title', 'Journal des Factures d\'Achat')}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('achats.subtitle', 'Suivre les marchandises et quantités reçues des fournisseurs')}
              </p>
            </div>

            <button
              onClick={openCreateInvoice}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('achats.newInvoice', 'Nouvelle Facture d\'Achat')}</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className={`py-4 px-6 ${isRTL ? 'text-right' : 'text-left'}`}>{t('achats.invoiceNumber', 'Numéro de Facture')}</th>
                    <th className={`py-4 px-6 ${isRTL ? 'text-right' : 'text-left'}`}>{t('achats.supplier', 'Fournisseur')} / {t('common.date', 'Date')}</th>
                    <th className={`py-4 px-6 ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.total', 'Montant Total')}</th>
                    <th className={`py-4 px-6 text-emerald-600 dark:text-emerald-400 ${isRTL ? 'text-left' : 'text-right'}`}>
                      {t('achats.amountPaid', 'Payé')}
                    </th>
                    <th className={`py-4 px-6 text-amber-600 dark:text-amber-400 ${isRTL ? 'text-left' : 'text-right'}`}>
                      {t('caisse.closingBalance', 'Reste / Crédit')}
                    </th>
                    <th className="py-4 px-6 text-center">{t('common.print', 'Imprimer')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                  {invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-slate-400 dark:text-slate-500 font-bold text-sm"
                      >
                        {t('achats.noInvoices', 'Aucune facture enregistrée pour le moment')}
                      </td>
                    </tr>
                  ) : (
                    paginatedInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="font-mono font-black text-slate-900 dark:text-white text-xs bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                            {inv.numeroFacture}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">
                              {inv.fournisseurNom}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {inv.dateReception}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right font-black text-slate-900 dark:text-white text-sm">
                          {inv.montantTotal.toLocaleString('fr-DZ')} DA
                        </td>
                        <td className="py-4 px-6 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          {inv.montantPaye.toLocaleString('fr-DZ')} DA
                        </td>
                        <td className="py-4 px-6 text-right font-black text-amber-600 dark:text-amber-400 text-sm">
                          {inv.detteRestante.toLocaleString('fr-DZ')} DA
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => window.print()}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all active:scale-95"
                            title="Imprimer la Facture"
                          >
                            <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer (Matching Screenshot 1) */}
          <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>

            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Page {currentPage} sur {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1"
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ================= MODE 2: CRÉER UNE FACTURE D'ACHAT (SCREENSHOT 2) ================= */
        <div className="space-y-6">
          {/* Top Bar Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('journal')}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Créer une Facture d'Achat
                </h2>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                  <span>Le stock sera mis à jour automatiquement</span>
                  <span>⚡</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveInvoice}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 active:scale-95 transition-all shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer la Facture & Mettre à jour le Stock</span>
            </button>
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Données de base & Calcul (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Card 1: Données de Base de la Facture */}
              <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-500">
                  Données de Base de la Facture
                </h3>

                {/* Fournisseur select */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    Fournisseur (Données de l'Entreprise)
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-blue-500 dark:border-blue-500 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                  >
                    <option value="">Choisir un fournisseur...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nom} {s.entreprise ? `(${s.entreprise})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Numéro de Facture (Bon) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    Numéro de Facture (Bon)
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="ex. INV-2023-001"
                    className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                {/* Date de Réception */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    Date de Réception
                  </label>
                  <input
                    type="date"
                    value={receptionDate}
                    onChange={(e) => setReceptionDate(e.target.value)}
                    className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* Card 2: Calcul du Coût & Paiement */}
              <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 space-y-4 shadow-sm">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-500">
                  Calcul du Coût & Paiement
                </h3>

                {/* Taxe TVA & Transport Extras */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 block uppercase">
                      Taxe (TVA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={tvaTax}
                      onChange={(e) => setTvaTax(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 block uppercase">
                      Transport & Extras
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={transportCost}
                      onChange={(e) => setTransportCost(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none text-center"
                    />
                  </div>
                </div>

                {/* Montant Payé Maintenant & Date Echeance */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 block">
                        Montant Payé Maintenant (Espèces)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={amountPaidNow}
                        onChange={(e) => setAmountPaidNow(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 font-black text-sm text-center focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 block">
                        Date d'Échéance de la Dette
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full h-10 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dark Summary Box at Bottom Left (Matching Screenshot 2) */}
                <div className="bg-slate-950 text-white p-5 rounded-3xl space-y-2 border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Montant Total Requis
                      </span>
                      <span className="text-2xl font-black text-blue-400">
                        {totalAmount.toFixed(2)} <span className="text-xs">DA</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Dette Restante
                      </span>
                      <span className="text-lg font-black text-white">
                        {remainingDebt.toFixed(2)} <span className="text-xs">DA</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Product Search & Items Table (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Product Search Bar */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={productSearchTerm}
                    onChange={(e) => {
                      setProductSearchTerm(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder="Rechercher et sélectionner un produit..."
                    className="w-full h-12 pl-4 pr-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm"
                  />
                  <Barcode className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-500" />

                  {/* Dropdown Results */}
                  {showProductDropdown && productSearchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-40 divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredSearchProducts.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">
                          Aucun produit correspondant
                        </div>
                      ) : (
                        filteredSearchProducts.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSelectProductForInvoice(p)}
                            className="w-full p-3 text-left hover:bg-blue-50 dark:hover:bg-slate-700/60 flex items-center justify-between text-xs transition-colors"
                          >
                            <div>
                              <p className="font-extrabold text-slate-900 dark:text-white">
                                {p.nom}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {p.codeBarre} | Stock: {p.quantite}
                              </p>
                            </div>
                            <span className="font-black text-blue-600 dark:text-blue-400">
                              {p.prixAchat || 0} DA
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Button: Créer un nouveau produit */}
                <button
                  onClick={openNewProductModal}
                  className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs shrink-0 shadow-sm transition-all"
                >
                  Créer un nouveau produit
                </button>
              </div>

              {/* Items Table */}
              <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden min-h-[300px]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-700/80 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">PRODUIT</th>
                        <th className="py-3 px-3 text-center w-16">QTÉ</th>
                        <th className="py-3 px-3 text-right">PRIX D'ACHAT UNITAIRE</th>
                        <th className="py-3 px-3 text-center w-20">MARGE %</th>
                        <th className="py-3 px-3 text-right">PRIX DE VENTE SUGGÉRÉ</th>
                        <th className="py-3 px-3 text-right">PRIX DE GROS</th>
                        <th className="py-3 px-4 text-right">SOUS-TOTAL</th>
                        <th className="py-3 px-2 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                      {invoiceItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-24 text-center text-slate-400 dark:text-slate-500 font-bold text-xs"
                          >
                            Choisissez des produits dans la barre supérieure pour les ajouter à la facture
                          </td>
                        </tr>
                      ) : (
                        invoiceItems.map((item, idx) => (
                          <tr
                            key={item.productId}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40"
                          >
                            {/* Produit */}
                            <td className="py-3 px-4">
                              <p className="font-extrabold text-slate-900 dark:text-white">
                                {item.nom}
                              </p>
                              {item.codeBarre && (
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {item.codeBarre}
                                </p>
                              )}
                            </td>

                            {/* Qté */}
                            <td className="py-3 px-3 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantite}
                                onChange={(e) =>
                                  handleUpdateItem(idx, 'quantite', Number(e.target.value))
                                }
                                className="w-14 h-8 text-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-black text-xs text-slate-900 dark:text-white focus:outline-none"
                              />
                            </td>

                            {/* Prix D'Achat Unitaire */}
                            <td className="py-3 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                value={item.prixAchatUnitaire}
                                onChange={(e) =>
                                  handleUpdateItem(idx, 'prixAchatUnitaire', Number(e.target.value))
                                }
                                className="w-24 h-8 text-right px-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white focus:outline-none"
                              />
                            </td>

                            {/* Marge % */}
                            <td className="py-3 px-3 text-center">
                              <input
                                type="number"
                                value={item.margePourcent}
                                onChange={(e) =>
                                  handleUpdateItem(idx, 'margePourcent', Number(e.target.value))
                                }
                                className="w-16 h-8 text-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs text-blue-600 dark:text-blue-400 focus:outline-none"
                              />
                            </td>

                            {/* Prix de Vente Suggéré */}
                            <td className="py-3 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                value={item.prixVenteSuggere}
                                onChange={(e) =>
                                  handleUpdateItem(idx, 'prixVenteSuggere', Number(e.target.value))
                                }
                                className="w-24 h-8 text-right px-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-emerald-600 dark:text-emerald-400 focus:outline-none"
                              />
                            </td>

                            {/* Prix de Gros */}
                            <td className="py-3 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                value={item.prixGros || 0}
                                onChange={(e) =>
                                  handleUpdateItem(idx, 'prixGros', Number(e.target.value))
                                }
                                className="w-20 h-8 text-right px-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                              />
                            </td>

                            {/* Sous-total */}
                            <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white text-xs">
                              {item.sousTotal.toLocaleString('fr-DZ')} DA
                            </td>

                            {/* Delete button */}
                            <td className="py-3 px-2 text-center">
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW PRODUCT MODAL (SCREENSHOTS 3, 4, 5, 6) ================= */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 my-8 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-black text-slate-900 dark:text-white text-xl">
                {t('stock.addProduct', 'Ajouter un Nouveau Produit')}
              </h3>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveProductFromModal}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('stock.saveProduct', 'Enregistrer le produit')}</span>
                </button>

                <button
                  onClick={() => setShowNewProductModal(false)}
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 3 Tabs Header (Matching Screenshot) */}
            <div className="flex items-center gap-3 px-8 pt-4 pb-4 border-b border-slate-100 dark:border-slate-700/80 bg-white dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setActiveProductTab('base')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
                  activeProductTab === 'base'
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>{t('stock.basicInfo', 'Infos de base')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveProductTab('properties')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
                  activeProductTab === 'properties'
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{t('stock.propertiesAndPrices', 'Propriétés & tarifs')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveProductTab('variants')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
                  activeProductTab === 'variants'
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t('stock.variantsAndColors', 'Variantes & couleurs')}</span>
              </button>
            </div>

            {/* Error banner */}
            {modalFormError && (
              <div className="mx-8 mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{modalFormError}</span>
              </div>
            )}

            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 max-h-[75vh]">
            {/* TAB 1: INFOS DE BASE (Screenshots 3 & 4) */}
            {activeProductTab === 'base' && (
              <div className="space-y-5">
                {/* Code-barres & Extra Code-barres */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      {t('stock.barcode', 'Code-barres')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newProdBarcode}
                        onChange={(e) => setNewProdBarcode(e.target.value)}
                        placeholder="Code-barres principal"
                        className="flex-1 h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newProdName.trim()) {
                            setToastMessage("Veuillez d'abord saisir un nom de produit.");
                            return;
                          }
                          generateNewBarcode();
                        }}
                        className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                        title={t('stock.generateBarcode', 'Générer un code-barres')}
                      >
                        <Barcode className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Extra Barcodes Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                      {t('stock.extraBarcodes', 'Codes-barres Supplémentaires (Optionnel)')}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setExtraBarcodes([...extraBarcodes, `2026${Date.now().toString().slice(-6)}`])
                      }
                      className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-50/50 shadow-sm transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{t('stock.addBarcode', '+ Ajouter un Code-barres')}</span>
                    </button>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {t('stock.uniqueBarcodeNote', 'Remarque : Chaque code-barres doit être unique.')}
                    </p>
                  </div>
                </div>

                {/* Nom du produit & Catégorie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      {t('stock.productName', 'Nom du Produit')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      placeholder="ex. Téléphone Portable..."
                      className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <CreatableSelect
                    label={t('stock.category', 'Catégorie')}
                    value={newProdCategory}
                    onChange={setNewProdCategory}
                    options={categories}
                    placeholder={t('stock.chooseCategory', 'Saisir ou choisir une catégorie...')}
                  />
                </div>

                {/* Famille & Fournisseur */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CreatableSelect
                    label={t('stock.family', 'Famille')}
                    value={newProdFamily}
                    onChange={setNewProdFamily}
                    options={Array.from(new Set(products.map((p) => p.famille).filter((f): f is string => Boolean(f))))}
                    placeholder="Exemple : Famille Coca-Cola"
                  />

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      {t('achats.supplier', 'Fournisseur')}
                    </label>
                    <select
                      value={newProdSupplier}
                      onChange={(e) => setNewProdSupplier(e.target.value)}
                      className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                    >
                      <option value="">{t('stock.chooseSupplier', 'Choisissez dans la liste des fournisseurs')}</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.nom}>
                          {s.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Alerte Stock Minimum & Emplacement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      {t('stock.minStockAlert', 'Alerte Stock Minimum')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newProdMinStock}
                      onChange={(e) => setNewProdMinStock(Number(e.target.value))}
                      className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      {t('stock.location', 'Emplacement / Étagère')}
                    </label>
                    <input
                      type="text"
                      value={newProdShelf}
                      onChange={(e) => setNewProdShelf(e.target.value)}
                      className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    {t('stock.additionalInfo', 'Infos Supplémentaires (Description)')}
                  </label>
                  <textarea
                    rows={2}
                    value={newProdDescription}
                    onChange={(e) => setNewProdDescription(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block">
                    {t('stock.productImage', 'Image du Produit')}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900">
                      <Upload className="w-5 h-5" />
                    </div>
                    <label className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer">
                      <span>{t('stock.chooseFile', 'Choisir un fichier')}</span>
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                    <span className="text-[10px] text-slate-400">{t('stock.noFileChosen', 'Aucun fichier choisi')}</span>
                  </div>
                </div>

                {/* SECTION: Infos du lot initial (Stock de départ) (Screenshot 4) */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    {t('stock.initialLotInfo', 'Infos du lot initial (Stock de départ)')}
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                        Quantité Initiale
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newProdQty}
                        onChange={(e) => setNewProdQty(Number(e.target.value))}
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                        Prix d'Achat (DA)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newProdBuyPrice}
                        onChange={(e) => {
                          const buy = Number(e.target.value);
                          setNewProdBuyPrice(buy);
                          if (buy > 0 && newProdMargin > 0) {
                            setNewProdSellPrice(
                              Math.round(buy * (1 + newProdMargin / 100))
                            );
                          }
                        }}
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Marge bénéficiaire presets */}
                  <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-emerald-900 dark:text-emerald-300">
                        Marge bénéficiaire
                      </span>
                      <div className="flex items-center gap-1.5">
                        {[0, 10, 20, 30, 50].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => handleMarginPreset(pct)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-black border transition-all ${
                              newProdMargin === pct
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Prix de Vente au Détail & Prix de Gros */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                        Prix de Vente au Détail (DA)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newProdSellPrice}
                        onChange={(e) => setNewProdSellPrice(Number(e.target.value))}
                        className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-500 text-slate-900 dark:text-white text-xs font-black focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                        Prix de Vente en Gros
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newProdWholesalePrice}
                        onChange={(e) => setNewProdWholesalePrice(Number(e.target.value))}
                        placeholder="Optionnel"
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Date de Péremption */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      Date de Péremption
                    </label>
                    <input
                      type="date"
                      value={newProdExpiry}
                      onChange={(e) => setNewProdExpiry(e.target.value)}
                      className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROPRIÉTÉS & TARIFS (Screenshot 5) */}
            {activeProductTab === 'properties' && (
              <div className="space-y-5 text-left">
                {/* Propriétés du Produit */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Propriétés du Produit (Unité, Poids, Couleur)
                  </h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 block uppercase">
                        Unité de Mesure
                      </label>
                      <select
                        value={newProdUnit}
                        onChange={(e) => setNewProdUnit(e.target.value)}
                        className="w-full h-10 px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      >
                        <option value="Pièce">Pièce (Pcs)</option>
                        <option value="Kg">Kilogramme (Kg)</option>
                        <option value="Litre">Litre (L)</option>
                        <option value="Mètre">Mètre (m)</option>
                        <option value="Carton">Carton</option>
                        <option value="Sac">Sac</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 block uppercase">
                        Poids / Volume
                      </label>
                      <input
                        type="text"
                        value={newProdWeight}
                        onChange={(e) => setNewProdWeight(e.target.value)}
                        placeholder="Exemple : 500g"
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 block uppercase">
                        Couleur
                      </label>
                      <input
                        type="text"
                        value={newProdColor}
                        onChange={(e) => setNewProdColor(e.target.value)}
                        placeholder="Exemple : Rouge"
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Paramètres de Tarification de Gros */}
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-3">
                  <h4 className="text-xs font-extrabold text-purple-900 dark:text-purple-300">
                    Paramètres de Tarification de Gros (Optionnel)
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-purple-800 dark:text-purple-300 block">
                        Unité de Gros
                      </label>
                      <input
                        type="text"
                        value={newProdWholesaleUnit}
                        onChange={(e) => setNewProdWholesaleUnit(e.target.value)}
                        placeholder="Laissez vide si aucun"
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-purple-800 dark:text-purple-300 block">
                        Quantité de Base dans l'Unité Majeure
                      </label>
                      <input
                        type="text"
                        value={newProdBaseQtyInMajor}
                        onChange={(e) => setNewProdBaseQtyInMajor(e.target.value)}
                        placeholder="ex. 24 pièces par carton"
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Prix Supplémentaires */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300">
                    Prix Supplémentaires du Produit
                  </h4>

                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs hover:bg-emerald-100 transition-all"
                  >
                    + Ajouter un Prix Supplémentaire
                  </button>

                  <p className="text-[10px] text-slate-400">
                    Exemple : Prix VIP / Prix de livraison / Gros spécial...
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: VARIANTES & COULEURS (Screenshot 6) */}
            {activeProductTab === 'variants' && (
              <div className="space-y-5 text-left">
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
                      Config. des variantes et options
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Permet de créer des variations de ce produit (tailles, couleurs, etc.)
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => setHasVariants(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Activer les variantes pour ce produit
                    </span>
                  </label>
                </div>

                {hasVariants && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Variantes configurées
                    </p>
                    <div className="text-xs text-slate-400 italic">
                      Ajoutez des attributs comme Taille (S, M, L) ou Couleur (Noir, Blanc)
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification (Matching Screenshot 2) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
