const fs = require('fs');

function patchFiles() {
  const { execSync } = require('child_process');
  const files = execSync('grep -rl "\\.toLowerCase()" src/').toString().trim().split('\n');
  
  files.forEach(file => {
    if (!file) return;
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace p.nom.toLowerCase() -> (p.nom || '').toLowerCase()
    content = content.replace(/([a-zA-Z0-9_]+)\.nom\.toLowerCase\(\)/g, "($1.nom || '').toLowerCase()");
    content = content.replace(/([a-zA-Z0-9_]+)\.nomComplet\.toLowerCase\(\)/g, "($1.nomComplet || '').toLowerCase()");
    content = content.replace(/([a-zA-Z0-9_]+)\.nomUtilisateur\.toLowerCase\(\)/g, "($1.nomUtilisateur || '').toLowerCase()");
    content = content.replace(/([a-zA-Z0-9_]+)\.categorie\.toLowerCase\(\)/g, "($1.categorie || '').toLowerCase()");
    content = content.replace(/([a-zA-Z0-9_]+)\.role\.toLowerCase\(\)/g, "($1.role || '').toLowerCase()");
    content = content.replace(/([a-zA-Z0-9_]+)\.telephone\.toLowerCase\(\)/g, "($1.telephone || '').toLowerCase()");
    content = content.replace(/([a-zA-Z0-9_]+)\.clientNom\.toLowerCase\(\)/g, "($1.clientNom || '').toLowerCase()");
    
    // For CreatableSelect (opt.toLowerCase())
    content = content.replace(/opt\.toLowerCase\(\)/g, "(opt || '').toLowerCase()");
    
    // For Caisse category (cat.toLowerCase())
    if (file.includes('PointDeVenteView')) {
      content = content.replace(/cat\.toLowerCase\(\)/g, "(cat || '').toLowerCase()");
    }

    fs.writeFileSync(file, content);
  });
  console.log('Patched all known toLowerCase properties');
}

patchFiles();
