const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "          isOpen={isMobileMenuOpen}\n          onClose={() => setIsMobileMenuOpen(false)}\n        />",
  "          isOpen={isMobileMenuOpen}\n          onClose={() => setIsMobileMenuOpen(false)}\n          currentUser={currentUser}\n          storeName={activeLicense?.storeName || 'Vendeo POS'}\n        />"
);

fs.writeFileSync('src/App.tsx', code);
console.log("App patched!");
