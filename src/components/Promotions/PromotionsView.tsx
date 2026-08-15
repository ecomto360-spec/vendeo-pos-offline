import React, { useState } from 'react';
import { Tag, Plus, Search, Calendar, ShoppingCart, Trash2, X, Save, CheckCircle, AlertCircle, ToggleLeft, ToggleRight, Package } from 'lucide-react';
import { Promotion, Product } from '../../types';

interface PromotionsViewProps {
  promotions: Promotion[];
  products: Product[];
  onAddPromotion: (p: Promotion) => void;
  onUpdatePromotion?: (p: Promotion) => void;
  onDeletePromotion: (id: string) => void;
}

export const PromotionsView: React.FC<PromotionsViewProps> = ({
  promotions,
  products,
  onAddPromotion,
  onUpdatePromotion,
  onDeletePromotion,
}) => {
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [typeRemise, setTypeRemise] = useState<'pourcentage' | 'montant_fixe'>('pourcentage');
  const [valeurRemise, setValeurRemise] = useState<number | ''>('');
  
  // Format current datetime for default start date
  const nowStr = new Date().toISOString().slice(0, 16);
  const [dateDebut, setDateDebut] = useState(nowStr);
  const [dateFin, setDateFin] = useState('');
  const [limiteQuantite, setLimiteQuantite] = useState<number | ''>('');

  const openAddModal = () => {
    setSelectedProduct(null);
    setProductSearch('');
    setShowProductDropdown(false);
    setTypeRemise('pourcentage');
    setValeurRemise('');
    setDateDebut(new Date().toISOString().slice(0, 16));
    setDateFin('');
    setLimiteQuantite('');
    setShowModal(true);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductSearch(product.nom);
    setShowProductDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('Veuillez sélectionner un produit pour la promotion.');
      return;
    }
    const val = typeof valeurRemise === 'number' ? valeurRemise : parseFloat(valeurRemise as string);
    if (!val || val <= 0) {
      alert('Veuillez saisir une valeur de remise valide.');
      return;
    }

    const newPromo: Promotion = {
      id: `promo_${Date.now()}`,
      productId: selectedProduct.id,
      productNom: selectedProduct.nom,
      productCodeBarre: selectedProduct.codeBarre,
      typeRemise,
      valeurRemise: val,
      dateDebut: dateDebut ? dateDebut.replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
      dateFin: dateFin ? dateFin.replace('T', ' ') : '',
      limiteQuantite: typeof limiteQuantite === 'number' ? limiteQuantite : undefined,
      statut: 'active',
    };

    onAddPromotion(newPromo);
    setShowModal(false);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.nom.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.codeBarre.includes(productSearch)
  );

  const toggleStatut = (promo: Promotion) => {
    if (onUpdatePromotion) {
      onUpdatePromotion({
        ...promo,
        statut: promo.statut === 'active' ? 'inactive' : 'active',
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Gestion des Promotions</span>
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Configurez des remises pour des périodes spécifiques
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-lg shadow-red-600/20 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Créer une nouvelle promotion</span>
        </button>
      </div>

      {/* Promotions Table Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Produit</th>
                <th className="py-4 px-6">Remise</th>
                <th className="py-4 px-6">Validité</th>
                <th className="py-4 px-6">Limite de quantité</th>
                <th className="py-4 px-6">Statut</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold text-sm">
                    Aucune promotion
                  </td>
                </tr>
              ) : (
                promotions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      <div>
                        <span className="text-sm block">{p.productNom}</span>
                        {p.productCodeBarre && (
                          <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                            Code: {p.productCodeBarre}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-800/60">
                        {p.typeRemise === 'pourcentage' ? `${p.valeurRemise} %` : `${p.valeurRemise} DA`}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="block">Début: {p.dateDebut}</span>
                        {p.dateFin ? (
                          <span className="block text-slate-400 text-[11px]">Fin: {p.dateFin}</span>
                        ) : (
                          <span className="block text-emerald-600 dark:text-emerald-400 text-[11px]">Durée illimitée</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">
                      {p.limiteQuantite ? `${p.limiteQuantite} pcs` : 'Sans limite'}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold ${
                          p.statut === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.statut === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {p.statut === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onUpdatePromotion && (
                          <button
                            onClick={() => toggleStatut(p)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-all"
                            title={p.statut === 'active' ? 'Désactiver' : 'Activer'}
                          >
                            {p.statut === 'active' ? (
                              <ToggleRight className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm('Voulez-vous vraiment supprimer cette promotion ?')) {
                              onDeletePromotion(p.id);
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Créer une nouvelle promotion */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-red-600" />
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Créer une nouvelle promotion
                </h3>
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
              {/* Choisir le produit pour l'offre */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Choisir le produit pour l'offre
                </label>

                {selectedProduct ? (
                  <div className="flex items-center justify-between h-12 px-4 rounded-2xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-slate-900 dark:text-white text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-red-600" />
                      <span>{selectedProduct.nom}</span>
                      {selectedProduct.codeBarre && (
                        <span className="text-slate-400 text-[11px]">({selectedProduct.codeBarre})</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setProductSearch('');
                      }}
                      className="text-slate-400 hover:text-red-600 text-xs font-bold"
                    >
                      Changer
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setShowProductDropdown(true);
                        }}
                        onFocus={() => setShowProductDropdown(true)}
                        placeholder="Rechercher par nom ou code-barres"
                        className="w-full h-12 pr-11 pl-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/30"
                      />
                      <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {showProductDropdown && filteredProducts.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProduct(p)}
                            className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
                          >
                            <div>
                              <p className="font-extrabold">{p.nom}</p>
                              <p className="text-[11px] text-slate-400 font-normal">
                                Code: {p.codeBarre} | Prix: {p.prixVente} DA
                              </p>
                            </div>
                            <span className="text-[11px] text-blue-600 font-bold">Sélectionner</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Grid: Type de remise & Valeur de la remise */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Type de remise
                  </label>
                  <select
                    value={typeRemise}
                    onChange={(e) => setTypeRemise(e.target.value as any)}
                    className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  >
                    <option value="pourcentage">Pourcentage (%)</option>
                    <option value="montant_fixe">Montant Fixe (DA)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Valeur de la remise
                  </label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    value={valeurRemise}
                    onChange={(e) => setValeurRemise(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Par exemple : 20"
                    className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  />
                </div>
              </div>

              {/* Grid: Date de début & Date de fin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Date de début <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Date de fin <span className="text-slate-400 font-normal">(Optionnel)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  />
                </div>
              </div>

              {/* Highlighted Yellow/Amber Card: Limite de quantité */}
              <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-amber-800 dark:text-amber-300" />
                  <label className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                    Limite de quantité
                  </label>
                </div>

                <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300/80">
                  Si vous le laissez vide, l'offre sera valable pendant toute la période spécifiée, quelles que soient les ventes.
                </p>

                <input
                  type="number"
                  min="1"
                  value={limiteQuantite}
                  onChange={(e) => setLimiteQuantite(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Quantité autorisée..."
                  className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100 font-bold text-xs focus:outline-none"
                />
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
                  className="flex-1 py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/25 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
