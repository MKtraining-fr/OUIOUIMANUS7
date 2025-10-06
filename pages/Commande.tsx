// Ajout des imports pour les promotions
import { 
    validatePromoCode, 
    calculateOrderPromotions 
} from '../services/promotions';
import { 
    OrderPromotions, 
    AppliedPromoCode 
} from '../types';

// Dans la fonction Commande, ajouter les états pour les promotions
const [promotions, setPromotions] = useState<OrderPromotions | undefined>(undefined);
const [appliedPromoCodes, setAppliedPromoCodes] = useState<AppliedPromoCode[]>([]);
const [subtotal, setSubtotal] = useState(0); // Sous-total avant remises

// Dans useEffect pour le chargement initial, ajouter le calcul des promotions
useEffect(() => {
    if (order) {
        // Calculer le sous-total (total avant remises)
        const calculatedSubtotal = order.items.reduce(
            (sum, item) => sum + item.prix_unitaire * item.quantite,
            0
        );
        setSubtotal(calculatedSubtotal);
        
        // Calculer les promotions applicables
        calculateOrderPromotions(order, appliedPromoCodes)
            .then(calculatedPromotions => {
                setPromotions(calculatedPromotions);
                
                // Mettre à jour le total de la commande avec les remises
                const updatedTotal = calculatedSubtotal - calculatedPromotions.totalDiscount;
                setOrder(prev => prev ? { ...prev, total: updatedTotal } : null);
            })
            .catch(error => {
                console.error('Erreur lors du calcul des promotions:', error);
            });
    }
}, [order?.items, appliedPromoCodes]);

// Fonction pour appliquer un code promo
const handleApplyPromoCode = async (code: string) => {
    try {
        // Vérifier si le code est déjà appliqué
        if (appliedPromoCodes.some(pc => pc.code === code)) {
            throw new Error('Ce code promo est déjà appliqué');
        }
        
        // Valider le code promo
        const validation = await validatePromoCode(code);
        
        if (!validation.valid) {
            throw new Error(validation.message || 'Code promo invalide');
        }
        
        // Ajouter le code promo à la liste des codes appliqués
        const newAppliedCode: AppliedPromoCode = {
            code,
            promotionId: validation.promotion!.id,
            valid: true
        };
        
        setAppliedPromoCodes(prev => [...prev, newAppliedCode]);
    } catch (error) {
        console.error('Erreur lors de l\'application du code promo:', error);
        throw error;
    }
};

// Fonction pour supprimer un code promo
const handleRemovePromoCode = (code: string) => {
    setAppliedPromoCodes(prev => prev.filter(pc => pc.code !== code));
};

// Dans le rendu, mettre à jour le composant OrderSummary pour inclure les promotions
<OrderSummary
    categorizedItems={categorizedItems}
    total={order?.total || 0}
    subtotal={subtotal} // Nouveau: sous-total avant remises
    onQuantityChange={handleQuantityChange}
    onCommentChange={handleCommentChange}
    onPersistComment={handlePersistComment}
    onStartEditingComment={setEditingCommentId}
    onSendToKitchen={handleSendToKitchen}
    onServeOrder={handleServeOrder}
    onOpenPayment={() => setIsPaymentModalOpen(true)}
    isSending={isSendingToKitchen}
    hasPending={categorizedItems.pending.length > 0}
    orderStatus={order?.estado_cocina || 'no_enviado'}
    editingCommentId={editingCommentId}
    promotions={promotions} // Nouveau: promotions appliquées
    onApplyPromoCode={handleApplyPromoCode} // Nouveau: fonction pour appliquer un code promo
    onRemovePromoCode={handleRemovePromoCode} // Nouveau: fonction pour supprimer un code promo
/>
