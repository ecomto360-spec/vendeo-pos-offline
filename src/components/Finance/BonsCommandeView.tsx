import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  Printer,
  Calendar,
  User,
  Phone,
  PackageCheck,
  Clock,
  X,
  FileText,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { BonCommande, Product, Customer, Sale } from '../../types';

interface BonsCommandeViewProps {
  orders: BonCommande[];
  products: Product[];
  customers: Customer[];
  onAddOrder: (newOrder: BonCommande) => void;
  onUpdateStatus: (id: string, newStatus: 'en_attente' | 'livree' | 'annulee') => void;
  onDeleteOrder: (id: string) => void;
  onConvertToSale?: (order: BonCommande) => void;
}

export const BonsCommandeView: React.FC<BonsCommandeViewProps> = ({
  orders,
  products,
  customers,
  onAddOrder,
  onUpdateStatus,
  onDeleteOrder,
  onConvertToSale,
}) => {
  // Filter States
  const [activeTab, setActiveTab] = useState<'tous' | 'en_attente' | 'livree' | 'annulee'>('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewOrder, setViewOrder] = useState<BonCommande | null>(null);

  // Form State for New Order
  const [clientNom, setClientNom] = useState('');
  const [clientTelephone, setClientTelephone] = useState('');
  const [dateLivraisonPrevue, setDateLivraisonPrevue] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [orderItems, setOrderItems] = useState<
    { productId: string; nom: string; prixUnitaire: number; quantite: number; total: number }[]
  >([]);
  const [acompte, setAcompte] = useState<number>(0);
  const [remarques, setRemarques] = useState('');
  const [formError, setFormError] = useState('');

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  // Add Item to New Order Form
  const handleAddItem = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const existingIdx = orderItems.findIndex((i) => i.productId === selectedProductId);
    if (existingIdx >= 0) {
      const updated = [...orderItems];
      updated[existingIdx].quantite += selectedQty;
      updated[existingIdx].total = updated[existingIdx].quantite * updated[existingIdx].prixUnitaire;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: prod.id,
          nom: prod.nom,
          prixUnitaire: prod.prixVente,
          quantite: selectedQty,
          total: prod.prixVente * selectedQty,
        },
      ]);
    }

    setSelectedProductId('');
    setSelectedQty(1);
    setFormError('');
  };

  const handleRemoveItem = (idx: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const calculatedTotal = orderItems.reduce((acc, item) => acc + item.total, 0);
  const calculatedReste = Math.max(0, calculatedTotal - acompte);

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNom.trim()) {
      setFormError('Veuillez saisir le nom du client.');
      return;
    }
    if (orderItems.length === 0) {
      setFormError('Veuillez ajouter au moins un article à la commande.');
      return;
    }

    const newOrder: BonCommande = {
      id: `BC-2026-${String(orders.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      dateLivraisonPrevue,
      clientNom: clientNom.trim(),
      clientTelephone: clientTelephone.trim(),
      items: orderItems,
      total: calculatedTotal,
      acompte,
      reste: calculatedReste,
      statut: 'en_attente',
      remarques: remarques.trim(),
    };

    onAddOrder(newOrder);

    // Reset Form
    setClientNom('');
    setClientTelephone('');
    setOrderItems([]);
    setAcompte(0);
    setRemarques('');
    setFormError('');
    setShowCreateModal(false);
  };

  const handleDeliverAndConvert = (order: BonCommande) => {
    onUpdateStatus(order.id, 'livree');
    if (onConvertToSale) {
      onConvertToSale(order);
    }
  };

  // Filter Orders
  const filteredOrders = orders.filter((ord) => {
    const matchesTab =
      activeTab === 'tous'
        ? true
        : activeTab === 'en_attente'
        ? ord.statut === 'en_attente'
        : activeTab === 'livree'
        ? ord.statut === 'livree'
        : ord.statut === 'annulee';

    const matchesSearch =
      ord.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.clientTelephone && ord.clientTelephone.includes(searchTerm)) ||
      ord.items.some((i) => i.nom.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  // Summary Metrics
  const countEnAttente = orders.filter((o) => o.statut === 'en_attente').length;
  const countLivree = orders.filter((o) => o.statut === 'livree').length;
  const countAnnulee = orders.filter((o) => o.statut === 'annulee').length;

  const totalMontantOrders = orders.reduce((acc, o) => acc + o.total, 0);
  const totalAcomptes = orders.reduce((acc, o) => acc + o.acompte, 0);
  const totalRestes = orders.reduce((acc, o) => acc + o.reste, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-blue-600" />
            <span>Bons de commande</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Réservations clients avec acompte – convertibles en facture réelle à la livraison
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Bon de Commande</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Total Commandes</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {totalMontantOrders.toLocaleString()} <span className="text-xs font-semibold text-slate-500">DA</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Acomptes Reçus</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {totalAcomptes.toLocaleString()} <span className="text-xs font-semibold text-slate-500">DA</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Reste à Recouvrer</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {totalRestes.toLocaleString()} <span className="text-xs font-semibold text-slate-500">DA</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800/90 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('tous')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
              activeTab === 'tous'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Tous ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('en_attente')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'en_attente'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>En attente ({countEnAttente})</span>
          </button>

          <button
            onClick={() => setActiveTab('livree')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'livree'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Livrée ({countLivree})</span>
          </button>

          <button
            onClick={() => setActiveTab('annulee')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'annulee'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Annulée ({countAnnulee})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par client, N° BC..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4">N° document</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Date de livraison prévue</th>
                <th className="py-4 px-4">Client</th>
                <th className="py-4 px-4">Articles de la commande</th>
                <th className="py-4 px-4 text-right">Total (DA)</th>
                <th className="py-4 px-4 text-right">Acompte</th>
                <th className="py-4 px-4 text-right">Reste</th>
                <th className="py-4 px-4 text-center">Statut</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400 font-semibold">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-600 stroke-1" />
                      <p className="text-sm font-extrabold text-slate-500 dark:text-slate-400">
                        Aucune commande trouvée
                      </p>
                      <p className="text-xs text-slate-400">
                        Cliquez sur "Nouveau Bon de Commande" pour créer votre première réservation.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    {/* Doc ID */}
                    <td className="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {ord.id}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {ord.date}
                    </td>

                    {/* Delivery Date */}
                    <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-200">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>{ord.dateLivraisonPrevue}</span>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      <div>
                        <p>{ord.clientNom}</p>
                        {ord.clientTelephone && (
                          <p className="text-[11px] font-normal text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{ord.clientTelephone}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Articles */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {ord.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold"
                          >
                            {item.nom} <strong className="text-blue-600">x{item.quantite}</strong>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                      {ord.total.toLocaleString()} DA
                    </td>

                    {/* Acompte */}
                    <td className="py-4 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {ord.acompte.toLocaleString()} DA
                    </td>

                    {/* Reste */}
                    <td className="py-4 px-4 text-right font-black">
                      {ord.reste > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          {ord.reste.toLocaleString()} DA
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">0 DA (Payé)</span>
                      )}
                    </td>

                    {/* Statut Badge */}
                    <td className="py-4 px-4 text-center">
                      {ord.statut === 'en_attente' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3" />
                          <span>En attente</span>
                        </span>
                      )}
                      {ord.statut === 'livree' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Livrée</span>
                        </span>
                      )}
                      {ord.statut === 'annulee' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                          <XCircle className="w-3 h-3" />
                          <span>Annulée</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View/Print */}
                        <button
                          onClick={() => setViewOrder(ord)}
                          title="Imprimer / Consulter"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all active:scale-95"
                        >
                          <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>

                        {/* Deliver & Convert to Sale */}
                        {ord.statut === 'en_attente' && (
                          <button
                            onClick={() => handleDeliverAndConvert(ord)}
                            title="Marquer comme Livrée & Convertir en Vente"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all active:scale-95"
                          >
                            <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </button>
                        )}

                        {/* Cancel */}
                        {ord.statut === 'en_attente' && (
                          <button
                            onClick={() => onUpdateStatus(ord.id, 'annulee')}
                            title="Annuler la commande"
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900 text-red-700 dark:text-red-300 transition-all active:scale-95"
                          >
                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteOrder(ord.id)}
                          title="Supprimer"
                          className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 transition-all active:scale-95"
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

        {/* Footer Pagination Bar */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-500 font-bold">
          <button
            disabled
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed"
          >
            Précédent
          </button>
          <span>Page 1 / 1</span>
          <button
            disabled
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>

      {/* CREATE ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                    Nouveau Bon de Commande
                  </h3>
                  <p className="text-xs text-slate-400">Enregistrer une réservation client avec acompte</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveOrder} className="space-y-5">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                    NOM DU CLIENT *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientNom}
                    onChange={(e) => setClientNom(e.target.value)}
                    placeholder="ex: Karim Saidi"
                    className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                    TÉLÉPHONE DU CLIENT
                  </label>
                  <input
                    type="tel"
                    value={clientTelephone}
                    onChange={(e) => setClientTelephone(e.target.value)}
                    placeholder="0550..."
                    className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* Delivery Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                  DATE DE LIVRAISON PRÉVUE
                </label>
                <input
                  type="date"
                  value={dateLivraisonPrevue}
                  onChange={(e) => setDateLivraisonPrevue(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Add Items Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
                  AJOUTER DES ARTICLES À LA COMMANDE
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 h-11 px-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="">-- Choisir un produit --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nom} - {p.prixVente.toLocaleString()} DA (Stock: {p.quantite})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 h-11 px-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-center"
                    />

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="h-11 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>

                {/* Added Items Table */}
                {orderItems.length > 0 && (
                  <div className="mt-3 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-extrabold uppercase">
                        <tr>
                          <th className="p-2.5">Produit</th>
                          <th className="p-2.5 text-center">Qté</th>
                          <th className="p-2.5 text-right">Prix (DA)</th>
                          <th className="p-2.5 text-right">Total (DA)</th>
                          <th className="p-2.5 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {orderItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-bold">{item.nom}</td>
                            <td className="p-2.5 text-center font-bold text-blue-600">{item.quantite}</td>
                            <td className="p-2.5 text-right">{item.prixUnitaire.toLocaleString()}</td>
                            <td className="p-2.5 text-right font-black">{item.total.toLocaleString()}</td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Financial Calculation (Total, Deposit, Balance) */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-600 dark:text-slate-300">Total de la commande :</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {calculatedTotal.toLocaleString()} DA
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs gap-4">
                  <label className="font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0">
                    Acompte versé (DA) :
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={calculatedTotal}
                    value={acompte}
                    onChange={(e) => setAcompte(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-36 h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-blue-200/60 dark:border-blue-800">
                  <span className="font-extrabold text-slate-700 dark:text-slate-200">Reste à payer à la livraison :</span>
                  <span className="text-base font-black text-amber-600 dark:text-amber-400">
                    {calculatedReste.toLocaleString()} DA
                  </span>
                </div>
              </div>

              {/* Remarques */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                  REMARQUES / NOTES
                </label>
                <textarea
                  value={remarques}
                  onChange={(e) => setRemarques(e.target.value)}
                  placeholder="Instructions particulières de livraison..."
                  rows={2}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {/* Save Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer la commande</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT MODAL */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl my-8">
            {/* Modal Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <span className="font-mono text-xs font-bold text-blue-600 uppercase">
                Aperçu de l'Impression
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer</span>
                </button>
                <button
                  onClick={() => setViewOrder(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Ticket / Bon de Commande Body */}
            <div className="p-6 border border-slate-200 rounded-2xl space-y-6 bg-white text-slate-900 print:border-none print:p-0">
              {/* Store Header */}
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  VENDEO DIGITAL POS
                </h2>
                <p className="text-xs font-semibold text-slate-600">
                  Rue Didouche Mourad, Alger - Tél: 0555 00 11 22
                </p>
                <div className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 font-extrabold text-xs tracking-wider border border-blue-200">
                  BON DE COMMANDE N° {viewOrder.id}
                </div>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-b border-slate-100 py-3">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Client</p>
                  <p className="font-extrabold text-slate-900">{viewOrder.clientNom}</p>
                  {viewOrder.clientTelephone && (
                    <p className="text-slate-500 font-mono">{viewOrder.clientTelephone}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Date de Commande</p>
                  <p className="font-bold text-slate-800">{viewOrder.date}</p>
                  <p className="text-slate-400 font-semibold uppercase text-[10px] mt-1">Livraison Prévue</p>
                  <p className="font-extrabold text-blue-600">{viewOrder.dateLivraisonPrevue}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="pb-2">Désignation</th>
                    <th className="pb-2 text-center">Qté</th>
                    <th className="pb-2 text-right">P.U (DA)</th>
                    <th className="pb-2 text-right">Total (DA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewOrder.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5 font-bold text-slate-800">{item.nom}</td>
                      <td className="py-2.5 text-center font-bold text-blue-600">{item.quantite}</td>
                      <td className="py-2.5 text-right text-slate-600">{item.prixUnitaire.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-extrabold text-slate-900">
                        {item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Breakdown */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between font-extrabold text-slate-700">
                  <span>Montant Total :</span>
                  <span className="text-sm text-slate-900 font-black">
                    {viewOrder.total.toLocaleString()} DA
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-emerald-600">
                  <span>Acompte Reçu :</span>
                  <span>{viewOrder.acompte.toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between font-black text-amber-600 text-sm pt-1 border-t border-slate-100">
                  <span>Reste à Payer :</span>
                  <span>{viewOrder.reste.toLocaleString()} DA</span>
                </div>
              </div>

              {viewOrder.remarques && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 italic">
                  <strong>Note:</strong> {viewOrder.remarques}
                </div>
              )}

              {/* Footer Notice */}
              <div className="text-center text-[10px] text-slate-400 font-semibold pt-4">
                Merci de votre confiance ! Veuillez conserver ce bon pour la livraison.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
