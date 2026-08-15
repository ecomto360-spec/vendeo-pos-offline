import React, { useState } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, Receipt } from 'lucide-react';
import { CashMovement } from '../../types';

interface MouvementsCaisseProps {
  movements: CashMovement[];
}

export const MouvementsCaisse: React.FC<MouvementsCaisseProps> = ({ movements }) => {
  const [filterType, setFilterType] = useState('tous');

  const filtered = movements.filter((m) => filterType === 'tous' || m.type === filterType);

  const totalDepots = movements
    .filter((m) => m.type === 'depot')
    .reduce((acc, m) => acc + m.montant, 0);

  const totalRetraits = movements
    .filter((m) => m.type === 'retrait')
    .reduce((acc, m) => acc + m.montant, 0);

  const totalDepenses = movements
    .filter((m) => m.type === 'depense_caisse')
    .reduce((acc, m) => acc + m.montant, 0);

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-blue-50/60 dark:bg-blue-950/40 rounded-3xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            Journal des mouvements de caisse
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Historique des transactions de la caisse
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total dépôts */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border-l-4 border-l-emerald-500 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              TOTAL DES DÉPÔTS EN ESPÈCES
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalDepots.toLocaleString()} DA
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        {/* Total retraits */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border-l-4 border-l-red-500 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
              TOTAL DES RETRAITS EN ESPÈCES
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalRetraits.toLocaleString()} DA
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Total dépenses caisse */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border-l-4 border-l-amber-500 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              TOTAL DÉPENSES CAISSE
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalDepenses.toLocaleString()} DA
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Table Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
          >
            <option value="tous">Tous les types</option>
            <option value="depot">Dépôts uniquement</option>
            <option value="retrait">Retraits uniquement</option>
            <option value="depense_caisse">Dépenses de Caisse</option>
          </select>
          <span className="text-xs text-slate-400 font-semibold">{filtered.length} transaction(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3">TYPE</th>
                <th className="py-3 px-3">DESCRIPTION</th>
                <th className="py-3 px-3">MONTANT</th>
                <th className="py-3 px-3">CATÉGORIE</th>
                <th className="py-3 px-3">UTILISATEUR</th>
                <th className="py-3 px-3">SESSION</th>
                <th className="py-3 px-3">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    Aucun mouvement de caisse à afficher
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        m.type === 'depot'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.type === 'retrait'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.type === 'depot' ? 'Dépôt' : m.type === 'retrait' ? 'Retrait' : 'Dépense'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100">{m.description}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{m.montant.toLocaleString()} DA</td>
                    <td className="py-3 px-3 text-slate-500">{m.categorie}</td>
                    <td className="py-3 px-3 text-slate-500">{m.utilisateur}</td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-400">{m.session}</td>
                    <td className="py-3 px-3 text-slate-500">{m.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
