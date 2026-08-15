import React, { useState } from 'react';
import {
  History,
  Search,
  Printer,
  Eye,
  CreditCard,
  Banknote,
  SlidersHorizontal,
  Filter,
  FileText,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Sale } from '../../types';
import { useLanguage } from '../../lib/i18n';

interface JournalVentesViewProps {
  sales: Sale[];
  customers?: { id: string; nom: string }[];
}

export const JournalVentesView: React.FC<JournalVentesViewProps> = ({ sales, customers = [] }) => {
  const { t, isRTL } = useLanguage();
  const [orderNumberSearch, setOrderNumberSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState('Tous les Clients');
  const [startDate, setStartDate] = useState('2026-08-09');
  const [endDate, setEndDate] = useState('2026-08-10');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Client list
  const clientOptions = [
    'Tous les Clients',
    'Client Passager',
    ...Array.from(new Set([...customers.map((c) => c.nom), ...sales.map((s) => s.clientNom)])),
  ].filter((value, index, self) => self.indexOf(value) === index);

  const filteredSales = sales.filter((s) => {
    const matchesOrder = !orderNumberSearch || s.id.toLowerCase().includes(orderNumberSearch.toLowerCase());
    const matchesClient = selectedClient === 'Tous les Clients' || s.clientNom === selectedClient;
    return matchesOrder && matchesClient;
  });

  const totalAmount = filteredSales.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-blue-600" />
            <span>{t('salesLog.title', 'Historique des Ventes')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('salesLog.subtitle', 'Consulter et suivre les transactions de vente passées')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>{t('pos.advancedFilters', 'Filtres Avancés')}</span>
          </button>

          <button
            type="button"
            onClick={() => {}}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>{t('salesLog.filterBtn', 'Filtrer')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSummaryModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{t('stats.summary', 'Récapitulatif')}</span>
          </button>
        </div>
      </div>

      {/* Filter Options Panel */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">{t('salesLog.orderNumber', 'Numéro de Commande')}</label>
            <input
              type="text"
              value={orderNumberSearch}
              onChange={(e) => setOrderNumberSearch(e.target.value)}
              placeholder={t('salesLog.orderNumber', 'Numéro de Commande')}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">{t('tiers.client', 'Client')}</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {clientOptions.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{c === 'Tous les Clients' ? t('salesLog.allClients', 'Tous les Clients') : c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">{t('salesLog.from', 'Du')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">{t('salesLog.to', 'Au')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sales Table Container */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4 text-center">{t('salesLog.saleNo', 'Vente N°')}</th>
                <th className="py-3.5 px-4 text-center">{t('common.date', 'Date')} & {t('common.time', 'Heure')}</th>
                <th className="py-3.5 px-4 text-center">{t('tiers.client', 'Client')}</th>
                <th className="py-3.5 px-4 text-center">{t('salesLog.items', 'Articles de la commande')}</th>
                <th className="py-3.5 px-4 text-center font-black text-blue-600">{t('common.total', 'Total')} (DA)</th>
                <th className="py-3.5 px-4 text-center">{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold text-xs">
                    {t('salesLog.noSales', 'Aucune vente dans l\'historique actuel.')}
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                      #{s.id}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-500">{s.date}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-100">
                      {s.clientNom}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-500">
                      {s.items.map((i) => `${i.nom} (×${i.quantite})`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                      {s.total.toLocaleString()} DA
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedSale(s)}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Détails</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-2xl font-bold disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="font-bold text-slate-600 dark:text-slate-300">Page 1 sur 1</span>
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-2xl font-bold disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Récapitulatif des Ventes</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Nombre de Ventes</span>
                <span className="text-lg font-black text-emerald-600">{filteredSales.length}</span>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Chiffre d'Affaires Total</span>
                <span className="text-xl font-black text-blue-600">{totalAmount.toLocaleString()} DA</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer le Récapitulatif</span>
            </button>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-2xl border border-slate-200 text-slate-900 font-mono">
            <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-4">
              <h3 className="font-extrabold text-lg uppercase tracking-widest">Vendeo POS</h3>
              <p className="text-[10px] text-slate-500">Ticket #{selectedSale.id} - {selectedSale.date}</p>
              <p className="text-[10px] font-bold">Client: {selectedSale.clientNom}</p>
            </div>

            <div className="space-y-2 text-xs">
              {selectedSale.items.map((i, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{i.nom}</p>
                    <p className="text-[10px] text-slate-500">{i.prixUnitaire} DA × {i.quantite}</p>
                  </div>
                  <span className="font-bold">{i.total} DA</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-dashed border-slate-300 space-y-1 text-xs">
              <div className="flex justify-between font-black text-sm">
                <span>TOTAL :</span>
                <span>{selectedSale.total} DA</span>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-slate-300 text-center space-y-3 font-sans">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="w-full text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
