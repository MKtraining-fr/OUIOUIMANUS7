import React from 'react';
import { Promotion } from '../../types';
import Image from 'next/image';

interface PromotionBadgeProps {
  promotion: Promotion;
  className?: string;
}

const PromotionBadge: React.FC<PromotionBadgeProps> = ({ promotion, className = '' }) => {
  // Formater le montant de la remise
  const formatDiscount = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className={`flex items-center p-2 rounded-md bg-blue-100 ${className}`}>
      {promotion.image && (
        <div className="w-8 h-8 mr-2 flex-shrink-0">
          <img 
            src={promotion.image} 
            alt={promotion.type} 
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <div className="flex-grow">
        <div className="font-medium text-blue-800">{promotion.name}</div>
        <div className="text-xs text-blue-600">{promotion.description}</div>
      </div>
      {promotion.value > 0 && (
        <div className="ml-2 font-bold text-green-600">
          -{formatDiscount(promotion.value)}
        </div>
      )}
    </div>
  );
};

export default PromotionBadge;
