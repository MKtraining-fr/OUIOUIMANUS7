// URLs des images de promotion hébergées sur Cloudinary
export const PROMOTION_IMAGES = {
  PROMO_2X1: "https://res.cloudinary.com/dmed4shf3/image/upload/v1759789488/Custom/promotions/promo_2x1.png",
  PROMO_PERCENTAGE: "https://res.cloudinary.com/dmed4shf3/image/upload/v1759789489/Custom/promotions/promo_percentage.png",
  PROMO_FIXED: "https://res.cloudinary.com/dmed4shf3/image/upload/v1759789489/Custom/promotions/promo_fixed.png",
  PROMO_FREE_ITEM: "https://res.cloudinary.com/dmed4shf3/image/upload/v1759789490/Custom/promotions/promo_free_item.png",
  PROMO_CODE: "https://res.cloudinary.com/dmed4shf3/image/upload/v1759789490/Custom/promotions/promo_code.png",
  PROMO_BANNER: "https://res.cloudinary.com/dmed4shf3/image/upload/v1759789491/Custom/promotions/promo_banner.png"
};

// Fonction pour obtenir l'image correspondant au type de promotion
export const getPromotionImage = (type: string): string => {
  switch (type.toLowerCase()) {
    case '2x1':
    case 'buy_one_get_one':
    case 'bogo':
      return PROMOTION_IMAGES.PROMO_2X1;
    case 'percentage':
    case 'percent':
      return PROMOTION_IMAGES.PROMO_PERCENTAGE;
    case 'fixed':
    case 'amount':
      return PROMOTION_IMAGES.PROMO_FIXED;
    case 'free_item':
    case 'free':
      return PROMOTION_IMAGES.PROMO_FREE_ITEM;
    case 'code':
    case 'promo_code':
      return PROMOTION_IMAGES.PROMO_CODE;
    default:
      return PROMOTION_IMAGES.PROMO_BANNER;
  }
};
