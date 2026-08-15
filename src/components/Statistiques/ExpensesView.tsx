import React, { useState } from 'react';
import { PieChart, Plus, Trash2, Landmark, Wallet } from 'lucide-react';
import { Expense } from '../../types';

interface ExpensesViewProps {
  expenses: Expense[];
  categories: string[];
  onAddExpense: (exp: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  categories,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [cat, setCat] = useState(categories[0] || 'Loyer');
  const [desc, setDesc] = useState('');
  const [montant, setMontant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!montant || parseFloat(montant) <= 0) return;
    onAddExpense({
      categorie: cat,
      description: desc || 'Dépense courante',
      montant: parseFloat(montant),
      date,
      creePar: 'coco ben',
    });
    setDesc('');
    setMontant('');
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-blue-50/60 dark:bg-blue-950/40 rounded-3xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
          <PieChart className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            Gestion des Dépenses d'Exploitation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enregistrez les coûts pour mettre à jour le bénéfice net en temps réel.
          </p>
        </div>
      </div>

      {/* Add Expense Form Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Ajouter une Nouvelle Dépense</span>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Catégorie
            </label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-xs font-semibold focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Note (Optionnelle)"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Montant (DA)
            </label>
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </form>
      </div>

      {/* Expenses Detailed Table Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
          <Wallet className="w-4 h-4 text-blue-600" />
          <span>Journal Détaillé des Dépenses</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3">CATÉGORIE</th>
                <th className="py-3 px-3">DESCRIPTION</th>
                <th className="py-3 px-3">MONTANT</th>
                <th className="py-3 px-3">DATE</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    Aucune dépense enregistrée
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{e.categorie}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{e.description}</td>
                    <td className="py-3 px-3 font-bold text-red-600 dark:text-red-400">{e.montant.toLocaleString()} DA</td>
                    <td className="py-3 px-3 text-slate-500">{e.date}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onDeleteExpense(e.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Capital Management Banner */}
      <div className="p-6 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
          <Landmark className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-base">
            Gérer le Capital de l'Entreprise
          </h4>
          <p className="text-xs text-emerald-800 dark:text-emerald-400">
            Suivre les injections de capital et les fonds de démarrage.
          </p>
        </div>
      </div>
    </div>
  );
};
