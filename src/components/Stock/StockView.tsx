import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Boxes, AlertTriangle, Trash2, Edit2, SlidersHorizontal, 
  Barcode, X, Check, Save, Info, Tag, Palette, Package, Image as ImageIcon, 
  Copy, PlusCircle, Columns, Layers, ChevronDown, Printer, Star, TrendingUp, 
  DollarSign, Calendar, Clock, ShoppingCart, Percent, ArrowUpRight, Activity, 
  Banknote, Hourglass, CalendarDays
} from 'lucide-react';
import { Product, Supplier, ProductPriceExtra, ProductVariant, ProductOptionGroup, ExtraBarcode, ProductLot, Sale } from '../../types';
import { useLanguage } from '../../lib/i18n';
import { CreatableSelect } from '../common/CreatableSelect';

interface StockViewProps {
  products: Product[];
  categories: string[];
  suppliers?: Supplier[];
  sales?: Sale[];
  onAddProduct: (product: Omit<Product, 'id'> | Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const StockView: React.FC<StockViewProps> = ({
  products,
  categories,
  suppliers = [],
  sales = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('toutes');
  const [selectedFamille, setSelectedFamille] = useState('toutes');
  const [selectedFournisseur, setSelectedFournisseur] = useState('tous');
  const [selectedStatut, setSelectedStatut] = useState('tous');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'base' | 'tarifs' | 'variantes'>('base');

  // Gérer les Lots Modal State (Screenshot 2)
  const [managingLotsProduct, setManagingLotsProduct] = useState<Product | null>(null);
  const [newLotName, setNewLotName] = useState('');
  const [newLotQty, setNewLotQty] = useState('');
  const [newLotCostPrice, setNewLotCostPrice] = useState('');
  const [newLotMargin, setNewLotMargin] = useState('');
  const [newLotRetailPrice, setNewLotRetailPrice] = useState('');
  const [newLotWholesalePrice, setNewLotWholesalePrice] = useState('');
  const [newLotExpiry, setNewLotExpiry] = useState('');
  const [newLotSupplier, setNewLotSupplier] = useState('');
  const [editingLotId, setEditingLotId] = useState<string | null>(null);

  // Statistiques du Produit Modal State (Screenshot 4)
  const [statsProduct, setStatsProduct] = useState<Product | null>(null);

  // Form State
  const [nom, setNom] = useState('');
  const [codeBarre, setCodeBarre] = useState('');
  const [extraBarcodes, setExtraBarcodes] = useState<ExtraBarcode[]>([]);
  const [categorie, setCategorie] = useState('');
  const [famille, setFamille] = useState('');
  const [fournisseurNom, setFournisseurNom] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [emplacement, setEmplacement] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  // Print Barcode Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printBarcode, setPrintBarcode] = useState('');
  const [printProductName, setPrintProductName] = useState('');
  const [printPriceType, setPrintPriceType] = useState('Détail');
  const [printPrice, setPrintPrice] = useState('0');
  const [printLabelCount, setPrintLabelCount] = useState(1);
  const [printLabelSize, setPrintLabelSize] = useState('50 × 30 mm');
  const [autoHeight, setAutoHeight] = useState(true);
  const [labelContent, setLabelContent] = useState({
    storeName: false,
    productName: true,
    price: false,
    priceType: false,
    barcodeNumber: true,
    variants: false,
    discount: false,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const openPrintBarcodeModal = (code: string, pName?: string, priceType: string = 'Détail', priceVal?: number | string) => {
    const nameToUse = pName !== undefined ? pName : nom;
    if (!nameToUse || !nameToUse.trim()) {
      setToastMessage("Veuillez d'abord saisir un nom de produit.");
      return;
    }
    setPrintBarcode(code || codeBarre || `2026${Math.floor(10000000 + Math.random() * 90000000)}`);
    setPrintProductName(nameToUse.trim());
    setPrintPriceType(priceType || 'Détail');
    const priceToUse = priceVal !== undefined ? priceVal.toString() : (priceType === 'Gros' && prixVenteGros ? prixVenteGros : prixVente);
    setPrintPrice(priceToUse || '0');
    setShowPrintModal(true);
  };

  // Lot Initial / Prices
  const [quantite, setQuantite] = useState('0');
  const [prixAchat, setPrixAchat] = useState('0');
  const [prixVente, setPrixVente] = useState('0');
  const [prixVenteGros, setPrixVenteGros] = useState('');
  const [datePeremption, setDatePeremption] = useState('');
  const [marginPercent, setMarginPercent] = useState<number | null>(null);

  // Tab 2: Propriétés & tarifs
  const [uniteMesure, setUniteMesure] = useState('');
  const [poidsVolume, setPoidsVolume] = useState('');
  const [couleur, setCouleur] = useState('');
  const [uniteGros, setUniteGros] = useState('');
  const [quantiteBaseGros, setQuantiteBaseGros] = useState('');
  const [prixSupplementaires, setPrixSupplementaires] = useState<ProductPriceExtra[]>([]);

  // Tab 3: Variantes & couleurs
  const [activerVariantes, setActiverVariantes] = useState(false);
  const [groupesOptions, setGroupesOptions] = useState<ProductOptionGroup[]>([]);
  const [variantes, setVariantes] = useState<ProductVariant[]>([]);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [showWholesaleCol, setShowWholesaleCol] = useState(false);
  const [showExpiryCol, setShowExpiryCol] = useState(false);
  const [bulkPrixAchat, setBulkPrixAchat] = useState('');
  const [bulkPrixVente, setBulkPrixVente] = useState('');
  const [bulkPrixGros, setBulkPrixGros] = useState('');
  const [bulkQte, setBulkQte] = useState('');

  // Extract unique families from products
  const families = Array.from(
    new Set(products.map((p) => p.famille).filter((f): f is string => Boolean(f)))
  );

  const openAddModal = () => {
    setEditingProduct(null);
    setActiveTab('base');
    setNom('');
    setCodeBarre(`2026${Math.floor(10000000 + Math.random() * 90000000)}`);
    setExtraBarcodes([]);
    setCategorie(categories[0] || '');
    setFamille('');
    setFournisseurNom('');
    setMinStock('5');
    setEmplacement('');
    setDescription('');
    setImage('');
    setQuantite('0');
    setPrixAchat('0');
    setPrixVente('0');
    setPrixVenteGros('');
    setDatePeremption('');
    setMarginPercent(null);

    // Reset new fields
    setUniteMesure('');
    setPoidsVolume('');
    setCouleur('');
    setUniteGros('');
    setQuantiteBaseGros('');
    setPrixSupplementaires([]);
    setActiverVariantes(false);
    setGroupesOptions([]);
    setVariantes([]);

    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setActiveTab('base');
    setNom(p.nom || '');
    setCodeBarre(p.codeBarre || '');
    if (p.codesBarresSuppList && p.codesBarresSuppList.length > 0) {
      setExtraBarcodes(p.codesBarresSuppList);
    } else if (p.codesBarresSupp && p.codesBarresSupp.length > 0) {
      setExtraBarcodes(
        p.codesBarresSupp.map((c: any) =>
          typeof c === 'string' ? { codeBarre: c, typePrix: 'Détail' } : c
        )
      );
    } else {
      setExtraBarcodes([]);
    }
    setCategorie(p.categorie || '');
    setFamille(p.famille || '');
    setFournisseurNom(p.fournisseurNom || '');
    setMinStock(p.minStock ? p.minStock.toString() : '5');
    setEmplacement(p.emplacement || '');
    setDescription(p.description || '');
    setImage(p.image || '');
    setQuantite(p.quantite !== undefined ? p.quantite.toString() : '0');
    setPrixAchat(p.prixAchat !== undefined ? p.prixAchat.toString() : '0');
    setPrixVente(p.prixVente !== undefined ? p.prixVente.toString() : '0');
    setPrixVenteGros(p.prixVenteGros !== undefined ? p.prixVenteGros.toString() : '');
    setDatePeremption(p.datePeremption || '');
    setMarginPercent(null);

    // Load new fields
    setUniteMesure(p.uniteMesure || '');
    setPoidsVolume(p.poidsVolume || '');
    setCouleur(p.couleur || '');
    setUniteGros(p.uniteGros || '');
    setQuantiteBaseGros(p.quantiteBaseGros ? p.quantiteBaseGros.toString() : '');
    setPrixSupplementaires(p.prixSupplementaires || []);
    setActiverVariantes(p.activerVariantes || false);
    setGroupesOptions(p.groupesOptions || []);
    setVariantes(p.variantes || []);

    setShowModal(true);
  };

  const generateBarcode = () => {
    setCodeBarre(`2026${Math.floor(10000000 + Math.random() * 90000000)}`);
  };

  const handleAddExtraBarcode = () => {
    const newCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setExtraBarcodes([...extraBarcodes, { codeBarre: newCode, typePrix: 'Détail' }]);
  };

  const applyMargin = (percent: number) => {
    setMarginPercent(percent);
    const pa = parseFloat(prixAchat) || 0;
    if (pa > 0) {
      const calculatedVente = Math.round(pa * (1 + percent / 100));
      setPrixVente(calculatedVente.toString());
    }
  };

  const handlePrixAchatChange = (val: string) => {
    setPrixAchat(val);
    if (marginPercent !== null && val) {
      const pa = parseFloat(val) || 0;
      const calculatedVente = Math.round(pa * (1 + marginPercent / 100));
      setPrixVente(calculatedVente.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      alert('Veuillez entrer un nom de produit.');
      return;
    }

    const pData: Omit<Product, 'id'> = {
      nom: nom.trim(),
      codeBarre: codeBarre.trim() || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      codesBarresSupp: extraBarcodes.map((b) => b.codeBarre),
      codesBarresSuppList: extraBarcodes,
      categorie: categorie.trim() || 'Général',
      famille: famille.trim(),
      fournisseurNom: fournisseurNom.trim(),
      prixAchat: parseFloat(prixAchat) || 0,
      prixVente: parseFloat(prixVente) || 0,
      prixVenteGros: prixVenteGros ? parseFloat(prixVenteGros) : undefined,
      quantite: parseInt(quantite) || 0,
      minStock: parseInt(minStock) || 5,
      emplacement: emplacement.trim(),
      description: description.trim(),
      image: image.trim(),
      datePeremption: datePeremption || undefined,
      
      // New fields
      uniteMesure: uniteMesure.trim(),
      poidsVolume: poidsVolume.trim(),
      couleur: couleur.trim(),
      uniteGros: uniteGros.trim(),
      quantiteBaseGros: quantiteBaseGros ? parseInt(quantiteBaseGros) : undefined,
      prixSupplementaires,
      activerVariantes,
      groupesOptions,
      variantes,
    };

    if (editingProduct) {
      const updated: Product = { 
        ...pData, 
        id: editingProduct.id,
        isFavorite: editingProduct.isFavorite || false,
        lots: editingProduct.lots || [],
      };
      if (onUpdateProduct) {
        onUpdateProduct(updated);
      } else {
        onAddProduct(updated);
      }
    } else {
      onAddProduct(pData);
    }

    setShowModal(false);
  };

  // Toggle favorite
  const handleToggleFavorite = (p: Product) => {
    const updated = { ...p, isFavorite: !p.isFavorite };
    if (onUpdateProduct) onUpdateProduct(updated);
  };

  // Open Lots Management Modal (Screenshot 2)
  const openLotsModal = (p: Product) => {
    let lotsToUse = p.lots && p.lots.length > 0 ? p.lots : [];
    if (lotsToUse.length === 0) {
      lotsToUse = [
        {
          id: `lot-1`,
          nomLot: 'BATCH-1',
          quantite: p.quantite !== undefined ? p.quantite : 5,
          prixAchat: p.prixAchat || 0,
          prixVente: p.prixVente || 0,
          prixVenteGros: p.prixVenteGros,
          datePeremption: p.datePeremption || '2026-08-16',
          fournisseurNom: p.fournisseurNom || '',
          isDefault: true,
        },
      ];
      const updatedP = { ...p, lots: lotsToUse };
      if (onUpdateProduct) onUpdateProduct(updatedP);
      setManagingLotsProduct(updatedP);
    } else {
      setManagingLotsProduct(p);
    }

    // Reset new lot form
    setNewLotName('');
    setNewLotQty('');
    setNewLotCostPrice('');
    setNewLotMargin('');
    setNewLotRetailPrice('');
    setNewLotWholesalePrice('');
    setNewLotExpiry('');
    setNewLotSupplier('');
    setEditingLotId(null);
  };

  const handleLotMarginChange = (percentStr: string) => {
    setNewLotMargin(percentStr);
    const percent = parseFloat(percentStr);
    const pa = parseFloat(newLotCostPrice) || 0;
    if (!isNaN(percent) && pa > 0) {
      const calculated = Math.round(pa * (1 + percent / 100));
      setNewLotRetailPrice(calculated.toString());
    }
  };

  const handleLotCostChange = (costStr: string) => {
    setNewLotCostPrice(costStr);
    const cost = parseFloat(costStr) || 0;
    const percent = parseFloat(newLotMargin);
    if (!isNaN(percent) && cost > 0) {
      const calculated = Math.round(cost * (1 + percent / 100));
      setNewLotRetailPrice(calculated.toString());
    }
  };

  const handleAddOrUpdateLot = () => {
    if (!managingLotsProduct) return;
    const qty = parseInt(newLotQty) || 0;
    if (qty <= 0 && !editingLotId) {
      setToastMessage('Veuillez entrer une quantité valide pour le lot.');
      return;
    }
    const cost = parseFloat(newLotCostPrice) || 0;
    const retail = parseFloat(newLotRetailPrice) || 0;
    const wholesale = newLotWholesalePrice ? parseFloat(newLotWholesalePrice) : undefined;
    const margin = newLotMargin ? parseFloat(newLotMargin) : undefined;

    let updatedLots: ProductLot[] = [...(managingLotsProduct.lots || [])];

    if (editingLotId) {
      updatedLots = updatedLots.map((l) =>
        l.id === editingLotId
          ? {
              ...l,
              nomLot: newLotName.trim() || l.nomLot || `BATCH-${updatedLots.length}`,
              quantite: qty,
              prixAchat: cost,
              prixVente: retail,
              prixVenteGros: wholesale,
              margePourcent: margin,
              datePeremption: newLotExpiry || undefined,
              fournisseurNom: newLotSupplier || undefined,
            }
          : l
      );
    } else {
      const nextBatchNum = updatedLots.length + 1;
      const newLot: ProductLot = {
        id: `lot-${Date.now()}`,
        nomLot: newLotName.trim() || `BATCH-${nextBatchNum}`,
        quantite: qty,
        prixAchat: cost,
        prixVente: retail,
        prixVenteGros: wholesale,
        margePourcent: margin,
        datePeremption: newLotExpiry || undefined,
        fournisseurNom: newLotSupplier || undefined,
        isDefault: updatedLots.length === 0,
      };
      updatedLots.push(newLot);
    }

    const totalQty = updatedLots.reduce((sum, l) => sum + (l.quantite || 0), 0);
    const updatedProd: Product = {
      ...managingLotsProduct,
      lots: updatedLots,
      quantite: totalQty,
    };

    if (onUpdateProduct) onUpdateProduct(updatedProd);
    setManagingLotsProduct(updatedProd);

    // Reset inputs
    setNewLotName('');
    setNewLotQty('');
    setNewLotCostPrice('');
    setNewLotMargin('');
    setNewLotRetailPrice('');
    setNewLotWholesalePrice('');
    setNewLotExpiry('');
    setNewLotSupplier('');
    setEditingLotId(null);
  };

  const handleStartEditLot = (lot: ProductLot) => {
    setEditingLotId(lot.id);
    setNewLotName(lot.nomLot || '');
    setNewLotQty(lot.quantite.toString());
    setNewLotCostPrice(lot.prixAchat.toString());
    setNewLotMargin(lot.margePourcent !== undefined ? lot.margePourcent.toString() : '');
    setNewLotRetailPrice(lot.prixVente.toString());
    setNewLotWholesalePrice(lot.prixVenteGros ? lot.prixVenteGros.toString() : '');
    setNewLotExpiry(lot.datePeremption || '');
    setNewLotSupplier(lot.fournisseurNom || '');
  };

  const handleSetDefaultLot = (lotId: string) => {
    if (!managingLotsProduct) return;
    const targetLot = managingLotsProduct.lots?.find((l) => l.id === lotId);
    if (!targetLot) return;
    const updatedLots = (managingLotsProduct.lots || []).map((l) => ({
      ...l,
      isDefault: l.id === lotId,
    }));
    const updatedProd: Product = {
      ...managingLotsProduct,
      lots: updatedLots,
      prixAchat: targetLot.prixAchat,
      prixVente: targetLot.prixVente,
      prixVenteGros: targetLot.prixVenteGros,
      datePeremption: targetLot.datePeremption,
    };
    if (onUpdateProduct) onUpdateProduct(updatedProd);
    setManagingLotsProduct(updatedProd);
  };

  const handleDeleteLot = (lotId: string) => {
    if (!managingLotsProduct) return;
    const updatedLots = (managingLotsProduct.lots || []).filter((l) => l.id !== lotId);
    const totalQty = updatedLots.reduce((sum, l) => sum + (l.quantite || 0), 0);
    const updatedProd: Product = {
      ...managingLotsProduct,
      lots: updatedLots,
      quantite: totalQty,
    };
    if (onUpdateProduct) onUpdateProduct(updatedProd);
    setManagingLotsProduct(updatedProd);
  };

  // Open Stats Modal
  const openStatsModal = (p: Product) => {
    setStatsProduct(p);
  };

  // Filtering
  const filtered = products.filter((p) => {
    const matchSearch =
      p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codeBarre.includes(searchTerm) ||
      (p.codesBarresSupp && p.codesBarresSupp.some((c) => c.includes(searchTerm)));

    const matchCat = selectedCat === 'toutes' || p.categorie === selectedCat;
    const matchFamille = selectedFamille === 'toutes' || p.famille === selectedFamille;
    const matchFournisseur = selectedFournisseur === 'tous' || p.fournisseurNom === selectedFournisseur;

    let matchStatut = true;
    if (selectedStatut === 'en_stock') {
      matchStatut = p.quantite > p.minStock;
    } else if (selectedStatut === 'stock_faible') {
      matchStatut = p.quantite > 0 && p.quantite <= p.minStock;
    } else if (selectedStatut === 'rupture') {
      matchStatut = p.quantite === 0;
    }

    return matchSearch && matchCat && matchFamille && matchFournisseur && matchStatut;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('stock.title', 'Gestion du Stock & Produits')}</span>
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {t('stock.subtitle', 'Inventaire, prix, seuils d\'alerte et mouvements')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-600/25 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>{t('stock.addProduct', 'Ajouter un Produit')}</span>
        </button>
      </div>

      {/* Main Search & Filters Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`w-5 h-5 absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('caisse.rechercheProduit', 'Rechercher dans le stock (nom, code-barres)...')}
              className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white placeholder:text-slate-400`}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
              showAdvancedFilters
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-600 dark:text-blue-400'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t('pos.advancedFilters', 'Filtres Avancés')}</span>
          </button>
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                Catégorie
              </label>
              <select
                value={selectedCat}
                onChange={(e) => {
                  setSelectedCat(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="toutes" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                Famille
              </label>
              <select
                value={selectedFamille}
                onChange={(e) => {
                  setSelectedFamille(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="toutes" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Toutes les Familles</option>
                {families.map((f) => (
                  <option key={f} value={f} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                Fournisseur
              </label>
              <select
                value={selectedFournisseur}
                onChange={(e) => {
                  setSelectedFournisseur(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="tous" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Tous les Fournisseurs</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.nom} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{s.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                Statut du Stock
              </label>
              <select
                value={selectedStatut}
                onChange={(e) => {
                  setSelectedStatut(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="tous" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Tous les Statuts</option>
                <option value="en_stock" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">En Stock</option>
                <option value="stock_faible" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Stock Faible</option>
                <option value="rupture" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Rupture de Stock</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Code-barres</th>
                <th className="py-4 px-6">Nom du Produit</th>
                <th className="py-4 px-6">Qté Valide</th>
                <th className="py-4 px-6">Statut</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                        <Boxes className="w-6 h-6" />
                      </div>
                      <p className="text-slate-400 dark:text-slate-500 font-bold text-sm">
                        Aucun produit ne correspond à la recherche.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isLow = p.quantite > 0 && p.quantite <= p.minStock;
                  const isOut = p.quantite === 0;
                  const lotsCount = p.lots && p.lots.length > 0 ? p.lots.length : 1;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                      {/* Code-barres */}
                      <td className="py-4 px-6 font-semibold text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-3 py-1.5 rounded-xl font-bold">
                          <Barcode className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.codeBarre}</span>
                        </span>
                      </td>

                      {/* Nom du Produit with Thumbnail */}
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.nom}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-extrabold block text-slate-900 dark:text-white">
                              {p.nom}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-semibold text-slate-400">
                              <span>{p.categorie || 'Général'}</span>
                              {p.famille && (
                                <>
                                  <span>•</span>
                                  <span>Famille: {p.famille}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Qté Valide Badge */}
                      <td className="py-4 px-6">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-800/80">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            {p.quantite} (Rupture)
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            {p.quantite} (Faible)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {p.quantite} (Valide)
                          </span>
                        )}
                      </td>

                      {/* Statut (Lots count) */}
                      <td className="py-4 px-6 font-extrabold text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {lotsCount} LOT{lotsCount > 1 ? 'S' : 'S'}
                      </td>

                      {/* Actions Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Star Favorite Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleFavorite(p)}
                            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer"
                            title={p.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                p.isFavorite
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-400'
                              }`}
                            />
                          </button>

                          {/* Stock & Lots Button (Screenshot 1) */}
                          <button
                            type="button"
                            onClick={() => openLotsModal(p)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-extrabold text-xs transition-all cursor-pointer shadow-sm"
                          >
                            Stock & Lots
                          </button>

                          {/* Modifier Infos Produit Button (Screenshot 1) */}
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-extrabold text-xs transition-all cursor-pointer shadow-sm"
                          >
                            Modifier Infos Produit
                          </button>

                          {/* Print Barcode Button */}
                          <button
                            type="button"
                            onClick={() => openPrintBarcodeModal(p.codeBarre, p.nom, 'Détail', p.prixVente)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-all cursor-pointer"
                            title="Imprimer le Code-barres"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>

                          {/* Stats Button */}
                          <button
                            type="button"
                            onClick={() => openStatsModal(p)}
                            className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 transition-all cursor-pointer"
                            title="Statistiques du produit"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Voulez-vous vraiment supprimer "${p.nom}" ?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-all cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Précédent
          </button>

          <span className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-slate-700 dark:text-slate-300">
            Page {currentPage} sur {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Modal: Ajouter / Modifier un Produit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
              </h3>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer le produit</span>
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs (Pill style matching screenshot) */}
            <div className="flex items-center gap-3 px-8 pt-4 pb-4 border-b border-slate-100 dark:border-slate-700/80 bg-white dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('base')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
                  activeTab === 'base'
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>Infos de base</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tarifs')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
                  activeTab === 'tarifs'
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Propriétés & tarifs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('variantes')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
                  activeTab === 'variantes'
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Variantes & couleurs</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* TAB 1: Infos de base */}
              {activeTab === 'base' && (
                <div className="space-y-5">
                  {/* Grid 1: Barcode & Extra Barcodes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Code-barres Principal */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Code-barres
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={codeBarre}
                          onChange={(e) => setCodeBarre(e.target.value)}
                          placeholder="Code-barres principal"
                          className="flex-1 h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />

                        <button
                          type="button"
                          onClick={() => openPrintBarcodeModal(codeBarre, nom, 'Détail', prixVente)}
                          className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                          title="Imprimer le code-barres"
                        >
                          <Barcode className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Codes-barres Supplémentaires */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Codes-barres Supplémentaires (Optionnel)
                      </label>

                      <div className="rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 p-3.5 border border-slate-200/80 dark:border-slate-800 space-y-3">
                        {extraBarcodes.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-white dark:bg-slate-800 rounded-2xl border border-blue-200/80 dark:border-slate-700 shadow-sm flex items-center gap-2"
                          >
                            <input
                              type="text"
                              value={item.codeBarre}
                              onChange={(e) => {
                                const next = [...extraBarcodes];
                                next[idx] = { ...next[idx], codeBarre: e.target.value };
                                setExtraBarcodes(next);
                              }}
                              placeholder="Code-barres"
                              className="w-28 sm:w-36 h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                            />

                            <select
                              value={item.typePrix}
                              onChange={(e) => {
                                const next = [...extraBarcodes];
                                next[idx] = { ...next[idx], typePrix: e.target.value };
                                setExtraBarcodes(next);
                              }}
                              className="h-9 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="Détail">Détail</option>
                              <option value="Gros">Gros</option>
                            </select>

                            <button
                              type="button"
                              onClick={() =>
                                openPrintBarcodeModal(
                                  item.codeBarre,
                                  nom,
                                  item.typePrix,
                                  item.typePrix === 'Gros' ? prixVenteGros : prixVente
                                )
                              }
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 transition-colors"
                              title="Imprimer ce code-barres"
                            >
                              <Barcode className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setExtraBarcodes(extraBarcodes.filter((_, i) => i !== idx))}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 dark:bg-slate-700 dark:hover:bg-red-950/60 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={handleAddExtraBarcode}
                          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-50/50 shadow-sm transition-all cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>+ Ajouter un Code-barres</span>
                        </button>

                        <p className="text-[11px] text-slate-400 font-medium px-1">
                          Remarque : Chaque code-barres doit être unique.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nom du produit & Catégorie */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Nom du Produit <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        placeholder="ex. Téléphone Portable..."
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>

                    <CreatableSelect
                      label="Catégorie"
                      value={categorie}
                      onChange={setCategorie}
                      options={categories}
                      placeholder="Choisir ou saisir une catégorie..."
                    />
                  </div>

                  {/* Famille & Fournisseur */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CreatableSelect
                      label="Famille"
                      value={famille}
                      onChange={setFamille}
                      options={families}
                      placeholder="Exemple : Famille Coca-Cola"
                    />

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Fournisseur
                      </label>
                      <select
                        value={fournisseurNom}
                        onChange={(e) => setFournisseurNom(e.target.value)}
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      >
                        <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Choisissez dans la liste des fournisseurs</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.nom} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{s.nom}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Alerte Stock Min & Emplacement */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Alerte Stock Minimum
                      </label>
                      <input
                        type="number"
                        value={minStock}
                        onChange={(e) => setMinStock(e.target.value)}
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Emplacement / Étagère
                      </label>
                      <input
                        type="text"
                        value={emplacement}
                        onChange={(e) => setEmplacement(e.target.value)}
                        placeholder="Ex: Étagère A3"
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Infos Supplémentaires (Description)
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Remarques ou détails..."
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                    />
                  </div>

                  {/* Image Product Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Image du Produit
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 shrink-0">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <label className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs cursor-pointer hover:bg-slate-50">
                        <span>Choisir un fichier</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setImage(URL.createObjectURL(e.target.files[0]));
                            }
                          }}
                        />
                      </label>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {image ? 'Image sélectionnée' : 'Aucun fichier choisi'}
                      </span>
                    </div>
                  </div>

                  {/* Highlighted Lot Initial Box */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                    <h4 className="text-xs font-black text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                      Infos du lot initial (Stock de départ)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Quantité Initiale
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={quantite}
                          onChange={(e) => setQuantite(e.target.value)}
                          className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Prix d'Achat (DA)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={prixAchat}
                          onChange={(e) => handlePrixAchatChange(e.target.value)}
                          className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Marge bénéficiaire quick buttons */}
                    <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-2 overflow-x-auto">
                      <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 shrink-0">
                        Marge bénéficiaire
                      </span>
                      {[0, 10, 20, 30, 50].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => applyMargin(m)}
                          className={`px-3 py-1 rounded-xl text-xs font-black border transition-all ${
                            marginPercent === m
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {m}%
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Prix de Vente au Détail (DA)
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={prixVente}
                          onChange={(e) => setPrixVente(e.target.value)}
                          className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-blue-500 text-slate-900 dark:text-white text-xs font-bold focus:outline-none ring-2 ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Prix de Vente en Gros
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={prixVenteGros}
                          onChange={(e) => setPrixVenteGros(e.target.value)}
                          placeholder="Optionnel"
                          className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Date de Péremption
                      </label>
                      <input
                        type="date"
                        value={datePeremption}
                        onChange={(e) => setDatePeremption(e.target.value)}
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Propriétés & tarifs */}
              {activeTab === 'tarifs' && (
                <div className="space-y-6">
                  {/* Section 1: Propriétés du Produit */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Propriétés du Produit (Unité, Poids, Couleur)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Unité de Mesure</label>
                        <select
                          value={uniteMesure}
                          onChange={(e) => setUniteMesure(e.target.value)}
                          className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        >
                          <option value=""></option>
                          <option value="Pièce">Pièce</option>
                          <option value="Kg">Kg</option>
                          <option value="Litre">Litre</option>
                          <option value="Mètre">Mètre</option>
                          <option value="Carton">Carton</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Poids / Volume</label>
                        <input
                          type="text"
                          value={poidsVolume}
                          onChange={(e) => setPoidsVolume(e.target.value)}
                          placeholder="Exemple : 500g"
                          className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Couleur</label>
                        <input
                          type="text"
                          value={couleur}
                          onChange={(e) => setCouleur(e.target.value)}
                          placeholder="Exemple : Rouge"
                          className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Paramètres de Tarification de Gros */}
                  <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10 space-y-4">
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                      <Package className="w-5 h-5" />
                      <h4 className="text-sm font-black">Paramètres de Tarification de Gros (Optionnel)</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Unité de Gros</label>
                        <input
                          type="text"
                          value={uniteGros}
                          onChange={(e) => setUniteGros(e.target.value)}
                          placeholder="Laissez vide si aucun"
                          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Quantité de Base dans l'Unité Majeure</label>
                        <input
                          type="text"
                          value={quantiteBaseGros}
                          onChange={(e) => setQuantiteBaseGros(e.target.value)}
                          placeholder="ex. 24 pièces par carton"
                          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Prix Supplémentaires */}
                  <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Tag className="w-5 h-5" />
                      <h4 className="text-sm font-black">Prix Supplémentaires du Produit</h4>
                    </div>
                    
                    <div className="space-y-3">
                      {prixSupplementaires.map((prix, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={prix.label}
                            onChange={(e) => {
                              const newPrix = [...prixSupplementaires];
                              newPrix[index].label = e.target.value;
                              setPrixSupplementaires(newPrix);
                            }}
                            placeholder="Nom (ex: Prix VIP)"
                            className="flex-1 h-11 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                          />
                          <input
                            type="number"
                            value={prix.prix}
                            onChange={(e) => {
                              const newPrix = [...prixSupplementaires];
                              newPrix[index].prix = parseFloat(e.target.value) || 0;
                              setPrixSupplementaires(newPrix);
                            }}
                            placeholder="Prix"
                            className="w-32 h-11 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPrixSupplementaires(prixSupplementaires.filter((_, i) => i !== index));
                            }}
                            className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPrixSupplementaires([...prixSupplementaires, { label: '', prix: 0 }])}
                      className="w-full py-3 rounded-2xl border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all"
                    >
                      + Ajouter un Prix Supplémentaire
                    </button>
                    <p className="text-[11px] text-slate-400">Exemple : Prix VIP / Prix de livraison / Gros spécial...</p>
                  </div>
                </div>
              )}

              {/* TAB 3: Variantes & couleurs */}
              {activeTab === 'variantes' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600 dark:text-blue-400">
                         <Copy className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm">Config. des variantes et options</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={activerVariantes} 
                        onChange={(e) => setActiverVariantes(e.target.checked)} 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-xs font-bold text-slate-700 dark:text-slate-300">Activer les variantes pour ce produit</span>
                    </label>
                  </div>

                  {activerVariantes && (
                    <>
                      {/* Groupes d'options */}
                      <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-800 shadow-sm space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Groupes d'options (Taille, Couleur, etc.)</h4>
                        
                        <div className="space-y-3">
                          {groupesOptions.map((groupe, idx) => (
                            <div key={idx} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                              <div className="flex gap-2 items-end">
                                <div className="flex-1 space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500">Nom de la propriété (ex : Couleur)</label>
                                  <input
                                    type="text"
                                    placeholder="Nom de la propriété (ex : Couleur)"
                                    value={groupe.nom}
                                    onChange={(e) => {
                                      const newG = [...groupesOptions];
                                      newG[idx].nom = e.target.value;
                                      setGroupesOptions(newG);
                                    }}
                                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setGroupesOptions(groupesOptions.filter((_, i) => i !== idx))}
                                  className="w-11 h-11 text-red-500 flex items-center justify-center hover:text-red-600 transition-colors shrink-0"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500">Valeurs (tapez une valeur puis Entrée)</label>
                                <div className="flex flex-wrap gap-2 p-2 w-full min-h-[44px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500/30">
                                  {groupe.options.map((opt, optIdx) => (
                                    <span key={optIdx} className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-100 dark:border-blue-800">
                                      {opt}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newG = [...groupesOptions];
                                          newG[idx].options = groupe.options.filter((_, i) => i !== optIdx);
                                          setGroupesOptions(newG);
                                        }}
                                        className="hover:text-blue-800 dark:hover:text-blue-200 ml-1"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                                  <input
                                    type="text"
                                    placeholder={groupe.options.length === 0 ? "Tapez une valeur puis Entrée (ou collez une liste avec virgules)" : ""}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                                        e.preventDefault();
                                        const vals = e.currentTarget.value.split(',').map(s => s.trim()).filter(s => s);
                                        const newG = [...groupesOptions];
                                        const currentOpts = newG[idx].options;
                                        vals.forEach(v => { if (!currentOpts.includes(v)) currentOpts.push(v); });
                                        setGroupesOptions(newG);
                                        e.currentTarget.value = '';
                                      }
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value.trim() !== '') {
                                        const vals = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                        const newG = [...groupesOptions];
                                        const currentOpts = newG[idx].options;
                                        vals.forEach(v => { if (!currentOpts.includes(v)) currentOpts.push(v); });
                                        setGroupesOptions(newG);
                                        e.target.value = '';
                                      }
                                    }}
                                    className="flex-1 min-w-[120px] bg-transparent text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setGroupesOptions([...groupesOptions, { id: Math.random().toString(), nom: '', options: [] }])}
                          className="w-full py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          <PlusCircle className="w-5 h-5" />
                          <span>Ajouter un groupe d'options</span>
                        </button>
                      </div>

                      {/* Liste des variantes générées */}
                      <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-800 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Liste des variantes générées</h4>
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg">
                              Nombre de combinaisons: {variantes.length}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-sm"
                              >
                                <Columns className="w-4 h-4" />
                                <span>Colonnes</span>
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              
                              {showColumnsDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 py-2">
                                  <label className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={showWholesaleCol}
                                      onChange={(e) => setShowWholesaleCol(e.target.checked)}
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Prix de gros</span>
                                  </label>
                                  <label className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={showExpiryCol}
                                      onChange={(e) => setShowExpiryCol(e.target.checked)}
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Date d'expiration</span>
                                  </label>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                // generate variants
                                if (groupesOptions.length === 0) return;
                                
                                const cartesian = (...a: any[][]) => a.reduce((acc, b) => acc.flatMap(d => b.map(e => [d, e].flat())));
                                const optionsList = groupesOptions.map(g => g.options.length > 0 ? g.options : ['']);
                                const combinations = cartesian(...optionsList);
                                
                                const newVariantes = combinations.map((combo: any) => {
                                  const name = Array.isArray(combo) ? combo.join(' - ') : combo;
                                  const existing = variantes.find(ev => ev.nom === name);
                                  return {
                                    id: existing?.id || Math.random().toString(),
                                    nom: name,
                                    codeBarre: existing?.codeBarre || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
                                    quantite: existing?.quantite || 0,
                                    prixAchat: existing?.prixAchat ?? (parseFloat(prixAchat) || 0),
                                    prixVente: existing?.prixVente ?? (parseFloat(prixVente) || 0),
                                    actif: true
                                  };
                                });
                                setVariantes(newVariantes);
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              Générer / Actualiser le tableau
                            </button>
                          </div>
                        </div>

                        {variantes.length > 0 && (
                          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-4">
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs">
                                <Layers className="w-4 h-4" />
                                <span>Remplissage groupé</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold text-slate-500">Prix d'achat</label>
                                <input type="number" className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none" value={bulkPrixAchat} onChange={e => setBulkPrixAchat(e.target.value)} />
                                <button onClick={() => setVariantes(variantes.map(v => ({...v, prixAchat: parseFloat(bulkPrixAchat) || 0})))} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors">Appliquer</button>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold text-slate-500">Prix de vente</label>
                                <input type="number" className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none" value={bulkPrixVente} onChange={e => setBulkPrixVente(e.target.value)} />
                                <button onClick={() => setVariantes(variantes.map(v => ({...v, prixVente: parseFloat(bulkPrixVente) || 0})))} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors">Appliquer</button>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold text-slate-500">Prix de gros</label>
                                <input type="number" className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none" value={bulkPrixGros} onChange={e => setBulkPrixGros(e.target.value)} />
                                <button onClick={() => setVariantes(variantes.map(v => ({...v, prixVenteGros: parseFloat(bulkPrixGros) || 0})))} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors">Appliquer</button>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold text-slate-500">Qté</label>
                                <input type="number" className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none" value={bulkQte} onChange={e => setBulkQte(e.target.value)} />
                                <button onClick={() => setVariantes(variantes.map(v => ({...v, quantite: parseInt(bulkQte) || 0})))} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors">Appliquer</button>
                              </div>
                              
                              <button onClick={() => setVariantes(variantes.map(v => ({...v, codeBarre: v.codeBarre || Math.floor(100000000000 + Math.random() * 900000000000).toString()})))} className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <Barcode className="w-4 h-4" />
                                <span>Générer les codes-barres vides</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                              <tr>
                                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">#</th>
                                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">Variante</th>
                                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">Code-barres (Auto/Manuel)</th>
                                <th className="p-3 font-bold text-slate-700 dark:text-slate-300 w-24">Qté</th>
                                <th className="p-3 font-bold text-slate-700 dark:text-slate-300 w-28">Prix d'achat</th>
                                <th className="p-3 font-bold text-slate-700 dark:text-slate-300 w-28">Prix de vente</th>
                                {showWholesaleCol && <th className="p-3 font-bold text-slate-700 dark:text-slate-300 w-28">Prix de gros</th>}
                                {showExpiryCol && <th className="p-3 font-bold text-slate-700 dark:text-slate-300 w-32">Date d'expiration</th>}
                                <th className="p-3 font-bold text-slate-700 dark:text-slate-300 w-24 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <input 
                                      type="checkbox" 
                                      checked={variantes.length > 0 && variantes.every(v => v.actif)}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        setVariantes(variantes.map(v => ({...v, actif: checked})));
                                      }}
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Actif
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {variantes.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                                    Ajoutez des propriétés, puis cliquez sur "Générer / Mettre à jour le tableau"
                                  </td>
                                </tr>
                              ) : (
                                variantes.map((v, i) => (
                                  <tr key={v.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="p-3 text-slate-500 font-medium">{i + 1}</td>
                                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{v.nom}</td>
                                    <td className="p-2">
                                      <div className="flex items-center gap-1">
                                        <input 
                                          type="text" 
                                          value={v.codeBarre} 
                                          onChange={(e) => {
                                            const newV = [...variantes];
                                            newV[i].codeBarre = e.target.value;
                                            setVariantes(newV);
                                          }}
                                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500/30 focus:outline-none" 
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newV = [...variantes];
                                            newV[i].codeBarre = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                                            setVariantes(newV);
                                          }}
                                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                          title="Générer un code-barres"
                                        >
                                          <Barcode className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                    <td className="p-2">
                                      <input 
                                        type="number" 
                                        value={v.quantite}
                                        onChange={(e) => {
                                          const newV = [...variantes];
                                          newV[i].quantite = parseInt(e.target.value) || 0;
                                          setVariantes(newV);
                                        }}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500/30 focus:outline-none" 
                                      />
                                    </td>
                                    <td className="p-2">
                                      <input 
                                        type="number" 
                                        value={v.prixAchat}
                                        onChange={(e) => {
                                          const newV = [...variantes];
                                          newV[i].prixAchat = parseFloat(e.target.value) || 0;
                                          setVariantes(newV);
                                        }}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500/30 focus:outline-none" 
                                      />
                                    </td>
                                    <td className="p-2">
                                      <input 
                                        type="number" 
                                        value={v.prixVente}
                                        onChange={(e) => {
                                          const newV = [...variantes];
                                          newV[i].prixVente = parseFloat(e.target.value) || 0;
                                          setVariantes(newV);
                                        }}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500/30 focus:outline-none" 
                                      />
                                    </td>
                                    {showWholesaleCol && (
                                      <td className="p-2">
                                        <input 
                                          type="number" 
                                          value={v.prixVenteGros || ''}
                                          onChange={(e) => {
                                            const newV = [...variantes];
                                            newV[i].prixVenteGros = parseFloat(e.target.value) || 0;
                                            setVariantes(newV);
                                          }}
                                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500/30 focus:outline-none" 
                                        />
                                      </td>
                                    )}
                                    {showExpiryCol && (
                                      <td className="p-2">
                                        <input 
                                          type="date" 
                                          value={v.datePeremption || ''}
                                          onChange={(e) => {
                                            const newV = [...variantes];
                                            newV[i].datePeremption = e.target.value;
                                            setVariantes(newV);
                                          }}
                                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500/30 focus:outline-none" 
                                        />
                                      </td>
                                    )}
                                    <td className="p-2 text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={v.actif}
                                        onChange={(e) => {
                                          const newV = [...variantes];
                                          newV[i].actif = e.target.checked;
                                          setVariantes(newV);
                                        }}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      />
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 text-orange-800 dark:text-orange-300 text-xs font-medium flex items-start gap-3 leading-relaxed">
                        <AlertTriangle className="w-5 h-5 shrink-0 text-orange-500 dark:text-orange-400" />
                        <p>Attention : Lors de l'activation de cette fonctionnalité, la quantité et le prix du "Lot initial" standard du produit ne seront pas utilisés. Les données de stock et de tarification seront tirées du tableau des variantes ci-dessus.</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPRIMER LE CODE-BARRES */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/80 text-center relative">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Imprimer le Code-barres
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Configuration des étiquettes
              </p>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Code-barres */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  Code-barres
                </label>
                <input
                  type="text"
                  readOnly
                  value={printBarcode}
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs font-extrabold opacity-90"
                />
              </div>

              {/* Produit */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  Produit
                </label>
                <input
                  type="text"
                  readOnly
                  value={printProductName}
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-extrabold opacity-90"
                />
              </div>

              {/* Type de prix & Prix */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    Type de Prix
                  </label>
                  <select
                    value={printPriceType}
                    onChange={(e) => setPrintPriceType(e.target.value)}
                    className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Détail">Détail</option>
                    <option value="Gros">Gros</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    Prix (DA)
                  </label>
                  <input
                    type="number"
                    value={printPrice}
                    onChange={(e) => setPrintPrice(e.target.value)}
                    className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Nombre d'étiquettes */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  Nombre d'étiquettes
                </label>
                <input
                  type="number"
                  min="1"
                  value={printLabelCount}
                  onChange={(e) => setPrintLabelCount(parseInt(e.target.value) || 1)}
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                />
              </div>

              {/* Taille de l'étiquette */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  Taille de l'étiquette
                </label>
                <select
                  value={printLabelSize}
                  onChange={(e) => setPrintLabelSize(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="40 × 25 mm">40 × 25 mm</option>
                  <option value="40 × 30 mm">40 × 30 mm</option>
                  <option value="50 × 25 mm">50 × 25 mm</option>
                  <option value="50 × 30 mm">50 × 30 mm</option>
                  <option value="60 × 40 mm">60 × 40 mm</option>
                  <option value="Personnalisé...">Personnalisé...</option>
                </select>
              </div>

              {/* Hauteur du code-barres automatique */}
              <div className="space-y-1 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoHeight}
                    onChange={(e) => setAutoHeight(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Hauteur du code-barres automatique
                  </span>
                </label>
                <p className="text-[10px] text-slate-400 font-medium pl-6 leading-tight">
                  Choisit automatiquement la meilleure hauteur pour remplir l'espace restant tout en gardant le code-barres lisible.
                </p>
              </div>

              {/* Contenu de l'étiquette */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  Contenu de l'étiquette
                </label>

                <div className="grid grid-cols-2 gap-y-2.5 gap-x-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={labelContent.storeName}
                      onChange={(e) => setLabelContent({ ...labelContent, storeName: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom du magasin</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={labelContent.productName}
                      onChange={(e) => setLabelContent({ ...labelContent, productName: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom du produit</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={labelContent.price}
                      onChange={(e) => setLabelContent({ ...labelContent, price: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Prix</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={labelContent.priceType}
                      onChange={(e) => setLabelContent({ ...labelContent, priceType: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Type de prix</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={labelContent.barcodeNumber}
                      onChange={(e) => setLabelContent({ ...labelContent, barcodeNumber: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Numéro du code-barres</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={labelContent.variants}
                      onChange={(e) => setLabelContent({ ...labelContent, variants: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Variantes</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={labelContent.discount}
                      onChange={(e) => setLabelContent({ ...labelContent, discount: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Remise</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700/80 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="w-full py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gérer les Lots (Matching Screenshot 2) */}
      {managingLotsProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/80 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Gérer les Lots : {managingLotsProduct.nom}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Gérez les dates d'expiration, les prix d'achat/vente et les quantités pour chaque lot individuel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManagingLotsProduct(null)}
                className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Formulaire d'ajout / modification de lot */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{editingLotId ? 'Modifier le Lot' : 'Ajouter un Nouveau Lot'}</span>
                  </h4>
                  {editingLotId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLotId(null);
                        setNewLotName('');
                        setNewLotQty('');
                        setNewLotCostPrice('');
                        setNewLotMargin('');
                        setNewLotRetailPrice('');
                        setNewLotWholesalePrice('');
                        setNewLotExpiry('');
                        setNewLotSupplier('');
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                    >
                      Annuler la modification
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      Nom / Numéro de Lot
                    </label>
                    <input
                      type="text"
                      value={newLotName}
                      onChange={(e) => setNewLotName(e.target.value)}
                      placeholder="Ex : BATCH-2026-A"
                      className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      Quantité du Lot
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newLotQty}
                      onChange={(e) => setNewLotQty(e.target.value)}
                      placeholder="0"
                      className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      Date d'Expiration
                    </label>
                    <input
                      type="date"
                      value={newLotExpiry}
                      onChange={(e) => setNewLotExpiry(e.target.value)}
                      className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      Prix d'Achat (DA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newLotCostPrice}
                      onChange={(e) => handleLotCostChange(e.target.value)}
                      placeholder="0"
                      className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      Marge (%)
                    </label>
                    <input
                      type="number"
                      value={newLotMargin}
                      onChange={(e) => handleLotMarginChange(e.target.value)}
                      placeholder="ex: 20"
                      className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      Prix Vente Détail (DA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newLotRetailPrice}
                      onChange={(e) => setNewLotRetailPrice(e.target.value)}
                      placeholder="0"
                      className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-blue-500 text-slate-900 dark:text-white text-xs font-bold focus:outline-none ring-2 ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      Prix Vente Gros (DA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newLotWholesalePrice}
                      onChange={(e) => setNewLotWholesalePrice(e.target.value)}
                      placeholder="Optionnel"
                      className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    Fournisseur du Lot (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={newLotSupplier}
                    onChange={(e) => setNewLotSupplier(e.target.value)}
                    placeholder="Ex : Fournisseur principal"
                    className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddOrUpdateLot}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingLotId ? 'Mettre à jour ce Lot' : '+ Ajouter ce Lot au Stock'}</span>
                </button>
              </div>

              {/* Liste des Lots Actuellement Stockés */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Lots Actuellement Stockés ({(managingLotsProduct.lots || []).length})
                  </h4>
                  <span className="text-xs font-bold text-slate-500">
                    Stock Total : <strong className="text-blue-600 dark:text-blue-400 font-black">{managingLotsProduct.quantite}</strong>
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-4">Lot</th>
                          <th className="py-3 px-4">Quantité</th>
                          <th className="py-3 px-4">Prix Achat</th>
                          <th className="py-3 px-4">Prix Vente</th>
                          <th className="py-3 px-4">Périmé le</th>
                          <th className="py-3 px-4 text-center">Par Défaut</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(!managingLotsProduct.lots || managingLotsProduct.lots.length === 0) ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                              Aucun lot enregistré. Le lot par défaut sera créé automatiquement.
                            </td>
                          </tr>
                        ) : (
                          managingLotsProduct.lots.map((lot) => {
                            const isExpired = lot.datePeremption && new Date(lot.datePeremption) <= new Date();

                            return (
                              <tr key={lot.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-black">{lot.nomLot || 'BATCH-1'}</span>
                                    {lot.isDefault && (
                                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-extrabold text-[10px]">
                                        Défaut
                                      </span>
                                    )}
                                  </div>
                                  {lot.fournisseurNom && (
                                    <span className="text-[10px] text-slate-400 block font-medium">
                                      Fourn: {lot.fournisseurNom}
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                                  {lot.quantite}
                                </td>

                                <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                                  {lot.prixAchat} DA
                                </td>

                                <td className="py-3.5 px-4 font-black text-blue-600 dark:text-blue-400">
                                  <div>{lot.prixVente} DA</div>
                                  {lot.prixVenteGros && (
                                    <span className="text-[10px] text-slate-400 font-medium block">
                                      Gros: {lot.prixVenteGros} DA
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4">
                                  {lot.datePeremption ? (
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded-xl text-[11px] font-black border ${
                                        isExpired
                                          ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                      }`}
                                    >
                                      {lot.datePeremption} {isExpired && '(Périmé)'}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleSetDefaultLot(lot.id)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer mx-auto ${
                                      lot.isDefault
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'
                                    }`}
                                    title="Définir comme lot par défaut"
                                  >
                                    {lot.isDefault && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                </td>

                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditLot(lot)}
                                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 hover:text-blue-600 dark:text-slate-300 transition-all cursor-pointer"
                                      title="Modifier ce lot"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Supprimer le lot "${lot.nomLot}" ?`)) {
                                          handleDeleteLot(lot.id);
                                        }
                                      }}
                                      className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-all cursor-pointer"
                                      title="Supprimer ce lot"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setManagingLotsProduct(null)}
                className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Statistiques du Produit (Matching Screenshot 4) */}
      {statsProduct && (() => {
        const productSales = sales.flatMap((s) => s.items || []).filter(
          (item) => item.productId === statsProduct.id || item.nom === statsProduct.nom
        );
        const totalQtySold = productSales.reduce((acc, i) => acc + (i.quantite || 0), 0);
        const totalRevenue = productSales.reduce((acc, i) => acc + (i.total || 0), 0);
        const totalCostOfSold = totalQtySold * (statsProduct.prixAchat || 0);
        const totalProfit = Math.max(0, totalRevenue - totalCostOfSold);
        const stockValue = (statsProduct.quantite || 0) * (statsProduct.prixAchat || 0);
        const marginRate =
          statsProduct.prixAchat > 0
            ? ((statsProduct.prixVente - statsProduct.prixAchat) / statsProduct.prixAchat) * 100
            : 0;
        const dailyAverageSales = totalQtySold > 0 ? (totalQtySold / 7).toFixed(1) : '0';
        const daysUntilStockout =
          parseFloat(dailyAverageSales) > 0
            ? Math.round(statsProduct.quantite / parseFloat(dailyAverageSales))
            : 0;

        const isProductExpired =
          statsProduct.datePeremption && new Date(statsProduct.datePeremption) <= new Date();
        const expiredLotsCount = (statsProduct.lots || []).filter(
          (l) => l.datePeremption && new Date(l.datePeremption) <= new Date()
        ).length;
        const totalLotsCount =
          statsProduct.lots && statsProduct.lots.length > 0 ? statsProduct.lots.length : 1;
        const expiredQty = isProductExpired
          ? statsProduct.quantite
          : (statsProduct.lots || [])
              .filter((l) => l.datePeremption && new Date(l.datePeremption) <= new Date())
              .reduce((acc, l) => acc + l.quantite, 0);
        const availableQty = Math.max(0, statsProduct.quantite - expiredQty);

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-700/80 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Statistiques du Produit : {statsProduct.nom}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Analyse des ventes, bénéfices et état du stock
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStatsProduct(null)}
                  className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* 4 KPI Cards (Screenshot 4 Top Row) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Revenu Total */}
                  <div className="p-5 rounded-3xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Revenu Total
                      </span>
                      <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Banknote className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                      {totalRevenue.toFixed(2)} DA
                    </div>
                  </div>

                  {/* Bénéfice Net */}
                  <div className="p-5 rounded-3xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Bénéfice Net
                      </span>
                      <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                      {totalProfit.toFixed(2)} DA
                    </div>
                  </div>

                  {/* Quantité Vendue */}
                  <div className="p-5 rounded-3xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Quantité Vendue
                      </span>
                      <div className="w-9 h-9 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                      {totalQtySold}
                    </div>
                  </div>

                  {/* Valeur du Stock */}
                  <div className="p-5 rounded-3xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Valeur du Stock
                      </span>
                      <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                      {stockValue.toFixed(2)} DA
                    </div>
                  </div>
                </div>

                {/* 3 KPI Cards (Screenshot 4 Middle Row) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Marge Bénéficiaire */}
                  <div className="p-4 rounded-3xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black shrink-0">
                      <Percent className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                        Marge Bénéficiaire
                      </span>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {marginRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Ventes Quotidiennes */}
                  <div className="p-4 rounded-3xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                        Ventes Quotidiennes
                      </span>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {dailyAverageSales}
                      </span>
                    </div>
                  </div>

                  {/* Jours avant Rupture */}
                  <div className="p-4 rounded-3xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black shrink-0">
                      <Hourglass className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                        Jours avant Rupture
                      </span>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {daysUntilStockout} jours
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2 Bottom Containers (Screenshot 4 Bottom Row) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Statut du Stock */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Statut du Stock
                    </h4>
                    <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                          Stock total restant
                        </span>
                        <span className="font-black text-slate-900 dark:text-white">
                          {statsProduct.quantite}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                          Stock disponible à la vente
                        </span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          {availableQty}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                          Stock expiré
                        </span>
                        <span className="font-black text-red-500">
                          {expiredQty}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                          Lots (Expirés / Total)
                        </span>
                        <span className="font-black text-slate-900 dark:text-white">
                          {expiredLotsCount} / {totalLotsCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance des variantes */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Performance des variantes
                    </h4>

                    {statsProduct.variantes && statsProduct.variantes.length > 0 ? (
                      <div className="space-y-2 text-xs">
                        {statsProduct.variantes.map((v) => (
                          <div
                            key={v.id}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {Object.values(v.options).join(' / ')}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{v.sku}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-slate-900 dark:text-white block">
                                {v.prixVente} DA
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">
                                Stock: {v.stock}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 flex items-center justify-center text-xs font-bold text-slate-400 dark:text-slate-500">
                        Aucune donnée pour les variantes
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setStatsProduct(null)}
                  className="px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
