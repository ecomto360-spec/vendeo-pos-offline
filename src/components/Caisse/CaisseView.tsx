import React, { useState } from 'react';
import { Lock, Play, Plus, Minus, Receipt, RefreshCw, Eye, CheckCircle2, AlertCircle, X, Calendar, User as UserIcon, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { CashSession, CashMovement, AppUser } from '../../types';
import { useLanguage } from '../../lib/i18n';

interface CaisseViewProps {
  sessions: CashSession[];
  activeSession: CashSession | null;
  cashMovements: CashMovement[];
  users: AppUser[];
  onOpenSession: (soldeOuverture: number) => void;
  onCloseSession: (sessionId: string, soldeCloture: number, note?: string) => void;
  onAddCashMovement: (movement: Omit<CashMovement, 'id'>) => void;
}

export const CaisseView: React.FC<CaisseViewProps> = ({
  sessions,
  activeSession,
  cashMovements,
  users,
  onOpenSession,
  onCloseSession,
  onAddCashMovement,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'actuelle' | 'historique'>('actuelle');

  // Open session state
  const [soldeOuvertureInput, setSoldeOuvertureInput] = useState('0');

  // Close session modal state
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [soldeClotureInput, setSoldeClotureInput] = useState('0');
  const [closeNote, setCloseNote] = useState('');

  // Cash movement modal state (Dépôt / Retrait / Dépense)
  const [movementModalType, setMovementModalType] = useState<'depot' | 'retrait' | 'depense' | null>(null);
  const [movementMontant, setMovementMontant] = useState('');
  const [movementDesc, setMovementDesc] = useState('');

  // Session details view modal
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<CashSession | null>(null);

  // History filters
  const [filterDateDe, setFilterDateDe] = useState('');
  const [filterDateA, setFilterDateA] = useState('');
  const [filterEmploye, setFilterEmploye] = useState('tous');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Calculations for active session
  const sessionMovements = cashMovements.filter((m) => m.session === activeSession?.id);

  const totalEncaissements = sessionMovements
    .filter((m) => m.type === 'depot' || m.type === 'vente')
    .reduce((sum, m) => sum + m.montant, 0);

  const totalDecaissements = sessionMovements
    .filter((m) => m.type === 'retrait' || m.type === 'depense_caisse')
    .reduce((sum, m) => sum + m.montant, 0);

  const soldeActuel = (activeSession?.soldeOuverture || 0) + totalEncaissements - totalDecaissements;

  // Handlers
  const handleOpenSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const solde = parseFloat(soldeOuvertureInput) || 0;
    onOpenSession(solde);
    showToast('Session de caisse ouverte avec succès');
  };

  const handleConfirmCloseSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    const count = parseFloat(soldeClotureInput) || 0;
    onCloseSession(activeSession.id, count, closeNote);
    setShowCloseModal(false);
    setCloseNote('');
    showToast('Session fermée — Caisse équilibrée');
  };

  const handleAddMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementModalType || !activeSession) return;
    const montant = parseFloat(movementMontant) || 0;
    if (montant <= 0) return;

    let type: CashMovement['type'] = 'depot';
    let cat = 'Mouvement Caisse';

    if (movementModalType === 'depot') {
      type = 'depot';
      cat = 'Dépôt Espèces';
    } else if (movementModalType === 'retrait') {
      type = 'retrait';
      cat = 'Retrait Espèces';
    } else {
      type = 'depense_caisse';
      cat = 'Dépense Caisse';
    }

    onAddCashMovement({
      type,
      description: movementDesc.trim() || (type === 'depot' ? 'Dépôt manuel' : 'Retrait manuel'),
      montant,
      categorie: cat,
      utilisateur: activeSession.employeNom,
      session: activeSession.id,
      date: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    });

    setMovementModalType(null);
    setMovementMontant('');
    setMovementDesc('');
    showToast('Mouvement enregistré avec succès');
  };

  // History filtering
  const filteredSessions = sessions.filter((s) => {
    const matchEmploye = filterEmploye === 'tous' || s.employeNom === filterEmploye;
    return matchEmploye;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 shadow-xl rounded-2xl p-4 flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white animate-bounce">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('caisse.title', 'Gestion de la Caisse')}</span>
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {t('caisse.subtitle', 'Suivi des sessions de caisse et des ventes journalières')}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('actuelle')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === 'actuelle'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('caisse.sessionActive', 'Session Actuelle')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historique')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activeTab === 'historique'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('caisse.sessionHistory', 'Historique des Sessions')}
          </button>
        </div>
      </div>

      {/* TAB 1: Session Actuelle */}
      {activeTab === 'actuelle' && (
        <div className="space-y-6">
          {!activeSession ? (
            /* NO ACTIVE SESSION */
            <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-12 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto my-12">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center shadow-inner">
                <Lock className="w-10 h-10 stroke-[1.8]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Aucune session active
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Veuillez ouvrir une nouvelle session pour commencer à vendre
                </p>
              </div>

              {/* Solde d'ouverture form box */}
              <form
                onSubmit={handleOpenSessionSubmit}
                className="w-full max-w-md bg-slate-50 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 space-y-4 shadow-sm"
              >
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Solde d'ouverture (DA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={soldeOuvertureInput}
                    onChange={(e) => setSoldeOuvertureInput(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base font-black focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-center"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Ouvrir la session</span>
                </button>
              </form>
            </div>
          ) : (
            /* ACTIVE SESSION VIEW */
            <div className="space-y-6">
              {/* Active session top banner */}
              <div className="p-4 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span>Session Active #{activeSession.id}</span>
                      <span className="text-slate-400 font-normal">—</span>
                      <span className="text-slate-700 dark:text-slate-200">{activeSession.employeNom}</span>
                    </h4>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Ouverte depuis {activeSession.ouvertA}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSoldeClotureInput(soldeActuel.toString());
                    setShowCloseModal(true);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Lock className="w-4 h-4" />
                  <span>Fermer la session</span>
                </button>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800/90 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold">Solde d'ouverture</span>
                    <Wallet className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {activeSession.soldeOuverture.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800/90 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-emerald-600">
                    <span className="text-xs font-bold text-slate-500">Encaissements</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {totalEncaissements.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800/90 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-red-600">
                    <span className="text-xs font-bold text-slate-500">Décaissements</span>
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-black text-red-600 dark:text-red-400">
                    {totalDecaissements.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
                  </p>
                </div>

                <div className="bg-blue-600 text-white p-5 rounded-3xl shadow-lg shadow-blue-600/25 space-y-1">
                  <div className="flex items-center justify-between text-blue-200">
                    <span className="text-xs font-bold">Solde actuel</span>
                    <Wallet className="w-4 h-4 text-blue-200" />
                  </div>
                  <p className="text-2xl font-black">
                    {soldeActuel.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
                  </p>
                </div>
              </div>

              {/* Action Buttons: Dépôt / Retrait / Dépense */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMovementModalType('depot')}
                  className="py-3.5 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Dépôt d'espèces</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementModalType('retrait')}
                  className="py-3.5 px-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-extrabold text-xs hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
                >
                  <Minus className="w-4 h-4" />
                  <span>Retrait d'espèces</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementModalType('depense')}
                  className="py-3.5 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-extrabold text-xs hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Ajouter une dépense</span>
                </button>
              </div>

              {/* Transactions log table */}
              <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden space-y-3">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    <span>Journal des transactions</span>
                  </h4>

                  <button
                    type="button"
                    onClick={() => showToast('Journal actualisé')}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                    title="Actualiser"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-900/40 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-6">Heure</th>
                        <th className="py-3 px-6">Type</th>
                        <th className="py-3 px-6">Description</th>
                        <th className="py-3 px-6 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                      {sessionMovements.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400 font-bold">
                            Aucune transaction pour le moment
                          </td>
                        </tr>
                      ) : (
                        sessionMovements.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                            <td className="py-3.5 px-6 font-mono text-slate-500">{m.date}</td>
                            <td className="py-3.5 px-6 font-bold">
                              {m.type === 'depot' || m.type === 'vente' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600">
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                  <span>{m.type === 'vente' ? 'Vente Comptant' : 'Dépôt Espèces'}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-600">
                                  <ArrowDownRight className="w-3.5 h-3.5" />
                                  <span>{m.type === 'depense_caisse' ? 'Dépense Caisse' : 'Retrait Espèces'}</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-200">
                              {m.description}
                            </td>
                            <td className="py-3.5 px-6 font-black text-right text-slate-900 dark:text-white">
                              {m.type === 'depot' || m.type === 'vente' ? '+' : '-'}
                              {m.montant.toLocaleString('fr-FR')} DA
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Historique des Sessions */}
      {activeTab === 'historique' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-800/90 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 mb-1">De</label>
              <input
                type="date"
                value={filterDateDe}
                onChange={(e) => setFilterDateDe(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 mb-1">À</label>
              <input
                type="date"
                value={filterDateA}
                onChange={(e) => setFilterDateA(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 mb-1">Employé</label>
              <select
                value={filterEmploye}
                onChange={(e) => setFilterEmploye(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="tous">Tous les employés</option>
                {users.map((u) => (
                  <option key={u.id} value={u.nomComplet || u.nomUtilisateur}>
                    {u.nomComplet || u.nomUtilisateur}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => showToast('Filtres appliqués')}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Recherche</span>
            </button>
          </div>

          {/* History Table */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/40 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-700/80">
                    <th className="py-4 px-4">#</th>
                    <th className="py-4 px-4">Employé</th>
                    <th className="py-4 px-4">Ouvert à</th>
                    <th className="py-4 px-4">Fermé à</th>
                    <th className="py-4 px-4">Solde d'ouverture</th>
                    <th className="py-4 px-4">Solde de clôture</th>
                    <th className="py-4 px-4">Prévu</th>
                    <th className="py-4 px-4">Différence</th>
                    <th className="py-4 px-4">Statut</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                        Aucune session trouvée.
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((s, idx) => {
                      const diff = s.difference || 0;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                          <td className="py-4 px-4 font-bold text-slate-600">{idx + 1}</td>
                          <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">
                            {s.employeNom}
                          </td>
                          <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{s.ouvertA}</td>
                          <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{s.fermeA || '—'}</td>
                          <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {s.soldeOuverture.toFixed(2)} DA
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {s.soldeCloture !== undefined ? `${s.soldeCloture.toFixed(2)} DA` : '—'}
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {s.soldePrevu !== undefined ? `${s.soldePrevu.toFixed(2)} DA` : '—'}
                          </td>
                          <td className="py-4 px-4 font-bold">
                            {diff === 0 ? (
                              <span className="text-emerald-600">+0,00 DA</span>
                            ) : diff > 0 ? (
                              <span className="text-emerald-600">+{diff.toFixed(2)} DA</span>
                            ) : (
                              <span className="text-red-600">{diff.toFixed(2)} DA</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {s.statut === 'active' ? (
                              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                Fermée
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedSessionForDetails(s)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-200"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Fermer la session */}
      {showCloseModal && activeSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Fermer la session</h3>
                <p className="text-xs text-slate-500">Vérifier l'encaisse</p>
              </div>
            </div>

            <form onSubmit={handleConfirmCloseSession} className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl flex justify-between items-center border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xs font-bold text-slate-500 uppercase">Solde prévu</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {soldeActuel.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Solde actuel (compté dans la caisse)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={soldeClotureInput}
                  onChange={(e) => setSoldeClotureInput(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base font-black text-center focus:outline-none"
                />
              </div>

              {/* Difference calculation display */}
              <div className="text-center">
                {(() => {
                  const counted = parseFloat(soldeClotureInput) || 0;
                  const diff = counted - soldeActuel;
                  return (
                    <p className={`text-xs font-black ${diff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      Différence: {diff >= 0 ? '+' : ''}{diff.toFixed(2)} DA
                    </p>
                  );
                })()}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Note / Remarque
                </label>
                <textarea
                  rows={2}
                  value={closeNote}
                  onChange={(e) => setCloseNote(e.target.value)}
                  placeholder="Observations ou explications sur l'écart..."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold text-xs"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-4 h-4" />
                  <span>Confirmer la fermeture</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Dépôt / Retrait / Dépense */}
      {movementModalType && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {movementModalType === 'depot' && "Dépôt d'espèces en caisse"}
                {movementModalType === 'retrait' && "Retrait d'espèces de la caisse"}
                {movementModalType === 'depense' && 'Enregistrer une dépense de caisse'}
              </h3>
              <button
                type="button"
                onClick={() => setMovementModalType(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMovementSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Montant (DA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={movementMontant}
                  onChange={(e) => setMovementMontant(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base font-black focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Motif / Description
                </label>
                <input
                  type="text"
                  required
                  value={movementDesc}
                  onChange={(e) => setMovementDesc(e.target.value)}
                  placeholder="Ex: Fond de roulement, Achat fournitures..."
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all"
              >
                Enregistrer le mouvement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Détails d'une session */}
      {selectedSessionForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Détails Session #{selectedSessionForDetails.id}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Employé : {selectedSessionForDetails.employeNom}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSessionForDetails(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 font-bold">
                <span className="text-slate-500">Ouvert à :</span>
                <span className="text-slate-900 dark:text-white">{selectedSessionForDetails.ouvertA}</span>
              </div>

              <div className="flex justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 font-bold">
                <span className="text-slate-500">Fermé à :</span>
                <span className="text-slate-900 dark:text-white">{selectedSessionForDetails.fermeA || 'En cours'}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-1">
                  <span className="text-slate-400 block font-bold">Solde d'ouverture</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedSessionForDetails.soldeOuverture.toFixed(2)} DA
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-1">
                  <span className="text-slate-400 block font-bold">Solde de clôture</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedSessionForDetails.soldeCloture ? `${selectedSessionForDetails.soldeCloture.toFixed(2)} DA` : '—'}
                  </span>
                </div>
              </div>

              {selectedSessionForDetails.note && (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 text-amber-800 dark:text-amber-300">
                  <span className="font-extrabold block mb-0.5">Note de fermeture :</span>
                  <p>{selectedSessionForDetails.note}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedSessionForDetails(null)}
              className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
