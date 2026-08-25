const fs = require('fs');
const { execSync } = require('child_process');
const files = execSync('grep -rl "\\.includes(" src/').toString().trim().split('\n');

files.forEach(file => {
  if (!file) return;
  let content = fs.readFileSync(file, 'utf-8');
  
  content = content.replace(/p\.codeBarre\.includes/g, "(p.codeBarre || '').includes");
  content = content.replace(/c\.telephone\.includes/g, "(c.telephone || '').includes");
  content = content.replace(/prof\.clientNIF\.includes/g, "(prof.clientNIF || '').includes");
  content = content.replace(/ord\.clientTelephone\.includes/g, "(ord.clientTelephone || '').includes");

  fs.writeFileSync(file, content);
});
console.log('Patched includes');
