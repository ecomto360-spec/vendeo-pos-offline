import { Product, Sale, Expense, CashMovement, Customer, Supplier, AppSettings, BonCommande, ProformaInvoice, AppUser, PurchaseInvoice, Promotion, Pack, CashSession } from './types';

export const initialPurchaseInvoices: PurchaseInvoice[] = [];

export const initialUsers: AppUser[] = [
  {
    id: 'u1',
    nomComplet: 'coco ben',
    nomUtilisateur: 'COCO',
    role: 'admin',
    statut: 'actif',
    dateCreation: '2026-01-15',
  },
  {
    id: 'u2',
    nomComplet: 'Amina Khelifi',
    nomUtilisateur: 'AMINA',
    role: 'caissier',
    statut: 'actif',
    dateCreation: '2026-03-10',
  },
  {
    id: 'u3',
    nomComplet: 'Karim Benali',
    nomUtilisateur: 'KARIM',
    role: 'vendeur',
    statut: 'actif',
    dateCreation: '2026-05-20',
  },
];

export const initialProformas: ProformaInvoice[] = [
  {
    id: 'PRO-2026-001',
    date: '2026-08-08 09:30',
    dateValidite: '2026-09-08',
    clientNom: 'SARL Maghreb Commerce',
    clientTelephone: '021 65 43 21',
    clientNIF: '001916001234567',
    clientNIS: '1992160000123',
    clientAdresse: 'Zone Industrielle, Oued Smar, Alger',
    items: [
      { productId: 'p6', nom: 'Huile de Tournesol 5L', prixUnitaire: 1350, quantite: 10, total: 13500 },
      { productId: 'p1', nom: "Jus d'Orange 1L", prixUnitaire: 160, quantite: 50, total: 8000 },
    ],
    totalHT: 21500,
    tvaRate: 19,
    tvaMontant: 4085,
    totalTTC: 25585,
    statut: 'en_attente',
    remarques: 'Offre valable 30 jours à compter de la date d’émission',
  },
  {
    id: 'PRO-2026-002',
    date: '2026-08-05 15:45',
    dateValidite: '2026-08-25',
    clientNom: 'EURL Techno Distribution',
    clientTelephone: '0550 99 88 77',
    clientNIF: '001516009876543',
    items: [
      { productId: 'p2', nom: 'Lait Entier 1L', prixUnitaire: 110, quantite: 100, total: 11000 },
      { productId: 'p5', nom: 'Fromage Fondu 16p', prixUnitaire: 290, quantite: 30, total: 8700 },
    ],
    totalHT: 19700,
    tvaRate: 19,
    tvaMontant: 3743,
    totalTTC: 23443,
    statut: 'convertie',
    remarques: 'Pro-forma convertie en vente réelle le 10/08/2026',
  },
];

export const initialBonsCommande: BonCommande[] = [
  {
    id: 'BC-2026-001',
    date: '2026-08-09 10:30',
    dateLivraisonPrevue: '2026-08-15',
    clientNom: 'Karim Saidi',
    clientTelephone: '0555 12 34 56',
    items: [
      { productId: 'p6', nom: 'Huile de Tournesol 5L', prixUnitaire: 1350, quantite: 3, total: 4050 },
      { productId: 'p1', nom: "Jus d'Orange 1L", prixUnitaire: 160, quantite: 5, total: 800 },
    ],
    total: 4850,
    acompte: 2000,
    reste: 2850,
    statut: 'en_attente',
    remarques: 'Livraison à domicile demandée',
  },
  {
    id: 'BC-2026-002',
    date: '2026-08-07 14:15',
    dateLivraisonPrevue: '2026-08-10',
    clientNom: 'Ahmed Benali',
    clientTelephone: '0661 98 76 54',
    items: [
      { productId: 'p2', nom: 'Lait Entier 1L', prixUnitaire: 110, quantite: 20, total: 2200 },
      { productId: 'p5', nom: 'Fromage Fondu 16p', prixUnitaire: 290, quantite: 10, total: 2900 },
    ],
    total: 5100,
    acompte: 5100,
    reste: 0,
    statut: 'livree',
    remarques: 'Commande payée intégralement à la réservation',
  },
  {
    id: 'BC-2026-003',
    date: '2026-08-08 11:00',
    dateLivraisonPrevue: '2026-08-18',
    clientNom: 'Yacine Amrani',
    clientTelephone: '0770 45 67 89',
    items: [
      { productId: 'p3', nom: 'Chocolat Noir 100g', prixUnitaire: 280, quantite: 10, total: 2800 },
    ],
    total: 2800,
    acompte: 1000,
    reste: 1800,
    statut: 'en_attente',
    remarques: 'Réservation pour événement',
  },
];

export const initialProducts: Product[] = [
  {
    id: 'p-proj',
    codeBarre: '613000000010',
    nom: 'Table avec projecteur ...',
    categorie: 'Jeux & Jouets',
    prixAchat: 160,
    prixVente: 220,
    quantite: 8,
    minStock: 2,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-proj-1',
        nomLot: 'BATCH-2026-PROJ',
        quantite: 8,
        prixAchat: 160,
        prixVente: 220,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-cam',
    codeBarre: '613000000011',
    nom: 'Mini caméra HD pour e...',
    categorie: 'Jeux & Jouets',
    prixAchat: 210,
    prixVente: 300,
    quantite: 8,
    minStock: 2,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-cam-1',
        nomLot: 'BATCH-2026-CAM',
        quantite: 8,
        prixAchat: 210,
        prixVente: 300,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-alfa',
    codeBarre: '613000000012',
    nom: 'Robotics - Alfabot',
    categorie: 'Jeux & Jouets',
    prixAchat: 160,
    prixVente: 225,
    quantite: 5,
    minStock: 5,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-alfa-1',
        nomLot: 'BATCH-2026-ALFA',
        quantite: 5,
        prixAchat: 160,
        prixVente: 225,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-alfa3',
    codeBarre: '613000000013',
    nom: 'Robotics - Alfabot 3 e...',
    categorie: 'Jeux & Jouets',
    prixAchat: 170,
    prixVente: 242,
    quantite: 10,
    minStock: 2,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-alfa3-1',
        nomLot: 'BATCH-2026-ALFA3',
        quantite: 10,
        prixAchat: 170,
        prixVente: 242,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-sci',
    codeBarre: '613000000014',
    nom: 'Kit de Ciências 100 Ex...',
    categorie: 'Jeux & Jouets',
    prixAchat: 165,
    prixVente: 240,
    quantite: 9,
    minStock: 2,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-sci-1',
        nomLot: 'BATCH-2026-SCI',
        quantite: 9,
        prixAchat: 165,
        prixVente: 240,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-choc',
    codeBarre: '613000000015',
    nom: 'Fábrica de Chocolates',
    categorie: 'Jeux & Jouets',
    prixAchat: 120,
    prixVente: 180,
    quantite: 6,
    minStock: 2,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-choc-1',
        nomLot: 'BATCH-2026-CHOC',
        quantite: 6,
        prixAchat: 120,
        prixVente: 180,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-perf',
    codeBarre: '613000000016',
    nom: 'Parfums Super Lab',
    categorie: 'Jeux & Jouets',
    prixAchat: 155,
    prixVente: 225,
    quantite: 7,
    minStock: 2,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-perf-1',
        nomLot: 'BATCH-2026-PERF',
        quantite: 7,
        prixAchat: 155,
        prixVente: 225,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-sol',
    codeBarre: '613000000017',
    nom: 'Système Solaire 3D',
    categorie: 'Jeux & Jouets',
    prixAchat: 180,
    prixVente: 260,
    quantite: 8,
    minStock: 2,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-sol-1',
        nomLot: 'BATCH-2026-SOL',
        quantite: 8,
        prixAchat: 180,
        prixVente: 260,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-corv',
    codeBarre: '613000000018',
    nom: 'Chevrolet Corvette ZR1',
    categorie: 'Modélisme',
    prixAchat: 160,
    prixVente: 225,
    quantite: 10,
    minStock: 2,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-corv-1',
        nomLot: 'BATCH-2026-CORV',
        quantite: 10,
        prixAchat: 160,
        prixVente: 225,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-dod',
    codeBarre: '613000000019',
    nom: 'Dodge Charger',
    categorie: 'Modélisme',
    prixAchat: 160,
    prixVente: 225,
    quantite: 8,
    minStock: 2,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-dod-1',
        nomLot: 'BATCH-2026-DOD',
        quantite: 8,
        prixAchat: 160,
        prixVente: 225,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-dod2',
    codeBarre: '613000000020',
    nom: 'Dodge Sports Car',
    categorie: 'Modélisme',
    prixAchat: 160,
    prixVente: 225,
    quantite: 6,
    minStock: 2,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-dod2-1',
        nomLot: 'BATCH-2026-DOD2',
        quantite: 6,
        prixAchat: 160,
        prixVente: 225,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-audi',
    codeBarre: '613000000021',
    nom: 'Audi Q4 e-tron',
    categorie: 'Modélisme',
    prixAchat: 160,
    prixVente: 225,
    quantite: 5,
    minStock: 2,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-audi-1',
        nomLot: 'BATCH-2026-AUDI',
        quantite: 5,
        prixAchat: 160,
        prixVente: 225,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-puzc',
    codeBarre: '613000000022',
    nom: 'Puzzle Collection',
    categorie: 'Jeux & Jouets',
    prixAchat: 120,
    prixVente: 180,
    quantite: 10,
    minStock: 2,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1588693951525-6b66e3c1044a?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-puzc-1',
        nomLot: 'BATCH-2026-PUZC',
        quantite: 10,
        prixAchat: 120,
        prixVente: 180,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-puze',
    codeBarre: '613000000023',
    nom: 'puzzle enfant',
    categorie: 'Jeux & Jouets',
    prixAchat: 100,
    prixVente: 150,
    quantite: 15,
    minStock: 2,
    uniteMesure: 'À Vendre',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    lots: [
      {
        id: 'lot-puze-1',
        nomLot: 'BATCH-2026-PUZE',
        quantite: 15,
        prixAchat: 100,
        prixVente: 150,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p-puzd',
    codeBarre: '613000000024',
    nom: 'puzzle disney',
    categorie: 'Jeux & Jouets',
    prixAchat: 105,
    prixVente: 150,
    quantite: 30,
    minStock: 2,
    uniteMesure: 'Pièce',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    variantes: [
      {
        id: 'v-disney-1',
        nom: 'Format 1000 pcs',
        codeBarre: '613000000024-1',
        quantite: 30,
        prixAchat: 105,
        prixVente: 150,
        actif: true
      }
    ],
    lots: [
      {
        id: 'lot-puzd-1',
        nomLot: 'BATCH-2026-PUZD',
        quantite: 30,
        prixAchat: 105,
        prixVente: 150,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p0',
    codeBarre: '613000000000',
    nom: 'puzzle tom et jerry',
    categorie: 'Jeux & Jouets',
    prixAchat: 95,
    prixVente: 130,
    quantite: 20,
    minStock: 5,
    uniteMesure: 'Pièce',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-12-31',
    variantes: [
      {
        id: 'v-tj-1',
        nom: 'Format 500 pcs',
        codeBarre: '613000000000-1',
        quantite: 20,
        prixAchat: 95,
        prixVente: 130,
        actif: true
      }
    ],
    lots: [
      {
        id: 'lot-puzzle-1',
        nomLot: 'BATCH-2026-TJ',
        quantite: 20,
        prixAchat: 95,
        prixVente: 130,
        prixVenteGros: 115,
        datePeremption: '2028-12-31',
        isDefault: true,
      }
    ]
  },
  {
    id: 'p1',
    codeBarre: '613000000001',
    nom: 'Jus d\'Orange 1L',
    categorie: 'Boissons',
    prixAchat: 120,
    prixVente: 160,
    quantite: 45,
    minStock: 10,
    uniteMesure: 'Pièce',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2026-11-15',
    lots: [
      {
        id: 'lot-p1-1',
        nomLot: 'BATCH-2026-JUS',
        quantite: 45,
        prixAchat: 120,
        prixVente: 160,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p2',
    codeBarre: '613000000002',
    nom: 'Lait Entier 1L',
    categorie: 'Produits Laitiers',
    prixAchat: 90,
    prixVente: 110,
    quantite: 8,
    minStock: 15,
    uniteMesure: 'Pièce',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2026-08-25',
    lots: [
      {
        id: 'lot-p2-1',
        nomLot: 'BATCH-2026-LAIT',
        quantite: 8,
        prixAchat: 90,
        prixVente: 110,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p3',
    codeBarre: '613000000003',
    nom: 'Chocolat Noir 100g',
    categorie: 'Épicerie',
    prixAchat: 200,
    prixVente: 280,
    quantite: 30,
    minStock: 5,
    uniteMesure: 'Pièce',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2027-01-10',
    lots: [
      {
        id: 'lot-p3-1',
        nomLot: 'BATCH-2026-CHOC',
        quantite: 30,
        prixAchat: 200,
        prixVente: 280,
        isDefault: true,
      }
    ]
  },
  {
    id: 'p4',
    codeBarre: '613000000004',
    nom: 'Eau Minérale 1.5L',
    categorie: 'Boissons',
    prixAchat: 35,
    prixVente: 50,
    quantite: 120,
    minStock: 20,
    uniteMesure: 'Pièce',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2027-06-30',
  },
  {
    id: 'p5',
    codeBarre: '613000000005',
    nom: 'Fromage Fondu 16p',
    categorie: 'Produits Laitiers',
    prixAchat: 220,
    prixVente: 290,
    quantite: 4,
    minStock: 8,
    uniteMesure: 'Pièce',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2026-09-05',
  },
  {
    id: 'p6',
    codeBarre: '613000000006',
    nom: 'Huile de Tournesol 5L',
    categorie: 'Épicerie',
    prixAchat: 1100,
    prixVente: 1350,
    quantite: 18,
    minStock: 5,
    uniteMesure: 'Pièce',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    datePeremption: '2028-03-20',
  },
];

export const initialSales: Sale[] = [
  {
    id: 'V-1001',
    date: '2026-08-10 10:15',
    clientNom: 'Ahmed Benali',
    items: [
      { productId: 'p1', nom: 'Jus d\'Orange 1L', prixUnitaire: 160, quantite: 2, total: 320 },
      { productId: 'p3', nom: 'Chocolat Noir 100g', prixUnitaire: 280, quantite: 1, total: 280 },
    ],
    total: 600,
    methodePaiement: 'especes',
    statut: 'paye',
    montantPaye: 600,
    reste: 0,
  },
  {
    id: 'V-1002',
    date: '2026-08-10 11:30',
    clientNom: 'Karim Saidi',
    items: [
      { productId: 'p6', nom: 'Huile de Tournesol 5L', prixUnitaire: 1350, quantite: 1, total: 1350 },
      { productId: 'p2', nom: 'Lait Entier 1L', prixUnitaire: 110, quantite: 2, total: 220 },
    ],
    total: 1570,
    methodePaiement: 'credit',
    statut: 'non_paye',
    montantPaye: 0,
    reste: 1570,
  },
  {
    id: 'V-1003',
    date: '2026-08-09 16:45',
    clientNom: 'Client Passager',
    items: [
      { productId: 'p4', nom: 'Eau Minérale 1.5L', prixUnitaire: 50, quantite: 6, total: 300 },
      { productId: 'p2', nom: 'Lait Entier 1L', prixUnitaire: 110, quantite: 3, total: 330 },
    ],
    total: 630,
    methodePaiement: 'especes',
    statut: 'paye',
    montantPaye: 630,
    reste: 0,
  },
  {
    id: 'V-1004',
    date: '2026-08-08 14:20',
    clientNom: 'Yacine Amrani',
    items: [
      { productId: 'p5', nom: 'Fromage Fondu 16p', prixUnitaire: 290, quantite: 4, total: 1160 },
      { productId: 'p1', nom: 'Jus d\'Orange 1L', prixUnitaire: 160, quantite: 3, total: 480 },
    ],
    total: 1640,
    methodePaiement: 'especes',
    statut: 'paye',
    montantPaye: 1640,
    reste: 0,
  },
  {
    id: 'V-1005',
    date: '2026-08-05 09:10',
    clientNom: 'Ahmed Benali',
    items: [
      { productId: 'p6', nom: 'Huile de Tournesol 5L', prixUnitaire: 1350, quantite: 2, total: 2700 },
      { productId: 'p3', nom: 'Chocolat Noir 100g', prixUnitaire: 280, quantite: 5, total: 1400 },
    ],
    total: 4100,
    methodePaiement: 'especes',
    statut: 'paye',
    montantPaye: 4100,
    reste: 0,
  },
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    categorie: 'Loyer',
    description: 'Loyer mensuel du magasin',
    montant: 35000,
    date: '2026-08-01',
    creePar: 'coco ben',
  },
  {
    id: 'exp-2',
    categorie: 'Électricité',
    description: 'Facture Sonelgaz Électricité',
    montant: 4200,
    date: '2026-08-05',
    creePar: 'coco ben',
  },
  {
    id: 'exp-3',
    categorie: 'Transport',
    description: 'Frais de livraison marchandises',
    montant: 1500,
    date: '2026-08-08',
    creePar: 'coco ben',
  },
];

export const initialCashMovements: CashMovement[] = [
  {
    id: 'mvt-1',
    type: 'depot',
    description: 'Fond de caisse initial du matin',
    montant: 10000,
    categorie: 'Fond de Caisse',
    utilisateur: 'coco ben',
    session: 'SESS-8901',
    date: '10/08/2026 à 08:00',
  },
  {
    id: 'mvt-2',
    type: 'depense_caisse',
    description: 'Achat petites fournitures de bureau',
    montant: 800,
    categorie: 'Entretien',
    utilisateur: 'coco ben',
    session: 'SESS-8901',
    date: '10/08/2026 à 09:30',
  },
];

export const initialCashSessions: CashSession[] = [
  {
    id: 'SESS-8901',
    employeNom: 'coco ben',
    ouvertA: '10/08/2026 à 08:00',
    fermeA: '10/08/2026 à 17:00',
    soldeOuverture: 10000,
    soldeCloture: 15200,
    soldePrevu: 15200,
    difference: 0,
    statut: 'fermee',
    note: 'Caisse équilibrée en fin de journée.',
    encaissements: 6000,
    decaissements: 800,
  },
];

export const initialCustomers: Customer[] = [
  {
    id: 'c1',
    nom: 'Karim Saidi',
    telephone: '0550 12 34 56',
    adresse: 'Alger Centre',
    nif: '099812345678901',
    rc: '16/00-12345B20',
    ai: '16010293847',
    nis: '000116010098765',
    detteInitiale: 2000,
    plafondCredit: 50000,
    detteTotale: 4500,
    facturesOuvertes: 2,
  },
  {
    id: 'c2',
    nom: 'Ahmed Benali',
    telephone: '0661 98 76 54',
    adresse: 'Kouba, Alger',
    detteInitiale: 0,
    plafondCredit: 20000,
    detteTotale: 0,
    facturesOuvertes: 0,
  },
  {
    id: 'c3',
    nom: 'Yacine Amrani',
    telephone: '0770 45 67 89',
    adresse: 'Bab Ezzouar',
    nif: '099765432109876',
    detteInitiale: 5000,
    plafondCredit: 100000,
    detteTotale: 12000,
    facturesOuvertes: 3,
  },
];

export const initialSuppliers: Supplier[] = [
  {
    id: 's1',
    nom: 'Grossiste Laitier Sarl',
    telephone: '021 65 43 21',
    entreprise: 'Sarl Lacto-Algérie',
    detteTotale: 25000,
    facturesOuvertes: 1,
    dateEcheance: '2026-08-28',
  },
  {
    id: 's2',
    nom: 'Distributeur Boissons Nord',
    telephone: '023 88 99 00',
    entreprise: 'EURL Boissons & Co',
    detteTotale: 18500,
    facturesOuvertes: 2,
    dateEcheance: '2026-09-02',
  },
];

export const defaultCategories: string[] = [];

export const initialPromotions: Promotion[] = [
  {
    id: 'promo_1',
    productId: 'p1',
    productNom: 'Eau Minérale Lalla Khedidja 1.5L',
    productCodeBarre: '613000111222',
    typeRemise: 'pourcentage',
    valeurRemise: 20,
    dateDebut: '2026-08-01 08:00',
    dateFin: '2026-08-31 23:59',
    limiteQuantite: 100,
    statut: 'active',
  },
  {
    id: 'promo_2',
    productId: 'p2',
    productNom: 'Lait Candia Silia 1L',
    productCodeBarre: '613000222333',
    typeRemise: 'montant_fixe',
    valeurRemise: 15,
    dateDebut: '2026-08-05 08:00',
    dateFin: '',
    limiteQuantite: 50,
    statut: 'active',
  },
];

export const initialPacks: Pack[] = [
  {
    id: 'pack_1',
    nom: 'Pack Petit Déjeuner Familial',
    codeBarre: '613900000101',
    prixVente: 450,
    prixAchat: 370,
    description: 'Comprend 1x Jus d\'Orange Rouiba 1L et 2x Lait Candia Silia 1L',
    produits: [
      { productId: 'p2', productNom: 'Lait Candia Silia 1L', productPrixVente: 120, productPrixAchat: 95, quantite: 2 },
      { productId: 'p3', productNom: 'Jus d\'Orange Rouiba 1L', productPrixVente: 250, productPrixAchat: 180, quantite: 1 },
    ],
    statut: 'actif',
  },
  {
    id: 'pack_2',
    nom: 'Pack Hydratation Été (6x Eau 1.5L)',
    codeBarre: '613900000102',
    prixVente: 220,
    prixAchat: 180,
    description: 'Pack promo de 6 bouteilles d\'eau minérale 1.5L',
    produits: [
      { productId: 'p1', productNom: 'Eau Minérale Lalla Khedidja 1.5L', productPrixVente: 40, productPrixAchat: 30, quantite: 6 },
    ],
    statut: 'actif',
  },
];

export const initialSettings: AppSettings = {
  langue: 'fr',
  nomMagasin: 'لومينا ديجيتال سيرفيس',
  descriptionMagasin: '',
  adresseMagasin: 'Exemple : Rue Didouche Mourad, Alger',
  telephoneMagasin: '05XX XX XX',
  telephoneFixe: '021 XX XX XX',
  emailMagasin: 'contact@example.com',
  rc: '',
  nif: '',
  ai: '',
  nis: '',
  tvaGlobal: 0,
  modelFacture: 'design1',
  modelTicket: 'standard',
  langueImpression: 'fr',
  categoriesDepenses: ['أخرى', 'صيانة', 'نقل', 'رواتب', 'ماء', 'كهرباء', 'إيجار'],
  modeReseau: 'unique',
  ventesEssaiRestantes: 100,
  estActive: false,
  venteRapide: true,
  modeComptabiliteFinanciere: false,
  autoriserStockNegatif: false,
  demanderConfirmationVenteSansStock: true,
  tarificationPrixMoyen: false,
  activerDroitDeTimbre: false,
  modelTicketDesign: 'design1',
  langueImpressionRecu: 'fr',
  afficherCodeBarreRecu: true,
  impressionSilencieuse: true,
  imprimanteParDefaut: 'default',
  imprimanteTicket: 'default',
  imprimanteCodeBarre: 'default',
  activerTiroirCaisse: false,
  etiquetteLargeur: 50,
  etiquetteHauteur: 30,
  etiquetteHauteurCodeBarres: 10,
  etiquetteAutoHauteur: true,
  etiquetteChamps: {
    nomMagasin: false,
    nomProduit: true,
    prix: false,
    typePrix: false,
    codeBarre: true,
    variantes: false,
    remise: false,
  },
  activerBalanceElectronique: false,
};
