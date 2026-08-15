import React, { useState } from 'react';
import { Calculator, PlusCircle, MinusCircle, Info, Sparkles } from 'lucide-react';
import { Product, Customer, Supplier } from '../../types';

interface CalculateurZakatProps {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
}

export const CalculateurZakat: React.FC<CalculateurZakatProps> = ({
  products,
  customers,
  suppliers,
}) => {
  const [cashBalanceInput, setCashBalanceInput] = useState('25000');

  // Stock retail value
  const stockRetailValue = products.reduce((acc, p) => acc + p.prixVente * p.quantite, 0);

  // Cash balance
  const cashBalance = parseFloat(cashBalanceInput) || 0;

  // Receivables from customers
  const customerReceivables = customers.reduce((acc, c) => acc + c.detteTotale, 0);

  // Total Assets
  const totalAssets = stockRetailValue + cashBalance + customerReceivables;

  // Payables to suppliers
  const supplierPayables = suppliers.reduce((acc, s) => acc + s.detteTotale, 0);

  // Total Net Zakat Base
  const zakatBase = Math.max(0, totalAssets - supplierPayables);

  // Current Nisab threshold in Algeria (e.g., 85g gold ~ 1,105,000 DA)
  const nisabThreshold = 1105000;
  const isNisabReached = zakatBase >= nisabThreshold;
  const missingAmount = nisabThreshold - zakatBase;

  const zakatDue = isNisabReached ? zakatBase * 0.025 : 0;

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-emerald-300" />
            <h3 className="text-2xl font-black tracking-tight">Calculateur de Zakat sur le Commerce</h3>
          </div>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed opacity-90">
            Calculez précisément la Zakat de votre commerce basée sur les données du système. La Zakat est obligatoire sur les biens ayant atteint le Nissab après un an, au taux de 2,5%.
          </p>
        </div>

        <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-center shrink-0">
          <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
            TAUX DE ZAKAT
          </span>
          <span className="text-3xl font-black text-white">2.5%</span>
          <span className="text-[10px] text-emerald-200 block font-arabic">( ربع العشر )</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Actifs & Passifs Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actifs Box */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
              <PlusCircle className="w-5 h-5" />
              <span>Actifs Soumis (À ajouter)</span>
            </div>

            <div className="space-y-3">
              {/* Stock Value */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    Valeur du Stock (Prix de Vente)
                  </h5>
                  <p className="text-[11px] text-slate-400">Calculé automatiquement</p>
                </div>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {stockRetailValue.toLocaleString()} DA
                </span>
              </div>

              {/* Cash Balance */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    Solde de Caisse (Liquidité + Banque)
                  </h5>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ← Saisissez le solde manuellement
                  </p>
                </div>
                <div className="w-full sm:w-48">
                  <input
                    type="number"
                    value={cashBalanceInput}
                    onChange={(e) => setCashBalanceInput(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl text-right font-black text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Customer Receivables */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    Créances Clients (Dettes à recouvrir)
                  </h5>
                  <p className="text-[11px] text-slate-400">Calculé depuis le journal des dettes</p>
                </div>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {customerReceivables.toLocaleString()} DA
                </span>
              </div>
            </div>
          </div>

          {/* Passifs Box */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
              <MinusCircle className="w-5 h-5" />
              <span>Passifs (À déduire)</span>
            </div>

            <div className="p-4 bg-red-50/30 dark:bg-red-950/20 rounded-2xl border border-red-200/80 dark:border-red-800/60 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Dettes Fournisseurs (À payer)
                </h5>
                <p className="text-[11px] text-slate-400">Dettes envers les fournisseurs</p>
              </div>
              <span className="text-lg font-black text-red-600 dark:text-red-400">
                -{supplierPayables.toLocaleString()} DA
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Result & Nisab Status */}
        <div className="space-y-6">
          {/* Obligatory Zakat Amount Box */}
          <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-lg shadow-emerald-600/30 space-y-4 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              MONTANT DE ZAKAT OBLIGATOIRE
            </span>
            <div className="text-4xl font-black tracking-tight">
              {zakatDue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
            </div>

            <div className="pt-4 border-t border-emerald-500/50 space-y-2 text-xs text-emerald-100 text-left">
              <div className="flex justify-between">
                <span>Assiette de Zakat :</span>
                <span className="font-bold">{zakatBase.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between">
                <span>Total des Actifs :</span>
                <span className="font-bold text-emerald-200">+{totalAssets.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between">
                <span>Total des Passifs :</span>
                <span className="font-bold text-red-200">-{supplierPayables.toLocaleString()} DA</span>
              </div>
            </div>
          </div>

          {/* Nisab Status Card */}
          <div className={`p-5 rounded-3xl border ${
            isNisabReached
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          } space-y-2`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{isNisabReached ? 'Nissab Atteint !' : 'Nissab non atteint'}</span>
            </div>
            <p className="text-xs font-medium leading-relaxed">
              {isNisabReached
                ? 'L\'assiette dépasse le Nissab (1,105,000 DA). La Zakat de 2.5% est due.'
                : `Manquant : ${missingAmount.toLocaleString()} DA pour atteindre le Nissab légal.`}
            </p>
          </div>

          {/* Formula Explanation */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Info className="w-4 h-4 text-blue-500" />
              <span>Méthode de Calcul</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Assiette</strong> = (Stock Prix Vente + Caisse + Créances) - Dettes Fournisseurs
            </p>
            <p className="text-[11px] text-slate-400">
              Si Assiette ≥ Nissab, alors <strong>Zakat = Assiette × 2.5%</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
