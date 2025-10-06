import React, { useState } from 'react';
import { Tag, X, CheckCircle, AlertCircle } from 'lucide-react';
import { AppliedPromoCode } from '../../types';

interface PromoCodeInputProps {
  appliedCodes: AppliedPromoCode[];
  onApplyCode: (code: string) => Promise<void>;
  onRemoveCode: (code: string) => void;
  disabled?: boolean;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  appliedCodes,
  onApplyCode,
  onRemoveCode,
  disabled = false
}) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await onApplyCode(code.trim());
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'application du code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Tag size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code promo"
            disabled={disabled || isSubmitting}
            className="ui-input pl-10 w-full"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || isSubmitting || !code.trim()}
          className="ui-button-primary py-2 px-4 rounded-md"
        >
          Appliquer
        </button>
      </form>
      
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {appliedCodes.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {appliedCodes.map((appliedCode) => (
            <div 
              key={appliedCode.code}
              className={`flex items-center gap-1 py-1 px-2 rounded-full text-sm ${
                appliedCode.valid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {appliedCode.valid ? (
                <CheckCircle size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
              <span>{appliedCode.code}</span>
              <button
                type="button"
                onClick={() => onRemoveCode(appliedCode.code)}
                className="ml-1 p-0.5 rounded-full hover:bg-gray-200"
                aria-label="Supprimer le code promo"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
