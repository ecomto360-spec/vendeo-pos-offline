import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  RefreshCw, 
  Printer, 
  PieChart, 
  TrendingUp, 
  Wallet, 
  Boxes, 
  Receipt, 
  Calculator 
} from 'lucide-react';
import { StatistiquesTab, Sale, Product, Expense, CashMovement, Customer, Supplier } from '../../types';
import { ResumeFinancier } from './ResumeFinancier';
import { StatistiquesAvancees } from './StatistiquesAvancees';
import { DettesSoldes } from './DettesSoldes';
import { AnalysesStock } from './AnalysesStock';
import { ExpensesView } from './ExpensesView';
import { MouvementsCaisse } from './MouvementsCaisse';
import { GraphiquesView } from './GraphiquesView';
import { CalculateurZakat } from './CalculateurZakat';

interface StatistiquesViewProps {
  sales: Sale[];
  products: Product[];
  expenses: Expense[];
  categories: string[];
  cashMovements: CashMovement[];
  customers: Customer[];
  suppliers: Supplier[];
  onAddExpense: (exp: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const StatistiquesView: React.FC<StatistiquesViewProps> = ({
  sales,
  products,
  expenses,
  categories,
  cashMovements,
  customers,
  suppliers,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [activeTab, setActiveTab] = useState<StatistiquesTab>('resume');
  const [refreshing, setRefreshing] = useState(false);

  // Date Filter State ('tout' | 'aujourdhui' | 'hier' | 'semaine' | 'mois' | 'custom')
  const [presetPeriod, setPresetPeriod] = useState<string>('tout');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleSelectPreset = (preset: string) => {
    setPresetPeriod(preset);
    const todayStr = '2026-08-10'; // Current system date
    if (preset === 'aujourdhui') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'hier') {
      setStartDate('2026-08-09');
      setEndDate('2026-08-09');
    } else if (preset === 'semaine') {
      setStartDate('2026-08-03');
      setEndDate(todayStr);
    } else if (preset === 'mois') {
      setStartDate('2026-08-01');
      setEndDate('2026-08-31');
    } else if (preset === 'tout') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  // Filter sales based on startDate and endDate
  const filteredSales = sales.filter((s) => {
    if (!startDate && !endDate) return true;
    const sDate = s.date ? s.date.split(' ')[0] : '';
    if (startDate && sDate < startDate) return false;
    if (endDate && sDate > endDate) return false;
    return true;
  });

  // Filter expenses based on startDate and endDate
  const filteredExpenses = expenses.filter((e) => {
    if (!startDate && !endDate) return true;
    const eDate = e.date ? e.date.split(' ')[0] : '';
    if (startDate && eDate < startDate) return false;
    if (endDate && eDate > endDate) return false;
    return true;
  });

  // Filter cash movements based on startDate and endDate
  const filteredCashMovements = cashMovements.filter((m) => {
    if (!startDate && !endDate) return true;
    const mDate = m.date ? m.date.split(' ')[0] : '';
    if (startDate && mDate < startDate) return false;
    if (endDate && mDate > endDate) return false;
    return true;
  });

  const tabs: { id: StatistiquesTab; label: string; icon: React.ReactNode }[] = [
    { id: 'resume', label: 'Résumé Financier', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'avancees', label: 'Statistiques avancées', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'dettes-soldes', label: 'Dettes & Soldes', icon: <Wallet className="w-4 h-4" /> },
    { id: 'analyses-stock', label: 'Analyses du Stock', icon: <Boxes className="w-4 h-4" /> },
    { id: 'depenses', label: 'Dépenses', icon: <PieChart className="w-4 h-4" /> },
    { id: 'mouvements-caisse', label: 'Mouvements de Caisse', icon: <Receipt className="w-4 h-4" /> },
    { id: 'graphiques', label: 'Graphiques', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'zakat', label: 'Calculateur de Zakat', icon: <Calculator className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Interactive Date Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Statistiques
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Centre de Commandement Numérique - Examiner les performances financières et du stock
          </p>
        </div>

        {/* Global Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {[
              { id: 'tout', label: 'Tout' },
              { id: 'aujourdhui', label: "Aujourd'hui" },
              { id: 'hier', label: 'Hier' },
              { id: 'mois', label: 'Ce Mois' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  presetPeriod === p.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-400">De:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPresetPeriod('custom');
              }}
              className="bg-transparent font-mono text-xs focus:outline-none dark:text-white cursor-pointer"
            />
            <span className="text-slate-400">→ À:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPresetPeriod('custom');
              }}
              className="bg-transparent font-mono text-xs focus:outline-none dark:text-white cursor-pointer"
            />
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={() => window.print()}
            title="Imprimer le rapport"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700 font-bold border-b-2 border-b-blue-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-tab Active Component View */}
      <div className="pt-2">
        {activeTab === 'resume' && (
          <ResumeFinancier sales={filteredSales} products={products} expenses={filteredExpenses} />
        )}
        {activeTab === 'avancees' && <StatistiquesAvancees products={products} />}
        {activeTab === 'dettes-soldes' && (
          <DettesSoldes customers={customers} suppliers={suppliers} />
        )}
        {activeTab === 'analyses-stock' && <AnalysesStock products={products} />}
        {activeTab === 'depenses' && (
          <ExpensesView
            expenses={filteredExpenses}
            categories={categories}
            onAddExpense={onAddExpense}
            onDeleteExpense={onDeleteExpense}
          />
        )}
        {activeTab === 'mouvements-caisse' && <MouvementsCaisse movements={filteredCashMovements} />}
        {activeTab === 'graphiques' && <GraphiquesView sales={filteredSales} products={products} />}
        {activeTab === 'zakat' && (
          <CalculateurZakat products={products} customers={customers} suppliers={suppliers} />
        )}
      </div>
    </div>
  );
};
