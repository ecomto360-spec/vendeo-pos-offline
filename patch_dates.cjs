const fs = require('fs');
let file = 'src/components/Ventes/JournalVentesView.tsx';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(/useState\('2026-08-09'\)/g, "useState(new Date().toISOString().split('T')[0])");
content = content.replace(/useState\('2026-08-10'\)/g, "useState(new Date().toISOString().split('T')[0])");
fs.writeFileSync(file, content);
console.log('Patched dates in JournalVentesView');
