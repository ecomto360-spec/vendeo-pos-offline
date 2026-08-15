import React, { useState } from 'react';
import { Package, Plus, Search, Barcode, Trash2, X, Save, ToggleLeft, ToggleRight, Edit, ShoppingBag, Minus } from 'lucide-react';
import { Pack, PackItem, Product } from '../../types';

interface PacksViewProps {
  packs: Pack[];
  products: Product[];
  onAddPack: (pack: Pack) => void;
  onUpdatePack?: (pack: Pack) => void;
  onDeletePack: (id: string) => void;
}

export const PacksView: React.FC<PacksViewProps> = ({
  packs,
  products,
  onAddPack,
  onUpdatePack,
  onDeletePack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);

  // Form State
  const [nom, setNom] = useState('');
  const [codeBarre, setCodeBarre] = useState('');
  const [prixVente, setPrixVente] = useState<number | ''>('');
  const [prixAchat, setPrixAchat] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [packItems, setPackItems] = useState<PackItem[]>([]);

  // Product Search within Modal
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const openAddModal = () => {
    setEditingPack(null);
    setNom('');
    setCodeBarre(`PK_${Date.now().toString().slice(-6)}`);
    setPrixVente('');
    setPrixAchat('');
    setDescription('');
    setPackItems([]);
    setProductSearch('');
    setShowProductDropdown(false);
    setShowModal(true);
  };

  const openEditModal = (p: Pack) => {
    setEditingPack(p);
    setNom(p.nom || '');
    setCodeBarre(p.codeBarre || '');
    setPrixVente(p.prixVente || '');
    setPrixAchat(p.prixAchat || '');
    setDescription(p.description || '');
    setPackItems(p.produits || []);
    setProductSearch('');
    setShowProductDropdown(false);
    setShowModal(true);
  };

  const handleAddProductToPack = (product: Product) => {
    const existingIndex = packItems.findIndex((item) => item.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...packItems];
      updated[existingIndex].quantite += 1;
      setPackItems(updated);
    } else {
      const newItem: PackItem = {
        productId: product.id,
        productNom: product.nom,
        productPrixVente: product.prixVente,
        productPrixAchat: product.prixAchat,
        quantite: 1,
      };
      setPackItems([...packItems, newItem]);
    }
    setProductSearch('');
    setShowProductDropdown(false);

    // Auto calculate sell & purchase price if empty or 0
    recalculatePrices([...packItems, { productId: product.id, productNom: product.nom, productPrixVente: product.prixVente, productPrixAchat: product.prixAchat, quantite: 1 }]);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updated = packItems
      .map((item) => {
        if (item.productId === productId) {
          const newQ = item.quantite + delta;
          return newQ > 0 ? { ...item, quantite: newQ } : null;
        }
        return item;
      })
      .filter(Boolean) as PackItem[];

    setPackItems(updated);
    recalculatePrices(updated);
  };

  const removeProductFromPack = (productId: string) => {
    const updated = packItems.filter((item) => item.productId !== productId);
    setPackItems(updated);
    recalculatePrices(updated);
  };

  const recalculatePrices = (items: PackItem[]) => {
    if (items.length === 0) return;
    const totalAchat = items.reduce((sum, item) => sum + (item.productPrixAchat || 0) * item.quantite, 0);
    const totalVente = items.reduce((sum, item) => sum + item.productPrixVente * item.quantite, 0);
    
    // Suggest slightly discounted price for sale if creating new
    if (!prixVente || typeof prixVente !== 'number') {
      setPrixVente(Math.round(totalVente * 0.9)); // 10% discount default for pack
    }
    if (!prixAchat || typeof prixAchat !== 'number') {
      setPrixAchat(totalAchat);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      alert('Veuillez saisir un nom pour le pack.');
      return;
    }
    const pVente = typeof prixVente === 'number' ? prixVente : parseFloat(prixVente as string);
    if (!pVente || pVente <= 0) {
      alert('Veuillez indiquer un prix de vente valide.');
      return;
    }
    if (packItems.length === 0) {
      alert('Veuillez ajouter au moins un produit au pack.');
      return;
    }

    const pAchat = typeof prixAchat === 'number' ? prixAchat : parseFloat(prixAchat as string) || 0;

    if (editingPack) {
      const updatedPack: Pack = {
        ...editingPack,
        nom: nom.trim(),
        codeBarre: codeBarre.trim(),
        prixVente: pVente,
        prixAchat: pAchat,
        description: description.trim(),
        produits: packItems,
      };
      if (onUpdatePack) {
        onUpdatePack(updatedPack);
      } else {
        onAddPack(updatedPack);
      }
    } else {
      const newPack: Pack = {
        id: `pack_${Date.now()}`,
        nom: nom.trim(),
        codeBarre: codeBarre.trim() || `PK_${Date.now().toString().slice(-6)}`,
        prixVente: pVente,
        prixAchat: pAchat,
        description: description.trim(),
        produits: packItems,
        statut: 'actif',
      };
      onAddPack(newPack);
    }

    setShowModal(false);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.nom.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.codeBarre.includes(productSearch)
  );

  const filteredPacks = packs.filter(
    (p) =>
      p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.codeBarre && p.codeBarre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleStatut = (pack: Pack) => {
    if (onUpdatePack) {
      onUpdatePack({
        ...pack,
        statut: pack.statut === 'actif' ? 'inactif' : 'actif',
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Gestion des Packs</span>
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Regroupez plusieurs produits dans une offre à prix spécial
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-600/25 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un nouveau pack</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher des packs par nom ou code-barres..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Packs Table Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Nom du pack</th>
                <th className="py-4 px-6">Code-barres</th>
                <th className="py-4 px-6">Nombre de produits</th>
                <th className="py-4 px-6">Prix de Vente</th>
                <th className="py-4 px-6">Statut</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {filteredPacks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                        <Package className="w-6 h-6" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                        Aucun pack trouvé
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPacks.map((pack) => {
                  const totalItemsCount = pack.produits.reduce((acc, item) => acc + item.quantite, 0);
                  return (
                    <tr key={pack.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                        <div>
                          <span className="text-sm block">{pack.nom}</span>
                          {pack.description && (
                            <span className="text-[11px] font-normal text-slate-400 block mt-0.5">
                              {pack.description}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1 font-mono text-xs bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
                          <Barcode className="w-3.5 h-3.5 text-slate-400" />
                          <span>{pack.codeBarre || '-'}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full font-black text-xs">
                          {pack.produits.length} article(s) ({totalItemsCount} pcs)
                        </span>
                      </td>

                      <td className="py-4 px-6 font-black text-slate-900 dark:text-white text-sm">
                        {pack.prixVente.toLocaleString()} DA
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold ${
                            pack.statut === 'actif'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              pack.statut === 'actif' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {pack.statut === 'actif' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onUpdatePack && (
                            <button
                              onClick={() => toggleStatut(pack)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-all"
                              title={pack.statut === 'actif' ? 'Désactiver' : 'Activer'}
                            >
                              {pack.statut === 'actif' ? (
                                <ToggleRight className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => openEditModal(pack)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-all"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Voulez-vous vraiment supprimer le pack "${pack.nom}" ?`)) {
                                onDeletePack(pack.id);
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
      </div>

      {/* Modal: Ajouter / Modifier Un Pack */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {editingPack ? 'Modifier le pack' : 'Ajouter un nouveau pack'}
                </h3>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  Choisissez les produits et les quantités pour créer le pack
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Grid: Nom du pack & Code-barres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Nom du pack <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex: Pack Bureau Complet"
                    className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Code-barres
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={codeBarre}
                      onChange={(e) => setCodeBarre(e.target.value)}
                      placeholder="Optionnel"
                      className="w-full h-11 pr-11 pl-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500">
                      <Barcode className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid: Prix de Vente & Prix d'Achat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Prix de Vente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      value={prixVente}
                      onChange={(e) => setPrixVente(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ex: 1200"
                      className="w-full h-11 pr-12 pl-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">
                      DA
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Prix d'Achat
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={prixAchat}
                      onChange={(e) => setPrixAchat(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ex: 900"
                      className="w-full h-11 pr-12 pl-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">
                      DA
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description optionnelle du pack"
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Section: Produits du pack */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Produits du pack</span>
                </div>

                {/* Product Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder="Rechercher un produit..."
                    className="w-full h-11 pr-11 pl-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

                  {showProductDropdown && filteredProducts.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleAddProductToPack(p)}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
                        >
                          <div>
                            <p className="font-extrabold">{p.nom}</p>
                            <p className="text-[11px] text-slate-400 font-normal">
                              Prix Vente: {p.prixVente} DA | Code: {p.codeBarre}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Ajouter
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Pack Items Container */}
                <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/40 min-h-[140px] flex flex-col justify-center">
                  {packItems.length === 0 ? (
                    <div className="text-center space-y-2 py-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <Package className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-slate-400 font-semibold">
                        Aucun produit ajouté. Recherchez et ajoutez des produits.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 w-full">
                      {packItems.map((item) => (
                        <div
                          key={item.productId}
                          className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                              {item.productNom}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-400">
                              Unit: {item.productPrixVente} DA
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="w-8 text-center text-xs font-black text-slate-900 dark:text-white">
                              {item.quantite}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, 1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <span className="w-20 text-right text-xs font-black text-blue-600 dark:text-blue-400">
                              {(item.productPrixVente * item.quantite).toLocaleString()} DA
                            </span>

                            <button
                              type="button"
                              onClick={() => removeProductFromPack(item.productId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/25 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer le pack</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
