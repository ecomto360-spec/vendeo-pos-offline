import React from 'react';
import { Package, Tag, Lightbulb, AlertTriangle, CalendarX, CheckCircle } from 'lucide-react';
import { Product } from '../../types';

interface AnalysesStockProps {
  products: Product[];
}

export const AnalysesStock: React.FC<AnalysesStockProps> = ({ products }) => {
  const stockCostValue = products.reduce((acc, p) => acc + p.prixAchat * p.quantite, 0);
  const stockRetailValue = products.reduce((acc, p) => acc + p.prixVente * p.quantite, 0);
  const potentialProfit = stockRetailValue - stockCostValue;
  const totalUnits = products.reduce((acc, p) => acc + p.quantite, 0);

  const lowStockProducts = products.filter((p) => p.quantite <= p.minStock);

  // Check items expiring in < 30 days
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringProducts = products.filter((p) => {
    if (!p.datePeremption) return false;
    const expDate = new Date(p.datePeremption);
    return expDate <= thirtyDaysLater;
  });

  return (
    <div className="space-y-6">
      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stock prix achat */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border-2 border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                STOCK AU PRIX D'ACHAT
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {stockCostValue.toLocaleString()} DA
              </div>
            </div>
          </div>
        </div>

        {/* Stock prix vente */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border-2 border-blue-500/80 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                STOCK AU PRIX DE VENTE
              </span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {stockRetailValue.toLocaleString()} DA
              </div>
            </div>
          </div>
        </div>

        {/* Bénéfice potentiel */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/40 rounded-3xl p-6 border-2 border-emerald-500/80 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                BÉNÉFICE POTENTIEL
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {potentialProfit.toLocaleString()} DA
              </div>
            </div>
          </div>
          <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
            {totalUnits} Unités en stock
          </p>
        </div>
      </div>

      {/* Low Stock Alerts & Expiration Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes de stock faible */}
        <div className="bg-amber-50/30 dark:bg-amber-950/20 rounded-3xl p-6 border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold border-b border-amber-200/60 dark:border-amber-800/60 pb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h4>Alertes de stock faible</h4>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-12 text-center text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Le stock est en bon état</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-100/50 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Produit</th>
                    <th className="py-2.5 px-3">Stock Actuel</th>
                    <th className="py-2.5 px-3">Limite Min</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200/60 dark:divide-amber-800/40">
                  {lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">{p.nom}</td>
                      <td className="py-2.5 px-3 font-bold text-red-600">{p.quantite}</td>
                      <td className="py-2.5 px-3 text-slate-500">{p.minStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alertes de Péremption */}
        <div className="bg-red-50/30 dark:bg-red-950/20 rounded-3xl p-6 border border-red-200 dark:border-red-800/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold border-b border-red-200/60 dark:border-red-800/60 pb-3">
            <CalendarX className="w-5 h-5 text-red-600" />
            <h4>Alertes de Péremption (dans les 30 jours)</h4>
          </div>

          {expiringProducts.length === 0 ? (
            <div className="py-12 text-center text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Aucun produit proche de la péremption</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-red-100/50 dark:bg-red-900/40 text-red-900 dark:text-red-200 font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Produit</th>
                    <th className="py-2.5 px-3">Quantité</th>
                    <th className="py-2.5 px-3">Date Péremption</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-200/60 dark:divide-red-800/40">
                  {expiringProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">{p.nom}</td>
                      <td className="py-2.5 px-3 font-bold">{p.quantite}</td>
                      <td className="py-2.5 px-3 font-bold text-red-600">{p.datePeremption}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
