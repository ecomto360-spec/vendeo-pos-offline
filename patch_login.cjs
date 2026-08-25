const fs = require('fs');

let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf-8');

// Insert imports and the handler inside LoginScreen
const handlerCode = `
  const handleOAuthLogin = async (providerName: 'google' | 'facebook') => {
    try {
      setError('');
      const { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } = await import('firebase/auth');
      const { getFirebaseInstance } = await import('../lib/firebase');
      
      const instance = getFirebaseInstance();
      if (!instance) {
        setError('Firebase non configuré.');
        return;
      }
      
      const provider = providerName === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
      
      const result = await signInWithPopup(instance.auth, provider);
      const user = result.user;
      
      const newUser = {
        id: user.uid,
        nomComplet: user.displayName || 'Utilisateur',
        nomUtilisateur: user.email?.split('@')[0] || user.uid.substring(0, 8),
        role: 'admin' as const,
        statut: 'actif' as const,
        dateCreation: new Date().toISOString().split('T')[0],
      };
      
      setCurrentSessionUser(newUser as any);
      onLoginSuccess(newUser as any);
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('La fenêtre de connexion a été fermée.');
      } else {
        setError("Erreur d'authentification : " + err.message);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {`;

code = code.replace("  const handleSubmit = (e: React.FormEvent) => {", handlerCode);

// Add onClick to Google buttons
code = code.replaceAll(
  `<button 
                type="button" 
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border border-zinc-700/50 hover:bg-zinc-800/50 transition-all text-white font-medium text-[14px]"
              >
                <GoogleIcon />
                Google
              </button>`,
  `<button 
                type="button" 
                onClick={() => handleOAuthLogin('google')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border border-zinc-700/50 hover:bg-zinc-800/50 transition-all text-white font-medium text-[14px]"
              >
                <GoogleIcon />
                Google
              </button>`
);

// Add onClick to Facebook buttons
code = code.replaceAll(
  `<button 
                type="button" 
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border border-zinc-700/50 hover:bg-zinc-800/50 transition-all text-white font-medium text-[14px]"
              >
                <FacebookIcon />
                Facebook
              </button>`,
  `<button 
                type="button" 
                onClick={() => handleOAuthLogin('facebook')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border border-zinc-700/50 hover:bg-zinc-800/50 transition-all text-white font-medium text-[14px]"
              >
                <FacebookIcon />
                Facebook
              </button>`
);

fs.writeFileSync('src/components/LoginScreen.tsx', code);
console.log("LoginScreen.tsx patched!");
