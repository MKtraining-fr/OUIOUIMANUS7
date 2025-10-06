// Types pour le système de promotions

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
 * Configuration spécifique au type de promotion
 */
export interface PromotionConfig {
  type: PromotionType;
  config: {
    // Configuration pour buy_x_get_y
    buyQuantity?: number;
    getQuantity?: number;
    targetProducts?: string[];
    
    // Configuration pour percentage
    percentage?: number;
    maxDiscount?: number;
    
    // Configuration pour fixed_amount
    amount?: number;
    
    // Configuration pour free_item
    itemId?: string;
    quantity?: number;
    
    // Configuration pour code_promo
    code?: string;
    usageLimit?: number;
    usageCount?: number;
    perCustomer?: boolean;
  };
}

/**
 * Modèle principal d'une promotion
 */
export interface Promotion {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  startDate: Date | string;
  endDate?: Date | string | null;
  conditions: PromotionCondition[];
  config: PromotionConfig;
  priority: number;
  stackable: boolean;
  usageLimit?: number | null;
  usageCount: number;
}

/**
 * Code promo appliqué à une commande
 */
export interface AppliedPromoCode {
  code: string;
  promotionId: string;
  valid: boolean;
  message?: string;
}

/**
 * Promotion appliquée à une commande
 */
export interface AppliedPromotion {
  promotionId: string;
  promotionName: string;
  type: string;
  discountAmount: number;
  items?: string[]; // IDs des articles concernés
}

/**
 * Promotions appliquées à une commande
 */
export interface OrderPromotions {
  appliedPromotions: AppliedPromotion[];
  appliedPromoCodes: AppliedPromoCode[];
  totalDiscount: number;
}
