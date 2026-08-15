import React from 'react';
import { Layers, Percent, Truck, Users, FileText, ShoppingBag, Plus, Search } from 'lucide-react';

interface GenericPageViewProps {
  type: 'packs' | 'promotions' | 'achats' | 'utilisateurs' | 'proformas' | 'commandes';
}

export const GenericPageView: React.FC<GenericPageViewProps> = ({ type }) => {
  const titles = {
    packs: { title: 'Packs de Produit & Offres Groupées', subtitle: 'Créer des compositions de produits avec prix préférentiels', icon: <Layers className="w-6 h-6 text-blue-600" /> },
    promotions: { title: 'Promotions & Réductions', subtitle: 'Programmer des soldes temporaires et remises par catégorie', icon: <Percent className="w-6 h-6 text-blue-600" /> },
    achats: { title: 'Bons d\'Achats & Réceptions', subtitle: 'Enregistrer les entrées de stock en provenance des fournisseurs', icon: <Truck className="w-6 h-6 text-blue-600" /> },
    utilisateurs: { title: 'Gestion des Caissiers & Droits d\'Accès', subtitle: 'Créer les comptes utilisateurs et définir leurs permissions', icon: <Users className="w-6 h-6 text-blue-600" /> },
    proformas: { title: 'Factures Pro-forma & Devis', subtitle: 'Établir des propositions commerciales pour les clients institutionnels', icon: <FileText className="w-6 h-6 text-blue-600" /> },
    commandes: { title: 'Bons de Commande Fournisseur', subtitle: 'Planifier les réapprovisionnements auprès de vos partenaires', icon: <ShoppingBag className="w-6 h-6 text-blue-600" /> },
  };

  const current = titles[type];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {current.icon}
            <span>{current.title}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{current.subtitle}</p>
        </div>

        <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/30 active:scale-95 transition-all">
          <Plus className="w-4 h-4" />
          <span>Ajouter Element</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrer les enregistrements..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-12 border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          {current.icon}
        </div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Module {current.title} prêt</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Ce module est configuré et prêt pour l'intégration de données réelles.
        </p>
      </div>
    </div>
  );
};
