import React, { useState } from 'react';
import {
  UserCog,
  UserPlus,
  Search,
  User,
  AtSign,
  KeyRound,
  Shield,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Save,
  Lock,
} from 'lucide-react';
import { AppUser, UserRole } from '../../types';

interface UtilisateursViewProps {
  users: AppUser[];
  onAddUser: (newUser: AppUser) => void;
  onUpdateUser: (updatedUser: AppUser) => void;
  onDeleteUser: (id: string) => void;
}

export const UtilisateursView: React.FC<UtilisateursViewProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // Form Fields
  const [nomComplet, setNomComplet] = useState('');
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [role, setRole] = useState<UserRole>('vendeur');
  const [statut, setStatut] = useState<'actif' | 'desactive'>('actif');
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setEditingUser(null);
    setNomComplet('');
    setNomUtilisateur('');
    setMotDePasse('');
    setRole('vendeur');
    setStatut('actif');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (u: AppUser) => {
    setEditingUser(u);
    setNomComplet(u.nomComplet);
    setNomUtilisateur(u.nomUtilisateur);
    setMotDePasse('');
    setRole(u.role);
    setStatut(u.statut);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomComplet.trim()) {
      setFormError('Veuillez saisir le nom complet de l’utilisateur.');
      return;
    }
    if (!nomUtilisateur.trim()) {
      setFormError('Veuillez saisir le nom d’utilisateur (pour la connexion).');
      return;
    }

    if (editingUser) {
      const updated: AppUser = {
        ...editingUser,
        nomComplet: nomComplet.trim(),
        nomUtilisateur: nomUtilisateur.trim().toUpperCase(),
        role,
        statut,
        motDePasse: motDePasse ? motDePasse : editingUser.motDePasse,
      };
      onUpdateUser(updated);
    } else {
      const newUser: AppUser = {
        id: `u_${Date.now()}`,
        nomComplet: nomComplet.trim(),
        nomUtilisateur: nomUtilisateur.trim().toUpperCase(),
        motDePasse: motDePasse || '123456',
        role,
        statut,
        dateCreation: new Date().toISOString().split('T')[0],
      };
      onAddUser(newUser);
    }

    setShowModal(false);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nomUtilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Admin
          </span>
        );
      case 'caissier':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Caissier
          </span>
        );
      case 'vendeur':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Vendeur
          </span>
        );
      case 'comptable':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Comptable
          </span>
        );
      case 'assistant':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Assistant
          </span>
        );
    }
  };

  const getRoleHelpText = (r: UserRole) => {
    switch (r) {
      case 'vendeur':
        return 'Accès au point de vente et à la caisse uniquement. Ne peut pas ajouter de nouveau client depuis le point de vente.';
      case 'caissier':
        return 'Accès à la caisse, encaissements directs et ouverture de session de caisse.';
      case 'comptable':
        return 'Accès aux modules financiers, fournisseurs, achats et rapports de comptabilité.';
      case 'assistant':
        return 'Accès à la gestion globale (produits, stock, clients), sauf les paramètres système.';
      case 'admin':
        return 'Accès complet et illimité à l’ensemble des fonctionnalités et configurations.';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserCog className="w-7 h-7 text-blue-600" />
            <span>Utilisateurs</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérer les autorisations d’accès et les utilisateurs
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Ajouter un Utilisateur</span>
        </button>
      </div>

      {/* Users Table Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
        {/* Search Bar Inside Table Card */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher nom, pseudo ou rôle..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">INFO UTILISATEUR</th>
                <th className="py-4 px-6">NOM D'UTILISATEUR</th>
                <th className="py-4 px-6">RÔLE & AUTORISATIONS</th>
                <th className="py-4 px-6 text-center">STATUT</th>
                <th className="py-4 px-6 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    {/* User Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 uppercase shrink-0 text-sm">
                          {u.nomComplet.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {u.nomComplet}
                          </p>
                          {u.dateCreation && (
                            <p className="text-[10px] text-slate-400 font-medium">
                              Inscrit le {u.dateCreation}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="py-4 px-6">
                      <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono font-black text-xs rounded-xl border border-slate-200 dark:border-slate-700">
                        {u.nomUtilisateur}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6">{getRoleBadge(u.role)}</td>

                    {/* Statut */}
                    <td className="py-4 px-6 text-center">
                      {u.statut === 'actif' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Actif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700">
                          <XCircle className="w-3 h-3" />
                          <span>Désactivé</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all active:scale-95"
                        >
                          <Pencil className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Modifier</span>
                        </button>

                        {u.role !== 'admin' && (
                          <button
                            onClick={() => onDeleteUser(u.id)}
                            className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs transition-all active:scale-95"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                Gestion des Utilisateurs
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
              {/* Nom complet */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>NOM COMPLET</span>
                </label>
                <input
                  type="text"
                  required
                  value={nomComplet}
                  onChange={(e) => setNomComplet(e.target.value)}
                  placeholder="ex: coco ben"
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Nom d'utilisateur */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-slate-400" />
                  <span>NOM D'UTILISATEUR (POUR LA CONNEXION)</span>
                </label>
                <input
                  type="text"
                  required
                  value={nomUtilisateur}
                  onChange={(e) => setNomUtilisateur(e.target.value)}
                  placeholder="ex: COCO"
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span>MOT DE PASSE</span>
                </label>
                <input
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder={
                    editingUser ? 'Laissez vide si vous ne souhaitez pas modifier' : 'Mot de passe'
                  }
                  className="w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Grid: Role & Statut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Role select */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider block">
                    RÔLE & AUTORISATIONS
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="vendeur">Vendeur (Caisse uniquement)</option>
                    <option value="caissier">Caissier (Caisse Uniquement)</option>
                    <option value="comptable">Comptable (Financier + Fournisseurs + Achats)</option>
                    <option value="assistant">Assistant (Tout sauf Paramètres)</option>
                    <option value="admin">Administrateur (Accès Complet)</option>
                  </select>
                </div>

                {/* Statut select */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider block">
                    STATUT
                  </label>
                  <select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value as 'actif' | 'desactive')}
                    className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="actif">Actif (Accès Normal)</option>
                    <option value="desactive">Désactivé (Aucun Accès)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Help Box for selected role permissions */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {getRoleHelpText(role)}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
