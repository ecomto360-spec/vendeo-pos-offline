const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');

const targetBlock = `  // 3. Initial Setup Wizard for first-time store onboarding
  if (!isInitialized) {`;

const insertBlock = `  // License Expiration Check
  if (!isLicenseActive) {
    return (
      <ActivationScreen
        onActivationSuccess={(lic) => {
          setActiveLicense(lic);
          setIsLicenseActive(true);
        }}
      />
    );
  }

  // 3. Initial Setup Wizard for first-time store onboarding
  if (!isInitialized) {`;

appCode = appCode.replace(targetBlock, insertBlock);

fs.writeFileSync('src/App.tsx', appCode);
console.log("App.tsx patched again!");
