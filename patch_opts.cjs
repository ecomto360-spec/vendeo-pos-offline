const fs = require('fs');

function patch(file) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/const currentOpts = newG\[idx\]\.options;/g, "const currentOpts = newG[idx].options || [];\n                                        newG[idx].options = currentOpts;");
  fs.writeFileSync(file, content);
}

patch('src/components/Caisse/PointDeVenteView.tsx');
patch('src/components/Stock/StockView.tsx');
console.log('Patched currentOpts');
