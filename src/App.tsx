import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ParametresView } from './components/Parametres/ParametresView';
import { StatistiquesView } from './components/Statistiques/StatistiquesView';
import { CaisseView } from './components/Caisse/CaisseView';
import { PointDeVenteView } from './components/Caisse/PointDeVenteView';
import { StockView } from './components/Stock/StockView';
import { JournalVentesView } from './components/Ventes/JournalVentesView';
import { TiersView } from './components/Tiers/TiersView';
import { ClientsView } from './components/Tiers/ClientsView';
import { FournisseursView } from './components/Tiers/FournisseursView';
import { GenericPageView } from './components/Generic/GenericPageView';
import { BonsCommandeView } from './components/Finance/BonsCommandeView';
import { ProformasView } from './components/Finance/ProformasView';
import { UtilisateursView } from './components/Utilisateurs/UtilisateursView';
import { AchatsView } from './components/Achats/AchatsView';
import { PromotionsView } from './components/Promotions/PromotionsView';
import { PacksView } from './components/Packs/PacksView';
import { LoginScreen } from './components/LoginScreen';
import { SetupWizard } from './components/SetupWizard';
import { getCurrentSessionUser, setCurrentSessionUser, clearUserSession } from './lib/authSession';
import { applyLanguageDOM, LanguageProvider } from './lib/i18n';

import {
  initialProducts,
  initialSales,
  initialExpenses,
  initialCashMovements,
  initialCustomers,
  initialSuppliers,
  initialSettings,
  defaultCategories,
  initialBonsCommande,
  initialProformas,
  initialUsers,
  initialPurchaseInvoices,
  initialPromotions,
  initialPacks,
  initialCashSessions,
} from './mockData';

import { Product, Sale, Expense, CashMovement, Customer, Supplier, AppSettings, BonCommande, ProformaInvoice, AppUser, PurchaseInvoice, Promotion, Pack, CashSession, ParametresTab } from './types';
import { Keyboard, PlayCircle, Sparkles, X } from 'lucide-react';

import { ShortcutsModal } from './components/ShortcutsModal';
import { getStoredItem, setStoredItem } from './lib/db';

export function App() {
  const [currentView, setCurrentView] = useState<string>('parametres');
  const [parametresTab, setParametresTab] = useState<ParametresTab>('generaux');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleOpenActivationPage = () => {
    setCurrentView('parametres');
    setParametresTab('activation');
  };

  // Initialization State
  const [isInitialized, setIsInitialized] = useState<boolean>(() => {
    return localStorage.getItem('lumina_initialized') === 'true';
  });

  // Flag to check if DB data is loaded
  const [isDbLoaded, setIsDbLoaded] = useState<boolean>(false);

  // Application Data States
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>(initialCashMovements);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [orders, setOrders] = useState<BonCommande[]>(initialBonsCommande);
  const [proformas, setProformas] = useState<ProformaInvoice[]>(initialProformas);
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>(initialPurchaseInvoices);
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [packs, setPacks] = useState<Pack[]>(initialPacks);
  const [cashSessions, setCashSessions] = useState<CashSession[]>(initialCashSessions);

  // Load from IndexedDB on startup
  useEffect(() => {
    async function loadDataFromDB() {
      try {
        const [
          storedProducts,
          storedSales,
          storedExpenses,
          storedCashMovements,
          storedCustomers,
          storedSuppliers,
          storedSettings,
          storedCategories,
          storedOrders,
          storedProformas,
          storedUsers,
          storedPurchaseInvoices,
          storedPromotions,
          storedPacks,
          storedCashSessions,
        ] = await Promise.all([
          getStoredItem('products', initialProducts),
          getStoredItem('sales', initialSales),
          getStoredItem('expenses', initialExpenses),
          getStoredItem('cashMovements', initialCashMovements),
          getStoredItem('customers', initialCustomers),
          getStoredItem('suppliers', initialSuppliers),
          getStoredItem('settings', initialSettings),
          getStoredItem('categories', defaultCategories),
          getStoredItem('orders', initialBonsCommande),
          getStoredItem('proformas', initialProformas),
          getStoredItem('users', initialUsers),
          getStoredItem('purchaseInvoices', initialPurchaseInvoices),
          getStoredItem('promotions', initialPromotions),
          getStoredItem('packs', initialPacks),
          getStoredItem('cashSessions', initialCashSessions),
        ]);

        setProducts(storedProducts);
        setSales(storedSales);
        setExpenses(storedExpenses);
        setCashMovements(storedCashMovements);
        setCustomers(storedCustomers);
        setSuppliers(storedSuppliers);
        setSettings(storedSettings);
        setCategories(storedCategories);
        setOrders(storedOrders);
        setProformas(storedProformas);
        setUsers(storedUsers);
        setPurchaseInvoices(storedPurchaseInvoices);
        setPromotions(storedPromotions);
        setPacks(storedPacks);
        setCashSessions(storedCashSessions);
      } catch (err) {
        console.error('[DB] Error loading IndexedDB data:', err);
      } finally {
        setIsDbLoaded(true);
      }
    }

    loadDataFromDB();
  }, []);

  // Save to IndexedDB on changes (only after initial load)
  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('products', products);
  }, [products, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('sales', sales);
  }, [sales, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('expenses', expenses);
  }, [expenses, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('cashMovements', cashMovements);
  }, [cashMovements, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('customers', customers);
  }, [customers, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('suppliers', suppliers);
  }, [suppliers, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('settings', settings);
  }, [settings, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('categories', categories);
  }, [categories, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('orders', orders);
  }, [orders, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('proformas', proformas);
  }, [proformas, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('users', users);
  }, [users, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('purchaseInvoices', purchaseInvoices);
  }, [purchaseInvoices, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('promotions', promotions);
  }, [promotions, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('packs', packs);
  }, [packs, isDbLoaded]);

  useEffect(() => {
    if (!isDbLoaded) return;
    setStoredItem('cashSessions', cashSessions);
  }, [cashSessions, isDbLoaded]);

  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(
    getCurrentSessionUser() || (isInitialized ? initialUsers[0] : null)
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getCurrentSessionUser() || (isInitialized && !!initialUsers[0]));

  // Modals
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showVideosModal, setShowVideosModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    applyLanguageDOM(settings.langue || 'fr');
  }, [settings.langue]);

  const handleSetupComplete = (adminUser: Partial<AppUser>, setupSettings: Partial<AppSettings>) => {
    const newAdmin: AppUser = {
      id: `user-${Date.now()}`,
      nomComplet: adminUser.nomComplet!,
      nomUtilisateur: adminUser.nomUtilisateur!,
      motDePasse: adminUser.motDePasse,
      role: 'admin',
      statut: 'actif',
      dateCreation: new Date().toISOString(),
    };

    setUsers([newAdmin]);
    setSettings({ ...initialSettings, ...setupSettings });
    
    // Auto-login the new admin
    setCurrentUser(newAdmin);
    setCurrentSessionUser(newAdmin);
    setIsAuthenticated(true);
    
    setIsInitialized(true);
    localStorage.setItem('lumina_initialized', 'true');
  };

  const handleLogout = () => {
    clearUserSession();
    setCurrentUser(null);
    setIsAuthenticated(false);

    setShowShortcutsModal(false);
    setShowVideosModal(false);
    setShowOfferModal(false);
  };

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setCurrentSessionUser(user);
    setIsAuthenticated(true);
  };

  if (!isInitialized) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  const activeSession = cashSessions.find((s) => s.statut === 'active') || null;

  const handleOpenSession = (soldeOuverture: number) => {
    const newSession: CashSession = {
      id: `SESS-${Math.floor(1000 + Math.random() * 9000)}`,
      employeNom: users[0]?.nomComplet || 'coco ben',
      ouvertA: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      soldeOuverture,
      statut: 'active',
    };
    setCashSessions((prev) => [newSession, ...prev]);

    if (soldeOuverture > 0) {
      setCashMovements((prev) => [
        {
          id: `mvt-${Date.now()}`,
          type: 'depot',
          description: "Fond de caisse d'ouverture",
          montant: soldeOuverture,
          categorie: 'Fond de Caisse',
          utilisateur: newSession.employeNom,
          session: newSession.id,
          date: newSession.ouvertA,
        },
        ...prev,
      ]);
    }
  };

  const handleCloseSession = (sessionId: string, soldeCloture: number, note?: string) => {
    const sessionMovements = cashMovements.filter((m) => m.session === sessionId);
    const totalEncaissements = sessionMovements
      .filter((m) => m.type === 'depot' || m.type === 'vente')
      .reduce((sum, m) => sum + m.montant, 0);
    const totalDecaissements = sessionMovements
      .filter((m) => m.type === 'retrait' || m.type === 'depense_caisse')
      .reduce((sum, m) => sum + m.montant, 0);

    const targetSession = cashSessions.find((s) => s.id === sessionId);
    const soldePrevu = (targetSession?.soldeOuverture || 0) + totalEncaissements - totalDecaissements;
    const difference = soldeCloture - soldePrevu;

    setCashSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              fermeA: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              soldeCloture,
              soldePrevu,
              difference,
              statut: 'fermee',
              note,
              encaissements: totalEncaissements,
              decaissements: totalDecaissements,
            }
          : s
      )
    );
  };

  const handleAddCashMovement = (movement: Omit<CashMovement, 'id'>) => {
    const newMvt: CashMovement = {
      id: `mvt-${Date.now()}`,
      ...movement,
    };
    setCashMovements((prev) => [newMvt, ...prev]);
  };

  const handleAddPack = (pack: Pack) => {
    setPacks((prev) => [pack, ...prev]);
  };

  const handleUpdatePack = (updated: Pack) => {
    setPacks((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePack = (id: string) => {
    setPacks((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddPromotion = (promo: Promotion) => {
    setPromotions((prev) => [promo, ...prev]);
  };

  const handleUpdatePromotion = (updated: Promotion) => {
    setPromotions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePromotion = (id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddPurchaseInvoice = (invoice: PurchaseInvoice) => {
    setPurchaseInvoices((prev) => [invoice, ...prev]);

    // Update product stock and prices automatically
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const item = invoice.items.find((i) => i.productId === p.id);
        if (item) {
          return {
            ...p,
            quantite: p.quantite + item.quantite,
            prixAchat: item.prixAchatUnitaire > 0 ? item.prixAchatUnitaire : p.prixAchat,
            prixVente: item.prixVenteSuggere > 0 ? item.prixVenteSuggere : p.prixVente,
          };
        }
        return p;
      })
    );

    // Update supplier debt if any
    if (invoice.fournisseurId) {
      setSuppliers((prevSuppliers) =>
        prevSuppliers.map((s) => {
          if (s.id === invoice.fournisseurId) {
            return {
              ...s,
              detteTotale: s.detteTotale + invoice.detteRestante,
              facturesOuvertes: invoice.detteRestante > 0 ? s.facturesOuvertes + 1 : s.facturesOuvertes,
            };
          }
          return s;
        })
      );
    }
  };

  // User handlers
  const handleAddUser = (newUser: AppUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateUser = (updatedUser: AppUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Proforma handlers
  const handleAddProforma = (newProforma: ProformaInvoice) => {
    setProformas((prev) => [newProforma, ...prev]);
  };

  const handleUpdateProformaStatus = (id: string, newStatus: 'en_attente' | 'convertie' | 'annulee') => {
    setProformas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, statut: newStatus } : p))
    );
  };

  const handleDeleteProforma = (id: string) => {
    setProformas((prev) => prev.filter((p) => p.id !== id));
  };

  const handleConvertProformaToSale = (proforma: ProformaInvoice) => {
    const newSale: Sale = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      clientNom: proforma.clientNom,
      items: proforma.items,
      total: proforma.totalTTC,
      methodePaiement: 'especes',
      statut: 'paye',
      montantPaye: proforma.totalTTC,
      reste: 0,
    };

    setSales((prev) => [newSale, ...prev]);

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = proforma.items.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, quantite: Math.max(0, p.quantite - item.quantite) };
        }
        return p;
      })
    );

    // Record cash deposit
    setCashMovements((prev) => [
      {
        id: Date.now().toString(),
        type: 'depot',
        description: `Règlement Facture Pro-forma ${proforma.id} - ${proforma.clientNom}`,
        montant: proforma.totalTTC,
        date: newSale.date,
        utilisateur: 'coco ben',
        session: 'Session #1',
        categorie: 'Vente',
      },
      ...prev,
    ]);
  };

  // Order handlers
  const handleAddOrder = (newOrder: BonCommande) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (id: string, newStatus: 'en_attente' | 'livree' | 'annulee') => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, statut: newStatus } : o))
    );
  };

  const handleDeleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const handleConvertToSale = (order: BonCommande) => {
    const newSale: Sale = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      clientNom: order.clientNom,
      items: order.items,
      total: order.total,
      methodePaiement: 'especes',
      statut: order.reste === 0 ? 'paye' : 'partiel',
      montantPaye: order.total,
      reste: 0,
    };

    setSales((prev) => [newSale, ...prev]);

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = order.items.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, quantite: Math.max(0, p.quantite - item.quantite) };
        }
        return p;
      })
    );

    // Record remaining payment in cash
    if (order.reste > 0) {
      setCashMovements((prev) => [
        {
          id: Date.now().toString(),
          type: 'depot',
          description: `Règlement solde Bon de Commande ${order.id} - ${order.clientNom}`,
          montant: order.reste,
          date: newSale.date,
          utilisateur: 'coco ben',
          session: 'Session #1',
          categorie: 'Vente',
        },
        ...prev,
      ]);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleUpdateSettings = (newSet: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSet }));
  };

  const handleAddCategory = (catName: string) => {
    const trimmed = catName.trim();
    if (trimmed) {
      setCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    }
  };

  const handleAddProduct = (prod: Product | Omit<Product, 'id'>) => {
    const newP: Product = 'id' in prod ? prod : { ...prod, id: Date.now().toString() };
    setProducts((prev) => [newP, ...prev]);

    if (newP.categorie && newP.categorie.trim()) {
      handleAddCategory(newP.categorie);
    }
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (updated.categorie && updated.categorie.trim()) {
      handleAddCategory(updated.categorie);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCompleteSale = (saleData: Omit<Sale, 'id'>) => {
    const newSale: Sale = { ...saleData, id: Math.floor(1000 + Math.random() * 9000).toString() };
    setSales((prev) => [newSale, ...prev]);

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const soldItem = saleData.items.find((item) => item.productId === p.id);
        if (soldItem) {
          return { ...p, quantite: Math.max(0, p.quantite - soldItem.quantite) };
        }
        return p;
      })
    );

    // Record cash movement
    if (saleData.montantPaye > 0) {
      setCashMovements((prev) => [
        {
          id: Date.now().toString(),
          type: 'depot',
          description: `Vente Ticket #${newSale.id} - ${newSale.clientNom}`,
          montant: saleData.montantPaye,
          date: newSale.date,
          utilisateur: 'coco ben',
          session: 'Session #1',
          categorie: 'Vente',
        },
        ...prev,
      ]);
    }
  };

  const handleAddExpense = (expData: Omit<Expense, 'id'>) => {
    const newExp: Expense = { ...expData, id: Date.now().toString() };
    setExpenses((prev) => [newExp, ...prev]);

    setCashMovements((prev) => [
      {
        id: Date.now().toString(),
        type: 'depense_caisse',
        description: expData.description,
        montant: expData.montant,
        date: expData.date,
        utilisateur: expData.creePar,
        session: 'Session #1',
        categorie: expData.categorie,
      },
      ...prev,
    ]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddCustomer = (c: Customer) => {
    setCustomers((prev) => [c, ...prev]);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddSupplier = (s: Supplier) => {
    setSuppliers((prev) => [s, ...prev]);
  };

  const handleUpdateSupplier = (updated: Supplier) => {
    setSuppliers((prev) => prev.map((sp) => (sp.id === updated.id ? updated : sp)));
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((sp) => sp.id !== id));
  };

  const handlePaySupplierDebt = (supplierId: string, amount: number) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const newDebt = Math.max(0, s.detteTotale - amount);
          return {
            ...s,
            detteTotale: newDebt,
            facturesOuvertes: newDebt === 0 ? 0 : s.facturesOuvertes,
          };
        }
        return s;
      })
    );

    setCashMovements((prev) => [
      {
        id: Date.now().toString(),
        type: 'retrait',
        description: `Règlement dette fournisseur - ${supplier?.nom || ''}`,
        montant: amount,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        utilisateur: 'coco ben',
        session: 'Session #1',
        categorie: 'Paiement Fournisseur',
      },
      ...prev,
    ]);
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <LanguageProvider language={settings.langue} onLanguageChange={(lang) => handleUpdateSettings({ langue: lang })}>
        <LoginScreen users={users} onLoginSuccess={handleLoginSuccess} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider language={settings.langue} onLanguageChange={(lang) => handleUpdateSettings({ langue: lang })}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-blue-500 selection:text-white">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onLogout={handleLogout}
          currentLanguage={settings.langue}
        />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          theme={theme}
          currentUser={currentUser}
          currentLanguage={settings.langue}
          onLanguageChange={(lang) => handleUpdateSettings({ langue: lang })}
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
          onOpenShortcuts={() => setShowShortcutsModal(true)}
          onOpenVideos={() => setShowVideosModal(true)}
          onOpenOffer={() => setShowOfferModal(true)}
          onOpenActivation={handleOpenActivationPage}
        />

        {/* Dynamic View Route */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {currentView === 'parametres' && (
            <ParametresView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              initialTab={parametresTab}
            />
          )}

          {currentView === 'statistiques' && (
            <StatistiquesView
              sales={sales}
              products={products}
              expenses={expenses}
              categories={categories}
              cashMovements={cashMovements}
              customers={customers}
              suppliers={suppliers}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {(currentView === 'pos' || currentView === 'point-de-vente') && (
            <PointDeVenteView
              products={products}
              customers={customers}
              categories={categories}
              activeSession={activeSession}
              sales={sales}
              onOpenSessionRequested={() => setCurrentView('caisse')}
              onCompleteSale={handleCompleteSale}
              onAddProduct={handleAddProduct}
              onGoToJournalVentes={() => setCurrentView('journal-ventes')}
            />
          )}

          {currentView === 'caisse' && (
            <CaisseView
              sessions={cashSessions}
              activeSession={activeSession}
              cashMovements={cashMovements}
              users={users}
              onOpenSession={handleOpenSession}
              onCloseSession={handleCloseSession}
              onAddCashMovement={handleAddCashMovement}
            />
          )}

          {currentView === 'stock' && (
            <StockView
              products={products}
              categories={categories}
              suppliers={suppliers}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {(currentView === 'journal-ventes' || currentView === 'ventes') && (
            <JournalVentesView sales={sales} />
          )}

          {currentView === 'clients' && (
            <ClientsView
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {currentView === 'fournisseurs' && (
            <FournisseursView
              suppliers={suppliers}
              onAddSupplier={handleAddSupplier}
              onUpdateSupplier={handleUpdateSupplier}
              onDeleteSupplier={handleDeleteSupplier}
              onPaySupplierDebt={handlePaySupplierDebt}
            />
          )}

          {currentView === 'tiers' && (
            <TiersView
              initialTab="fournisseurs"
              customers={customers}
              suppliers={suppliers}
              onAddCustomer={handleAddCustomer}
              onAddSupplier={(s) =>
                handleAddSupplier({
                  id: Date.now().toString(),
                  detteTotale: 0,
                  facturesOuvertes: 0,
                  ...s,
                })
              }
              onDeleteCustomer={handleDeleteCustomer}
              onDeleteSupplier={handleDeleteSupplier}
            />
          )}

          {(currentView === 'bons-commande' || currentView === 'commandes') && (
            <BonsCommandeView
              orders={orders}
              products={products}
              customers={customers}
              onAddOrder={handleAddOrder}
              onUpdateStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              onConvertToSale={handleConvertToSale}
            />
          )}

          {(currentView === 'proformas' || currentView === 'pro-formas') && (
            <ProformasView
              proformas={proformas}
              products={products}
              customers={customers}
              onAddProforma={handleAddProforma}
              onUpdateStatus={handleUpdateProformaStatus}
              onDeleteProforma={handleDeleteProforma}
              onConvertToSale={handleConvertProformaToSale}
            />
          )}

          {currentView === 'utilisateurs' && (
            <UtilisateursView
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {currentView === 'achats' && (
            <AchatsView
              invoices={purchaseInvoices}
              suppliers={suppliers}
              products={products}
              categories={categories}
              onAddInvoice={handleAddPurchaseInvoice}
              onAddProduct={handleAddProduct}
            />
          )}

          {currentView === 'promotions' && (
            <PromotionsView
              promotions={promotions}
              products={products}
              onAddPromotion={handleAddPromotion}
              onUpdatePromotion={handleUpdatePromotion}
              onDeletePromotion={handleDeletePromotion}
            />
          )}

          {currentView === 'packs' && (
            <PacksView
              packs={packs}
              products={products}
              onAddPack={handleAddPack}
              onUpdatePack={handleUpdatePack}
              onDeletePack={handleDeletePack}
            />
          )}
        </main>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}

      {/* Video Guides Modal */}
      {showVideosModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Tutoriels & Guides Vidéo</h3>
              </div>
              <button onClick={() => setShowVideosModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">1. Prise en main de la Caisse POS</h5>
                  <p className="text-[11px] text-slate-400">Durée: 3 min 20s</p>
                </div>
                <button className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold">Regarder</button>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">2. Configuration des Imprimantes & Tickets</h5>
                  <p className="text-[11px] text-slate-400">Durée: 2 min 10s</p>
                </div>
                <button className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold">Regarder</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Special Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-blue-800 via-blue-900 to-slate-950 text-white rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl border border-blue-500/30 relative">
            <button
              onClick={() => setShowOfferModal(false)}
              className="absolute right-5 top-5 text-blue-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-blue-200 rounded-full text-xs font-bold border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                OFFRE D'ACTIVATION -40%
              </span>
              <h3 className="text-2xl font-black">Passez à la version complète</h3>
              <p className="text-blue-200 text-xs leading-relaxed">
                Profitez de la promotion de lancement à 6 000 DA / an avec toutes les fonctionnalités et mises à jour incluses.
              </p>
            </div>

            <div className="p-4 bg-blue-950/80 rounded-2xl border border-blue-500/30 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-blue-300 uppercase">Tarif Spécial Annuel</span>
                <div className="text-2xl font-black">6 000 DA / an</div>
              </div>
              <span className="text-xs line-through text-blue-400 font-bold">10 000 DA</span>
            </div>

            <button
              onClick={() => {
                setShowOfferModal(false);
                handleOpenActivationPage();
              }}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 transition-all"
            >
              Activer Ma Licence Maintenant
            </button>
          </div>
        </div>
      )}
      </div>
    </LanguageProvider>
  );
}

export default App;
