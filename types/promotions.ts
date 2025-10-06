// Types pour le système de gestion des promotions

/**
 * Types de promotions supportés par le système
 */
export type PromotionType = 
  | 'buy_x_get_y'       // Achetez X, obtenez Y gratuit (ex: 2x1, 3x2)
  | 'percentage'        // Remise en pourcentage (ex: 20% de réduction)
  | 'fixed_amount'      // Remise d'un montant fixe (ex: 5000 COP de réduction)
  | 'free_item'         // Article gratuit sous condition (ex: dessert gratuit)
  | 'code_promo';       // Code promotionnel à usage unique ou limité

/**
 * Conditions d'application des promotions
 */
export type PromotionConditionType =
  | 'min_order_amount'  // Montant minimum de commande
  | 'min_items'         // Nombre minimum d'articles
  | 'specific_products' // Produits spécifiques
  | 'specific_category' // Catégorie spécifique
  | 'specific_day'      // Jour spécifique de la semaine
  | 'specific_time';    // Plage horaire spécifique

/**
 * Condition d'application d'une promotion
 */
export interface PromotionCondition {
  type: PromotionConditionType;
  value: string | number | string[]; // Valeur de la condition (montant, nombre, IDs, etc.)
}

/**
 * Configuration spécifique pour les promotions de type buy_x_get_y
 */
export interface BuyXGetYConfig {
  buyQuantity: number;   // Quantité à acheter
  getQuantity: number;   // Quantité offerte
  targetProducts?: string[]; // IDs des produits concernés (si différent des produits de la condition)
}

/**
 * Configuration spécifique pour les promotions de type percentage
 */
export interface PercentageConfig {
  percentage: number;    // Pourcentage de réduction
  maxDiscount?: number;  // Montant maximum de la réduction (optionnel)
}

/**
 * Configuration spécifique pour les promotions de type fixed_amount
 */
export interface FixedAmountConfig {
  amount: number;        // Montant fixe de la réduction
}

/**
 * Configuration spécifique pour les promotions de type free_item
 */
export interface FreeItemConfig {
  itemId: string;        // ID du produit offert
  quantity: number;      // Quantité offerte
}

/**
 * Configuration spécifique pour les promotions de type code_promo
 */
export interface CodePromoConfig {
  code: string;          // Code à saisir
  usageLimit?: number;   // Limite d'utilisation (optionnel)
  usageCount: number;    // Nombre d'utilisations actuel
  perCustomer?: boolean; // Limite par client (optionnel)
}

/**
 * Configuration d'une promotion selon son type
 */
export type PromotionConfig = 
  | { type: 'buy_x_get_y', config: BuyXGetYConfig }
  | { type: 'percentage', config: PercentageConfig }
  | { type: 'fixed_amount', config: FixedAmountConfig }
  | { type: 'free_item', config: FreeItemConfig }
  | { type: 'code_promo', config: CodePromoConfig };

/**
 * Modèle principal d'une promotion
 */
export interface Promotion {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  startDate: number;     // Timestamp
  endDate?: number;      // Timestamp (optionnel pour les promotions permanentes)
  conditions: PromotionCondition[];
  config: PromotionConfig;
  priority: number;      // Priorité d'application (les promotions à priorité plus élevée sont appliquées en premier)
  stackable: boolean;    // Si la promotion peut être cumulée avec d'autres
  usageLimit?: number;   // Limite d'utilisation globale (optionnel)
  usageCount: number;    // Nombre d'utilisations actuel
}

/**
 * Résultat de l'application d'une promotion à une commande
 */
export interface AppliedPromotion {
  promotionId: string;
  promotionName: string;
  discountAmount: number;
  affectedItems: string[]; // IDs des articles concernés
  type: PromotionType;
}

/**
 * État d'un code promo appliqué à une commande
 */
export interface AppliedPromoCode {
  code: string;
  promotionId: string;
  valid: boolean;
  errorMessage?: string;
}

/**
 * Modèle pour stocker les promotions appliquées à une commande
 */
export interface OrderPromotions {
  appliedPromotions: AppliedPromotion[];
  appliedPromoCodes: AppliedPromoCode[];
  totalDiscount: number;
}
