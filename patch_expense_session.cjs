const fs = require('fs');
let appFile = 'src/App.tsx';
let appContent = fs.readFileSync(appFile, 'utf-8');

appContent = appContent.replace(
/utilisateur: expData\.creePar,\n\s*session: saleData\.session \|\| 'Hors-Session',/g,
"utilisateur: expData.creePar,\n        session: activeSession?.id || 'Hors-Session',"
);

fs.writeFileSync(appFile, appContent);
console.log('Fixed handleAddExpense');
