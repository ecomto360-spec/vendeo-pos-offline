export type NavigationPage = 
  | 'journal-ventes'
  | 'caisse'
  | 'stock'
  | 'packs'
  | 'promotions'
  | 'fournisseurs'
  | 'achats'
  | 'clients'
  | 'utilisateurs'
  | 'pro-formas'
  | 'bons-commande'
  | 'statistiques'
  | 'parametres';

export type ParametresTab = 
  | 'compte'
  | 'generaux'
  | 'factures'
  | 'reseau'
  | 'import-export'
  | 'activation'
  | 'super-admin'
  | 'mobile'
  | 'mises-a-jour';

export type StatistiquesTab = 
  | 'resume'
  | 'avancees'
  | 'dettes-soldes'
  | 'analyses-stock'
  | 'depenses'
  | 'mouvements-caisse'
  | 'graphiques'
  | 'zakat';

export interface ProductPriceExtra {
  label: string;
  prix: number;
}

export interface ProductVariant {
  id: string;
  nom: string; // e.g., "Rouge - M"
  codeBarre: string;
  quantite: number;
  prixAchat: number;
  prixVente: number;
  prixVenteGros?: number;
  datePeremption?: string;
  actif: boolean;
}

export interface ProductOptionGroup {
  id: string;
  nom: string; // e.g., "Taille", "Couleur"
  options: string[]; // e.g., ["S", "M", "L"]
}

export interface Product {
  id: string;
  codeBarre: string;
  codesBarresSupp?: string[];
  nom: string;
  categorie: string;
  famille?: string;
  fournisseurNom?: string;
  prixAchat: number;
  prixVente: number;
  prixVenteGros?: number;
  quantite: number;
  minStock: number;
  datePeremption?: string;
  emplacement?: string;
  description?: string;
  image?: string;
  
  // Nouveaux champs (Propriétés & tarifs)
  uniteMesure?: string;
  poidsVolume?: string;
  couleur?: string;
  uniteGros?: string;
  quantiteBaseGros?: number;
  prixSupplementaires?: ProductPriceExtra[];

  // Variantes
  activerVariantes?: boolean;
  groupesOptions?: ProductOptionGroup[];
  variantes?: ProductVariant[];
}

export interface SaleItem {
  productId: string;
  nom: string;
  prixUnitaire: number;
  quantite: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  clientNom: string;
  items: SaleItem[];
  total: number;
  methodePaiement: 'especes' | 'carte' | 'credit';
  statut: 'paye' | 'partiel' | 'non_paye' | 'annule';
  montantPaye: number;
  reste: number;
}

export interface Expense {
  id: string;
  categorie: string;
  description: string;
  montant: number;
  date: string;
  creePar?: string;
}

export interface CashMovement {
  id: string;
  type: 'depot' | 'retrait' | 'depense_caisse' | 'vente';
  description: string;
  montant: number;
  categorie: string;
  utilisateur: string;
  session: string;
  date: string;
}

export interface CashSession {
  id: string;
  employeId?: string;
  employeNom: string;
  ouvertA: string;
  fermeA?: string;
  soldeOuverture: number;
  soldeCloture?: number;
  soldePrevu?: number;
  difference?: number;
  statut: 'active' | 'fermee';
  note?: string;
  encaissements?: number;
  decaissements?: number;
}

export interface BonCommandeItem {
  productId: string;
  nom: string;
  prixUnitaire: number;
  quantite: number;
  total: number;
}

export interface BonCommande {
  id: string;
  date: string;
  dateLivraisonPrevue: string;
  clientNom: string;
  clientTelephone?: string;
  items: BonCommandeItem[];
  total: number;
  acompte: number;
  reste: number;
  statut: 'en_attente' | 'livree' | 'annulee';
  remarques?: string;
}

export interface ProformaItem {
  productId: string;
  nom: string;
  prixUnitaire: number;
  quantite: number;
  total: number;
}

export interface ProformaInvoice {
  id: string;
  date: string;
  dateValidite: string;
  clientNom: string;
  clientTelephone?: string;
  clientNIF?: string;
  clientNIS?: string;
  clientAdresse?: string;
  items: ProformaItem[];
  totalHT: number;
  tvaRate: number;
  tvaMontant: number;
  totalTTC: number;
  statut: 'en_attente' | 'convertie' | 'annulee';
  remarques?: string;
}

export type UserRole = 'admin' | 'vendeur' | 'caissier' | 'comptable' | 'assistant';

export interface AppUser {
  id: string;
  nomComplet: string;
  nomUtilisateur: string;
  motDePasse?: string;
  role: UserRole;
  statut: 'actif' | 'desactive';
  dateCreation?: string;
}

export interface Customer {
  id: string;
  nom: string;
  telephone: string;
  adresse?: string;
  email?: string;
  nif?: string;
  rc?: string;
  ai?: string;
  nis?: string;
  detteInitiale?: number;
  plafondCredit?: number;
  detteTotale: number;
  facturesOuvertes: number;
}

export interface PurchaseInvoiceItem {
  productId: string;
  codeBarre?: string;
  nom: string;
  quantite: number;
  prixAchatUnitaire: number;
  margePourcent: number;
  prixVenteSuggere: number;
  prixGros?: number;
  sousTotal: number;
}

export interface PurchaseInvoice {
  id: string;
  numeroFacture: string;
  fournisseurId: string;
  fournisseurNom: string;
  dateReception: string;
  items: PurchaseInvoiceItem[];
  taxeTva: number;
  transportExtras: number;
  montantPaye: number;
  dateEcheanceDette?: string;
  montantTotal: number;
  detteRestante: number;
  statut: 'paye' | 'partiel' | 'non_paye';
}

export interface Supplier {
  id: string;
  nom: string;
  telephone: string;
  adresse?: string;
  email?: string;
  entreprise?: string;
  rc?: string;
  nif?: string;
  ai?: string;
  nis?: string;
  detteInitiale?: number;
  detteTotale: number;
  facturesOuvertes: number;
  dateEcheance?: string;
}

export interface PackItem {
  productId: string;
  productNom: string;
  productPrixVente: number;
  productPrixAchat?: number;
  quantite: number;
}

export interface Pack {
  id: string;
  nom: string;
  codeBarre?: string;
  prixVente: number;
  prixAchat?: number;
  description?: string;
  produits: PackItem[];
  statut: 'actif' | 'inactif';
}

export interface Promotion {
  id: string;
  productId: string;
  productNom: string;
  productCodeBarre?: string;
  typeRemise: 'pourcentage' | 'montant_fixe';
  valeurRemise: number;
  dateDebut: string;
  dateFin?: string;
  limiteQuantite?: number;
  statut: 'active' | 'inactive' | 'expiree';
}

export type Language = 'fr' | 'ar' | 'en';

export interface AppSettings {
  langue: Language;
  nomMagasin: string;
  descriptionMagasin?: string;
  adresseMagasin: string;
  telephoneMagasin: string;
  telephoneFixe?: string;
  emailMagasin?: string;
  rc?: string;
  nif?: string;
  ai?: string;
  nis?: string;
  tvaGlobal?: number;
  logoUrl?: string;
  modelFacture: 'design1' | 'design2' | 'design3';
  modelTicket: 'standard' | 'compact' | 'large';
  langueImpression: 'fr' | 'ar' | 'en';
  categoriesDepenses: string[];
  modeReseau: 'unique' | 'lan' | 'cloud' | 'combine';
  ventesEssaiRestantes: number;
  estActive: boolean;
  // POS Settings
  venteRapide?: boolean;
  modeComptabiliteFinanciere?: boolean;
  autoriserStockNegatif?: boolean;
  demanderConfirmationVenteSansStock?: boolean;
  tarificationPrixMoyen?: boolean;
  activerDroitDeTimbre?: boolean;
  // Invoice & Receipt Settings
  modelTicketDesign?: 'design1' | 'design2' | 'design3' | 'design4';
  langueImpressionRecu?: 'fr' | 'ar' | 'en';
  afficherCodeBarreRecu?: boolean;
  impressionSilencieuse?: boolean;
  imprimanteParDefaut?: string;
  imprimanteTicket?: string;
  imprimanteCodeBarre?: string;
  activerTiroirCaisse?: boolean;
  etiquetteLargeur?: number;
  etiquetteHauteur?: number;
  etiquetteHauteurCodeBarres?: number;
  etiquetteAutoHauteur?: boolean;
  etiquetteChamps?: {
    nomMagasin?: boolean;
    nomProduit?: boolean;
    prix?: boolean;
    typePrix?: boolean;
    codeBarre?: boolean;
    variantes?: boolean;
    remise?: boolean;
  };
  activerBalanceElectronique?: boolean;
}
