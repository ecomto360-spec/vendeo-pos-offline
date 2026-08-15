import React, { useState } from 'react';
import { User as UserIcon, Lock, Building, Phone, MapPin, CheckCircle, Store, Briefcase, Globe } from 'lucide-react';
import { AppUser, AppSettings, Language } from '../types';

interface SetupWizardProps {
  onComplete: (adminUser: Partial<AppUser>, settings: Partial<AppSettings>) => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [language, setLanguage] = useState<Language>('fr');
  
  const [userForm, setUserForm] = useState({
    nomComplet: '',
    nomUtilisateur: 'admin',
    motDePasse: '',
    confirmerMotDePasse: '',
  });
  const [storeForm, setStoreForm] = useState({
    nomMagasin: '',
    telephoneMagasin: '',
    adresseMagasin: '',
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (userForm.motDePasse !== userForm.confirmerMotDePasse) {
        alert('Les mots de passe ne correspondent pas.');
        return;
      }
      if (!userForm.nomComplet || !userForm.nomUtilisateur || !userForm.motDePasse) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      setStep(3);
    } else {
      if (!storeForm.nomMagasin) {
        alert("Veuillez saisir le nom de l'activité.");
        return;
      }
      onComplete(
        {
          nomComplet: userForm.nomComplet,
          nomUtilisateur: userForm.nomUtilisateur,
          motDePasse: userForm.motDePasse,
          role: 'admin',
          statut: 'actif',
        },
        {
          langue: language,
          nomMagasin: storeForm.nomMagasin,
          telephoneMagasin: storeForm.telephoneMagasin,
          adresseMagasin: storeForm.adresseMagasin,
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="bg-blue-600 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-sm mb-4 shadow-inner">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black mb-2">
            {step === 1 ? 'Bienvenue sur Vendeo POS !' : step === 2 ? 'Création du compte' : 'Informations de l\'activité'}
          </h2>
          <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
            {step === 1
              ? "Pour commencer, veuillez choisir la langue de l'application."
              : step === 2
              ? "Veuillez configurer le compte administrateur afin d'initialiser le système avec tous les droits."
              : "Complétez les informations de base de votre activité commerciale."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleNext} className="p-8 space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Langue / Language / اللغة</label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage('fr')}
                  className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                    language === 'fr' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <span className="text-2xl">🇫🇷</span>
                  <span className="font-bold text-slate-900 dark:text-white">Français</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                    language === 'ar' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <span className="text-2xl">🇩🇿</span>
                  <span className="font-bold text-slate-900 dark:text-white">العربية</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                    language === 'en' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <span className="text-2xl">🇬🇧</span>
                  <span className="font-bold text-slate-900 dark:text-white">English</span>
                </button>
              </div>
            </div>
          ) : step === 2 ? (
            <>
              <div>
                <div className="relative">
                  <UserIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nom complet"
                    value={userForm.nomComplet}
                    onChange={(e) => setUserForm({ ...userForm, nomComplet: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <div className="relative">
                  <UserIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nom d'utilisateur (ex : admin)"
                    value={userForm.nomUtilisateur}
                    onChange={(e) => setUserForm({ ...userForm, nomUtilisateur: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Mot de passe"
                    value={userForm.motDePasse}
                    onChange={(e) => setUserForm({ ...userForm, motDePasse: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Confirmer le mot de passe"
                    value={userForm.confirmerMotDePasse}
                    onChange={(e) => setUserForm({ ...userForm, confirmerMotDePasse: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="relative">
                  <Briefcase className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nom de l'Activité / Magasin"
                    value={storeForm.nomMagasin}
                    onChange={(e) => setStoreForm({ ...storeForm, nomMagasin: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Numéro de Téléphone"
                    value={storeForm.telephoneMagasin}
                    onChange={(e) => setStoreForm({ ...storeForm, telephoneMagasin: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Adresse de l'Activité"
                    value={storeForm.adresseMagasin}
                    onChange={(e) => setStoreForm({ ...storeForm, adresseMagasin: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
          >
            {step === 1 ? (
              <>
                <Globe className="w-4 h-4" />
                <span>Continuer</span>
              </>
            ) : step === 2 ? (
              <>
                <UserIcon className="w-4 h-4" />
                <span>Créer le compte et continuer</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Terminer la configuration</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

