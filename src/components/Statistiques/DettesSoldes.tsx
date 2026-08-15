import React from 'react';
import { Users, Truck, Scale, Clock } from 'lucide-react';
import { Customer, Supplier } from '../../types';

interface DettesSoldesProps {
  customers: Customer[];
  suppliers: Supplier[];
}

export const DettesSoldes: React.FC<DettesSoldesProps> = ({ customers, suppliers }) => {
  const totalCustomerDebt = customers.reduce((acc, c) => acc + c.detteTotale, 0);
  const totalSupplierDebt = suppliers.reduce((acc, s) => acc + s.detteTotale, 0);
  const netPosition = totalCustomerDebt - totalSupplierDebt;

  return (
    <div className="space-y-6">
      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dettes Clients Totales */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border-l-4 border-l-emerald-500 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Dettes Clients Totales</span>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {totalCustomerDebt.toLocaleString()} DA
          </div>
        </div>

        {/* Dettes Fournisseurs Totales */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border-l-4 border-l-red-500 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Truck className="w-4 h-4 text-red-500" />
            <span>Dettes Fournisseurs Totales</span>
          </div>
          <div className="text-3xl font-black text-red-600 dark:text-red-400">
            {totalSupplierDebt.toLocaleString()} DA
          </div>
        </div>

        {/* Position Financière Nette */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-3 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Scale className="w-4 h-4 text-blue-400" />
            <span>Position Financière Nette</span>
          </div>
          <div className={`text-3xl font-black ${netPosition >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {netPosition >= 0 ? '+' : ''}{netPosition.toLocaleString()} DA
          </div>
        </div>
      </div>

      {/* Two Detailed Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Détails des Dettes Clients */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
            <Users className="w-5 h-5 text-emerald-500" />
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Détails des Dettes Clients
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-2">Client</th>
                  <th className="py-3 px-2">Dette</th>
                  <th className="py-3 px-2">Factures</th>
                  <th className="py-3 px-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                {customers.filter((c) => c.detteTotale > 0).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Aucune dette client
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-100">{c.nom}</td>
                      <td className="py-3 px-2 font-bold text-amber-600">{c.detteTotale.toLocaleString()} DA</td>
                      <td className="py-3 px-2 font-semibold">{c.facturesOuvertes}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          En attente
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Détails des Dettes Fournisseurs */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
            <Truck className="w-5 h-5 text-red-500" />
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Détails des Dettes Fournisseurs
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-2">Fournisseur</th>
                  <th className="py-3 px-2">Dette</th>
                  <th className="py-3 px-2">Factures</th>
                  <th className="py-3 px-2">Échéance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                {suppliers.filter((s) => s.detteTotale > 0).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Aucune dette fournisseur
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-100">{s.nom}</td>
                      <td className="py-3 px-2 font-bold text-red-600">{s.detteTotale.toLocaleString()} DA</td>
                      <td className="py-3 px-2 font-semibold">{s.facturesOuvertes}</td>
                      <td className="py-3 px-2 text-slate-500">{s.dateEcheance || '28/08/2026'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Âge des dettes Matrix Box */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Âge des dettes</h4>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold">
            Top 30 des débiteurs
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">0 - 30 Jours</span>
            <p className="text-base font-black text-emerald-900 dark:text-emerald-200 mt-1">4,500 DA</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] font-bold text-amber-700 uppercase">31 - 60 Jours</span>
            <p className="text-base font-black text-amber-900 dark:text-amber-200 mt-1">12,000 DA</p>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-950/40 rounded-2xl border border-orange-200 dark:border-orange-800">
            <span className="text-[10px] font-bold text-orange-700 uppercase">61 - 90 Jours</span>
            <p className="text-base font-black text-orange-900 dark:text-orange-200 mt-1">0 DA</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800">
            <span className="text-[10px] font-bold text-red-700 uppercase">+90 Jours</span>
            <p className="text-base font-black text-red-900 dark:text-red-200 mt-1">0 DA</p>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Dettes</span>
            <p className="text-base font-black text-slate-900 dark:text-white mt-1">16,500 DA</p>
          </div>
        </div>
      </div>
    </div>
  );
};
