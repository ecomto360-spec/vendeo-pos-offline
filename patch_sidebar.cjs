const fs = require('fs');

let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

code = code.replace(
  "import { NavigationPage, Language } from '../types';",
  "import { NavigationPage, Language, AppUser } from '../types';"
);

code = code.replace(
  "  isOpen?: boolean;\n  onClose?: () => void;\n}",
  "  isOpen?: boolean;\n  onClose?: () => void;\n  currentUser?: AppUser | null;\n  storeName?: string;\n}"
);

code = code.replace(
  "  isOpen = false,\n  onClose,\n}) => {",
  "  isOpen = false,\n  onClose,\n  currentUser,\n  storeName,\n}) => {"
);

// Replace "Vendeo POS" with storeName or "Vendeo POS"
code = code.replace(
  "className=\"font-bold text-slate-900 dark:text-white text-base tracking-tight\">Vendeo POS</h1>",
  "className=\"font-bold text-slate-900 dark:text-white text-base tracking-tight\">{storeName || 'Vendeo POS'}</h1>"
);

// Replace "coco ben" with the actual user name
code = code.replace(
  "{isSuperAdmin ? 'adlen' : 'coco ben'}",
  "{isSuperAdmin ? 'adlen' : (currentUser?.nomComplet || 'Utilisateur')}"
);

// Replace "ADMIN" with actual role
code = code.replace(
  "{isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}",
  "{isSuperAdmin ? 'SUPER ADMIN' : ((currentUser?.role || 'ADMIN').toUpperCase())}"
);


fs.writeFileSync('src/components/Sidebar.tsx', code);
console.log("Sidebar patched!");
