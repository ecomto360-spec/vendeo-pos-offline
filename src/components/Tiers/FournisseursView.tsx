import React, { useState } from 'react';
import { Truck, Plus, Search, Phone, MapPin, Edit, Trash2, X, DollarSign, Building, FileText, CheckCircle2 } from 'lucide-react';
import { Supplier } from '../../types';

interface FournisseursViewProps {
  suppliers: Supplier[];
  onAddSupplier: (s: Supplier) => void;
  onUpdateSupplier?: (s: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onPaySupplierDebt?: (supplierId: string, amount: number) => void;
}

export const FournisseursView: React.FC<FournisseursViewProps> = ({
  suppliers,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  onPaySupplierDebt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Modal Form States
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [rc, setRc] = useState('');
  const [nif, setNif] = useState('');
  const [ai, setAi] = useState('');
  const [nis, setNis] = useState('');
  const [detteInitiale, setDetteInitiale] = useState<number | ''>(0);

  // Debt Payment Modal State
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const openAddModal = () => {
    setEditingSupplier(null);
    setNom('');
    setTelephone('');
    setAdresse('');
    setRc('');
    setNif('');
    setAi('');
    setNis('');
    setDetteInitiale(0);
    setShowModal(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNom(supplier.nom || '');
    setTelephone(supplier.telephone || '');
    setAdresse(supplier.adresse || '');
    setRc(supplier.rc || '');
    setNif(supplier.nif || '');
    setAi(supplier.ai || '');
    setNis(supplier.nis || '');
    setDetteInitiale(supplier.detteInitiale || 0);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    const initialDebtVal = typeof detteInitiale === 'number' ? detteInitiale : 0;

    if (editingSupplier) {
      const updated: Supplier = {
        ...editingSupplier,
        nom: nom.trim(),
        telephone: telephone.trim(),
        adresse: adresse.trim(),
        rc: rc.trim(),
        nif: nif.trim(),
        ai: ai.trim(),
        nis: nis.trim(),
        detteInitiale: initialDebtVal,
      };
      if (onUpdateSupplier) {
        onUpdateSupplier(updated);
      } else {
        onAddSupplier(updated);
      }
    } else {
      const newSupplier: Supplier = {
        id: `s_${Date.now()}`,
        nom: nom.trim(),
        telephone: telephone.trim(),
        adresse: adresse.trim(),
        rc: rc.trim(),
        nif: nif.trim(),
        ai: ai.trim(),
        nis: nis.trim(),
        detteInitiale: initialDebtVal,
        detteTotale: initialDebtVal,
        facturesOuvertes: initialDebtVal > 0 ? 1 : 0,
      };
      onAddSupplier(newSupplier);
    }

    setShowModal(false);
  };

  const handlePayDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingSupplier || !paymentAmount || paymentAmount <= 0) return;

    const payVal = typeof paymentAmount === 'number' ? paymentAmount : 0;

    if (onPaySupplierDebt) {
      onPaySupplierDebt(payingSupplier.id, payVal);
    } else if (onUpdateSupplier) {
      const newDebt = Math.max(0, payingSupplier.detteTotale - payVal);
      onUpdateSupplier({
        ...payingSupplier,
        detteTotale: newDebt,
        facturesOuvertes: newDebt === 0 ? 0 : payingSupplier.facturesOuvertes,
      });
    }

    setPayingSupplier(null);
    setPaymentAmount('');
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.telephone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.adresse && s.adresse.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage) || 1;
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            <span>Gestion des Fournisseurs</span>
          </h2>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un Nouveau Fournisseur</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Rechercher des noms de fournisseurs..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Suppliers Grid or Empty State */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Aucun fournisseur enregistré pour le moment. Commencez par ajouter votre premier fournisseur.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {paginatedSuppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                      {s.nom}
                    </h3>
                    {s.entreprise && (
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3.5 h-3.5" />
                        <span>{s.entreprise}</span>
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[11px] font-extrabold">
                    Fournisseur
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {s.telephone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">{s.telephone}</span>
                    </p>
                  )}
                  {s.adresse && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.adresse}</span>
                    </p>
                  )}
                </div>

                {/* Fiscal info pill if available */}
                {(s.rc || s.nif || s.ai || s.nis) && (
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-700/60 text-[11px] grid grid-cols-2 gap-1 text-slate-600 dark:text-slate-400">
                    {s.rc && <div><span className="font-bold text-slate-700 dark:text-slate-300">RC:</span> {s.rc}</div>}
                    {s.nif && <div><span className="font-bold text-slate-700 dark:text-slate-300">NIF:</span> {s.nif}</div>}
                    {s.ai && <div><span className="font-bold text-slate-700 dark:text-slate-300">AI:</span> {s.ai}</div>}
                    {s.nis && <div><span className="font-bold text-slate-700 dark:text-slate-300">NIS:</span> {s.nis}</div>}
                  </div>
                )}
              </div>

              {/* Debt & Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                      Dette Totale
                    </span>
                    <span
                      className={`text-base font-black ${
                        s.detteTotale > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {s.detteTotale.toLocaleString()} DA
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                      Factures Ouvertes
                    </span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                      {s.facturesOuvertes || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {s.detteTotale > 0 && (
                    <button
                      onClick={() => {
                        setPayingSupplier(s);
                        setPaymentAmount(s.detteTotale);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Régler / Verser</span>
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(s)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Voulez-vous vraiment supprimer le fournisseur "${s.nom}" ?`)) {
                        onDeleteSupplier(s.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Précédent
        </button>

        <span>
          Page {currentPage} sur {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Suivant
        </button>
      </div>

      {/* Modal: Ajouter / Modifier Un Fournisseur */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {editingSupplier ? 'Modifier le Fournisseur' : 'Ajouter un Nouveau Fournisseur'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Fournisseur / Nom de l'Entreprise */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Fournisseur / Nom de l'Entreprise
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Sarl Agro-Distro"
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Grid: Téléphone & Adresse */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Numéro de Téléphone Principal
                  </label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="Ex: 0550 12 34 56"
                    className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Adresse & Localisation
                  </label>
                  <input
                    type="text"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    placeholder="Ex: Alger, Rouiba..."
                    className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* RC & Informations Fiscales Box */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>RC & Informations Fiscales</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      RC (Registre de Commerce)
                    </label>
                    <input
                      type="text"
                      value={rc}
                      onChange={(e) => setRc(e.target.value)}
                      placeholder=""
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      NIF (Numéro d'Identification Fiscale)
                    </label>
                    <input
                      type="text"
                      value={nif}
                      onChange={(e) => setNif(e.target.value)}
                      placeholder=""
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      AI (Article d'Imposition)
                    </label>
                    <input
                      type="text"
                      value={ai}
                      onChange={(e) => setAi(e.target.value)}
                      placeholder=""
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      NIS (Numéro d'Identification Statistique)
                    </label>
                    <input
                      type="text"
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      placeholder=""
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Highlighted Yellow/Amber Card: Dette Initiale */}
              {!editingSupplier && (
                <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
                  <label className="text-xs font-extrabold text-amber-900 dark:text-amber-200 block">
                    Dette Initiale (montant que vous devez à ce fournisseur avant l'utilisation du logiciel)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={detteInitiale}
                      onChange={(e) =>
                        setDetteInitiale(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full h-12 pr-12 pl-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100 font-black text-base focus:outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-xs text-amber-700 dark:text-amber-400">
                      DA
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300/80">
                    Ce montant sera ajouté à votre dette totale envers ce fournisseur. Laissez 0 s'il n'y a pas de dette antérieure.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/25 active:scale-95 transition-all text-center"
                >
                  Enregistrer les Données du Fournisseur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Régler la Dette */}
      {payingSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Régler / Verser Dette Fournisseur
              </h3>
              <button
                onClick={() => setPayingSupplier(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-1">
              <p className="text-xs text-slate-500">Fournisseur:</p>
              <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                {payingSupplier.nom}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 font-bold">
                Dette Actuelle: {payingSupplier.detteTotale.toLocaleString()} DA
              </p>
            </div>

            <form onSubmit={handlePayDebtSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Montant du Versement (DA)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={payingSupplier.detteTotale}
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base font-extrabold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingSupplier(null)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider le Versement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
