const fs = require('fs');

// Patch App.tsx to pass sales to CaisseView
let appFile = 'src/App.tsx';
let appContent = fs.readFileSync(appFile, 'utf-8');
appContent = appContent.replace(
  /<CaisseView\s+sessions=\{cashSessions\}\s+activeSession=\{activeSession\}\s+cashMovements=\{cashMovements\}/g,
  "<CaisseView\n              sales={sales}\n              sessions={cashSessions}\n              activeSession={activeSession}\n              cashMovements={cashMovements}"
);
fs.writeFileSync(appFile, appContent);

// Patch CaisseView.tsx to accept sales and display them
let caisseFile = 'src/components/Caisse/CaisseView.tsx';
let caisseContent = fs.readFileSync(caisseFile, 'utf-8');

if (!caisseContent.includes('sales: Sale[]')) {
  caisseContent = caisseContent.replace(
    /interface CaisseViewProps \{/,
    "import { Sale } from '../../types';\n\ninterface CaisseViewProps {\n  sales: Sale[];"
  );
  
  caisseContent = caisseContent.replace(
    /export const CaisseView: React\.FC<CaisseViewProps> = \(\{/,
    "export const CaisseView: React.FC<CaisseViewProps> = ({\n  sales,"
  );
  
  // Find where Journal des transactions is rendered and add a new section for Ventes
  const newSection = `
              </div>

              {/* Ventes de la session */}
              <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden space-y-3 mt-6">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Produits vendus (Session Actuelle)</span>
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-900/40 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-6">Heure</th>
                        <th className="py-3 px-6">Ticket</th>
                        <th className="py-3 px-6">Produits</th>
                        <th className="py-3 px-6 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                      {(() => {
                        const sessionSales = sales.filter(s => s.session === activeSession.id);
                        if (sessionSales.length === 0) {
                          return (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-slate-400 font-bold">
                                Aucun produit vendu dans cette session
                              </td>
                            </tr>
                          );
                        }
                        return sessionSales.map(sale => (
                          <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                            <td className="py-3.5 px-6 font-mono text-slate-500">{sale.date}</td>
                            <td className="py-3.5 px-6 font-bold">#{sale.id}</td>
                            <td className="py-3.5 px-6">
                              <div className="flex flex-col gap-1">
                                {sale.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.product.nom}</span>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">x{item.qty}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5 px-6 text-right font-black text-emerald-600">{sale.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions log table */}
  `;
  caisseContent = caisseContent.replace(/\{\/\* Transactions log table \*\/\}/, newSection);
  fs.writeFileSync(caisseFile, caisseContent);
  console.log('Patched CaisseView with sales');
}
