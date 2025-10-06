import React from 'react';
import { Tag, Percent, DollarSign, Gift, ShoppingBag } from 'lucide-react';
import { AppliedPromotion, PromotionType } from '../../types';
import { formatCurrencyCOP } from '../../utils/formatIntegerAmount';

interface PromotionBadgeProps {
  promotion: AppliedPromotion;
}

const PromotionBadge: React.FC<PromotionBadgeProps> = ({ promotion }) => {
  // Déterminer l'icône en fonction du type de promotion
  const getIcon = (type: PromotionType) => {
    switch (type) {
      case 'buy_x_get_y':
        return <ShoppingBag size={16} />;
      case 'percentage':
        return <Percent size={16} />;
      case 'fixed_amount':
        return <DollarSign size={16} />;
      case 'free_item':
        return <Gift size={16} />;
      case 'code_promo':
        return <Tag size={16} />;
      default:
        return <Tag size={16} />;
    }
  };

  // Déterminer la couleur en fonction du type de promotion
  const getBadgeClasses = (type: PromotionType) => {
    switch (type) {
      case 'buy_x_get_y':
        return 'bg-blue-100 text-blue-800';
      case 'percentage':
        return 'bg-green-100 text-green-800';
      case 'fixed_amount':
        return 'bg-purple-100 text-purple-800';
      case 'free_item':
        return 'bg-amber-100 text-amber-800';
      case 'code_promo':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-sm ${getBadgeClasses(promotion.type)}`}>
      {getIcon(promotion.type)}
      <span className="font-medium">{promotion.promotionName}</span>
      <span className="font-bold">-{formatCurrencyCOP(promotion.discountAmount)}</span>
    </div>
  );
};

export default PromotionBadge;
