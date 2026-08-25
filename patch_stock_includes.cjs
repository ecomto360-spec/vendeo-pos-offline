const fs = require('fs');
let content = fs.readFileSync('src/components/Stock/StockView.tsx', 'utf-8');
content = content.replace(/\(c\) => c\.includes/g, "(c) => (c || '').includes");
fs.writeFileSync('src/components/Stock/StockView.tsx', content);
console.log('Patched StockView includes');
