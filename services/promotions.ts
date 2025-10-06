import { Promotion, PromoCode, OrderItem } from '../types';
import { getPromotionImage } from '../constants/promotionImages';

// Fonction pour valider un code promo
export const validatePromoCode = (code: string): PromoCode | null => {
  // Codes promo de test
  const testCodes: { [key: string]: PromoCode } = {
    'WELCOME10': {
      id: 'welcome10',
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      description: '10% de réduction sur votre commande',
      minOrderValue: 0,
      maxUses: 1,
      currentUses: 0,
      validFrom: new Date('2023-01-01'),
      validTo: new Date('2025-12-31'),
      image: getPromotionImage('percentage')
    },
    'SUMMER2023': {
      id: 'summer2023',
      code: 'SUMMER2023',
      type: 'fixed',
      value: 5000,
      description: '5000 COP de réduction sur votre commande',
      minOrderValue: 20000,
      maxUses: 100,
      currentUses: 45,
      validFrom: new Date('2023-06-01'),
      validTo: new Date('2023-08-31'),
      image: getPromotionImage('fixed')
    },
    'FREEBEVERAGE': {
      id: 'freebeverage',
      code: 'FREEBEVERAGE',
      type: 'free_item',
      value: 0,
      description: 'Une boisson gratuite avec votre commande',
      minOrderValue: 30000,
      maxUses: 50,
      currentUses: 12,
      validFrom: new Date('2023-01-01'),
      validTo: new Date('2025-12-31'),
      image: getPromotionImage('free_item'),
      freeItemCategory: 'beverages'
    },
    'BURGER2X1': {
      id: 'burger2x1',
      code: 'BURGER2X1',
      type: '2x1',
      value: 0,
      description: 'Achetez un burger, obtenez-en un gratuit',
      minOrderValue: 0,
      maxUses: 200,
      currentUses: 87,
      validFrom: new Date('2023-01-01'),
      validTo: new Date('2025-12-31'),
      image: getPromotionImage('2x1'),
      applicableCategories: ['burgers']
    }
  };

  // Vérifier si le code existe
  const upperCode = code.toUpperCase();
  if (!testCodes[upperCode]) {
    return null;
  }

  const promoCode = testCodes[upperCode];

  // Vérifier si le code est valide (date)
  const now = new Date();
  if (now < promoCode.validFrom || now > promoCode.validTo) {
    return null;
  }

  // Vérifier si le code a atteint son nombre maximum d'utilisations
  if (promoCode.maxUses > 0 && promoCode.currentUses >= promoCode.maxUses) {
    return null;
  }

  return promoCode;
};

// Fonction pour calculer les promotions applicables à une commande
export const calculateOrderPromotions = (
  items: OrderItem[],
  promoCodes: PromoCode[] = []
): { 
  appliedPromotions: Promotion[],
  totalDiscount: number
} => {
  const appliedPromotions: Promotion[] = [];
  let totalDiscount = 0;

  // Promotions automatiques (exemple : 2x1 sur les burgers)
  const burgerItems = items.filter(item => 
    item.product.category === 'burgers' && 
    item.quantity >= 2
  );

  if (burgerItems.length > 0) {
    // Pour chaque burger, appliquer une promotion 2x1
    burgerItems.forEach(item => {
      const freeQuantity = Math.floor(item.quantity / 2);
      if (freeQuantity > 0) {
        const discountPerItem = item.product.price;
        const discount = discountPerItem * freeQuantity;
        
        appliedPromotions.push({
          id: `2x1-${item.product.id}`,
          type: '2x1',
          name: '2x1 sur les burgers',
          description: `Achetez un ${item.product.name}, obtenez-en un gratuit`,
          value: discount,
          image: getPromotionImage('2x1'),
          appliedTo: [item.id]
        });
        
        totalDiscount += discount;
      }
    });
  }

  // Appliquer les codes promo
  promoCodes.forEach(promoCode => {
    let discount = 0;
    
    switch (promoCode.type) {
      case 'percentage':
        // Calculer le sous-total de la commande
        const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        discount = subtotal * (promoCode.value / 100);
        break;
        
      case 'fixed':
        discount = promoCode.value;
        break;
        
      case 'free_item':
        // Logique pour article gratuit (à implémenter)
        break;
        
      case '2x1':
        // Déjà géré par les promotions automatiques
        break;
    }
    
    if (discount > 0) {
      appliedPromotions.push({
        id: promoCode.id,
        type: promoCode.type,
        name: `Code promo: ${promoCode.code}`,
        description: promoCode.description,
        value: discount,
        image: promoCode.image,
        appliedTo: items.map(item => item.id)
      });
      
      totalDiscount += discount;
    }
  });

  return {
    appliedPromotions,
    totalDiscount
  };
};
