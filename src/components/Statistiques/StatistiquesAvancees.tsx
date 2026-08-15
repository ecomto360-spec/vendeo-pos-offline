import React, { useState } from 'react';
import { Search, Printer, SlidersHorizontal, BarChart } from 'lucide-react';
import { Product } from '../../types';

interface StatistiquesAvanceesProps {
  products: Product[];
}

export const StatistiquesAvancees: React.FC<StatistiquesAvanceesProps> = ({ products }) => {
  const [portee, setPortee] = useState('produit');
  const [searchProd, setSearchProd] = useState('');
  const [periode, setPeriode] = useState<'jour' | 'semaine' | 'mois' | 'annee'>('mois');
  const [comparer, setComparer] = useState(true);
  const [displayed, setDisplayed] = useState(false);

  const filtered = products.filter((p) =>
    p.nom.toLowerCase().includes(searchProd.toLowerCase()) ||
    p.categorie.toLowerCase().includes(searchProd.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Portée d'analyse */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              PORTÉE D'ANALYSE
            </label>
            <select
              value={portee}
              onChange={(e) => setPortee(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            >
              <option value="produit">Produit / Groupe de produits</option>
              <option value="categorie">Par Catégorie</option>
              <option value="fournisseur">Par Fournisseur</option>
            </select>
          </div>

          {/* Choisir les produits */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              CHOISIR LES PRODUITS
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchProd}
                onChange={(e) => setSearchProd(e.target.value)}
                placeholder="Recherche produit..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Période selector */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            PÉRIODE
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'jour', label: "Aujourd'hui" },
              { id: 'semaine', label: 'Semaine' },
              { id: 'mois', label: 'Mois' },
              { id: 'annee', label: 'Année' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriode(p.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  periode === p.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {p.label}
              </button>
            ))}

            <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold">
              01/08/2026 12:00 AM → 10/08/2026 11:59 PM
            </div>
          </div>
        </div>

        {/* Compare Checkbox & Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={comparer}
              onChange={(e) => setComparer(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Comparer à la période précédente</span>
          </label>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setDisplayed(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/30 active:scale-95 transition-all"
            >
              <BarChart className="w-4 h-4" />
              <span>Afficher les statistiques</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Content Result Section */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-12 border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-center">
        {displayed ? (
          <div className="space-y-6 text-left">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Rapport Avancé des Ventes et Marge par Produit
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-3">PRODUIT</th>
                    <th className="py-3 px-3">PRIX ACHAT</th>
                    <th className="py-3 px-3">PRIX VENTE</th>
                    <th className="py-3 px-3">MARGE UNITAIRE</th>
                    <th className="py-3 px-3">PROJECTION MOIS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{p.nom}</td>
                      <td className="py-3 px-3 text-slate-500">{p.prixAchat} DA</td>
                      <td className="py-3 px-3 font-semibold">{p.prixVente} DA</td>
                      <td className="py-3 px-3 font-bold text-emerald-600">+{p.prixVente - p.prixAchat} DA</td>
                      <td className="py-3 px-3 font-semibold text-blue-600">{(p.prixVente * p.quantite).toLocaleString()} DA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-w-sm mx-auto text-slate-400">
            <SlidersHorizontal className="w-12 h-12 mx-auto stroke-1" />
            <p className="text-sm font-medium">
              Choisissez une portée et une période puis cliquez sur « Afficher »
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
