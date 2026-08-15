import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  RefreshCw,
  Printer,
  CheckCircle2,
  XCircle,
  Trash2,
  Calendar,
  Phone,
  Clock,
  X,
  DollarSign,
  AlertCircle,
  Building2,
  ArrowRightLeft,
  FileCheck2,
} from 'lucide-react';
import { ProformaInvoice, Product, Customer } from '../../types';

interface ProformasViewProps {
  proformas: ProformaInvoice[];
  products: Product[];
  customers: Customer[];
  onAddProforma: (newProforma: ProformaInvoice) => void;
  onUpdateStatus: (id: string, newStatus: 'en_attente' | 'convertie' | 'annulee') => void;
  onDeleteProforma: (id: string) => void;
  onConvertToSale?: (proforma: ProformaInvoice) => void;
}

export const ProformasView: React.FC<ProformasViewProps> = ({
  proformas,
  products,
  customers,
  onAddProforma,
  onUpdateStatus,
  onDeleteProforma,
  onConvertToSale,
}) => {
  // Filter States
  const [activeTab, setActiveTab] = useState<'tous' | 'en_attente' | 'convertie' | 'annulee'>('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewProforma, setViewProforma] = useState<ProformaInvoice | null>(null);

  // Form State for New Pro-forma
  const [clientNom, setClientNom] = useState('');
  const [clientTelephone, setClientTelephone] = useState('');
  const [clientNIF, setClientNIF] = useState('');
  const [clientNIS, setClientNIS] = useState('');
  const [clientAdresse, setClientAdresse] = useState('');
  const [dateValidite, setDateValidite] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [tvaRate, setTvaRate] = useState<number>(19); // Default 19%
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [proformaItems, setProformaItems] = useState<
    { productId: string; nom: string; prixUnitaire: number; quantite: number; total: number }[]
  >([]);
  const [remarques, setRemarques] = useState('Offre valable 30 jours à compter de la date d’émission.');
  const [formError, setFormError] = useState('');

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  // Add Item
  const handleAddItem = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const existingIdx = proformaItems.findIndex((i) => i.productId === selectedProductId);
    if (existingIdx >= 0) {
      const updated = [...proformaItems];
      updated[existingIdx].quantite += selectedQty;
      updated[existingIdx].total = updated[existingIdx].quantite * updated[existingIdx].prixUnitaire;
      setProformaItems(updated);
    } else {
      setProformaItems([
        ...proformaItems,
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
    setProformaItems(proformaItems.filter((_, i) => i !== idx));
  };

  // Calculations
  const calculatedTotalHT = proformaItems.reduce((acc, item) => acc + item.total, 0);
  const calculatedTVA = Math.round((calculatedTotalHT * tvaRate) / 100);
  const calculatedTotalTTC = calculatedTotalHT + calculatedTVA;

  const handleSaveProforma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNom.trim()) {
      setFormError('Veuillez saisir le nom du client / entreprise.');
      return;
    }
    if (proformaItems.length === 0) {
      setFormError('Veuillez ajouter au moins un produit à la pro-forma.');
      return;
    }

    const newProforma: ProformaInvoice = {
      id: `PRO-2026-${String(proformas.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      dateValidite,
      clientNom: clientNom.trim(),
      clientTelephone: clientTelephone.trim(),
      clientNIF: clientNIF.trim(),
      clientNIS: clientNIS.trim(),
      clientAdresse: clientAdresse.trim(),
      items: proformaItems,
      totalHT: calculatedTotalHT,
      tvaRate,
      tvaMontant: calculatedTVA,
      totalTTC: calculatedTotalTTC,
      statut: 'en_attente',
      remarques: remarques.trim(),
    };

    onAddProforma(newProforma);

    // Reset Form
    setClientNom('');
    setClientTelephone('');
    setClientNIF('');
    setClientNIS('');
    setClientAdresse('');
    setProformaItems([]);
    setRemarques('Offre valable 30 jours à compter de la date d’émission.');
    setFormError('');
    setShowCreateModal(false);
  };

  const handleConvertAndSell = (prof: ProformaInvoice) => {
    onUpdateStatus(prof.id, 'convertie');
    if (onConvertToSale) {
      onConvertToSale(prof);
    }
  };

  // Filter Proformas
  const filteredProformas = proformas.filter((prof) => {
    const matchesTab =
      activeTab === 'tous'
        ? true
        : activeTab === 'en_attente'
        ? prof.statut === 'en_attente'
        : activeTab === 'convertie'
        ? prof.statut === 'convertie'
        : prof.statut === 'annulee';

    const matchesSearch =
      prof.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prof.clientNIF && prof.clientNIF.includes(searchTerm)) ||
      prof.items.some((i) => i.nom.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  // Summary Metrics
  const countEnAttente = proformas.filter((p) => p.statut === 'en_attente').length;
  const countConvertie = proformas.filter((p) => p.statut === 'convertie').length;
  const countAnnulee = proformas.filter((p) => p.statut === 'annulee').length;

  const totalAmountTTC = proformas.reduce((acc, p) => acc + p.totalTTC, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-blue-600" />
            <span>Factures pro-forma</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Devis non comptables – modifiables puis convertibles en factures réelles à l'acceptation du client
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
            <span>Nouvelle Facture Pro-forma</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Volume Total Pro-forma</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {totalAmountTTC.toLocaleString()} <span className="text-xs font-semibold text-slate-500">DA TTC</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Devis En Attente</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {countEnAttente} <span className="text-xs font-semibold text-slate-500">dossiers</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Converties en Vente</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {countConvertie} <span className="text-xs font-semibold text-slate-500">factures</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5" />
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
            Tous ({proformas.length})
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
            onClick={() => setActiveTab('convertie')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'convertie'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Convertie ({countConvertie})</span>
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
            placeholder="Rechercher client, NIF, N° pro-forma..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Proformas Table Container */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4">N° document</th>
                <th className="py-4 px-4">Date & Heure</th>
                <th className="py-4 px-4">Validité</th>
                <th className="py-4 px-4">Client / Entreprise</th>
                <th className="py-4 px-4">Articles</th>
                <th className="py-4 px-4 text-right">Total HT</th>
                <th className="py-4 px-4 text-right">Total TTC (DA)</th>
                <th className="py-4 px-4 text-center">Statut</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {filteredProformas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 font-semibold">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 stroke-1" />
                      <p className="text-sm font-extrabold text-slate-500 dark:text-slate-400">
                        Aucune pro-forma trouvée
                      </p>
                      <p className="text-xs text-slate-400">
                        Cliquez sur "Nouvelle Facture Pro-forma" pour éditer votre premier devis.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProformas.map((prof) => (
                  <tr
                    key={prof.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    {/* Doc ID */}
                    <td className="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {prof.id}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {prof.date}
                    </td>

                    {/* Validity Date */}
                    <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-200">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>{prof.dateValidite}</span>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      <div>
                        <p>{prof.clientNom}</p>
                        {prof.clientNIF && (
                          <p className="text-[10px] font-mono font-semibold text-slate-400 mt-0.5">
                            NIF: {prof.clientNIF}
                          </p>
                        )}
                        {prof.clientTelephone && (
                          <p className="text-[11px] font-normal text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{prof.clientTelephone}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Articles */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {prof.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold"
                          >
                            {item.nom} <strong className="text-blue-600">x{item.quantite}</strong>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total HT */}
                    <td className="py-4 px-4 text-right font-medium text-slate-600 dark:text-slate-300">
                      {prof.totalHT.toLocaleString()} DA
                    </td>

                    {/* Total TTC */}
                    <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                      {prof.totalTTC.toLocaleString()} DA
                    </td>

                    {/* Statut Badge */}
                    <td className="py-4 px-4 text-center">
                      {prof.statut === 'en_attente' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3" />
                          <span>En attente</span>
                        </span>
                      )}
                      {prof.statut === 'convertie' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Convertie</span>
                        </span>
                      )}
                      {prof.statut === 'annulee' && (
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
                          onClick={() => setViewProforma(prof)}
                          title="Imprimer / Consulter"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all active:scale-95"
                        >
                          <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>

                        {/* Convert to Real Sale */}
                        {prof.statut === 'en_attente' && (
                          <button
                            onClick={() => handleConvertAndSell(prof)}
                            title="Convertir en Facture Réelle / Vente"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all active:scale-95 flex items-center gap-1"
                          >
                            <ArrowRightLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </button>
                        )}

                        {/* Cancel */}
                        {prof.statut === 'en_attente' && (
                          <button
                            onClick={() => onUpdateStatus(prof.id, 'annulee')}
                            title="Annuler le devis"
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900 text-red-700 dark:text-red-300 transition-all active:scale-95"
                          >
                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteProforma(prof.id)}
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

      {/* CREATE PROFORMA MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                    Nouvelle Facture Pro-forma
                  </h3>
                  <p className="text-xs text-slate-400">Établir un devis non comptable pour un client commercial</p>
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

            <form onSubmit={handleSaveProforma} className="space-y-5">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                    NOM DU CLIENT / ENTREPRISE *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientNom}
                    onChange={(e) => setClientNom(e.target.value)}
                    placeholder="ex: SARL Maghreb Commerce"
                    className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                    TÉLÉPHONE
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

              {/* Fiscal Info (NIF, NIS, Address) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    NIF (IDENTIFIANT FISCAL)
                  </label>
                  <input
                    type="text"
                    value={clientNIF}
                    onChange={(e) => setClientNIF(e.target.value)}
                    placeholder="0019..."
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    NIS (STATISTIQUE)
                  </label>
                  <input
                    type="text"
                    value={clientNIS}
                    onChange={(e) => setClientNIS(e.target.value)}
                    placeholder="1992..."
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    DATE DE VALIDITÉ
                  </label>
                  <input
                    type="date"
                    value={dateValidite}
                    onChange={(e) => setDateValidite(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
                  />
                </div>
              </div>

              {/* Add Items Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
                  SÉLECTIONNER LES PRODUITS
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
                        {p.nom} - {p.prixVente.toLocaleString()} DA
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

                {/* Items Table */}
                {proformaItems.length > 0 && (
                  <div className="mt-3 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-extrabold uppercase">
                        <tr>
                          <th className="p-2.5">Produit</th>
                          <th className="p-2.5 text-center">Qté</th>
                          <th className="p-2.5 text-right">P.U HT (DA)</th>
                          <th className="p-2.5 text-right">Total HT (DA)</th>
                          <th className="p-2.5 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {proformaItems.map((item, idx) => (
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

              {/* TVA Rate & Totals Calculation */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-600 dark:text-slate-300">Total Hors Taxes (HT) :</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {calculatedTotalHT.toLocaleString()} DA
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs gap-4">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 shrink-0">
                    Taux de TVA :
                  </label>
                  <select
                    value={tvaRate}
                    onChange={(e) => setTvaRate(parseFloat(e.target.value) || 0)}
                    className="w-32 h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-xs font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value={19}>19 % (Standard)</option>
                    <option value={9}>9 % (Réduit)</option>
                    <option value={0}>0 % (Exonéré)</option>
                  </select>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Montant TVA ({tvaRate}%) :</span>
                  <span className="font-semibold">{calculatedTVA.toLocaleString()} DA</span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-blue-200/60 dark:border-blue-800">
                  <span className="font-extrabold text-slate-900 dark:text-white">Total TTC :</span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400">
                    {calculatedTotalTTC.toLocaleString()} DA
                  </span>
                </div>
              </div>

              {/* Remarques */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                  CONDITIONS & REMARQUES
                </label>
                <textarea
                  value={remarques}
                  onChange={(e) => setRemarques(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {/* Buttons */}
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
                  <span>Enregistrer la Pro-forma</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT PROFORMA MODAL */}
      {viewProforma && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl my-8">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <span className="font-mono text-xs font-bold text-blue-600 uppercase">
                Aperçu - Facture Pro-forma (Devis)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer Devis</span>
                </button>
                <button
                  onClick={() => setViewProforma(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="p-6 border border-slate-200 rounded-2xl space-y-6 bg-white text-slate-900 print:border-none print:p-0">
              {/* Header Company & Proforma Badge */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">VENDEO POS DIGITAL</h1>
                  <p className="text-xs text-slate-600 font-semibold">
                    SARL au Capital Social de 5 000 000 DA
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Rue Didouche Mourad, Alger - Tél: 0555 00 11 22
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    NIF: 002016012345678 | NIS: 199016012345
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white font-black text-xs rounded-lg tracking-wider uppercase">
                    FACTURE PRO-FORMA
                  </span>
                  <p className="font-mono font-extrabold text-slate-900 mt-2">N° {viewProforma.id}</p>
                  <p className="text-xs text-slate-500">Date: {viewProforma.date}</p>
                  <p className="text-xs text-blue-600 font-bold">Validité: {viewProforma.dateValidite}</p>
                </div>
              </div>

              {/* Client Details Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">DOIT (CLIENT)</p>
                <p className="font-extrabold text-slate-900 text-sm">{viewProforma.clientNom}</p>
                {viewProforma.clientAdresse && <p className="text-slate-600">{viewProforma.clientAdresse}</p>}
                <div className="flex flex-wrap gap-4 text-[11px] font-mono text-slate-600 pt-1">
                  {viewProforma.clientNIF && <span>NIF: <strong>{viewProforma.clientNIF}</strong></span>}
                  {viewProforma.clientNIS && <span>NIS: <strong>{viewProforma.clientNIS}</strong></span>}
                  {viewProforma.clientTelephone && <span>Tél: <strong>{viewProforma.clientTelephone}</strong></span>}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-extrabold">
                    <th className="p-2">Désignation</th>
                    <th className="p-2 text-center">Qté</th>
                    <th className="p-2 text-right">P.U HT (DA)</th>
                    <th className="p-2 text-right">Total HT (DA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewProforma.items.map((item, i) => (
                    <tr key={i}>
                      <td className="p-2 font-bold text-slate-800">{item.nom}</td>
                      <td className="p-2 text-center font-bold text-blue-600">{item.quantite}</td>
                      <td className="p-2 text-right text-slate-600">{item.prixUnitaire.toLocaleString()}</td>
                      <td className="p-2 text-right font-extrabold text-slate-900">
                        {item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Total HT :</span>
                    <span>{viewProforma.totalHT.toLocaleString()} DA</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>TVA ({viewProforma.tvaRate}%) :</span>
                    <span>{viewProforma.tvaMontant.toLocaleString()} DA</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 text-sm pt-2 border-t border-slate-300">
                    <span>TOTAL TTC :</span>
                    <span className="text-blue-600">{viewProforma.totalTTC.toLocaleString()} DA</span>
                  </div>
                </div>
              </div>

              {viewProforma.remarques && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 italic border border-slate-100">
                  <strong>Condition:</strong> {viewProforma.remarques}
                </div>
              )}

              {/* Footer Stamp / Notice */}
              <div className="pt-6 flex justify-between items-end text-[10px] text-slate-400 font-semibold">
                <div>Document édité via Vendeo POS system.</div>
                <div className="text-center font-bold text-slate-700 border-t border-slate-300 pt-2 px-8">
                  Cachet & Signature
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
