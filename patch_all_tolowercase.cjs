const fs = require('fs');
const { execSync } = require('child_process');
const files = execSync('grep -rl "\\.toLowerCase()" src/').toString().trim().split('\n');

files.forEach(file => {
  if (!file) return;
  let content = fs.readFileSync(file, 'utf-8');
  
  // Protect specific fields not covered before
  content = content.replace(/s\.adresse\.toLowerCase\(\)/g, "(s.adresse || '').toLowerCase()");
  content = content.replace(/p\.codeBarre\.toLowerCase\(\)/g, "(p.codeBarre || '').toLowerCase()");
  content = content.replace(/trimmedUser\.toLowerCase\(\)/g, "(trimmedUser || '').toLowerCase()");
  content = content.replace(/s\.id\.toLowerCase\(\)/g, "(s.id || '').toLowerCase()");
  content = content.replace(/prof\.id\.toLowerCase\(\)/g, "(prof.id || '').toLowerCase()");
  content = content.replace(/ord\.id\.toLowerCase\(\)/g, "(ord.id || '').toLowerCase()");
  content = content.replace(/storeName\.toLowerCase\(\)/g, "(storeName || '').toLowerCase()");
  content = content.replace(/email\.toLowerCase\(\)/g, "(email || '').toLowerCase()");
  
  // Actually, wait, let's also protect searchTerm if it's somehow undefined
  content = content.replace(/searchTerm\.toLowerCase\(\)/g, "(searchTerm || '').toLowerCase()");
  content = content.replace(/productSearchTerm\.toLowerCase\(\)/g, "(productSearchTerm || '').toLowerCase()");
  content = content.replace(/categorySearchTerm\.toLowerCase\(\)/g, "(categorySearchTerm || '').toLowerCase()");
  content = content.replace(/productSearch\.toLowerCase\(\)/g, "(productSearch || '').toLowerCase()");
  content = content.replace(/orderNumberSearch\.toLowerCase\(\)/g, "(orderNumberSearch || '').toLowerCase()");
  content = content.replace(/searchProd\.toLowerCase\(\)/g, "(searchProd || '').toLowerCase()");
  content = content.replace(/searchQuery\.trim\(\)\.toLowerCase\(\)/g, "((searchQuery || '').trim().toLowerCase())");

  fs.writeFileSync(file, content);
});
console.log('Patched all remaining known toLowerCase issues');
