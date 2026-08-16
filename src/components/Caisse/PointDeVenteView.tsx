import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  UserPlus,
  CheckCircle2,
  ShoppingBag,
  AlertCircle,
  Barcode,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Settings2,
  Printer,
  Clock,
  PauseCircle,
  X,
  ChevronDown,
  Percent,
  Eye,
  Share2,
  Grid,
  List,
  Image as ImageIcon,
  RotateCw,
  Tag,
  PackagePlus,
  ShoppingCart,
  Receipt,
  FileText,
  FileCheck,
  ClipboardList,
  Building,
  Palette,
  Package,
  Copy,
  PlusCircle,
  Columns,
  Layers,
  Save,
  Info,
  Calendar,
} from 'lucide-react';
import {
  Product,
  Sale,
  Customer,
  CashSession,
  ProductPriceExtra,
  ProductVariant,
  ProductOptionGroup,
  ExtraBarcode,
  BonCommande,
  ProformaInvoice,
} from '../../types';
import { useLanguage } from '../../lib/i18n';
import { CreatableSelect } from '../common/CreatableSelect';
import { printReceipt } from '../../lib/receiptPrinter';

interface PointDeVenteViewProps {
  products: Product[];
  customers: Customer[];
  categories?: string[];
  activeSession?: CashSession | null;
  sales?: Sale[];
  orders?: BonCommande[];
  proformas?: ProformaInvoice[];
  onOpenSessionRequested?: () => void;
  onCompleteSale: (sale: Omit<Sale, 'id'>) => void;
  onAddProduct?: (product: Product) => void;
  onGoToJournalVentes?: () => void;
  onAddOrder?: (order: BonCommande) => void;
  onAddProforma?: (proforma: ProformaInvoice) => void;
}

interface CartItem {
  product: Product;
  qty: number;
  discount: number; // in DA
  isCustomItem?: boolean;
}

interface SuspendedDraft {
  id: string;
  date: string;
  clientNom: string;
  items: CartItem[];
  total: number;
}

export const PointDeVenteView: React.FC<PointDeVenteViewProps> = ({
  products,
  customers,
  categories = ['Boissons', 'Produits Laitiers', 'Épicerie', 'Hygiène', 'Nettoyage'],
  activeSession,
  sales = [],
  orders = [],
  proformas = [],
  onOpenSessionRequested,
  onCompleteSale,
  onAddProduct,
  onGoToJournalVentes,
  onAddOrder,
  onAddProforma,
}) => {
  const { t, isRTL } = useLanguage();

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeTerm, setBarcodeTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter criteria
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [filterFamily, setFilterFamily] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Mode state (Sale vs Return)
  const [isReturnMode, setIsReturnMode] = useState(false);

  // Cart & Customer State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('Client Passager');
  const [globalDiscount, setGlobalDiscount] = useState(0); // in DA
  const [suspendedDrafts, setSuspendedDrafts] = useState<SuspendedDraft[]>([]);

  // Display Settings
  const [layoutDesign, setLayoutDesign] = useState<'design1' | 'design2' | 'design3'>('design1');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showImages, setShowImages] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Modals state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showFreeProductModal, setShowFreeProductModal] = useState(false);
  const [showDisplaySettingsModal, setShowDisplaySettingsModal] = useState(false);
  const [showRecentSalesModal, setShowRecentSalesModal] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [showPrintCenterModal, setShowPrintCenterModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Auto-print mode state (F5 toggle)
  const [isAutoPrintEnabled, setIsAutoPrintEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('pos_auto_print_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleAutoPrint = () => {
    setIsAutoPrintEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('pos_auto_print_enabled', next ? 'true' : 'false');
      setToastMessage(
        next
          ? 'Impression automatique du ticket (F5) ACTIVÉE'
          : 'Impression automatique du ticket (F5) DÉSACTIVÉE'
      );
      return next;
    });
  };

  // Order (Bon de Commande) modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderDeliveryDate, setOrderDeliveryDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [orderDeposit, setOrderDeposit] = useState('0.00');
  const [orderDepositMethod, setOrderDepositMethod] = useState('Espèces (Cash)');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderReserveStock, setOrderReserveStock] = useState(true);

  // Proforma invoice modal state
  const [showProformaModal, setShowProformaModal] = useState(false);
  const [proformaValidityDate, setProformaValidityDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [proformaNotes, setProformaNotes] = useState('');

  const handleOpenOrderModal = () => {
    if (cart.length === 0) {
      setToastMessage("Veuillez d'abord sélectionner des produits dans le panier pour créer un bon de commande.");
      return;
    }
    setShowOrderModal(true);
  };

  const handleSaveOrder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return;

    const depositVal = parseFloat(orderDeposit) || 0;
    const orderId = `BC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: BonCommande = {
      id: orderId,
      date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      dateLivraisonPrevue: orderDeliveryDate,
      clientNom: selectedCustomer,
      items: cart.map((i) => ({
        productId: i.product.id,
        nom: i.product.nom,
        prixUnitaire: i.product.prixVente,
        quantite: i.qty,
        total: i.product.prixVente * i.qty,
      })),
      total: totalCart,
      acompte: depositVal,
      reste: Math.max(0, totalCart - depositVal),
      statut: 'en_attente',
      remarques: `${orderNotes}${orderDepositMethod ? ` [Mode d'acompte: ${orderDepositMethod}]` : ''}${orderReserveStock ? ' [Stock réservé]' : ''}`,
    };

    if (onAddOrder) {
      onAddOrder(newOrder);
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem('orders') || '[]');
        localStorage.setItem('orders', JSON.stringify([newOrder, ...stored]));
      } catch {
        // ignore
      }
    }

    setShowOrderModal(false);
    clearCart();
    setOrderDeposit('0.00');
    setOrderNotes('');
    setToastMessage(`Bon de commande ${orderId} enregistré avec succès (${totalCart.toFixed(2)} DA) !`);
  };

  const handleOpenProformaModal = () => {
    if (cart.length === 0) {
      setToastMessage("Veuillez d'abord sélectionner des produits dans le panier pour créer une facture pro-forma.");
      return;
    }
    setShowProformaModal(true);
  };

  const handleSaveProforma = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return;

    const proformaId = `PRO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalTTC = totalCart;
    const totalHT = Math.round((totalTTC / 1.19) * 100) / 100;
    const tvaMontant = Math.round((totalTTC - totalHT) * 100) / 100;

    const newProforma: ProformaInvoice = {
      id: proformaId,
      date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      dateValidite: proformaValidityDate,
      clientNom: selectedCustomer,
      items: cart.map((i) => ({
        productId: i.product.id,
        nom: i.product.nom,
        prixUnitaire: i.product.prixVente,
        quantite: i.qty,
        total: i.product.prixVente * i.qty,
      })),
      totalHT,
      tvaRate: 19,
      tvaMontant,
      totalTTC,
      statut: 'en_attente',
      remarques: proformaNotes,
    };

    if (onAddProforma) {
      onAddProforma(newProforma);
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem('proformas') || '[]');
        localStorage.setItem('proformas', JSON.stringify([newProforma, ...stored]));
      } catch {
        // ignore
      }
    }

    setShowProformaModal(false);
    clearCart();
    setProformaNotes('');
    setToastMessage(`Facture Pro-forma ${proformaId} enregistrée avec succès (${totalTTC.toFixed(2)} DA) !`);
  };

  // Free product form state (F8)
  const [freeProductName, setFreeProductName] = useState('');
  const [freeProductSalePrice, setFreeProductSalePrice] = useState('');
  const [freeProductCostPrice, setFreeProductCostPrice] = useState('');

  // Add new product form state
  const [addProductTab, setAddProductTab] = useState<'base' | 'props' | 'variants'>('base');
  const [newProdName, setNewProdName] = useState('');
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [newProdExtraBarcodes, setNewProdExtraBarcodes] = useState<ExtraBarcode[]>([]);
  const [newProdCategory, setNewProdCategory] = useState(categories[0] || 'Épicerie');
  const [newProdFamily, setNewProdFamily] = useState('');
  const [newProdSupplier, setNewProdSupplier] = useState('');
  const [newProdMinStock, setNewProdMinStock] = useState('5');
  const [newProdShelf, setNewProdShelf] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdInitialQty, setNewProdInitialQty] = useState('0');
  const [newProdCostPrice, setNewProdCostPrice] = useState('0');
  const [newProdMargin, setNewProdMargin] = useState(20);
  const [newProdSalePrice, setNewProdSalePrice] = useState('0');
  const [newProdWholesalePrice, setNewProdWholesalePrice] = useState('');
  const [newProdExpiry, setNewProdExpiry] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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

  const openPrintBarcodeModal = (code: string, pName?: string, priceType: string = 'Détail', priceVal?: number | string) => {
    const nameToUse = pName !== undefined ? pName : newProdName;
    if (!nameToUse || !nameToUse.trim()) {
      setToastMessage("Veuillez d'abord saisir un nom de produit.");
      return;
    }
    setPrintBarcode(code || newProdBarcode || `2026${Math.floor(10000000 + Math.random() * 90000000)}`);
    setPrintProductName(nameToUse.trim());
    setPrintPriceType(priceType || 'Détail');
    const priceToUse = priceVal !== undefined ? priceVal.toString() : (priceType === 'Gros' && newProdWholesalePrice ? newProdWholesalePrice : newProdSalePrice);
    setPrintPrice(priceToUse || '0');
    setShowPrintModal(true);
  };

  const generateNewProdBarcode = () => {
    setNewProdBarcode(`2026${Math.floor(10000000 + Math.random() * 90000000)}`);
  };

  const handleOpenAddProductModal = () => {
    setAddProductTab('base');
    setNewProdName('');
    setNewProdBarcode(`2026${Math.floor(10000000 + Math.random() * 90000000)}`);
    setNewProdExtraBarcodes([]);
    setNewProdCategory(categories[0] || '');
    setNewProdFamily('');
    setNewProdSupplier('');
    setNewProdMinStock('5');
    setNewProdShelf('');
    setNewProdDescription('');
    setNewProdImage('');
    setNewProdInitialQty('0');
    setNewProdCostPrice('0');
    setNewProdMargin(20);
    setNewProdSalePrice('0');
    setNewProdWholesalePrice('');
    setNewProdExpiry('');
    setNewProdUniteMesure('');
    setNewProdPoidsVolume('');
    setNewProdCouleur('');
    setNewProdUniteGros('');
    setNewProdQuantiteBaseGros('');
    setNewProdPrixSupplementaires([]);
    setNewProdActiverVariantes(false);
    setNewProdGroupesOptions([]);
    setNewProdVariantes([]);
    setShowAddProductModal(true);
  };

  const handleAddExtraBarcode = () => {
    const newCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setNewProdExtraBarcodes([...newProdExtraBarcodes, { codeBarre: newCode, typePrix: 'Détail' }]);
  };

  // New fields for props and variants
  const [newProdUniteMesure, setNewProdUniteMesure] = useState('');
  const [newProdPoidsVolume, setNewProdPoidsVolume] = useState('');
  const [newProdCouleur, setNewProdCouleur] = useState('');
  const [newProdUniteGros, setNewProdUniteGros] = useState('');
  const [newProdQuantiteBaseGros, setNewProdQuantiteBaseGros] = useState('');
  const [newProdPrixSupplementaires, setNewProdPrixSupplementaires] = useState<ProductPriceExtra[]>([]);
  const [newProdActiverVariantes, setNewProdActiverVariantes] = useState(false);
  const [newProdGroupesOptions, setNewProdGroupesOptions] = useState<ProductOptionGroup[]>([]);
  const [newProdVariantes, setNewProdVariantes] = useState<ProductVariant[]>([]);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [showWholesaleCol, setShowWholesaleCol] = useState(false);
  const [showExpiryCol, setShowExpiryCol] = useState(false);
  const [bulkPrixAchat, setBulkPrixAchat] = useState('');
  const [bulkPrixVente, setBulkPrixVente] = useState('');
  const [bulkPrixGros, setBulkPrixGros] = useState('');
  const [bulkQte, setBulkQte] = useState('');

  // Discount Modal State
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [discountValue, setDiscountValue] = useState('');

  // Checkout Modal State
  const [paymentMethod, setPaymentMethod] = useState<'especes' | 'carte' | 'credit'>('especes');
  const [amountPaid, setAmountPaid] = useState('');
  const [completedSaleSuccess, setCompletedSaleSuccess] = useState(false);

  // Print Center tab
  const [printCenterTab, setPrintCenterTab] = useState<'print' | 'pdf'>('print');

  // Input refs for barcode auto-focus
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Categories list
  const allCategories = ['Tous', ...Array.from(new Set([...categories, ...products.map((p) => p.categorie)]))];

  // Filtered product catalog
  const filteredProducts = products.filter((p) => {
    // Search term check
    const matchesSearch =
      !searchTerm ||
      p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codeBarre.includes(searchTerm) ||
      p.categorie.toLowerCase().includes(searchTerm.toLowerCase());

    // Barcode check
    const matchesBarcode = !barcodeTerm || p.codeBarre.includes(barcodeTerm);

    // Category check
    const matchesCategory = selectedCategory === 'Tous' || p.categorie === selectedCategory;

    // Advanced filters
    const matchesFamily = !filterFamily || p.famille === filterFamily;
    const matchesSupplier = !filterSupplier || p.fournisseurNom === filterSupplier;
    const matchesStatus =
      !filterStatus ||
      (filterStatus === 'en_stock' && p.quantite > 0) ||
      (filterStatus === 'faible' && p.quantite <= p.minStock && p.quantite > 0) ||
      (filterStatus === 'rupture' && p.quantite === 0);

    return matchesSearch && matchesBarcode && matchesCategory && matchesFamily && matchesSupplier && matchesStatus;
  });

  // Handle barcode scanner submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeTerm.trim()) return;
    const matched = products.find(
      (p) => p.codeBarre === barcodeTerm.trim() || p.codesBarresSupp?.includes(barcodeTerm.trim())
    );
    if (matched) {
      addToCart(matched);
      setBarcodeTerm('');
    }
  };

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1, discount: 0 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setGlobalDiscount(0);
  };

  // Calculations
  const subtotalCart = cart.reduce((acc, item) => {
    const itemTotal = item.product.prixVente * item.qty - item.discount;
    return acc + Math.max(0, itemTotal);
  }, 0);

  const totalCartBeforeReturn = Math.max(0, subtotalCart - globalDiscount);
  const totalCart = isReturnMode ? -totalCartBeforeReturn : totalCartBeforeReturn;

  // Handle Adding Free Product (F8)
  const handleAddFreeProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeProductName.trim() || !freeProductSalePrice) return;
    const price = parseFloat(freeProductSalePrice) || 0;
    const cost = parseFloat(freeProductCostPrice) || 0;

    const customProd: Product = {
      id: `custom-${Date.now()}`,
      codeBarre: `FREE-${Math.floor(1000 + Math.random() * 9000)}`,
      nom: freeProductName,
      categorie: 'Service / Libre',
      prixAchat: cost,
      prixVente: price,
      quantite: 999,
      minStock: 1,
    };

    setCart((prev) => [...prev, { product: customProd, qty: 1, discount: 0, isCustomItem: true }]);
    setFreeProductName('');
    setFreeProductSalePrice('');
    setFreeProductCostPrice('');
    setShowFreeProductModal(false);
  };

  // Handle Creating New Product in Modal
  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdSalePrice) return;

    const createdProd: Product = {
      id: `p-${Date.now()}`,
      codeBarre: newProdBarcode.trim() || `61300${Math.floor(100000 + Math.random() * 900000)}`,
      codesBarresSupp: newProdExtraBarcodes.map((b) => b.codeBarre),
      codesBarresSuppList: newProdExtraBarcodes,
      nom: newProdName.trim(),
      categorie: newProdCategory.trim() || 'Général',
      famille: newProdFamily.trim(),
      fournisseurNom: newProdSupplier.trim(),
      emplacement: newProdShelf.trim(),
      description: newProdDescription.trim(),
      image: newProdImage || undefined,
      prixAchat: parseFloat(newProdCostPrice) || 0,
      prixVente: parseFloat(newProdSalePrice) || 0,
      prixVenteGros: newProdWholesalePrice ? parseFloat(newProdWholesalePrice) : undefined,
      quantite: parseInt(newProdInitialQty) || 0,
      minStock: parseInt(newProdMinStock) || 5,
      datePeremption: newProdExpiry || undefined,
      
      // New fields
      uniteMesure: newProdUniteMesure.trim(),
      poidsVolume: newProdPoidsVolume.trim(),
      couleur: newProdCouleur.trim(),
      uniteGros: newProdUniteGros.trim(),
      quantiteBaseGros: newProdQuantiteBaseGros ? parseInt(newProdQuantiteBaseGros) : undefined,
      prixSupplementaires: newProdPrixSupplementaires,
      activerVariantes: newProdActiverVariantes,
      groupesOptions: newProdGroupesOptions,
      variantes: newProdVariantes,
    };

    if (onAddProduct) {
      onAddProduct(createdProd);
    }
    addToCart(createdProd);

    // Reset form
    setNewProdName('');
    setNewProdBarcode('');
    setNewProdExtraBarcodes([]);
    setNewProdFamily('');
    setNewProdSupplier('');
    setNewProdMinStock('5');
    setNewProdShelf('');
    setNewProdDescription('');
    setNewProdImage('');
    setNewProdInitialQty('10');
    setNewProdCostPrice('100');
    setNewProdSalePrice('120');
    setNewProdWholesalePrice('');
    setNewProdExpiry('');
    
    setNewProdUniteMesure('');
    setNewProdPoidsVolume('');
    setNewProdCouleur('');
    setNewProdUniteGros('');
    setNewProdQuantiteBaseGros('');
    setNewProdPrixSupplementaires([]);
    setNewProdActiverVariantes(false);
    setNewProdGroupesOptions([]);
    setNewProdVariantes([]);

    setShowAddProductModal(false);
  };

  // Calculate Margin on Cost Price change or Margin pill click
  const handleMarginPillClick = (marginPct: number) => {
    setNewProdMargin(marginPct);
    const cost = parseFloat(newProdCostPrice) || 0;
    const sale = Math.round(cost * (1 + marginPct / 100));
    setNewProdSalePrice(sale.toString());
  };

  // Apply Discount Modal Submit
  const handleApplyDiscount = () => {
    const val = parseFloat(discountValue) || 0;
    if (discountType === 'percent') {
      const calculated = (subtotalCart * val) / 100;
      setGlobalDiscount(calculated);
    } else {
      setGlobalDiscount(val);
    }
    setShowDiscountModal(false);
  };

  // Suspend Cart (F2)
  const handleSuspendCart = () => {
    if (cart.length === 0) return;
    const newDraft: SuspendedDraft = {
      id: `BROUILLON-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      clientNom: selectedCustomer,
      items: [...cart],
      total: totalCart,
    };
    setSuspendedDrafts((prev) => [newDraft, ...prev]);
    clearCart();
  };

  // Restore Suspended Cart
  const handleResumeDraft = (draft: SuspendedDraft) => {
    setCart(draft.items);
    setSelectedCustomer(draft.clientNom);
    setSuspendedDrafts((prev) => prev.filter((d) => d.id !== draft.id));
    setShowDraftsModal(false);
  };

  // Finalize Sale
  const handleFinalizeSale = () => {
    const paid = parseFloat(amountPaid) || (paymentMethod === 'credit' ? 0 : Math.abs(totalCart));
    const reste = Math.max(0, Math.abs(totalCart) - paid);
    const saleDate = new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const saleId = `${new Date().getFullYear()}${String(sales.length + 1).padStart(4, '0')}`;

    const currentSaleItems = cart.map((i) => ({
      productId: i.product.id,
      nom: i.product.nom,
      prixUnitaire: isReturnMode ? -i.product.prixVente : i.product.prixVente,
      quantite: i.qty,
      total: (isReturnMode ? -i.product.prixVente : i.product.prixVente) * i.qty,
    }));

    const printableData = {
      id: saleId,
      date: saleDate,
      clientNom: selectedCustomer,
      items: currentSaleItems,
      total: totalCart,
      montantPaye: paid,
      reste,
      methodePaiement: paymentMethod === 'cash' ? 'Espèces' : paymentMethod === 'card' ? 'Carte Bancaire' : 'À Crédit',
      session: activeSession?.id || 'Session Active',
    };

    onCompleteSale({
      date: saleDate,
      clientNom: selectedCustomer,
      items: currentSaleItems,
      total: totalCart,
      methodePaiement: paymentMethod,
      statut: paid >= Math.abs(totalCart) ? 'paye' : paid > 0 ? 'partiel' : 'non_paye',
      montantPaye: paid,
      reste,
      session: activeSession?.id || 'Hors-Session',
    });

    clearCart();
    setShowCheckoutModal(false);
    setAmountPaid('');
    setCompletedSaleSuccess(true);
    setTimeout(() => setCompletedSaleSuccess(false), 3000);

    // Impression automatique selon l'état de F5
    if (isAutoPrintEnabled) {
      setToastMessage('Vente enregistrée avec succès. Impression du ticket de caisse...');
      setTimeout(() => {
        printReceipt(printableData);
      }, 150);
    } else {
      setToastMessage('Vente enregistrée avec succès (Impression ticket désactivée).');
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shortcuts when typing in inputs/modals
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      if (isInput && !['F1', 'F2', 'F3', 'F4', 'F5', 'F8'].includes(e.key)) return;

      if (e.key === 'F1') {
        e.preventDefault();
        if (cart.length > 0) setShowCheckoutModal(true);
      } else if (e.key === 'F2') {
        e.preventDefault();
        handleSuspendCart();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setShowDraftsModal(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        clearCart();
      } else if (e.key === 'F5') {
        e.preventDefault();
        toggleAutoPrint();
      } else if (e.key === 'F8') {
        e.preventDefault();
        setShowFreeProductModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isAutoPrintEnabled]);

  return (
    <div
      className="p-4 sm:p-6 h-[calc(100vh-65px)] flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-[1600px] mx-auto overflow-hidden bg-slate-100/60 dark:bg-slate-900/40"
      style={{ zoom: `${zoomLevel}%` }}
    >
      {/* LEFT COLUMN: Catalog & Action Bar */}
      <div className="flex-1 flex flex-col space-y-3 sm:space-y-4 overflow-hidden min-w-0">
        {/* Session Inactive Alert */}
        {!activeSession && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('pos.noSessionWarning', 'Aucune session de caisse active. Veuillez ouvrir la caisse avant d\'encaisser !')}</span>
            </div>
            {onOpenSessionRequested && (
              <button
                type="button"
                onClick={onOpenSessionRequested}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] shrink-0 cursor-pointer"
              >
                {t('pos.openRegister', 'Ouvrir la Caisse')}
              </button>
            )}
          </div>
        )}

        {/* Sale Success Alert */}
        {completedSaleSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isReturnMode
                  ? 'Avoir / Retour enregistré avec succès !'
                  : 'Vente enregistrée avec succès ! Ticket de caisse généré.'}
              </span>
            </div>
            <button
              onClick={() => setShowPrintCenterModal(true)}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
          </div>
        )}

        {/* TOP ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 bg-white dark:bg-slate-800/90 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          {/* Search by Name Input */}
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('pos.searchProduct', 'Rechercher par nom de produit...')}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Scanner/Barcode Input */}
          <form onSubmit={handleBarcodeSubmit} className="relative w-44 sm:w-52">
            <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeTerm}
              onChange={(e) => setBarcodeTerm(e.target.value)}
              placeholder={t('pos.scanBarcode', 'Scanner/Taper le code-barres...')}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-100"
            />
          </form>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>{selectedCategory === 'Tous' ? t('pos.allProducts', 'Tous les Produits') : selectedCategory}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showCategoryDropdown && (
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-30 space-y-2">
                <input
                  type="text"
                  value={categorySearchTerm}
                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                  placeholder="Rechercher des catégories..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
                />
                <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                  {allCategories
                    .filter((cat) => cat.toLowerCase().includes(categorySearchTerm.toLowerCase()))
                    .map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          selectedCategory === cat
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Filters Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Filtres Avancés</span>
              {(filterStatus || filterFamily || filterSupplier) && (
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              )}
            </button>

            {showAdvancedFilters && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-40 space-y-3 text-slate-900 dark:text-slate-100">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <h4 className="text-xs font-extrabold uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                    <span>Filtres Avancés</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Statut du Stock
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Tous les Statuts</option>
                    <option value="en_stock" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">En Stock (&gt; 0)</option>
                    <option value="faible" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Stock Faible (&le; Seuil)</option>
                    <option value="rupture" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Rupture de Stock (0)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Famille de produit
                  </label>
                  <select
                    value={filterFamily}
                    onChange={(e) => setFilterFamily(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Toutes les Familles</option>
                    {Array.from(new Set(products.map((p) => p.famille).filter(Boolean))).map((f) => (
                      <option key={f} value={f} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                    Fournisseur
                  </label>
                  <select
                    value={filterSupplier}
                    onChange={(e) => setFilterSupplier(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Tous les Fournisseurs</option>
                    {Array.from(new Set(products.map((p) => p.fournisseurNom).filter(Boolean))).map((s) => (
                      <option key={s} value={s} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus('');
                      setFilterFamily('');
                      setFilterSupplier('');
                    }}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                  >
                    Réinitialiser
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters(false)}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-extrabold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Product Button */}
          <button
            type="button"
            onClick={handleOpenAddProductModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('pos.addProduct', 'Ajouter un produit')}</span>
          </button>

          {/* Mode Retour Button */}
          <button
            type="button"
            onClick={() => setIsReturnMode(!isReturnMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              isReturnMode
                ? 'bg-red-600 text-white border-red-600 shadow-md animate-pulse'
                : 'bg-white dark:bg-slate-900 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isReturnMode ? t('pos.cancelReturnMode', 'Annuler le mode retour') : t('pos.returnMode', 'Mode retour')}</span>
          </button>

          {/* Free Product (F8) Button */}
          <button
            type="button"
            onClick={() => setShowFreeProductModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-extrabold hover:bg-amber-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('pos.freeProduct', 'Produit libre F8')}</span>
          </button>

          {/* Customize / Personnaliser Button */}
          <button
            type="button"
            onClick={() => setShowDisplaySettingsModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('pos.customize', 'Personnaliser')}</span>
          </button>
        </div>

        {/* PRODUCT CATALOG GRID / LIST AREA */}
        <div className="flex-1 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-4 shadow-sm flex flex-col overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">
                Aucun produit ne correspond à la recherche.
              </h3>
              <p className="text-xs text-slate-400">
                Essayez d'effacer les filtres ou d'ajouter un nouveau produit au catalogue.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 pr-1 custom-scrollbar content-start items-start auto-rows-max">
                {filteredProducts.map((p) => {
                  const lotsCount = p.lots && p.lots.length > 0 ? p.lots.length : 1;
                  const hasVariants = p.variantes && p.variantes.length > 0;
                  const variantsCount = hasVariants ? p.variantes!.length : 0;
                  const isLowStock = p.quantite <= (p.minStock || 5);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addToCart(p)}
                      className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-blue-500/80 dark:hover:border-blue-400/80 transition-all text-left flex flex-col group overflow-hidden relative cursor-pointer"
                    >
                      {/* Top Image Section - 100% Edge to Edge with NO margin/padding */}
                      <div className="relative w-full h-40 sm:h-44 xl:h-48 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                        {/* Floating Quantity Pill (Matching Screenshot Top-Left) */}
                        <div className="absolute top-2 left-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1.5 z-10">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {p.quantite} À Vendre
                          </span>
                        </div>

                        {/* Low stock badge (Matching Screenshot Top-Right "(Faible)") */}
                        {isLowStock && (
                          <div className="absolute top-0 right-0 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-bl-xl shadow-xs z-10">
                            (Faible)
                          </div>
                        )}

                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.nom}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                          </div>
                        )}
                      </div>

                      {/* Card Body (Matching Screenshot Typography & Hierarchy) */}
                      <div className="p-3 sm:p-3.5 pt-2.5 flex flex-col space-y-2">
                        {/* Centered Product Title & Subtitle */}
                        <div className="text-center space-y-0.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-[14px] sm:text-[15px] tracking-tight truncate group-hover:text-blue-600 transition-colors">
                              {p.nom}
                            </h4>
                            {hasVariants && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] shrink-0">
                                {variantsCount}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                            {lotsCount} lots disponibles à la vente
                          </p>
                        </div>

                        {/* Price Line (Left Aligned, exact same line, no uppercase, matching screenshot) */}
                        <div className="pt-1 flex items-baseline gap-1.5 text-left whitespace-nowrap overflow-hidden">
                          <span className="text-[18px] sm:text-[19px] font-black text-blue-600 dark:text-blue-400 leading-none shrink-0">
                            {Number(p.prixVente).toFixed(2)}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                            DA / À Vendre
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Pagination Footer */}
              <div className="pt-3.5 flex items-center justify-between text-xs text-slate-400 font-medium border-t border-slate-100 dark:border-slate-700/60 mt-2 shrink-0">
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Précédent
                </button>
                <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px]">
                  Page 1 sur 1
                </span>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Suivant
                </button>
              </div>
            </div>
          ) : (
            /* List Mode */
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToCart(p)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-500 flex items-center justify-between gap-4 text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{p.nom}</h4>
                      <span className="text-[10px] text-slate-400">{p.categorie} • Code: {p.codeBarre}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-500">Stock: {p.quantite}</span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">{p.prixVente} DA</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Panier / Cart Panel */}
      <div className="w-full lg:w-[420px] bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5 shadow-sm flex flex-col justify-between shrink-0 overflow-hidden">
        <div className="space-y-3.5 flex-1 flex flex-col overflow-hidden">
          {/* Customer Selection / Search Bar matching screenshot */}
          <div className="flex items-center gap-2 bg-emerald-50/30 dark:bg-slate-900/80 px-3 py-2.5 rounded-2xl border border-emerald-300/70 dark:border-slate-700 shadow-2xs">
            <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Client Passager" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                Rechercher un client par nom ou ID...
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.nom} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {c.nom} {c.detteTotale > 0 ? `(${c.detteTotale} DA dette)` : ''}
                </option>
              ))}
            </select>
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Return Mode Banner inside Cart */}
          {isReturnMode && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl text-xs font-bold text-center">
              Mode Retour d'Article / Avoir Actif
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <ShoppingBag className="w-10 h-10 stroke-1 text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  La commande est vide, sélectionnez des produits
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 bg-slate-50/90 dark:bg-slate-900/50 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                      {item.product.nom}
                    </h5>
                    <span className="text-[11px] text-slate-400">
                      {item.product.prixVente.toLocaleString()} DA × {item.qty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQty(item.product.id, -1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1.5">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.product.id, 1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-black text-slate-900 dark:text-white w-16 text-right">
                      {(item.product.prixVente * item.qty).toLocaleString()} DA
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CART SUMMARY & ACTIONS FOOTER */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80 space-y-3 shrink-0">
          {/* Subtotal & Remise */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">Sous-total</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {isReturnMode ? `- ${subtotalCart.toFixed(2)}` : `${subtotalCart.toFixed(2)}`} DA
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setShowDiscountModal(true)}
                className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
              >
                <Percent className="w-3 h-3" />
                <span>Remise / Majoration</span>
              </button>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {globalDiscount.toFixed(2)} DA
              </span>
            </div>
          </div>

          {/* Big Total Dû */}
          <div className="flex items-baseline justify-between border-t border-slate-100 dark:border-slate-700/60 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Dû</span>
            <div className="text-right">
              <span className={`text-2xl sm:text-3xl font-black ${isReturnMode ? 'text-red-600' : 'text-blue-600 dark:text-blue-400'}`}>
                {totalCart.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-500 ml-1">DA</span>
            </div>
          </div>

          {/* Quick Action Buttons Grid (5 buttons row) */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            <button
              type="button"
              onClick={clearCart}
              title="Annuler (F4)"
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/90 hover:border-red-400 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-red-600 dark:text-red-400 transition-all cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-extrabold text-red-600">Annuler</span>
              <span className="text-[9px] font-bold text-red-400">F4</span>
            </button>

            <button
              type="button"
              onClick={handleSuspendCart}
              disabled={cart.length === 0}
              title="Suspendre (F2)"
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/90 hover:border-amber-400 disabled:opacity-40 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-amber-600 dark:text-amber-400 transition-all cursor-pointer shadow-2xs"
            >
              <PauseCircle className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-extrabold text-amber-600">Suspendre</span>
              <span className="text-[9px] font-bold text-amber-400">F2</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRecentSalesModal(true)}
              title="Historique"
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/90 hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-blue-600 dark:text-blue-400 transition-all cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-extrabold text-blue-600">Historique</span>
              <span className="text-[9px] font-bold text-transparent select-none">-</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDraftsModal(true)}
              title="Brouillons (F3)"
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/90 hover:border-slate-400 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
            >
              <PauseCircle className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300">Brouillons</span>
              <span className="text-[9px] font-bold text-slate-400">F3</span>
            </button>

            <button
              type="button"
              onClick={toggleAutoPrint}
              title={`Impression (F5) - ${isAutoPrintEnabled ? 'Activée' : 'Désactivée'}`}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer shadow-2xs ${
                isAutoPrintEnabled
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-400'
              }`}
            >
              {isAutoPrintEnabled ? (
                <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <div className="relative">
                  <Printer className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-5 h-[1.5px] bg-slate-400 dark:bg-slate-500 rotate-45 rounded-full" />
                  </div>
                </div>
              )}
              <span className={`text-[10px] font-extrabold ${isAutoPrintEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                Impression
              </span>
              <span className={`text-[9px] font-bold ${isAutoPrintEnabled ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400'}`}>
                F5
              </span>
            </button>
          </div>

          {/* Main Payment / Return Confirmation Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => setShowCheckoutModal(true)}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isReturnMode
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
            }`}
          >
            <Receipt className="w-4 h-4 shrink-0" />
            <span>
              {isReturnMode
                ? 'Confirmer le retour'
                : isAutoPrintEnabled
                ? 'Payer'
                : 'Régler la facture'}
            </span>
            <span className="bg-blue-700/90 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md ml-1">
              F1
            </span>
          </button>

          {/* Secondary Bottom Row Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleOpenProformaModal}
              title="Créer une facture pro-forma"
              className="py-2 px-2 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-300/90 dark:border-amber-700/80 text-amber-700 dark:text-amber-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100/60 transition-all cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>pro-forma</span>
            </button>
            <button
              type="button"
              onClick={handleOpenOrderModal}
              title="Enregistrer comme bon de commande"
              className="py-2 px-2 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-300/90 dark:border-blue-700/80 text-blue-600 dark:text-blue-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100/60 transition-all cursor-pointer shadow-2xs"
            >
              <FileCheck className="w-3.5 h-3.5 shrink-0" />
              <span>commande</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPrintCenterModal(true)}
              title="Centre d'impression"
              className="py-2 px-2 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-300/90 dark:border-purple-700/80 text-purple-700 dark:text-purple-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-purple-100/60 transition-all cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Ajouter un produit libre (F8) */}
      {showFreeProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="bg-amber-500 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Ajouter un produit libre</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFreeProductModal(false)}
                className="hover:opacity-75 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFreeProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nom du produit
                </label>
                <input
                  type="text"
                  required
                  value={freeProductName}
                  onChange={(e) => setFreeProductName(e.target.value)}
                  placeholder="Ex: Service de livraison, réparation..."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-amber-400 text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Prix de vente (DA)
                </label>
                <input
                  type="number"
                  required
                  value={freeProductSalePrice}
                  onChange={(e) => setFreeProductSalePrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Prix d'achat (optionnel)
                </label>
                <input
                  type="number"
                  value={freeProductCostPrice}
                  onChange={(e) => setFreeProductCostPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Ajouter au panier</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Paramètres d'affichage (Personnaliser) */}
      {showDisplaySettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                <h3 className="font-extrabold text-base">{t('pos.displaySettings', 'Paramètres d\'affichage')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDisplaySettingsModal(false)}
                className="hover:opacity-75 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Disposition */}
              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase">
                  {t('pos.layout', 'Disposition')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setLayoutDesign('design1')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      layoutDesign === 'design1'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 font-bold'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Grid className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs block font-bold">{t('pos.design1', 'Design 1')}</span>
                    <span className="text-[9px] text-slate-400 block">{t('pos.design1Desc', 'Résumé sous le panier')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayoutDesign('design2')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      layoutDesign === 'design2'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 font-bold'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <List className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs block font-bold">{t('pos.design2', 'Design 2')}</span>
                    <span className="text-[9px] text-slate-400 block">{t('pos.design2Desc', 'Résumé sous les produits')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayoutDesign('design3')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      layoutDesign === 'design3'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 font-bold'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Barcode className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs block font-bold">{t('pos.design3', 'Design 3')}</span>
                    <span className="text-[9px] text-slate-400 block">{t('pos.design3Desc', 'Mode scanner rapide')}</span>
                  </button>
                </div>
              </div>

              {/* Mode d'affichage */}
              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase">
                  {t('pos.viewModeLabel', 'Mode d\'affichage')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                      viewMode === 'grid'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    <span>{t('pos.gridMode', 'Vue en grille')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                      viewMode === 'list'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span>{t('pos.listMode', 'Vue en liste')}</span>
                  </button>
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold">{t('pos.showImages', 'Afficher les Images')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={showImages}
                  onChange={(e) => setShowImages(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Zoom interface */}
              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase">
                  {t('pos.uiZoom', 'Zoom de l\'interface')}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold w-12 text-center cursor-pointer"
                  >
                    -
                  </button>
                  <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-center text-xs font-black">
                    {zoomLevel}%
                  </div>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold w-12 text-center cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Ajouter un Nouveau Produit */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col my-8">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Ajouter un Nouveau Produit
              </h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveNewProduct}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer le produit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-3 px-8 pt-4 pb-4 border-b border-slate-100 dark:border-slate-700/80 bg-white dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setAddProductTab('base')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
                  addProductTab === 'base'
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>Infos de base</span>
              </button>
              <button
                type="button"
                onClick={() => setAddProductTab('props')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
                  addProductTab === 'props'
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Propriétés & tarifs</span>
              </button>
              <button
                type="button"
                onClick={() => setAddProductTab('variants')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
                  addProductTab === 'variants'
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Variantes & couleurs</span>
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 max-h-[75vh]">
              {addProductTab === 'base' && (
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
                          value={newProdBarcode}
                          onChange={(e) => setNewProdBarcode(e.target.value)}
                          placeholder="Code-barres principal"
                          className="flex-1 h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />

                        <button
                          type="button"
                          onClick={() => openPrintBarcodeModal(newProdBarcode, newProdName, 'Détail', newProdSalePrice)}
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
                        {newProdExtraBarcodes.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-white dark:bg-slate-800 rounded-2xl border border-blue-200/80 dark:border-slate-700 shadow-sm flex items-center gap-2"
                          >
                            <input
                              type="text"
                              value={item.codeBarre}
                              onChange={(e) => {
                                const next = [...newProdExtraBarcodes];
                                next[idx] = { ...next[idx], codeBarre: e.target.value };
                                setNewProdExtraBarcodes(next);
                              }}
                              placeholder="Code-barres"
                              className="w-28 sm:w-36 h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                            />

                            <select
                              value={item.typePrix}
                              onChange={(e) => {
                                const next = [...newProdExtraBarcodes];
                                next[idx] = { ...next[idx], typePrix: e.target.value };
                                setNewProdExtraBarcodes(next);
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
                                  newProdName,
                                  item.typePrix,
                                  item.typePrix === 'Gros' ? newProdWholesalePrice : newProdSalePrice
                                )
                              }
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 transition-colors"
                              title="Imprimer ce code-barres"
                            >
                              <Barcode className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setNewProdExtraBarcodes(newProdExtraBarcodes.filter((_, i) => i !== idx))}
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

                  {/* Grid 2: Nom du Produit & Catégorie */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Nom du Produit <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="ex. Téléphone Portable..."
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <CreatableSelect
                        label="Catégorie"
                        value={newProdCategory}
                        onChange={setNewProdCategory}
                        options={categories}
                        placeholder="Choisir ou créer une catégorie..."
                      />
                    </div>
                  </div>

                  {/* Grid 3: Famille & Fournisseur */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <CreatableSelect
                        label="Famille"
                        value={newProdFamily}
                        onChange={setNewProdFamily}
                        options={Array.from(new Set(products.map((p) => p.famille).filter((f): f is string => Boolean(f))))}
                        placeholder="Exemple : Famille Coca-Cola"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Fournisseur
                      </label>
                      <select
                        value={newProdSupplier}
                        onChange={(e) => setNewProdSupplier(e.target.value)}
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      >
                        <option value="">Choisissez dans la liste des fournisseurs</option>
                        {Array.from(new Set(products.map((p) => p.fournisseurNom).filter((fn): fn is string => Boolean(fn)))).map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Grid 4: Alerte Stock Minimum & Emplacement */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Alerte Stock Minimum
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newProdMinStock}
                        onChange={(e) => setNewProdMinStock(e.target.value)}
                        placeholder="5"
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Emplacement / Étagère
                      </label>
                      <input
                        type="text"
                        value={newProdShelf}
                        onChange={(e) => setNewProdShelf(e.target.value)}
                        placeholder="Ex: Rayon A, Étagère 3"
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
                      value={newProdDescription}
                      onChange={(e) => setNewProdDescription(e.target.value)}
                      placeholder="Notes ou description du produit..."
                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                    />
                  </div>

                  {/* Image upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Image du Produit
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 overflow-hidden">
                        {newProdImage ? (
                          <img src={newProdImage} alt="Aperçu" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6" />
                        )}
                      </div>
                      <label className="cursor-pointer px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors">
                        <span>Choisir un fichier</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (re) => setNewProdImage(re.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <span className="text-xs text-slate-400">
                        {newProdImage ? 'Image sélectionnée' : 'Aucun fichier choisi'}
                      </span>
                    </div>
                  </div>

                  {/* Stock initial box */}
                  <div className="p-5 bg-slate-50/80 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Infos du lot initial (Stock de départ)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Quantité Initiale
                        </label>
                        <input
                          type="number"
                          value={newProdInitialQty}
                          onChange={(e) => setNewProdInitialQty(e.target.value)}
                          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Prix d'Achat (DA)
                        </label>
                        <input
                          type="number"
                          value={newProdCostPrice}
                          onChange={(e) => setNewProdCostPrice(e.target.value)}
                          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Marge bénéficiaire
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl">
                          <input
                            type="number"
                            value={newProdMargin}
                            onChange={(e) => handleMarginPillClick(parseFloat(e.target.value) || 0)}
                            className="w-10 text-xs font-bold text-center bg-transparent focus:outline-none"
                          />
                          <span className="text-xs font-bold text-emerald-600">%</span>
                        </div>
                        {[10, 20, 30, 50].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => handleMarginPillClick(m)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                              newProdMargin === m
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                : 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50'
                            }`}
                          >
                            {m}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Prix de Vente au Détail (DA)
                        </label>
                        <input
                          type="number"
                          value={newProdSalePrice}
                          onChange={(e) => setNewProdSalePrice(e.target.value)}
                          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-blue-400 dark:border-blue-600 text-slate-900 dark:text-white text-xs font-extrabold focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          Prix de Vente en Gros
                        </label>
                        <input
                          type="number"
                          value={newProdWholesalePrice}
                          onChange={(e) => setNewProdWholesalePrice(e.target.value)}
                          placeholder="Optionnel"
                          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Date de Péremption
                      </label>
                      <input
                        type="date"
                        value={newProdExpiry}
                        onChange={(e) => setNewProdExpiry(e.target.value)}
                        className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {addProductTab === 'props' && (
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
                          value={newProdUniteMesure}
                          onChange={(e) => setNewProdUniteMesure(e.target.value)}
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
                          value={newProdPoidsVolume}
                          onChange={(e) => setNewProdPoidsVolume(e.target.value)}
                          placeholder="Exemple : 500g"
                          className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Couleur</label>
                        <input
                          type="text"
                          value={newProdCouleur}
                          onChange={(e) => setNewProdCouleur(e.target.value)}
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
                          value={newProdUniteGros}
                          onChange={(e) => setNewProdUniteGros(e.target.value)}
                          placeholder="Laissez vide si aucun"
                          className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Quantité de Base dans l'Unité Majeure</label>
                        <input
                          type="text"
                          value={newProdQuantiteBaseGros}
                          onChange={(e) => setNewProdQuantiteBaseGros(e.target.value)}
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
                      {newProdPrixSupplementaires.map((prix, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={prix.label}
                            onChange={(e) => {
                              const newPrix = [...newProdPrixSupplementaires];
                              newPrix[index].label = e.target.value;
                              setNewProdPrixSupplementaires(newPrix);
                            }}
                            placeholder="Nom (ex: Prix VIP)"
                            className="flex-1 h-11 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                          />
                          <input
                            type="number"
                            value={prix.prix}
                            onChange={(e) => {
                              const newPrix = [...newProdPrixSupplementaires];
                              newPrix[index].prix = parseFloat(e.target.value) || 0;
                              setNewProdPrixSupplementaires(newPrix);
                            }}
                            placeholder="Prix"
                            className="w-32 h-11 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewProdPrixSupplementaires(newProdPrixSupplementaires.filter((_, i) => i !== index));
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
                      onClick={() => setNewProdPrixSupplementaires([...newProdPrixSupplementaires, { label: '', prix: 0 }])}
                      className="w-full py-3 rounded-2xl border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all"
                    >
                      + Ajouter un Prix Supplémentaire
                    </button>
                    <p className="text-[11px] text-slate-400">Exemple : Prix VIP / Prix de livraison / Gros spécial...</p>
                  </div>
                </div>
              )}

              {addProductTab === 'variants' && (
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
                        checked={newProdActiverVariantes} 
                        onChange={(e) => setNewProdActiverVariantes(e.target.checked)} 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-xs font-bold text-slate-700 dark:text-slate-300">Activer les variantes pour ce produit</span>
                    </label>
                  </div>

                  {newProdActiverVariantes && (
                    <>
                      {/* Groupes d'options */}
                      <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-800 shadow-sm space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Groupes d'options (Taille, Couleur, etc.)</h4>
                        
                        <div className="space-y-3">
                          {newProdGroupesOptions.map((groupe, idx) => (
                            <div key={idx} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                              <div className="flex gap-2 items-end">
                                <div className="flex-1 space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500">Nom de la propriété (ex : Couleur)</label>
                                  <input
                                    type="text"
                                    placeholder="Nom de la propriété (ex : Couleur)"
                                    value={groupe.nom}
                                    onChange={(e) => {
                                      const newG = [...newProdGroupesOptions];
                                      newG[idx].nom = e.target.value;
                                      setNewProdGroupesOptions(newG);
                                    }}
                                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setNewProdGroupesOptions(newProdGroupesOptions.filter((_, i) => i !== idx))}
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
                                          const newG = [...newProdGroupesOptions];
                                          newG[idx].options = groupe.options.filter((_, i) => i !== optIdx);
                                          setNewProdGroupesOptions(newG);
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
                                        const newG = [...newProdGroupesOptions];
                                        const currentOpts = newG[idx].options;
                                        vals.forEach(v => { if (!currentOpts.includes(v)) currentOpts.push(v); });
                                        setNewProdGroupesOptions(newG);
                                        e.currentTarget.value = '';
                                      }
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value.trim() !== '') {
                                        const vals = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                        const newG = [...newProdGroupesOptions];
                                        const currentOpts = newG[idx].options;
                                        vals.forEach(v => { if (!currentOpts.includes(v)) currentOpts.push(v); });
                                        setNewProdGroupesOptions(newG);
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
                          onClick={() => setNewProdGroupesOptions([...newProdGroupesOptions, { id: Math.random().toString(), nom: '', options: [] }])}
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
                              Nombre de combinaisons: {newProdVariantes.length}
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
                                if (newProdGroupesOptions.length === 0) return;
                                
                                const cartesian = (...a: any[][]) => a.reduce((acc, b) => acc.flatMap(d => b.map(e => [d, e].flat())));
                                const optionsList = newProdGroupesOptions.map(g => g.options.length > 0 ? g.options : ['']);
                                const combinations = cartesian(...optionsList);
                                
                                const newVars = combinations.map((combo: any) => {
                                  const name = Array.isArray(combo) ? combo.join(' - ') : combo;
                                  const existing = newProdVariantes.find(ev => ev.nom === name);
                                  return {
                                    id: existing?.id || Math.random().toString(),
                                    nom: name,
                                    codeBarre: existing?.codeBarre || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
                                    quantite: existing?.quantite || 0,
                                    prixAchat: existing?.prixAchat ?? (parseFloat(newProdCostPrice) || 0),
                                    prixVente: existing?.prixVente ?? (parseFloat(newProdSalePrice) || 0),
                                    actif: true
                                  };
                                });
                                setNewProdVariantes(newVars);
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              Générer / Actualiser le tableau
                            </button>
                          </div>
                        </div>

                        {newProdVariantes.length > 0 && (
                          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-4">
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs">
                                <Layers className="w-4 h-4" />
                                <span>Remplissage groupé</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold text-slate-500">Prix d'achat</label>
                                <input type="number" className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none" value={bulkPrixAchat} onChange={e => setBulkPrixAchat(e.target.value)} />
                                <button onClick={() => setNewProdVariantes(newProdVariantes.map(v => ({...v, prixAchat: parseFloat(bulkPrixAchat) || 0})))} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors">Appliquer</button>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold text-slate-500">Prix de vente</label>
                                <input type="number" className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none" value={bulkPrixVente} onChange={e => setBulkPrixVente(e.target.value)} />
                                <button onClick={() => setNewProdVariantes(newProdVariantes.map(v => ({...v, prixVente: parseFloat(bulkPrixVente) || 0})))} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors">Appliquer</button>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold text-slate-500">Prix de gros</label>
                                <input type="number" className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none" value={bulkPrixGros} onChange={e => setBulkPrixGros(e.target.value)} />
                                <button onClick={() => setNewProdVariantes(newProdVariantes.map(v => ({...v, prixVenteGros: parseFloat(bulkPrixGros) || 0})))} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors">Appliquer</button>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold text-slate-500">Qté</label>
                                <input type="number" className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none" value={bulkQte} onChange={e => setBulkQte(e.target.value)} />
                                <button onClick={() => setNewProdVariantes(newProdVariantes.map(v => ({...v, quantite: parseInt(bulkQte) || 0})))} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors">Appliquer</button>
                              </div>
                              
                              <button onClick={() => setNewProdVariantes(newProdVariantes.map(v => ({...v, codeBarre: v.codeBarre || Math.floor(100000000000 + Math.random() * 900000000000).toString()})))} className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
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
                                      checked={newProdVariantes.length > 0 && newProdVariantes.every(v => v.actif)}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        setNewProdVariantes(newProdVariantes.map(v => ({...v, actif: checked})));
                                      }}
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Actif
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {newProdVariantes.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                                    Ajoutez des propriétés, puis cliquez sur "Générer / Mettre à jour le tableau"
                                  </td>
                                </tr>
                              ) : (
                                newProdVariantes.map((v, i) => (
                                  <tr key={v.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="p-3 text-slate-500 font-medium">{i + 1}</td>
                                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{v.nom}</td>
                                    <td className="p-2">
                                      <div className="flex items-center gap-1">
                                        <input 
                                          type="text" 
                                          value={v.codeBarre} 
                                          onChange={(e) => {
                                            const newV = [...newProdVariantes];
                                            newV[i].codeBarre = e.target.value;
                                            setNewProdVariantes(newV);
                                          }}
                                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500/30 focus:outline-none" 
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newV = [...newProdVariantes];
                                            newV[i].codeBarre = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                                            setNewProdVariantes(newV);
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
                                          const newV = [...newProdVariantes];
                                          newV[i].quantite = parseInt(e.target.value) || 0;
                                          setNewProdVariantes(newV);
                                        }}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500/30 focus:outline-none" 
                                      />
                                    </td>
                                    <td className="p-2">
                                      <input 
                                        type="number" 
                                        value={v.prixAchat}
                                        onChange={(e) => {
                                          const newV = [...newProdVariantes];
                                          newV[i].prixAchat = parseFloat(e.target.value) || 0;
                                          setNewProdVariantes(newV);
                                        }}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500/30 focus:outline-none" 
                                      />
                                    </td>
                                    <td className="p-2">
                                      <input 
                                        type="number" 
                                        value={v.prixVente}
                                        onChange={(e) => {
                                          const newV = [...newProdVariantes];
                                          newV[i].prixVente = parseFloat(e.target.value) || 0;
                                          setNewProdVariantes(newV);
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
                                            const newV = [...newProdVariantes];
                                            newV[i].prixVenteGros = parseFloat(e.target.value) || 0;
                                            setNewProdVariantes(newV);
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
                                            const newV = [...newProdVariantes];
                                            newV[i].datePeremption = e.target.value;
                                            setNewProdVariantes(newV);
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
                                          const newV = [...newProdVariantes];
                                          newV[i].actif = e.target.checked;
                                          setNewProdVariantes(newV);
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
                        <AlertCircle className="w-5 h-5 shrink-0 text-orange-500 dark:text-orange-400" />
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
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer"
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
                className="w-full py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Ventes Récentes (Historique F3) */}
      {showRecentSalesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Ventes Récentes</span>
                </h3>
                <p className="text-xs text-slate-400">Dernières transactions de vente</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRecentSalesModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {sales.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-bold">
                  Aucune vente dans l'historique actuel.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Vente N°</th>
                        <th className="py-2.5 px-3">Date & Heure</th>
                        <th className="py-2.5 px-3">Client</th>
                        <th className="py-2.5 px-3">Articles</th>
                        <th className="py-2.5 px-3">Total (DA)</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {sales.slice(0, 10).map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-600">#{s.id}</td>
                          <td className="py-2.5 px-3 text-slate-500">{s.date}</td>
                          <td className="py-2.5 px-3 font-bold">{s.clientNom}</td>
                          <td className="py-2.5 px-3 text-slate-500">{s.items.length} article(s)</td>
                          <td className="py-2.5 px-3 font-black text-slate-900 dark:text-white">{s.total} DA</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                printReceipt({
                                  id: s.id,
                                  date: s.date,
                                  clientNom: s.clientNom,
                                  items: s.items,
                                  total: s.total,
                                  montantPaye: s.montantPaye,
                                  reste: s.reste,
                                  methodePaiement: s.methodePaiement,
                                  session: s.session,
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Imprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowRecentSalesModal(false);
                  if (onGoToJournalVentes) onGoToJournalVentes();
                }}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl text-xs font-extrabold hover:bg-blue-100 flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Recherche approfondie dans tout l'enregistrement</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRecentSalesModal(false)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Brouillons en attente */}
      {showDraftsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/30">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Brouillons en attente
                  </h3>
                  <p className="text-[11px] text-slate-400">Factures suspendues et non encore terminées.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDraftsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {suspendedDrafts.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                  <p className="font-bold">Aucun brouillon suspendu actuellement.</p>
                </div>
              ) : (
                suspendedDrafts.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-600">{d.id} • {d.date}</span>
                      <h5 className="font-bold text-xs">{d.clientNom}</h5>
                      <p className="text-[10px] text-slate-400">{d.items.length} article(s) - Total: {d.total} DA</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleResumeDraft(d)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl"
                    >
                      Reprendre
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Centre d'impression */}
      {showPrintCenterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                <div>
                  <h3 className="font-extrabold text-base">Centre d'impression</h3>
                  <p className="text-[10px] opacity-80">
                    {sales.length > 0 ? `Dernière vente #${sales[0].id}` : 'Aucune vente récente'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintCenterModal(false)}
                className="hover:opacity-75 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 flex border-b border-slate-200 dark:border-slate-700 gap-2">
              <button
                type="button"
                onClick={() => setPrintCenterTab('print')}
                className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  printCenterTab === 'print' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                Imprimer
              </button>
              <button
                type="button"
                onClick={() => setPrintCenterTab('pdf')}
                className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  printCenterTab === 'pdf' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                PDF / Partager
              </button>
            </div>

            <div className="p-8 text-center space-y-3">
              <Printer className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto stroke-1" />
              {sales.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Ticket de caisse pour la vente #{sales[0].id} ({sales[0].total} DA)
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const latestSale = sales[0];
                      if (latestSale) {
                        printReceipt({
                          id: latestSale.id,
                          date: latestSale.date,
                          clientNom: latestSale.clientNom,
                          items: latestSale.items,
                          total: latestSale.total,
                          montantPaye: latestSale.montantPaye,
                          reste: latestSale.reste,
                          methodePaiement: latestSale.methodePaiement,
                          session: latestSale.session,
                        });
                      } else if (cart.length > 0) {
                        printReceipt({
                          date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                          clientNom: selectedCustomer,
                          items: cart.map((i) => ({
                            nom: i.product.nom,
                            prixUnitaire: i.product.prixVente,
                            quantite: i.qty,
                            total: i.product.prixVente * i.qty,
                          })),
                          total: totalCart,
                        });
                      }
                      setShowPrintCenterModal(false);
                    }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Lancer l'impression
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Aucune vente récente à imprimer. Finalisez une vente, ou sélectionnez un client pour la facture récapitulative.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Remise / Majoration */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Remise sur la commande</h3>
              <button
                type="button"
                onClick={() => setShowDiscountModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDiscountType('percent')}
                className={`py-2 rounded-xl text-xs font-extrabold transition-colors ${
                  discountType === 'percent' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                }`}
              >
                Pourcentage (%)
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('amount')}
                className={`py-2 rounded-xl text-xs font-extrabold transition-colors ${
                  discountType === 'amount' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                }`}
              >
                Montant Fixe (DA)
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                {discountType === 'percent' ? 'Pourcentage (%)' : 'Montant de la remise (DA)'}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="Ex: 10"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-sm font-bold focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleApplyDiscount}
              className="w-full py-3 bg-blue-600 text-white font-extrabold text-xs rounded-2xl shadow-md"
            >
              Appliquer la remise
            </button>
          </div>
        </div>
      )}

      {/* MODAL 8: Checkout / Encaissement Ticket (F1) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isReturnMode ? t('pos.confirmReturnHeader', "Confirmation du Retour d'Article") : t('pos.checkoutHeader', 'Encaissement du Ticket')}
              </h3>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl flex justify-between items-center ${
                  isReturnMode
                    ? 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300'
                    : 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                }`}
              >
                <span className="text-xs font-bold uppercase">
                  {isReturnMode ? t('pos.amountToRefund', 'Montant à Rembourser') : t('pos.totalDue', 'Total Dû')}
                </span>
                <span
                  className={`text-2xl font-black ${
                    isReturnMode ? 'text-red-600' : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {Math.abs(totalCart).toFixed(2)} DA
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t('journal.paymentMethod', 'Mode de Paiement')}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('especes')}
                    className={`p-3 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer ${
                      paymentMethod === 'especes'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t('journal.cash', 'Espèces')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('carte')}
                    className={`p-3 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer ${
                      paymentMethod === 'carte'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t('journal.card', 'Carte (CIB)')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit')}
                    className={`p-3 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer ${
                      paymentMethod === 'credit'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t('journal.debt', 'Crédit (Dette)')}
                  </button>
                </div>
              </div>

              {paymentMethod === 'especes' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t('pos.amountReceived', 'Montant Reçu (DA)')}</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder={Math.abs(totalCart).toString()}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none"
                  />
                  {parseFloat(amountPaid) > Math.abs(totalCart) && (
                    <p className="text-xs font-bold text-emerald-600 mt-2">
                      {t('pos.changeToReturn', 'Rendu monnaie')} : {(parseFloat(amountPaid) - Math.abs(totalCart)).toFixed(2)} DA
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleFinalizeSale}
                className={`w-full py-4 rounded-2xl font-extrabold text-sm text-white shadow-lg transition-all cursor-pointer ${
                  isReturnMode
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                    : isAutoPrintEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                }`}
              >
                {isReturnMode
                  ? t('pos.confirmReturnBtn', 'Valider le retour')
                  : isAutoPrintEnabled
                  ? t('pos.confirmPrintBtn', 'Confirmer & Imprimer Ticket')
                  : 'Régler la facture'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Enregistrer comme Bon de Commande (Matching Screenshot 3) */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Enregistrer comme bon de commande</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveOrder} className="p-6 space-y-4">
              {/* Client & Total info header */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                <div className="text-xs">
                  <span className="text-slate-500 font-medium">Client: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCustomer}</span>
                  <div className="text-[11px] text-slate-400">{cart.reduce((acc, i) => acc + i.qty, 0)} article(s)</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Commande</span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400">{totalCart.toFixed(2)} DA</span>
                </div>
              </div>

              {/* Date de livraison prévue */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date de livraison prévue
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={orderDeliveryDate}
                    onChange={(e) => setOrderDeliveryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Acompte */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Acompte (DA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={orderDeposit}
                  onChange={(e) => setOrderDeposit(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                  À la livraison, l'acompte est imputé sur la facture réelle
                </p>
              </div>

              {/* Mode de réception de l'acompte */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mode de réception de l'acompte
                </label>
                <select
                  value={orderDepositMethod}
                  onChange={(e) => setOrderDepositMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-blue-500 dark:border-blue-400 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value="Espèces (Cash)">Espèces (Cash)</option>
                  <option value="Carte Bancaire (CIB / Edahabia)">Carte Bancaire (CIB / Edahabia)</option>
                  <option value="Chèque bancaire">Chèque bancaire</option>
                  <option value="Virement bancaire">Virement bancaire</option>
                </select>
              </div>

              {/* Notes et conditions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes et conditions
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Conditions particulières de la commande..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none h-20 resize-none"
                />
              </div>

              {/* Checkbox Réserver le stock */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1 select-none">
                <input
                  type="checkbox"
                  checked={orderReserveStock}
                  onChange={(e) => setOrderReserveStock(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Réserver le stock pour cette commande
                </span>
              </label>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer la commande</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Enregistrer comme Facture Pro-forma */}
      {showProformaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-amber-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Enregistrer comme facture pro-forma</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProformaModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProforma} className="p-6 space-y-4">
              {/* Client & Pricing Breakdown */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Client: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCustomer}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Total HT (estimation): </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{(totalCart / 1.19).toFixed(2)} DA</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">TVA (19%): </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{(totalCart - totalCart / 1.19).toFixed(2)} DA</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-1 border-t border-amber-200 dark:border-amber-800">
                  <span className="font-bold text-amber-900 dark:text-amber-200">Total TTC Devis: </span>
                  <span className="font-black text-amber-700 dark:text-amber-400">{totalCart.toFixed(2)} DA</span>
                </div>
              </div>

              {/* Date de validité */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date de validité de l'offre
                </label>
                <input
                  type="date"
                  required
                  value={proformaValidityDate}
                  onChange={(e) => setProformaValidityDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Notes et conditions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Conditions particulières / Remarques
                </label>
                <textarea
                  value={proformaNotes}
                  onChange={(e) => setProformaNotes(e.target.value)}
                  placeholder="Conditions de paiement, délai de livraison estimé..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none h-20 resize-none"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProformaModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer la pro-forma</span>
                </button>
              </div>
            </form>
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
