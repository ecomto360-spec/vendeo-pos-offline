const fs = require('fs');
const { execSync } = require('child_process');
const files = execSync('grep -rl "\\.includes(" src/').toString().trim().split('\n');

files.forEach(file => {
  if (!file) return;
  let content = fs.readFileSync(file, 'utf-8');
  
  // Replace array includes just in case array is undefined
  content = content.replace(/categories\.includes/g, "(categories || []).includes");
  content = content.replace(/currentDeviceList\.includes/g, "(currentDeviceList || []).includes");
  content = content.replace(/prev\.includes/g, "(prev || []).includes");
  content = content.replace(/planType\.includes/g, "(planType || '').includes");
  
  // Replace string includes just in case string is undefined
  content = content.replace(/cleaned\.includes/g, "(cleaned || '').includes");
  content = content.replace(/errorMsg\.includes/g, "(errorMsg || '').includes");
  content = content.replace(/s\.date\.includes/g, "(s.date || '').includes");
  content = content.replace(/c\.telephone\.includes/g, "(c.telephone || '').includes");

  fs.writeFileSync(file, content);
});
console.log('Patched all other includes');
