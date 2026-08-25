const fs = require('fs');
let file = 'src/components/Caisse/PointDeVenteView.tsx';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(/p\.codesBarresSupp\?\.includes/g, "(p.codesBarresSupp || []).includes");
fs.writeFileSync(file, content);
console.log('Patched codesBarresSupp');
