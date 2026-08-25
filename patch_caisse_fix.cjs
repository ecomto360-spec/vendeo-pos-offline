const fs = require('fs');
let caisseFile = 'src/components/Caisse/CaisseView.tsx';
let caisseContent = fs.readFileSync(caisseFile, 'utf-8');

caisseContent = caisseContent.replace(
`              </div>
                 
              </div>

              {/* Ventes de la session */}`,
`              </div>

              {/* Ventes de la session */}`
);
fs.writeFileSync(caisseFile, caisseContent);
console.log('Fixed CaisseView syntax');
