import { Check, DollarSign, MessageSquare, MinusCircle, PlusCircle, Send } from 'lucide-react';
import type { Order, OrderItem, OrderPromotions, AppliedPromoCode } from '../../types';
import { formatCurrencyCOP } from '../../utils/formatIntegerAmount';
import PromotionsSection from './PromotionsSection';

export type CategorizedOrderItems = {
    pending: { item: OrderItem; index: number }[];
    sent: { item: OrderItem; index: number }[];
};

export interface OrderSummaryProps {
    categorizedItems: CategorizedOrderItems;
    total: number;
    subtotal: number; // Nouveau: total avant remises
    onQuantityChange: (itemIndex: number, change: number) => void;
    onCommentChange: (itemIndex: number, newComment: string) => void;
    onPersistComment: (itemIndex: number) => void;
    onStartEditingComment: (itemId: string) => void;
    onSendToKitchen: () => void | Promise<void>;
    onServeOrder: () => void | Promise<void>;
    onOpenPayment: () => void;
    isSending: boolean;
    hasPending: boolean;
    orderStatus: Order['estado_cocina'];
    editingCommentId: string | null;
    promotions?: OrderPromotions; // Nouveau: promotions appliquées
    onApplyPromoCode: (code: string) => Promise<void>; // Nouveau: appliquer un code promo
    onRemovePromoCode: (code: string) => void; // Nouveau: supprimer un code promo
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
    categorizedItems,
    total,
    subtotal,
    onQuantityChange,
    onCommentChange,
    onPersistComment,
    onStartEditingComment,
    onSendToKitchen,
    onServeOrder,
    onOpenPayment,
    isSending,
    hasPending,
    orderStatus,
    editingCommentId,
    promotions,
    onApplyPromoCode,
    onRemovePromoCode,
}) => {
    const totalItemsCount = categorizedItems.pending.length + categorizedItems.sent.length;
    const hasPromotions = promotions && promotions.appliedPromotions.length > 0;
    const discount = promotions?.totalDiscount || 0;

    return (
        <div className="ui-card flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-2xl font-semibold text-brand-secondary">Commande</h2>
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {totalItemsCount === 0 ? (
                    <p className="text-gray-500">La commande est vide.</p>
                ) : (
                    <>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-brand-secondary">Articles à envoyer</h3>
                                <span className="text-sm text-gray-500">{categorizedItems.pending.length}</span>
                            </div>
                            {categorizedItems.pending.length === 0 ? (
                                <p className="text-sm text-gray-500">Aucun article en attente.</p>
                            ) : (
                                categorizedItems.pending.map(({ item, index }) => (
                                    <div key={item.id} className="p-3 rounded-lg bg-yellow-100">
                                        <div className="flex justify-between items-center gap-3">
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-500 text-base font-bold text-white shadow-md">
                                                    {item.quantite}
                                                </span>
                                                <p className="font-bold text-gray-900">
                                                    {item.nom_produit}
                                                </p>
                                            </div>
                                            <p className="font-bold text-gray-900 whitespace-nowrap">
                                                {formatCurrencyCOP(item.quantite * item.prix_unitaire)}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-sm text-gray-700">
                                                {formatCurrencyCOP(item.prix_unitaire)} /u
                                                {item.promotionApplied && item.originalPrice && (
                                                    <span className="ml-2 line-through text-gray-500">
                                                        {formatCurrencyCOP(item.originalPrice)}
                                                    </span>
                                                )}
                                            </p>
                                            <div className="flex items-center space-x-2 text-gray-800">
                                                <button onClick={() => onQuantityChange(index, -1)} className="p-1">
                                                    <MinusCircle size={20} />
                                                </button>
                                                <span className="font-bold w-6 text-center">{item.quantite}</span>
                                                <button onClick={() => onQuantityChange(index, 1)} className="p-1">
                                                    <PlusCircle size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        {editingCommentId === item.id || item.commentaire ? (
                                            <input
                                                type="text"
                                                placeholder="Ajouter un commentaire..."
                                                value={item.commentaire ?? ''}
                                                onChange={(event) => onCommentChange(index, event.target.value)}
                                                onBlur={() => onPersistComment(index)}
                                                autoFocus={editingCommentId === item.id}
                                                className="mt-2 ui-input text-sm"
                                            />
                                        ) : (
                                            <button
                                                onClick={() => onStartEditingComment(item.id)}
                                                className="mt-2 flex items-center text-sm text-gray-500 hover:text-gray-700"
                                            >
                                                <MessageSquare size={16} className="mr-1" />
                                                <span>Ajouter un commentaire</span>
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {categorizedItems.sent.length > 0 && (
                            <div className="space-y-3 mt-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-brand-secondary">Articles envoyés</h3>
                                    <span className="text-sm text-gray-500">{categorizedItems.sent.length}</span>
                                </div>
                                {categorizedItems.sent.map(({ item }) => (
                                    <div key={item.id} className="p-3 rounded-lg bg-gray-100">
                                        <div className="flex justify-between items-center gap-3">
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-500 text-base font-bold text-white shadow-md">
                                                    {item.quantite}
                                                </span>
                                                <div>
                                                    <p className="font-bold text-gray-900">
                                                        {item.nom_produit}
                                                    </p>
                                                    {item.commentaire && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {item.commentaire}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="font-bold text-gray-900 whitespace-nowrap">
                                                {formatCurrencyCOP(item.quantite * item.prix_unitaire)}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-sm text-gray-700">
                                                {formatCurrencyCOP(item.prix_unitaire)} /u
                                                {item.promotionApplied && item.originalPrice && (
                                                    <span className="ml-2 line-through text-gray-500">
                                                        {formatCurrencyCOP(item.originalPrice)}
                                                    </span>
                                                )}
                                            </p>
                                            <div className="flex items-center">
                                                <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full flex items-center gap-1">
                                                    <Check size={12} />
                                                    Envoyé
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Section des promotions */}
                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <PromotionsSection
                                promotions={promotions}
                                onApplyPromoCode={onApplyPromoCode}
                                onRemovePromoCode={onRemovePromoCode}
                                disabled={isSending}
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="p-4 border-t">
                {/* Affichage du sous-total et de la remise si des promotions sont appliquées */}
                {hasPromotions && (
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Sous-total</span>
                        <span className="text-gray-600">{formatCurrencyCOP(subtotal)}</span>
                    </div>
                )}
                
                {/* Affichage de la remise si des promotions sont appliquées */}
                {hasPromotions && (
                    <div className="flex justify-between mb-2 text-green-600">
                        <span>Remise</span>
                        <span>-{formatCurrencyCOP(discount)}</span>
                    </div>
                )}
                
                <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{formatCurrencyCOP(total)}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {hasPending && (
                        <button
                            onClick={onSendToKitchen}
                            disabled={isSending || categorizedItems.pending.length === 0}
                            className="ui-button-primary py-3 flex items-center justify-center gap-2"
                        >
                            <Send size={20} />
                            <span>Envoyer en cuisine</span>
                        </button>
                    )}

                    {orderStatus === 'listo' && (
                        <button
                            onClick={onServeOrder}
                            disabled={isSending}
                            className="ui-button-primary py-3 flex items-center justify-center gap-2"
                        >
                            <Check size={20} />
                            <span>Servir</span>
                        </button>
                    )}

                    {(orderStatus === 'servido' || orderStatus === 'entregada') && (
                        <button
                            onClick={onOpenPayment}
                            disabled={isSending}
                            className="ui-button-primary py-3 flex items-center justify-center gap-2"
                        >
                            <DollarSign size={20} />
                            <span>Paiement</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
