export interface Role {
  id: string;
  name: string;
  pin?: string;
  homePage?: string;
  permissions: {
    [key: string]: 'editor' | 'readonly' | 'none';
  };
}

export interface SectionBackgroundStyle {
  type: 'color' | 'image';
  color: string;
  image: string | null;
}

export interface SectionStyle {
  background: SectionBackgroundStyle;
  fontFamily: string;
  fontSize: string;
  textColor: string;
}

export const INSTAGRAM_REVIEW_IDS = [
  'review1',
  'review2',
  'review3',
  'review4',
  'review5',
  'review6',
  'review7',
  'review8',
  'review9',
];

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Category {
  id: string;
  nom_categorie: string;
  description?: string;
  image_url?: string;
  active: boolean;
  order?: number;
}

export interface Ingredient {
  id: string;
  nom_ingredient: string;
  stock_actuel: number;
  stock_minimum: number;
  unite_mesure: string;
  prix_unitaire: number;
  fournisseur?: string;
  date_derniere_commande?: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeItem {
  ingredient_id: string;
  quantite: number;
}

export interface Product {
  id: string;
  nom_produit: string;
  description?: string;
  prix_vente: number;
  prix_achat: number;
  image_url?: string;
  categoria_id: string;
  estado: 'disponible' | 'agotado' | 'descontinuado';
  recipe: RecipeItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  produitRef: string;
  nom_produit: string;
  prix_unitaire: number;
  quantite: number;
  excluded_ingredients?: string[];
  commentaire?: string;
  estado: 'en_attente' | 'en_cours' | 'listo' | 'entregado';
  promotionApplied?: boolean;
  originalPrice?: number;
}

export interface Order {
  id: string;
  table_id: string;
  table_nom?: string;
  items: OrderItem[];
  total: number;
  estado: 'abierta' | 'cerrada' | 'cancelada';
  estado_cocina: 'no_enviado' | 'en_cocina' | 'listo' | 'entregado';
  payment_method?: 'efectivo' | 'transferencia' | 'tarjeta';
  payment_receipt_url?: string;
  created_at: string;
  updated_at: string;
  promotions?: any; // Référence aux promotions appliquées
}

export interface Table {
  id: string;
  nombre: string;
  capacidad: number;
  estado: 'libre' | 'ocupada' | 'reservada' | 'mantenimiento';
  posicion_x: number;
  posicion_y: number;
  created_at: string;
  updated_at: string;
}

export interface OrderSummary {
  id: string;
  table_id: string;
  table_nom?: string;
  total: number;
  estado: Order['estado'];
  estado_cocina: Order['estado_cocina'];
  created_at: string;
  updated_at: string;
  items_count: number;
}

export interface SoldProductsByCategory {
  categoryId: string;
  categoryName: string;
  products: {
    productId: string;
    productName: string;
    quantity: number;
    totalSales: number;
  }[];
  totalQuantity: number;
  totalSales: number;
}

export interface DailySalesReport {
  date: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  paymentMethods: {
    method: string;
    count: number;
    total: number;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    totalSales: number;
  }[];
  salesByHour: {
    hour: number;
    sales: number;
    orders: number;
  }[];
}

export interface DailyReport {
    generatedAt: string;
    startDate: string;
    clientsDuJour: number;
    panierMoyen: number;
    ventesDuJour: number;
    soldProducts: SoldProductsByCategory[];
    lowStockIngredients: Ingredient[];
    roleLogins: RoleLogin[];
    roleLoginsUnavailable?: boolean;
}

export interface Sale {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitCost: number;
  totalCost: number;
  profit: number;
  paymentMethod?: Order['payment_method'];
  saleDate: number; // timestamp
}

export interface RoleLogin {
  roleId: string;
  roleName: string;
  loginAt: string;
}

// Types pour le système de promotions
export interface PromotionType {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  startDate: Date | string;
  endDate?: Date | string | null;
  conditions: any[];
  config: any;
  priority: number;
  stackable: boolean;
  usageLimit?: number | null;
  usageCount: number;
}

export interface AppliedPromoCode {
  code: string;
  promotionId: string;
  valid: boolean;
  message?: string;
}

export interface AppliedPromotion {
  promotionId: string;
  promotionName: string;
  type: string;
  discountAmount: number;
  items?: string[]; // IDs des articles concernés
}

export interface OrderPromotions {
  appliedPromotions: AppliedPromotion[];
  appliedPromoCodes: AppliedPromoCode[];
  totalDiscount: number;
}
