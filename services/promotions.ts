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
import { api } from './api';

/**
 * Valide un code promotionnel et retourne les détails de la promotion si valide
 * @param code Le code promotionnel à valider
 * @returns Les détails de la promotion si le code est valide, null sinon
 */
export const validatePromoCode = async (code: string): Promise<AppliedPromoCode | null> => {
  try {
    // Dans une implémentation réelle, cette fonction ferait un appel API
    // pour valider le code promo côté serveur
    
    // Simulation d'une validation de code promo
    if (code.toLowerCase() === 'welcome10') {
      return {
        code: 'WELCOME10',
        discount: 10, // 10% de réduction
        type: 'percentage',
        name: 'Bienvenue',
        description: '10% de réduction sur votre première commande'
      };
    }
    
    if (code.toLowerCase() === 'summer2023') {
      return {
        code: 'SUMMER2023',
        discount: 5000, // 5000 COP de réduction
        type: 'fixed',
        name: 'Été 2023',
        description: '5000 COP de réduction sur votre commande'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la validation du code promo:', error);
    return null;
  }
};

/**
 * Calcule les promotions applicables à une commande
 * @param order La commande à analyser
 * @param appliedPromoCodes Les codes promo appliqués à la commande
 * @returns Les promotions appliquées et le montant total des remises
 */
export const calculateOrderPromotions = async (
  order: Order,
  appliedPromoCodes: AppliedPromoCode[]
): Promise<OrderPromotions> => {
  const appliedPromotions: AppliedPromotion[] = [];
  let totalDiscount = 0;
  
  try {
    // 1. Appliquer les promotions automatiques (2x1, etc.)
    // Dans une implémentation réelle, cette fonction récupérerait les promotions actives depuis l'API
    
    // Exemple: Promotion 2x1 sur les burgers
    const burgerItems = order.items.filter(item => 
      item.nom.toLowerCase().includes('burger') || 
      item.categorie?.toLowerCase().includes('burger')
    );
    
    if (burgerItems.length >= 2) {
      // Trouver l'article le moins cher pour l'offrir
      const sortedBurgers = [...burgerItems].sort((a, b) => a.prix_unitaire - b.prix_unitaire);
      const cheapestBurger = sortedBurgers[0];
      
      if (cheapestBurger) {
        const discount = cheapestBurger.prix_unitaire;
        appliedPromotions.push({
          id: 'auto-2x1-burger',
          name: '2x1 sur les burgers',
          description: 'Le burger le moins cher est offert',
          discount,
          type: 'automatic'
        });
        
        totalDiscount += discount;
      }
    }
    
    // 2. Appliquer les codes promo
    for (const promoCode of appliedPromoCodes) {
      let codeDiscount = 0;
      
      if (promoCode.type === 'percentage') {
        // Calculer la remise en pourcentage sur le total
        const subtotal = order.items.reduce((sum, item) => sum + item.prix_unitaire * item.quantite, 0);
        codeDiscount = Math.round(subtotal * (promoCode.discount / 100));
      } else if (promoCode.type === 'fixed') {
        // Remise d'un montant fixe
        codeDiscount = promoCode.discount;
      }
      
      appliedPromotions.push({
        id: `code-${promoCode.code}`,
        name: promoCode.name,
        description: promoCode.description,
        discount: codeDiscount,
        type: 'code',
        code: promoCode.code
      });
      
      totalDiscount += codeDiscount;
    }
    
    // 3. Vérifier si le total des remises ne dépasse pas le total de la commande
    const subtotal = order.items.reduce((sum, item) => sum + item.prix_unitaire * item.quantite, 0);
    if (totalDiscount > subtotal) {
      totalDiscount = subtotal;
    }
    
    return {
      appliedPromotions,
      totalDiscount
    };
  } catch (error) {
    console.error('Erreur lors du calcul des promotions:', error);
    return {
      appliedPromotions: [],
      totalDiscount: 0
    };
  }
};
