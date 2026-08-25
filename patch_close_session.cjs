const fs = require('fs');
let appFile = 'src/App.tsx';
let appContent = fs.readFileSync(appFile, 'utf-8');

appContent = appContent.replace(
/\.filter\(\(m\) => m\.type === 'depot' \|\| m\.type === 'vente'\)/g,
".filter((m) => (m.type === 'depot' || m.type === 'vente') && m.description !== \"Fond de caisse d'ouverture\")"
);

fs.writeFileSync(appFile, appContent);
console.log('Fixed handleCloseSession encaissements');
