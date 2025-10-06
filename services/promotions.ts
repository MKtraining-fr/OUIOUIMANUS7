import { 
  Promotion, 
  PromotionType, 
  PromotionCondition, 
  PromotionConfig,
  AppliedPromotion,
  AppliedPromoCode,
  OrderPromotions
} from '../types/promotions';
import { Order, OrderItem, Product, Category } from '../types';
import { api } from './api';

type SupabasePromotionRow = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  start_date: string;
  end_date: string | null;
  conditions: PromotionCondition[];
  config: PromotionConfig;
  priority: number;
  stackable: boolean;
  usage_limit: number | null;
  usage_count: number;
};

/**
 * Récupère toutes les promotions
 */
export const fetchAllPromotions = async (): Promise<Promotion[]> => {
  try {
    // Simulation d'appel API - à remplacer par un vrai appel à Supabase
    const response = await fetch('/api/promotions');
    const data = await response.json();
    return data.map(mapSupabaseRowToPromotion);
  } catch (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    return [];
  }
};

/**
 * Récupère les promotions actives
 */
export const fetchActivePromotions = async (): Promise<Promotion[]> => {
  try {
    // Simulation d'appel API - à remplacer par un vrai appel à Supabase
    const response = await fetch('/api/promotions/active');
    const data = await response.json();
    return data.map(mapSupabaseRowToPromotion);
  } catch (error) {
    console.error('Erreur lors de la récupération des promotions actives:', error);
    return [];
  }
};

/**
 * Crée une nouvelle promotion
 */
export const createPromotion = async (promotion: Omit<Promotion, 'id'>): Promise<Promotion> => {
  try {
    // Simulation d'appel API - à remplacer par un vrai appel à Supabase
    const response = await fetch('/api/promotions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promotion),
    });
    const data = await response.json();
    return mapSupabaseRowToPromotion(data);
  } catch (error) {
    console.error('Erreur lors de la création de la promotion:', error);
    throw error;
  }
};

/**
 * Met à jour une promotion existante
 */
export const updatePromotion = async (id: string, promotion: Partial<Promotion>): Promise<Promotion> => {
  try {
    // Simulation d'appel API - à remplacer par un vrai appel à Supabase
    const response = await fetch(`/api/promotions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promotion),
    });
    const data = await response.json();
    return mapSupabaseRowToPromotion(data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la promotion:', error);
    throw error;
  }
};

/**
 * Supprime une promotion
 */
export const deletePromotion = async (id: string): Promise<void> => {
  try {
    // Simulation d'appel API - à remplacer par un vrai appel à Supabase
    await fetch(`/api/promotions/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la promotion:', error);
    throw error;
  }
};

/**
 * Valide un code promo
 */
export const validatePromoCode = async (code: string): Promise<{ valid: boolean; message?: string; promotion?: Promotion }> => {
  try {
    // Simulation d'appel API - à remplacer par un vrai appel à Supabase
    const response = await fetch(`/api/promotions/validate-code?code=${encodeURIComponent(code)}`);
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la validation du code promo:', error);
    return { valid: false, message: 'Erreur lors de la validation du code' };
  }
};

/**
 * Calcule les promotions applicables à une commande
 */
export const calculateOrderPromotions = async (order: Order, appliedPromoCodes: AppliedPromoCode[] = []): Promise<OrderPromotions> => {
  // Pour l'instant, nous simulons le calcul des promotions
  // Dans une implémentation réelle, cela ferait un appel à l'API
  
  // Exemple de promotion 2x1 sur les burgers
  const burgerItems = order.items.filter(item => 
    item.nom_produit.toLowerCase().includes('burger') || 
    item.nom_produit.toLowerCase().includes('hamburger')
  );
  
  let appliedPromotions: AppliedPromotion[] = [];
  let totalDiscount = 0;
  
  // Si nous avons au moins 2 burgers, appliquer une promotion 2x1
  if (burgerItems.length >= 2) {
    // Trouver le burger le moins cher pour l'offrir
    const sortedBurgers = [...burgerItems].sort((a, b) => a.prix_unitaire - b.prix_unitaire);
    const cheapestBurger = sortedBurgers[0];
    
    // Calculer combien de burgers gratuits (1 gratuit pour chaque paire)
    const freeBurgersCount = Math.floor(burgerItems.length / 2);
    const discount = cheapestBurger.prix_unitaire * freeBurgersCount;
    
    appliedPromotions.push({
      promotionId: 'promo-2x1-burgers',
      promotionName: '2x1 sur les burgers',
      type: 'buy_x_get_y',
      discountAmount: discount,
      items: burgerItems.map(item => item.id)
    });
    
    totalDiscount += discount;
  }
  
  // Appliquer les codes promo
  for (const promoCode of appliedPromoCodes) {
    if (promoCode.valid) {
      // Simuler une remise de 10% pour chaque code promo valide
      const discount = Math.round(order.total * 0.1);
      
      appliedPromotions.push({
        promotionId: promoCode.promotionId,
        promotionName: `Code promo: ${promoCode.code}`,
        type: 'code_promo',
        discountAmount: discount
      });
      
      totalDiscount += discount;
    }
  }
  
  return {
    appliedPromotions,
    appliedPromoCodes,
    totalDiscount
  };
};

/**
 * Convertit une ligne de la base de données en objet Promotion
 */
const mapSupabaseRowToPromotion = (row: SupabasePromotionRow): Promotion => {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    active: row.active,
    startDate: row.start_date,
    endDate: row.end_date,
    conditions: row.conditions,
    config: row.config,
    priority: row.priority,
    stackable: row.stackable,
    usageLimit: row.usage_limit,
    usageCount: row.usage_count
  };
};
