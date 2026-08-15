import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  X,
  Save,
  DollarSign,
  AlertCircle,
  FileText,
  Building2,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Customer } from '../../types';

interface ClientsViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [nif, setNif] = useState('');
  const [rc, setRc] = useState('');
  const [ai, setAi] = useState('');
  const [nis, setNis] = useState('');
  const [detteInitiale, setDetteInitiale] = useState<number>(0);
  const [plafondCredit, setPlafondCredit] = useState<number>(0);
  const [formError, setFormError] = useState('');

  // Debt Payment Modal State
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const openAddModal = () => {
    setEditingCustomer(null);
    setNom('');
    setTelephone('');
    setAdresse('');
    setNif('');
    setRc('');
    setAi('');
    setNis('');
    setDetteInitiale(0);
    setPlafondCredit(0);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setNom(c.nom);
    setTelephone(c.telephone || '');
    setAdresse(c.adresse || '');
    setNif(c.nif || '');
    setRc(c.rc || '');
    setAi(c.ai || '');
    setNis(c.nis || '');
    setDetteInitiale(c.detteInitiale || 0);
    setPlafondCredit(c.plafondCredit || 0);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      setFormError('Le nom du client est obligatoire.');
      return;
    }

    if (editingCustomer) {
      const updated: Customer = {
        ...editingCustomer,
        nom: nom.trim(),
        telephone: telephone.trim(),
        adresse: adresse.trim(),
        nif: nif.trim(),
        rc: rc.trim(),
        ai: ai.trim(),
        nis: nis.trim(),
        detteInitiale,
        plafondCredit,
        // Update total debt if initial debt changed
        detteTotale:
          editingCustomer.detteTotale -
          (editingCustomer.detteInitiale || 0) +
          Number(detteInitiale),
      };
      onUpdateCustomer(updated);
    } else {
      const newCustomer: Customer = {
        id: `c_${Date.now()}`,
        nom: nom.trim(),
        telephone: telephone.trim(),
        adresse: adresse.trim(),
        nif: nif.trim(),
        rc: rc.trim(),
        ai: ai.trim(),
        nis: nis.trim(),
        detteInitiale: Number(detteInitiale),
        plafondCredit: Number(plafondCredit),
        detteTotale: Number(detteInitiale),
        facturesOuvertes: Number(detteInitiale) > 0 ? 1 : 0,
      };
      onAddCustomer(newCustomer);
    }

    setShowModal(false);
  };

  const handleSettleDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingCustomer || paymentAmount <= 0) return;

    const newDette = Math.max(0, payingCustomer.detteTotale - paymentAmount);
    const updated: Customer = {
      ...payingCustomer,
      detteTotale: newDette,
      facturesOuvertes: newDette === 0 ? 0 : payingCustomer.facturesOuvertes,
    };

    onUpdateCustomer(updated);
    setPayingCustomer(null);
    setPaymentAmount(0);
  };

  // Filter customers
  const filteredCustomers = customers.filter(
    (c) =>
      c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.telephone && c.telephone.includes(searchTerm))
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Clients Réguliers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérer les comptes, les dettes et les journaux de ventes
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Ajouter un Client</span>
        </button>
      </div>

      {/* Search Bar Input */}
      <div className="relative w-full">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Rechercher par nom ou numéro de téléphone..."
          className="w-full h-12 pl-5 pr-12 bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
        <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {/* Empty State or Customer List */}
      {filteredCustomers.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center">
          <p className="text-slate-400 dark:text-slate-500 font-bold text-sm">
            Aucun client trouvé.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedCustomers.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center text-sm shrink-0">
                      {c.nom.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1">
                        {c.nom}
                      </h4>
                      {c.telephone && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.telephone}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info grid */}
                <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {c.adresse && (
                    <p className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.adresse}</span>
                    </p>
                  )}
                  {(c.nif || c.rc) && (
                    <p className="flex items-center gap-1.5 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {c.nif ? `NIF: ${c.nif}` : ''} {c.rc ? `RC: ${c.rc}` : ''}
                      </span>
                    </p>
                  )}
                  {c.plafondCredit ? (
                    <p className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      <span>Plafond: {c.plafondCredit.toLocaleString('fr-DZ')} DA</span>
                    </p>
                  ) : null}
                </div>

                {/* Debt Banner */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60">
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase block">
                      Dette Totale
                    </span>
                    <span className="text-base font-black text-amber-700 dark:text-amber-400">
                      {c.detteTotale.toLocaleString('fr-DZ')} DA
                    </span>
                  </div>

                  {c.detteTotale > 0 && (
                    <button
                      onClick={() => {
                        setPayingCustomer(c);
                        setPaymentAmount(c.detteTotale);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] shadow-sm transition-all"
                    >
                      Verser
                    </button>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(c)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-all"
                >
                  <Pencil className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Modifier</span>
                </button>

                <button
                  onClick={() => onDeleteCustomer(c.id)}
                  className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer (Matching Screenshot) */}
      <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Précédent</span>
        </button>

        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
          Page {currentPage} sur {totalPages}
        </span>

        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1"
        >
          <span>Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* CREATE / EDIT CUSTOMER MODAL (Matching exact layout from Screenshots 2, 3, 4) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                {editingCustomer ? 'Modifier le Client' : 'Ajouter un Client Régulier'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Numéro de Téléphone */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  Numéro de Téléphone
                </label>
                <input
                  type="text"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Adresse ou Wilaya */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  Adresse ou Wilaya
                </label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Fiscal Info Grid: NIF, RC, AI, NIS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    NIF
                  </label>
                  <input
                    type="text"
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    className="w-full h-10 px-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    RC
                  </label>
                  <input
                    type="text"
                    value={rc}
                    onChange={(e) => setRc(e.target.value)}
                    className="w-full h-10 px-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    AI
                  </label>
                  <input
                    type="text"
                    value={ai}
                    onChange={(e) => setAi(e.target.value)}
                    className="w-full h-10 px-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    NIS
                  </label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="w-full h-10 px-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* Yellow Box for Dette Initiale */}
              <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 space-y-2">
                <label className="text-xs font-extrabold text-amber-900 dark:text-amber-300 block">
                  Dette Initiale (dettes antérieures avant l’utilisation du logiciel)
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={detteInitiale}
                    onChange={(e) => setDetteInitiale(Number(e.target.value))}
                    className="w-full h-11 pl-4 pr-12 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-black text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs text-amber-700 dark:text-amber-400">
                    DA
                  </span>
                </div>

                <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium leading-normal">
                  Ce montant sera ajouté à la dette totale du client. Laissez 0 s'il n'y a pas de dette antérieure.
                </p>
              </div>

              {/* Light Blue Box for Plafond de crédit */}
              <div className="p-4 rounded-2xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 space-y-2">
                <label className="text-xs font-extrabold text-blue-900 dark:text-blue-300 block">
                  Plafond de crédit (dette maximale autorisée)
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={plafondCredit}
                    onChange={(e) => setPlafondCredit(Number(e.target.value))}
                    className="w-full h-11 pl-4 pr-12 rounded-2xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs text-blue-700 dark:text-blue-400">
                    DA
                  </span>
                </div>

                <p className="text-[11px] text-blue-800 dark:text-blue-400 font-medium leading-normal">
                  Si la dette totale dépasse ce plafond lors d'une vente, une confirmation est demandée. Laissez 0 pour désactiver.
                </p>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all mt-4"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les Données</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SETTLE DEBT MODAL */}
      {payingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Règlement de Dette - {payingCustomer.nom}
              </h3>
              <button
                onClick={() => setPayingCustomer(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center justify-between">
              <span>Dette Actuelle:</span>
              <span className="text-sm font-black">
                {payingCustomer.detteTotale.toLocaleString('fr-DZ')} DA
              </span>
            </div>

            <form onSubmit={handleSettleDebt} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  Montant Versé (DA)
                </label>
                <input
                  type="number"
                  min="1"
                  max={payingCustomer.detteTotale}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingCustomer(null)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
                >
                  Confirmer le Versement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
