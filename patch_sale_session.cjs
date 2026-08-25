const fs = require('fs');

let appFile = 'src/App.tsx';
let appContent = fs.readFileSync(appFile, 'utf-8');

appContent = appContent.replace(
/session: 'Session #1',/g,
"session: saleData.session || 'Hors-Session',"
);
appContent = appContent.replace(
/type: 'depot',\s*description: `Vente Ticket/g,
"type: 'vente',\n          description: `Vente Ticket"
);

fs.writeFileSync(appFile, appContent);

let caisseFile = 'src/components/Caisse/CaisseView.tsx';
let caisseContent = fs.readFileSync(caisseFile, 'utf-8');

caisseContent = caisseContent.replace(
/\.filter\(\(m\) => m\.type === 'depot' \|\| m\.type === 'vente'\)/g,
".filter((m) => (m.type === 'depot' || m.type === 'vente') && m.description !== \"Fond de caisse d'ouverture\")"
);

fs.writeFileSync(caisseFile, caisseContent);
console.log('Patched App.tsx and CaisseView.tsx');
