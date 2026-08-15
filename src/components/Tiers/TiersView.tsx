import React, { useState } from 'react';
import { Users, Truck, Plus, Search, Phone, Mail, MapPin, Trash2 } from 'lucide-react';
import { Customer, Supplier } from '../../types';

interface TiersViewProps {
  initialTab?: 'clients' | 'fournisseurs';
  customers: Customer[];
  suppliers: Supplier[];
  onAddCustomer: (c: Customer) => void;
  onAddSupplier: (s: Omit<Supplier, 'id' | 'detteTotale' | 'facturesOuvertes'>) => void;
  onDeleteCustomer: (id: string) => void;
  onDeleteSupplier: (id: string) => void;
}

export const TiersView: React.FC<TiersViewProps> = ({
  initialTab = 'clients',
  customers,
  suppliers,
  onAddCustomer,
  onAddSupplier,
  onDeleteCustomer,
  onDeleteSupplier,
}) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'fournisseurs'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [adresse, setAdresse] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom) return;

    if (activeTab === 'clients') {
      onAddCustomer({ id: `c_${Date.now()}`, nom, telephone, email, adresse, detteTotale: 0, facturesOuvertes: 0 });
    } else {
      onAddSupplier({ nom, telephone, email, adresse, matriculeFiscal: '' });
    }

    setNom('');
    setTelephone('');
    setEmail('');
    setAdresse('');
    setShowAddModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Gestion des Tiers (Clients & Fournisseurs)</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fichier centralisé des contacts, coordonnées et suivis des créances
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'clients' ? 'Nouveau Client' : 'Nouveau Fournisseur'}</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'clients' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clients ({customers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('fournisseurs')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'fournisseurs' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Fournisseurs ({suppliers.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Recherche par nom ou téléphone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium focus:outline-none"
          />
        </div>
      </div>

      {/* Tiers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {activeTab === 'clients'
          ? customers
              .filter((c) => c.nom.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{c.nom}</h4>
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-extrabold">
                        Client
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {c.telephone}</p>
                      <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email || 'Non renseigné'}</p>
                      <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {c.adresse || 'Alger'}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Solde Dette</span>
                      <span className="text-sm font-black text-amber-600">{c.detteTotale} DA</span>
                    </div>
                    <button
                      onClick={() => onDeleteCustomer(c.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
          : suppliers
              .filter((s) => s.nom.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((s) => (
                <div
                  key={s.id}
                  className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{s.nom}</h4>
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-extrabold">
                        Fournisseur
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {s.telephone}</p>
                      <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {s.email || 'Non renseigné'}</p>
                      <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {s.adresse || 'Alger'}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Dette Envers Fournisseur</span>
                      <span className="text-sm font-black text-red-600">{s.detteTotale} DA</span>
                    </div>
                    <button
                      onClick={() => onDeleteSupplier(s.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ajouter un {activeTab === 'clients' ? 'Client' : 'Fournisseur'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nom Complet
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Mohamed Amine"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Numéro de Téléphone
                </label>
                <input
                  type="text"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="0655 00 00 00"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Wilaya / Ville"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all"
              >
                Enregistrer Contact
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
