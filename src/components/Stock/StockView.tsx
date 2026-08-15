import React, { useState } from 'react';
import { Search, Plus, Boxes, AlertTriangle, Trash2, Edit2, SlidersHorizontal, Barcode, X, Check, Save, Info, Tag, Palette, Package, Image as ImageIcon, Copy, PlusCircle, Columns, Layers, X, ChevronDown } from 'lucide-react';
import { Product, Supplier, ProductPriceExtra, ProductVariant, ProductOptionGroup } from '../../types';
import { useLanguage } from '../../lib/i18n';

interface StockViewProps {
  products: Product[];
  categories: string[];
  suppliers?: Supplier[];
  onAddProduct: (product: Omit<Product, 'id'> | Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const StockView: React.FC<StockViewProps> = ({
  products,
  categories,
  suppliers = [],
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

  // Form State
  const [nom, setNom] = useState('');
  const [codeBarre, setCodeBarre] = useState('');
  const [extraBarcodes, setExtraBarcodes] = useState<string[]>([]);
  const [categorie, setCategorie] = useState('');
  const [famille, setFamille] = useState('');
  const [fournisseurNom, setFournisseurNom] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [emplacement, setEmplacement] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

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
    setCodeBarre(Math.floor(100000000000 + Math.random() * 900000000000).toString());
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
    setExtraBarcodes(p.codesBarresSupp || []);
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
    setCodeBarre(Math.floor(100000000000 + Math.random() * 900000000000).toString());
  };

  const handleAddExtraBarcode = () => {
    const newCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setExtraBarcodes([...extraBarcodes, newCode]);
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
      codesBarresSupp: extraBarcodes,
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
      const updated: Product = { ...pData, id: editingProduct.id };
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

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl">
                          <Barcode className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.codeBarre}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                        <div>
                          <span className="text-sm block">{p.nom}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-medium text-slate-400">
                              {p.categorie || 'Général'}
                            </span>
                            {p.famille && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-500">
                                {p.famille}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-black text-slate-900 dark:text-white text-sm">
                        {p.quantite}
                      </td>

                      <td className="py-4 px-6">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            Rupture
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            Stock Faible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Valide
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-all"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Voulez-vous vraiment supprimer "${p.nom}" ?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-all"
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
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
              </h3>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer le produit</span>
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/30 px-6 pt-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('base')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-extrabold text-xs transition-all border-t border-x ${
                  activeTab === 'base'
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/80 shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>Infos de base</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tarifs')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-extrabold text-xs transition-all border-t border-x ${
                  activeTab === 'tarifs'
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/80 shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Propriétés & tarifs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('variantes')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-extrabold text-xs transition-all border-t border-x ${
                  activeTab === 'variantes'
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/80 shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Variantes & couleurs</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* TAB 1: Infos de base */}
              {activeTab === 'base' && (
                <div className="space-y-5">
                  {/* Grid 1: Barcode & Extra Barcodes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Code-barres
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={codeBarre}
                          onChange={(e) => setCodeBarre(e.target.value)}
                          placeholder="Code-barres principal"
                          className="w-full h-11 pr-11 pl-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        <button
                          type="button"
                          onClick={generateBarcode}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-300"
                          title="Générer code-barres"
                        >
                          <Barcode className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Codes-barres Supplémentaires (Optionnel)
                      </label>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleAddExtraBarcode}
                          className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-50/50"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Ajouter un Code-barres</span>
                        </button>
                        {extraBarcodes.map((code, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={code}
                              onChange={(e) => {
                                const next = [...extraBarcodes];
                                next[idx] = e.target.value;
                                setExtraBarcodes(next);
                              }}
                              className="flex-1 h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 font-mono text-xs font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => setExtraBarcodes(extraBarcodes.filter((_, i) => i !== idx))}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Remarque : Chaque code-barres doit être unique.
                      </p>
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

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Catégorie
                      </label>
                      <input
                        type="text"
                        list="modal-categories"
                        value={categorie}
                        onChange={(e) => setCategorie(e.target.value)}
                        placeholder="Choisir ou saisir une catégorie..."
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                      <datalist id="modal-categories">
                        {categories.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Famille & Fournisseur */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Famille
                      </label>
                      <input
                        type="text"
                        value={famille}
                        onChange={(e) => setFamille(e.target.value)}
                        placeholder="Exemple : Famille Coca-Cola"
                        className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>

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
                                  return {
                                    id: Math.random().toString(),
                                    nom: name,
                                    codeBarre: v.codeBarre || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
                                    quantite: 0,
                                    prixAchat: parseFloat(prixAchat) || 0,
                                    prixVente: parseFloat(prixVente) || 0,
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
    </div>
  );
};
