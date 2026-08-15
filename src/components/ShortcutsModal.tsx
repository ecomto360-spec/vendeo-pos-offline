import React, { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
  const [shortcuts, setShortcuts] = useState({
    searchProduct: 'F7',
    clearCart: 'F1',
    salesHistory: 'F4',
    saveDraft: 'F2',
    openDrafts: 'F3',
    navPrevious: 'F10 F9',
    autoPrint: 'F8',
    filterFeatured: 'F6',
    selectClient: 'F11',
    modifyLastItem: 'F12',
    increaseDecrease: '+ / -',
    customProduct: 'F8',
  });

  const handleChange = (key: keyof typeof shortcuts, value: string) => {
    setShortcuts({ ...shortcuts, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-blue-600" />
            <h3 className="font-black text-slate-900 dark:text-white text-lg">Raccourcis Clavier</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar pr-2 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Col 1 */}
            <div>
              <h4 className="font-bold text-blue-600 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Écran de Vente</h4>
              <div className="space-y-3">
                <ShortcutItem label="Rechercher un produit par nom" value={shortcuts.searchProduct} onChange={(v) => handleChange('searchProduct', v)} />
                <ShortcutItem label="Vider le panier" value={shortcuts.clearCart} onChange={(v) => handleChange('clearCart', v)} />
                <ShortcutItem label="Ventes précédentes / Retours" value={shortcuts.salesHistory} onChange={(v) => handleChange('salesHistory', v)} />
                <ShortcutItem label="Enregistrer le panier comme brouillon" value={shortcuts.saveDraft} onChange={(v) => handleChange('saveDraft', v)} />
                <ShortcutItem label="Ouvrir les brouillons" value={shortcuts.openDrafts} onChange={(v) => handleChange('openDrafts', v)} />
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="font-bold text-teal-600 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Actions Rapides</h4>
              <div className="space-y-3">
                <ShortcutItem label="Naviguer entre les commandes précédentes" value={shortcuts.navPrevious} onChange={(v) => handleChange('navPrevious', v)} />
                <ShortcutItem label="Impression auto (Activer/Désactiver)" value={shortcuts.autoPrint} onChange={(v) => handleChange('autoPrint', v)} />
                <ShortcutItem label="Filtrer les produits phares" value={shortcuts.filterFeatured} onChange={(v) => handleChange('filterFeatured', v)} />
                <ShortcutItem label="Sélectionner un client" value={shortcuts.selectClient} onChange={(v) => handleChange('selectClient', v)} />
                <ShortcutItem label="Modifier la quantité de la dernière ligne du panier" value={shortcuts.modifyLastItem} onChange={(v) => handleChange('modifyLastItem', v)} />
                <ShortcutItem label="Augmenter / Diminuer la quantité de la ligne sélectionnée" value={shortcuts.increaseDecrease} onChange={(v) => handleChange('increaseDecrease', v)} />
              </div>

              <h4 className="font-bold text-orange-600 mt-8 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Navigation Rapide</h4>
              <div className="space-y-3">
                <ShortcutItem label="Produit libre" value={shortcuts.customProduct} onChange={(v) => handleChange('customProduct', v)} />
              </div>
            </div>

          </div>
        </div>

        <div className="pt-6 mt-auto flex justify-start border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all">
            Annuler
          </button>
        </div>

      </div>
    </div>
  );
};

const ShortcutItem = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-700 dark:text-slate-300 font-medium pr-4">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-center font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs"
      />
    </div>
  );
};
