import { supabase } from './supabaseClient';
import { 
  Promotion, 
  PromotionType, 
  PromotionCondition, 
  PromotionConfig,
  AppliedPromotion,
  AppliedPromoCode,
  OrderPromotions,
  Order,
  OrderItem,
  Product,
  Category
} from '../types';

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
 * Convertit une ligne de promotion Supabase en objet Promotion
 */
const mapPromotionRow = (row: SupabasePromotionRow): Promotion => ({
  id: row.id,
  name: row.name,
  description: row.description ?? undefined,
  active: row.active,
  startDate: new Date(row.start_date).getTime(),
  endDate: row.end_date ? new Date(row.end_date).getTime() : undefined,
  conditions: row.conditions,
  config: row.config,
  priority: row.priority,
  stackable: row.stackable,
  usageLimit: row.usage_limit ?? undefined,
  usageCount: row.usage_count
});

/**
 * Récupère toutes les promotions actives
 */
export const fetchActivePromotions = async (): Promise<Promotion[]> => {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('active', true)
    .lte('start_date', now)
    .or(`end_date.gt.${now},end_date.is.null`);
  
  if (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    return [];
  }
  
  return (data as SupabasePromotionRow[]).map(mapPromotionRow);
};

/**
 * Récupère toutes les promotions (actives et inactives)
 */
export const fetchAllPromotions = async (): Promise<Promotion[]> => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('priority', { ascending: false });
  
  if (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    return [];
  }
  
  return (data as SupabasePromotionRow[]).map(mapPromotionRow);
};

/**
 * Récupère une promotion par son ID
 */
export const fetchPromotionById = async (id: string): Promise<Promotion | null> => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Erreur lors de la récupération de la promotion ${id}:`, error);
    return null;
  }
  
  return mapPromotionRow(data as SupabasePromotionRow);
};

/**
 * Crée une nouvelle promotion
 */
export const createPromotion = async (promotion: Omit<Promotion, 'id'>): Promise<Promotion | null> => {
  const { data, error } = await supabase
    .from('promotions')
    .insert({
      name: promotion.name,
      description: promotion.description || null,
      active: promotion.active,
      start_date: new Date(promotion.startDate).toISOString(),
      end_date: promotion.endDate ? new Date(promotion.endDate).toISOString() : null,
      conditions: promotion.conditions,
      config: promotion.config,
      priority: promotion.priority,
      stackable: promotion.stackable,
      usage_limit: promotion.usageLimit || null,
      usage_count: promotion.usageCount
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors de la création de la promotion:', error);
    return null;
  }
  
  return mapPromotionRow(data as SupabasePromotionRow);
};

/**
 * Met à jour une promotion existante
 */
export const updatePromotion = async (id: string, updates: Partial<Promotion>): Promise<Promotion | null> => {
  const updateData: Partial<SupabasePromotionRow> = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description || null;
  if (updates.active !== undefined) updateData.active = updates.active;
  if (updates.startDate !== undefined) updateData.start_date = new Date(updates.startDate).toISOString();
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate ? new Date(updates.endDate).toISOString() : null;
  if (updates.conditions !== undefined) updateData.conditions = updates.conditions;
  if (updates.config !== undefined) updateData.config = updates.config;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.stackable !== undefined) updateData.stackable = updates.stackable;
  if (updates.usageLimit !== undefined) updateData.usage_limit = updates.usageLimit || null;
  if (updates.usageCount !== undefined) updateData.usage_count = updates.usageCount;
  
  const { data, error } = await supabase
    .from('promotions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Erreur lors de la mise à jour de la promotion ${id}:`, error);
    return null;
  }
  
  return mapPromotionRow(data as SupabasePromotionRow);
};

/**
 * Supprime une promotion
 */
export const deletePromotion = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('promotions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Erreur lors de la suppression de la promotion ${id}:`, error);
    return false;
  }
  
  return true;
};

/**
 * Incrémente le compteur d'utilisation d'une promotion
 */
export const incrementPromotionUsage = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('promotions')
    .update({ usage_count: supabase.rpc('increment', { row_id: id, increment_amount: 1 }) })
    .eq('id', id);
  
  if (error) {
    console.error(`Erreur lors de l'incrémentation du compteur d'utilisation de la promotion ${id}:`, error);
    return false;
  }
  
  return true;
};

/**
 * Vérifie si un code promo est valide
 */
export const validatePromoCode = async (code: string): Promise<{ valid: boolean; promotion: Promotion | null; message?: string }> => {
  // Récupérer toutes les promotions de type code_promo
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('active', true)
    .eq('config->>type', 'code_promo');
  
  if (error) {
    console.error('Erreur lors de la validation du code promo:', error);
    return { valid: false, promotion: null, message: 'Erreur serveur' };
  }
  
  const promotions = (data as SupabasePromotionRow[]).map(mapPromotionRow);
  
  // Trouver la promotion correspondant au code
  const matchingPromotion = promotions.find(p => 
    p.config.type === 'code_promo' && 
    p.config.config.code.toLowerCase() === code.toLowerCase()
  );
  
  if (!matchingPromotion) {
    return { valid: false, promotion: null, message: 'Code promo invalide' };
  }
  
  // Vérifier si le code n'a pas dépassé sa limite d'utilisation
  if (matchingPromotion.config.type === 'code_promo' && 
      matchingPromotion.config.config.usageLimit && 
      matchingPromotion.config.config.usageCount >= matchingPromotion.config.config.usageLimit) {
    return { valid: false, promotion: matchingPromotion, message: 'Ce code a atteint sa limite d\'utilisation' };
  }
  
  // Vérifier si la promotion est dans sa période de validité
  const now = Date.now();
  if (matchingPromotion.startDate > now || (matchingPromotion.endDate && matchingPromotion.endDate < now)) {
    return { valid: false, promotion: matchingPromotion, message: 'Ce code n\'est pas valide à cette date' };
  }
  
  return { valid: true, promotion: matchingPromotion };
};

/**
 * Vérifie si une condition de promotion est satisfaite
 */
const isConditionMet = (
  condition: PromotionCondition, 
  order: Order, 
  products: Product[], 
  categories: Category[]
): boolean => {
  switch (condition.type) {
    case 'min_order_amount':
      return order.total >= (condition.value as number);
      
    case 'min_items':
      const totalItems = order.items.reduce((sum, item) => sum + item.quantite, 0);
      return totalItems >= (condition.value as number);
      
    case 'specific_products':
      const productIds = condition.value as string[];
      return order.items.some(item => productIds.includes(item.produitRef));
      
    case 'specific_category':
      const categoryIds = condition.value as string[];
      const productsByCategory = products.filter(p => categoryIds.includes(p.categoria_id));
      const productIdsByCategory = productsByCategory.map(p => p.id);
      return order.items.some(item => productIdsByCategory.includes(item.produitRef));
      
    case 'specific_day':
      const days = condition.value as string[];
      const currentDay = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
      return days.includes(currentDay);
      
    case 'specific_time':
      const [start, end] = (condition.value as string).split('-');
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;
      
      const [startHour, startMinute] = start.split(':').map(Number);
      const [endHour, endMinute] = end.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      return currentTime >= startTime && currentTime <= endTime;
      
    default:
      return false;
  }
};

/**
 * Vérifie si toutes les conditions d'une promotion sont satisfaites
 */
const areAllConditionsMet = (
  promotion: Promotion, 
  order: Order, 
  products: Product[], 
  categories: Category[]
): boolean => {
  return promotion.conditions.every(condition => 
    isConditionMet(condition, order, products, categories)
  );
};

/**
 * Applique une promotion de type buy_x_get_y à une commande
 */
const applyBuyXGetYPromotion = (
  promotion: Promotion, 
  order: Order, 
  products: Product[]
): AppliedPromotion | null => {
  if (promotion.config.type !== 'buy_x_get_y') return null;
  
  const { buyQuantity, getQuantity, targetProducts } = promotion.config.config;
  
  // Si des produits spécifiques sont ciblés, filtrer les articles de la commande
  let eligibleItems = order.items;
  if (targetProducts && targetProducts.length > 0) {
    eligibleItems = order.items.filter(item => targetProducts.includes(item.produitRef));
  }
  
  // Regrouper les articles par produit
  const productGroups: Record<string, OrderItem[]> = {};
  eligibleItems.forEach(item => {
    if (!productGroups[item.produitRef]) {
      productGroups[item.produitRef] = [];
    }
    productGroups[item.produitRef].push(item);
  });
  
  let totalDiscount = 0;
  const affectedItems: string[] = [];
  
  // Pour chaque groupe de produits
  Object.values(productGroups).forEach(items => {
    if (items.length === 0) return;
    
    // Calculer la quantité totale
    const totalQuantity = items.reduce((sum, item) => sum + item.quantite, 0);
    
    // Calculer combien de fois la promotion peut être appliquée
    const promotionApplications = Math.floor(totalQuantity / (buyQuantity + getQuantity));
    
    if (promotionApplications > 0) {
      // Calculer le nombre d'articles gratuits
      const freeItems = promotionApplications * getQuantity;
      
      // Calculer la remise
      const itemPrice = items[0].prix_unitaire;
      const discount = freeItems * itemPrice;
      
      totalDiscount += discount;
      items.forEach(item => affectedItems.push(item.id));
    }
  });
  
  if (totalDiscount > 0) {
    return {
      promotionId: promotion.id,
      promotionName: promotion.name,
      discountAmount: totalDiscount,
      affectedItems,
      type: 'buy_x_get_y'
    };
  }
  
  return null;
};

/**
 * Applique une promotion de type percentage à une commande
 */
const applyPercentagePromotion = (
  promotion: Promotion, 
  order: Order
): AppliedPromotion | null => {
  if (promotion.config.type !== 'percentage') return null;
  
  const { percentage, maxDiscount } = promotion.config.config;
  
  // Calculer la remise
  let discount = order.total * (percentage / 100);
  
  // Appliquer le plafond si défini
  if (maxDiscount && discount > maxDiscount) {
    discount = maxDiscount;
  }
  
  if (discount > 0) {
    return {
      promotionId: promotion.id,
      promotionName: promotion.name,
      discountAmount: Math.round(discount),
      affectedItems: order.items.map(item => item.id),
      type: 'percentage'
    };
  }
  
  return null;
};

/**
 * Applique une promotion de type fixed_amount à une commande
 */
const applyFixedAmountPromotion = (
  promotion: Promotion, 
  order: Order
): AppliedPromotion | null => {
  if (promotion.config.type !== 'fixed_amount') return null;
  
  const { amount } = promotion.config.config;
  
  // La remise ne peut pas dépasser le total de la commande
  const discount = Math.min(amount, order.total);
  
  if (discount > 0) {
    return {
      promotionId: promotion.id,
      promotionName: promotion.name,
      discountAmount: discount,
      affectedItems: order.items.map(item => item.id),
      type: 'fixed_amount'
    };
  }
  
  return null;
};

/**
 * Applique une promotion de type free_item à une commande
 */
const applyFreeItemPromotion = (
  promotion: Promotion, 
  order: Order,
  products: Product[]
): AppliedPromotion | null => {
  if (promotion.config.type !== 'free_item') return null;
  
  const { itemId, quantity } = promotion.config.config;
  
  // Trouver le produit gratuit
  const freeProduct = products.find(p => p.id === itemId);
  if (!freeProduct) return null;
  
  const discount = freeProduct.prix_vente * quantity;
  
  return {
    promotionId: promotion.id,
    promotionName: promotion.name,
    discountAmount: discount,
    affectedItems: [],
    type: 'free_item'
  };
};

/**
 * Applique une promotion de type code_promo à une commande
 */
const applyCodePromoPromotion = (
  promotion: Promotion, 
  order: Order
): AppliedPromotion | null => {
  if (promotion.config.type !== 'code_promo') return null;
  
  // Le traitement dépend de la configuration spécifique du code promo
  // Par défaut, on applique une remise de 10%
  const discount = Math.round(order.total * 0.1);
  
  return {
    promotionId: promotion.id,
    promotionName: promotion.name,
    discountAmount: discount,
    affectedItems: order.items.map(item => item.id),
    type: 'code_promo'
  };
};

/**
 * Applique une promotion à une commande
 */
const applyPromotion = (
  promotion: Promotion, 
  order: Order,
  products: Product[]
): AppliedPromotion | null => {
  switch (promotion.config.type) {
    case 'buy_x_get_y':
      return applyBuyXGetYPromotion(promotion, order, products);
    case 'percentage':
      return applyPercentagePromotion(promotion, order);
    case 'fixed_amount':
      return applyFixedAmountPromotion(promotion, order);
    case 'free_item':
      return applyFreeItemPromotion(promotion, order, products);
    case 'code_promo':
      return applyCodePromoPromotion(promotion, order);
    default:
      return null;
  }
};

/**
 * Calcule les promotions applicables à une commande
 */
export const calculateOrderPromotions = async (
  order: Order,
  appliedPromoCodes: AppliedPromoCode[] = []
): Promise<OrderPromotions> => {
  // Récupérer les données nécessaires
  const [activePromotions, products, categories] = await Promise.all([
    fetchActivePromotions(),
    fetchProducts(),
    fetchCategories()
  ]);
  
  const result: OrderPromotions = {
    appliedPromotions: [],
    appliedPromoCodes,
    totalDiscount: 0
  };
  
  // Trier les promotions par priorité (décroissante)
  const sortedPromotions = [...activePromotions].sort((a, b) => b.priority - a.priority);
  
  // Appliquer les promotions automatiques
  const appliedPromotionIds = new Set<string>();
  
  for (const promotion of sortedPromotions) {
    // Ignorer les promotions de type code_promo (elles sont appliquées séparément)
    if (promotion.config.type === 'code_promo') continue;
    
    // Vérifier si la promotion peut être cumulée avec d'autres
    if (!promotion.stackable && result.appliedPromotions.length > 0) continue;
    
    // Vérifier si les conditions sont remplies
    if (!areAllConditionsMet(promotion, order, products, categories)) continue;
    
    // Appliquer la promotion
    const appliedPromotion = applyPromotion(promotion, order, products);
    if (appliedPromotion) {
      result.appliedPromotions.push(appliedPromotion);
      result.totalDiscount += appliedPromotion.discountAmount;
      appliedPromotionIds.add(promotion.id);
    }
  }
  
  // Appliquer les codes promo
  for (const promoCode of appliedPromoCodes) {
    if (!promoCode.valid) continue;
    
    const promotion = await fetchPromotionById(promoCode.promotionId);
    if (!promotion) continue;
    
    // Vérifier si la promotion peut être cumulée avec d'autres
    if (!promotion.stackable && result.appliedPromotions.length > 0) continue;
    
    // Vérifier si les conditions sont remplies
    if (!areAllConditionsMet(promotion, order, products, categories)) continue;
    
    // Appliquer la promotion
    const appliedPromotion = applyPromotion(promotion, order, products);
    if (appliedPromotion) {
      result.appliedPromotions.push(appliedPromotion);
      result.totalDiscount += appliedPromotion.discountAmount;
      appliedPromotionIds.add(promotion.id);
      
      // Incrémenter le compteur d'utilisation
      await incrementPromotionUsage(promotion.id);
    }
  }
  
  return result;
};

/**
 * Récupère les produits (fonction temporaire, à remplacer par l'import de la fonction existante)
 */
const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return [];
  }
  
  return data as unknown as Product[];
};

/**
 * Récupère les catégories (fonction temporaire, à remplacer par l'import de la fonction existante)
 */
const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  
  if (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return [];
  }
  
  return data as unknown as Category[];
};
