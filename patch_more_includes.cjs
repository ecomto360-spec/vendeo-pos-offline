const fs = require('fs');
const { execSync } = require('child_process');
const files = execSync('grep -rl "\\.includes(" src/').toString().trim().split('\n');

files.forEach(file => {
  if (!file) return;
  let content = fs.readFileSync(file, 'utf-8');
  
  content = content.replace(/p\.codesBarresSupp && p\.codesBarresSupp\.some/g, "(p.codesBarresSupp || []).some");

  fs.writeFileSync(file, content);
});
console.log('Patched more includes');
