const fs = require('fs');

let code = fs.readFileSync('src/components/Header.tsx', 'utf-8');

code = code.replace(
  "currentUser?.nomComplet || 'coco ben'",
  "currentUser?.nomComplet || 'Utilisateur'"
);

fs.writeFileSync('src/components/Header.tsx', code);
console.log("Header patched!");
