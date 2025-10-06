import React from 'react';
import { Ticket } from 'lucide-react';
import { OrderPromotions, AppliedPromoCode } from '../../types';
import PromoCodeInput from './PromoCodeInput';
import PromotionBadge from './PromotionBadge';
import { formatCurrencyCOP } from '../../utils/formatIntegerAmount';
import { PROMOTION_IMAGES } from '../../constants/promotionImages';

interface PromotionsSectionProps {
  promotions: OrderPromotions | undefined;
  onApplyPromoCode: (code: string) => Promise<void>;
  onRemovePromoCode: (code: string) => void;
  disabled?: boolean;
}

const PromotionsSection: React.FC<PromotionsSectionProps> = ({
  promotions,
  onApplyPromoCode,
  onRemovePromoCode,
  disabled = false
}) => {
  const appliedCodes = promotions?.appliedPromoCodes || [];
  const appliedPromotions = promotions?.appliedPromotions || [];
  const totalDiscount = promotions?.totalDiscount || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-brand-secondary flex items-center gap-2">
          <img 
            src={PROMOTION_IMAGES.PROMO_BANNER} 
            alt="Promotions" 
            className="w-6 h-6"
          />
          <span>Promotions</span>
        </h3>
        {totalDiscount > 0 && (
          <span className="text-green-600 font-bold">
            -{formatCurrencyCOP(totalDiscount)}
          </span>
        )}
      </div>

      <PromoCodeInput
        appliedCodes={appliedCodes}
        onApplyCode={onApplyPromoCode}
        onRemoveCode={onRemovePromoCode}
        disabled={disabled}
      />

      {appliedPromotions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Promotions appliquées :</p>
          <div className="flex flex-wrap gap-2">
            {appliedPromotions.map((promotion) => (
              <PromotionBadge key={promotion.promotionId} promotion={promotion} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          Aucune promotion appliquée à cette commande.
        </p>
      )}
    </div>
  );
};

export default PromotionsSection;
