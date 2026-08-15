import React from 'react';
import { 
  Banknote, 
  RotateCcw, 
  Wallet, 
  ShoppingCart, 
  TrendingUp, 
  ShoppingBag, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Trophy
} from 'lucide-react';
import { Sale, Product, Expense } from '../../types';

interface ResumeFinancierProps {
  sales: Sale[];
  products: Product[];
  expenses: Expense[];
}

export const ResumeFinancier: React.FC<ResumeFinancierProps> = ({ sales, products, expenses }) => {
  // Calculations
  const totalRevenues = sales.reduce((acc, s) => acc + s.total, 0);
  const totalReturns = 0;
  const totalNetRevenue = totalRevenues - totalReturns;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.montant, 0);

  // Estimate COGS (Cost of goods sold)
  let totalCOGS = 0;
  sales.forEach((s) => {
    s.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const buyPrice = prod ? prod.prixAchat : item.prixUnitaire * 0.7;
      totalCOGS += buyPrice * item.quantite;
    });
  });

  const grossProfit = totalNetRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;
  const marginPct = totalNetRevenue > 0 ? ((netProfit / totalNetRevenue) * 100).toFixed(1) : '0';
  const avgBasket = sales.length > 0 ? (totalRevenues / sales.length).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      {/* Metric Cards Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* REVENUS */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              REVENUS
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalRevenues.toLocaleString()} DA
            </div>
            <p className="text-[11px] text-slate-400 mt-1">DA Revenus Totaux</p>
          </div>
        </div>

        {/* RETOURS */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              RETOURS
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400">
              {totalReturns.toLocaleString()} DA
            </div>
            <p className="text-[11px] text-slate-400 mt-1">DA Retours Totaux</p>
          </div>
        </div>

        {/* REVENU NET */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              REVENU NET
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {totalNetRevenue.toLocaleString()} DA
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Nombre de Ventes: {sales.length}
            </p>
          </div>
        </div>

        {/* COÛT DES MARCHANDISES VENDUES */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              COÛT DES MARCHANDISES (COGS)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {totalCOGS.toLocaleString()} DA
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Ratio COGS</p>
          </div>
        </div>

        {/* BÉNÉFICE BRUT */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              BÉNÉFICE BRUT
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {grossProfit.toLocaleString()} DA
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Dépenses Totales: {totalExpenses.toLocaleString()} DA
            </p>
          </div>
        </div>
      </div>

      {/* Average Basket Card */}
      <div className="w-full sm:w-72 bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            VALEUR MOYENNE DU PANIER
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
          {avgBasket} DA
        </div>
        <div className="p-2 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl text-[10px] text-purple-700 dark:text-purple-300 font-medium">
          Espèces: 100% | Crédit: 0%
        </div>
      </div>

      {/* Net Profit & Cash Flow vs Most Profitable Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Net Profit Box */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            Bénéfice Net & Flux de Trésorerie
          </h4>

          <div className="bg-blue-50/60 dark:bg-blue-950/40 rounded-3xl p-6 border-2 border-blue-500/80 shadow-sm space-y-4">
            <span className="text-xs font-extrabold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
              BÉNÉFICE NET FINAL
            </span>
            <div className="text-3xl font-black text-blue-900 dark:text-blue-100">
              {netProfit.toLocaleString()} DA
            </div>
            <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-xl text-xs font-bold">
              Marge Bénéficiaire: {marginPct}%
            </div>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/40 rounded-3xl p-5 border-2 border-emerald-500/80 shadow-sm space-y-2">
            <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
              ENTRÉES (RECETTES)
            </span>
            <div className="text-xl font-black text-emerald-900 dark:text-emerald-100">
              {totalRevenues.toLocaleString()} DA
            </div>
          </div>

          <div className="bg-red-50/60 dark:bg-red-950/40 rounded-3xl p-5 border-2 border-red-500/80 shadow-sm space-y-2">
            <span className="text-[11px] font-extrabold text-red-800 dark:text-red-300 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpCircle className="w-4 h-4 text-red-600" />
              SORTIES (DÉPENSES)
            </span>
            <div className="text-xl font-black text-red-900 dark:text-red-100">
              {totalExpenses.toLocaleString()} DA
            </div>
          </div>
        </div>

        {/* Right: Top 15 Most Profitable Products Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                Produits les Plus Rentables
              </h4>
            </div>
            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
              Top 15 des Produits
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3">PRODUIT</th>
                  <th className="py-3 px-3">CATÉGORIE</th>
                  <th className="py-3 px-3">QTÉ VENDUE</th>
                  <th className="py-3 px-3">REVENUS</th>
                  <th className="py-3 px-3">COÛT</th>
                  <th className="py-3 px-3">BÉNÉFICE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                {(() => {
                  const productStats = products.map((p) => {
                    const qteVendue = sales.reduce((acc, s) => {
                      const item = s.items.find((i) => i.productId === p.id);
                      return acc + (item ? item.quantite : 0);
                    }, 0);
                    const rev = qteVendue * p.prixVente;
                    const cost = qteVendue * p.prixAchat;
                    const profit = rev - cost;
                    return { ...p, qteVendue, rev, cost, profit };
                  });

                  // Sort by profit descending
                  const sortedStats = productStats.sort((a, b) => b.profit - a.profit);
                  const soldStats = sortedStats.filter((p) => p.qteVendue > 0);
                  const displayList = soldStats.length > 0 ? soldStats.slice(0, 15) : sortedStats.slice(0, 15);

                  if (sales.length === 0 || displayList.every((p) => p.qteVendue === 0)) {
                    return (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400 font-semibold">
                          Aucune donnée pour la période spécifiée
                        </td>
                      </tr>
                    );
                  }

                  return displayList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{p.nom}</td>
                      <td className="py-3 px-3 text-slate-500">{p.categorie}</td>
                      <td className="py-3 px-3 font-semibold">{p.qteVendue}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{p.rev.toLocaleString()} DA</td>
                      <td className="py-3 px-3 text-slate-500">{p.cost.toLocaleString()} DA</td>
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">+{p.profit.toLocaleString()} DA</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
