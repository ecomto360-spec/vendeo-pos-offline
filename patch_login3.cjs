const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf-8');

// Add static imports
const importsToAdd = `
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirebaseInstance } from '../lib/firebase';
`;

// Find a good place to insert (after import { useLanguage } from '../lib/i18n';)
code = code.replace(
  "import { useLanguage } from '../lib/i18n';",
  "import { useLanguage } from '../lib/i18n';\n" + importsToAdd
);

// Remove dynamic imports from handleOAuthLogin
const oldFuncStart = `  const handleOAuthLogin = async (providerName: 'google' | 'facebook') => {
    try {
      setError('');
      const { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } = await import('firebase/auth');
      const { getFirebaseInstance } = await import('../lib/firebase');
      
      const instance = getFirebaseInstance();`;

const newFuncStart = `  const handleOAuthLogin = async (providerName: 'google' | 'facebook') => {
    try {
      setError('');
      
      const instance = getFirebaseInstance();`;

code = code.replace(oldFuncStart, newFuncStart);

// Handle auth popup errors
code = code.replace(
  "setError(\"Erreur d'authentification : \" + err.message);",
  "if (err.code === 'auth/popup-blocked') { setError('La fenêtre de connexion a été bloquée par votre navigateur. Veuillez autoriser les popups ou ouvrir l\\'application dans un nouvel onglet.'); } else { setError(\"Erreur d'authentification : \" + err.message); }"
);

fs.writeFileSync('src/components/LoginScreen.tsx', code);
console.log("Patched login again for static imports");
