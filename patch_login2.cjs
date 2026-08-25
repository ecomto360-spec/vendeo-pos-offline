const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf-8');

const oldFunc = `  const handleOAuthLogin = async (providerName: 'google' | 'facebook') => {
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
  };`;

const newFunc = `  const handleOAuthLogin = async (providerName: 'google' | 'facebook') => {
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
      
      const email = user.email || '';
      
      // Look for existing user in current store
      const existingUser = users.find(u => 
        (u.nomUtilisateur && u.nomUtilisateur.toLowerCase() === email.toLowerCase()) || 
        u.id === user.uid
      );
      
      let finalUser;
      if (existingUser) {
        finalUser = existingUser;
      } else {
        finalUser = {
          id: user.uid,
          nomComplet: user.displayName || 'Utilisateur',
          nomUtilisateur: email || user.uid.substring(0, 8),
          role: 'admin' as const,
          statut: 'actif' as const,
          dateCreation: new Date().toISOString().split('T')[0],
        };
      }
      
      setCurrentSessionUser(finalUser as any);
      onLoginSuccess(finalUser as any);
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('La fenêtre de connexion a été fermée.');
      } else {
        setError("Erreur d'authentification : " + err.message);
      }
    }
  };`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('src/components/LoginScreen.tsx', code);
console.log("Patched login again");
