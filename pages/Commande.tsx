import type { MutableRefObject } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { uploadPaymentReceipt } from '../services/cloudinary';
import { Order, Product, Category, OrderItem, Ingredient, OrderPromotions, AppliedPromoCode } from '../types';
import { ArrowLeft } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import Modal from '../components/Modal';
import { createOrderItemsSnapshot, areOrderItemSnapshotsEqual, type OrderItemsSnapshot } from '../utils/orderSync';
import ProductGrid from '../components/commande/ProductGrid';
import OrderSummary from '../components/commande/OrderSummary';
import ItemCustomizationModal, { type ItemCustomizationResult } from '../components/commande/ItemCustomizationModal';
import { validatePromoCode, calculateOrderPromotions } from '../services/promotions';

const isPersistedItemId = (value?: string) =>
    !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const cloneOrder = (order: Order): Order => JSON.parse(JSON.stringify(order));

const generateTempId = (() => {
    let counter = 0;
    return () => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return `tmp-${crypto.randomUUID()}`;
        }

        counter += 1;
        return `tmp-${Date.now()}-${counter}`;
    };
})();

const normalizeComment = (value?: string | null) => (value ?? '').trim();

const haveSameExcludedIngredients = (a: string[] = [], b: string[] = []) => {
    if (a.length !== b.length) {
        return false;
    }

    const sortedA = [...a].sort();
    const sortedB = [...b].sort();

    return sortedA.every((value, index) => value === sortedB[index]);
};

export const mergeProductIntoPendingItems = (
    items: OrderItem[],
    product: Product,
    result: ItemCustomizationResult,
    generateId: () => string,
    defaultExcludedIngredients: string[] = [],
): OrderItem[] => {
    const trimmedComment = normalizeComment(result.comment);
    const sanitizedQuantity = Number.isFinite(result.quantity)
        ? Math.max(1, Math.floor(result.quantity))
        : 1;

    // Chercher un item existant compatible, même avec un ID temporaire
    const existingIndex = items.findIndex(
        item => item.produitRef === product.id
            && item.estado === 'en_attente'
            && normalizeComment(item.commentaire) === trimmedComment
            && haveSameExcludedIngredients(item.excluded_ingredients ?? [], defaultExcludedIngredients),
    );

    if (existingIndex > -1) {
        return items.map((item, index) => (
            index === existingIndex
                ? { ...item, quantite: item.quantite + sanitizedQuantity }
                : item
        ));
    }

    const newItem: OrderItem = {
        id: generateId(),
        produitRef: product.id,
        nom_produit: product.nom_produit,
        prix_unitaire: product.prix_vente,
        quantite: sanitizedQuantity,
        excluded_ingredients: [...defaultExcludedIngredients],
        commentaire: trimmedComment,
        estado: 'en_attente',
    };

    return [...items, newItem];
};

type OrderItemsSnapshotCache = {
    source: OrderItem[];
    snapshot: OrderItemsSnapshot;
};

const EMPTY_ORDER_ITEMS_SNAPSHOT = createOrderItemsSnapshot([]);

const Commande: React.FC = () => {
    const { tableId } = useParams<{ tableId: string }>();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState<Order | null>(null);
    const [originalOrder, setOriginalOrder] = useState<Order | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isExitConfirmOpen, setExitConfirmOpen] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [isSendingToKitchen, setIsSendingToKitchen] = useState(false);
    const [selectedProductForCustomization, setSelectedProductForCustomization] = useState<Product | null>(null);
    
    // États pour les promotions
    const [promotions, setPromotions] = useState<OrderPromotions | undefined>(undefined);
    const [appliedPromoCodes, setAppliedPromoCodes] = useState<AppliedPromoCode[]>([]);
    const [subtotal, setSubtotal] = useState(0); // Sous-total avant remises

    const orderRef = useRef<Order | null>(order);
    const originalOrderRef = useRef<Order | null>(originalOrder);
    const serverOrderRef = useRef<Order | null>(null);
    const pendingServerOrderRef = useRef<Order | null>(null);
    const itemsSyncTimeoutRef = useRef<number | null>(null);
    const syncQueueRef = useRef<Promise<void>>(Promise.resolve());
    const currentItemsSnapshotCacheRef = useRef<OrderItemsSnapshotCache | null>(null);
    const originalItemsSnapshotCacheRef = useRef<OrderItemsSnapshotCache | null>(null);
    const hasLocalChangesRef = useRef<boolean>(false);

    const updateSnapshotCache = useCallback((
        cacheRef: MutableRefObject<OrderItemsSnapshotCache | null>,
        items: OrderItem[] | undefined,
        snapshot?: OrderItemsSnapshot,
    ): OrderItemsSnapshot => {
        if (!items || items.length === 0) {
            cacheRef.current = null;
            return EMPTY_ORDER_ITEMS_SNAPSHOT;
        }

        const computedSnapshot = snapshot ?? createOrderItemsSnapshot(items);
        cacheRef.current = { source: items, snapshot: computedSnapshot };
        return computedSnapshot;
    }, []);

    const getCachedSnapshot = useCallback((
        items: OrderItem[] | undefined,
        cacheRef: MutableRefObject<OrderItemsSnapshotCache | null>,
    ): OrderItemsSnapshot => {
        if (!items || items.length === 0) {
            cacheRef.current = null;
            return EMPTY_ORDER_ITEMS_SNAPSHOT;
        }

        const cachedSnapshot = cacheRef.current;
        if (cachedSnapshot && cachedSnapshot.source === items) {
            return cachedSnapshot.snapshot;
        }

        return updateSnapshotCache(cacheRef, items);
    }, [updateSnapshotCache]);

    useEffect(() => {
        orderRef.current = order;
    }, [order]);

    useEffect(() => {
        originalOrderRef.current = originalOrder;
    }, [originalOrder]);

    const isOrderSynced = useCallback((comparisonOrder?: Order | null) => {
        const currentOrder = orderRef.current;
        if (!currentOrder) {
            return true;
        }

        const referenceOrder = comparisonOrder ?? originalOrderRef.current;
        if (!referenceOrder) {
            return true;
        }

        const currentSnapshot = getCachedSnapshot(currentOrder.items, currentItemsSnapshotCacheRef);
        const referenceSnapshot = comparisonOrder
            ? createOrderItemsSnapshot(referenceOrder.items)
            : getCachedSnapshot(referenceOrder.items, originalItemsSnapshotCacheRef);

        return areOrderItemSnapshotsEqual(referenceSnapshot, currentSnapshot);
    }, [getCachedSnapshot]);

    const applyPendingServerSnapshot = useCallback(() => {
        const pendingOrder = pendingServerOrderRef.current;
        if (!pendingOrder) {
            return;
        }

        const pendingItemsSnapshot = createOrderItemsSnapshot(pendingOrder.items);
        serverOrderRef.current = cloneOrder(pendingOrder);

        const currentOrder = orderRef.current;
        if (currentOrder) {
            const currentSnapshot = getCachedSnapshot(currentOrder.items, currentItemsSnapshotCacheRef);
            if (areOrderItemSnapshotsEqual(currentSnapshot, pendingItemsSnapshot)) {
                pendingServerOrderRef.current = null;
                return;
            }
        }

        pendingServerOrderRef.current = null;
        orderRef.current = pendingOrder;
        setOrder(pendingOrder);
        updateSnapshotCache(currentItemsSnapshotCacheRef, pendingOrder.items, pendingItemsSnapshot);
    }, [getCachedSnapshot, updateSnapshotCache]);

    const fetchOrderData = useCallback(async () => {
        if (!tableId) {
            return;
        }
        
        // Si des changements locaux sont en cours, ne pas rafraîchir
        if (hasLocalChangesRef.current) {
            return;
        }

        try {
            const orderData = await api.getOrderByTableId(tableId);
            
            if (!orderData) {
                navigate('/ventes');
                return;
            }

            if (pendingServerOrderRef.current) {
                pendingServerOrderRef.current = orderData;
                return;
            }

            const currentOrder = orderRef.current;
            if (currentOrder && !isOrderSynced(orderData)) {
                pendingServerOrderRef.current = orderData;
                return;
            }

            serverOrderRef.current = cloneOrder(orderData);
            setOrder(orderData);
            setOriginalOrder(cloneOrder(orderData));
            updateSnapshotCache(currentItemsSnapshotCacheRef, orderData.items);
            updateSnapshotCache(originalItemsSnapshotCacheRef, orderData.items);
        } catch (error) {
            console.error('Erreur lors de la récupération de la commande:', error);
        }
    }, [tableId, navigate, isOrderSynced, updateSnapshotCache]);

    const fetchProducts = useCallback(async () => {
        try {
            const [productsData, categoriesData, ingredientsData] = await Promise.all([
                api.getProducts(),
                api.getCategories(),
                api.getIngredients(),
            ]);
            
            setProducts(productsData);
            setCategories(categoriesData);
            setIngredients(ingredientsData);
        } catch (error) {
            console.error('Erreur lors de la récupération des produits:', error);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchOrderData(), fetchProducts()]);
            setLoading(false);
        };

        loadData();
    }, [fetchOrderData, fetchProducts]);

    // Calcul des promotions lorsque les articles de la commande changent
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

    const scheduleItemsSync = useCallback(() => {
        if (itemsSyncTimeoutRef.current !== null) {
            clearTimeout(itemsSyncTimeoutRef.current);
        }

        hasLocalChangesRef.current = true;
        
        itemsSyncTimeoutRef.current = window.setTimeout(() => {
            itemsSyncTimeoutRef.current = null;
            
            syncQueueRef.current = syncQueueRef.current
                .then(() => runServerSync())
                .catch(error => {
                    console.error('Erreur lors de la synchronisation avec le serveur:', error);
                })
                .finally(() => {
                    hasLocalChangesRef.current = false;
                });
        }, 300);
    }, []);

    const runServerSync = async () => {
        const currentOrder = orderRef.current;
        if (!currentOrder || !currentOrder.id || isOrderSynced()) {
            return;
        }

        const finalItems = orderRef.current.items;
        
        try {
            await api.updateOrderItems(currentOrder.id, finalItems);
            
            const updatedOrder = await api.getOrderById(currentOrder.id);
            if (updatedOrder) {
                serverOrderRef.current = cloneOrder(updatedOrder);
                setOriginalOrder(cloneOrder(updatedOrder));
                updateSnapshotCache(originalItemsSnapshotCacheRef, updatedOrder.items);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour des articles:', error);
        }
    };

    const applyLocalItemsUpdate = useCallback((updater: (items: OrderItem[]) => OrderItem[]) => {
        setOrder(currentOrder => {
            if (!currentOrder) {
                return null;
            }

            const updatedItems = updater(currentOrder.items);
            const updatedTotal = updatedItems.reduce(
                (sum, item) => sum + item.prix_unitaire * item.quantite,
                0,
            );

            const updatedOrder = {
                ...currentOrder,
                items: updatedItems,
                total: updatedTotal,
            };

            updateSnapshotCache(currentItemsSnapshotCacheRef, updatedItems);
            scheduleItemsSync();

            return updatedOrder;
        });
    }, [updateSnapshotCache, scheduleItemsSync]);

    const handleQuantityChange = useCallback((itemIndex: number, change: number) => {
        applyLocalItemsUpdate(items => {
            return items.map((item, index) => {
                if (index !== itemIndex) {
                    return item;
                }

                const newQuantity = Math.max(1, item.quantite + change);
                if (newQuantity === item.quantite) {
                    return item;
                }

                return { ...item, quantite: newQuantity };
            });
        });
    }, [applyLocalItemsUpdate]);

    const handleCommentChange = useCallback((itemIndex: number, newComment: string) => {
        applyLocalItemsUpdate(items => {
            return items.map((item, index) => (
                index === itemIndex
                    ? { ...item, commentaire: newComment }
                    : item
            ));
        });
    }, [applyLocalItemsUpdate]);

    const handlePersistComment = useCallback((itemIndex: number) => {
        setEditingCommentId(null);
    }, []);

    const handleAddProduct = useCallback((product: Product) => {
        setSelectedProductForCustomization(product);
    }, []);

    const handleCustomizationSave = useCallback((result: ItemCustomizationResult) => {
        if (!selectedProductForCustomization) {
            return;
        }

        applyLocalItemsUpdate(items => (
            mergeProductIntoPendingItems(
                items,
                selectedProductForCustomization,
                result,
                generateTempId,
            )
        ));

        setSelectedProductForCustomization(null);
    }, [selectedProductForCustomization, applyLocalItemsUpdate]);

    const handleCustomizationCancel = useCallback(() => {
        setSelectedProductForCustomization(null);
    }, []);

    const handleSendToKitchen = useCallback(async () => {
        if (!order || !order.id || isSendingToKitchen) {
            return;
        }

        setIsSendingToKitchen(true);

        try {
            await api.sendOrderToKitchen(order.id);
            await fetchOrderData();
        } catch (error) {
            console.error('Erreur lors de l\'envoi en cuisine:', error);
        } finally {
            setIsSendingToKitchen(false);
        }
    }, [order, isSendingToKitchen, fetchOrderData]);

    const handleServeOrder = useCallback(async () => {
        if (!order || !order.id || isSendingToKitchen) {
            return;
        }

        setIsSendingToKitchen(true);

        try {
            await api.serveOrder(order.id);
            await fetchOrderData();
        } catch (error) {
            console.error('Erreur lors du service de la commande:', error);
        } finally {
            setIsSendingToKitchen(false);
        }
    }, [order, isSendingToKitchen, fetchOrderData]);

    const handlePaymentSubmit = useCallback(async (
        paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta',
        receiptFile?: File,
    ) => {
        if (!order || !order.id) {
            return;
        }

        try {
            let receiptUrl: string | undefined;
            
            if (receiptFile) {
                receiptUrl = await uploadPaymentReceipt(receiptFile);
            }

            await api.finalizeOrder(order.id, paymentMethod, receiptUrl);
            setIsPaymentModalOpen(false);
            navigate('/ventes');
        } catch (error) {
            console.error('Erreur lors de la finalisation de la commande:', error);
        }
    }, [order, navigate]);

    const handleExitConfirm = useCallback(() => {
        navigate('/ventes');
    }, [navigate]);

    const handleBackClick = useCallback(() => {
        if (!isOrderSynced()) {
            setExitConfirmOpen(true);
        } else {
            navigate('/ventes');
        }
    }, [isOrderSynced, navigate]);

    const filteredProducts = useMemo(() => {
        if (activeCategoryId === 'all') {
            return products;
        }
        return products.filter(product => product.categoria_id === activeCategoryId);
    }, [products, activeCategoryId]);

    const isProductAvailable = useCallback((product: Product) => {
        if (product.estado !== 'disponible') {
            return false;
        }

        // Vérifier les ingrédients
        for (const recipeItem of product.recipe) {
            const ingredient = ingredients.find(ing => ing.id === recipeItem.ingredient_id);
            if (!ingredient) {
                continue;
            }

            if (ingredient.stock_actuel < ingredient.stock_minimum) {
                return false;
            }
        }

        return true;
    }, [ingredients]);

    const categorizedItems = useMemo(() => {
        if (!order) {
            return { pending: [], sent: [] };
        }

        return {
            pending: order.items
                .filter(item => item.estado === 'en_attente')
                .map((item, index) => ({ item, index })),
            sent: order.items
                .filter(item => item.estado !== 'en_attente')
                .map((item, index) => ({ item, index: order.items.findIndex(i => i.id === item.id) })),
        };
    }, [order]);

    const handleProductPointerDown = useCallback((product: Product) => {
        let timeoutId: number | null = null;
        let isLongPress = false;

        return (event: React.PointerEvent<HTMLButtonElement>) => {
            if (event.button !== 0) {
                return;
            }

            timeoutId = window.setTimeout(() => {
                isLongPress = true;
                handleAddProduct(product);
            }, 500);

            const handlePointerUp = () => {
                if (timeoutId !== null) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }

                if (!isLongPress) {
                    handleAddProduct(product);
                }

                document.removeEventListener('pointerup', handlePointerUp);
                document.removeEventListener('pointercancel', handlePointerUp);
            };

            document.addEventListener('pointerup', handlePointerUp);
            document.addEventListener('pointercancel', handlePointerUp);
        };
    }, [handleAddProduct]);

    const handleProductKeyDown = useCallback((product: Product) => {
        return (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleAddProduct(product);
            }
        };
    }, [handleAddProduct]);
    
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Commande introuvable</h1>
                    <button
                        onClick={() => navigate('/ventes')}
                        className="ui-button-primary"
                    >
                        Retour aux ventes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center mb-4">
                <button
                    onClick={handleBackClick}
                    className="p-2 rounded-full hover:bg-gray-200 mr-2"
                    aria-label="Retour"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold">
                    {order.table_nom || `Table ${order.table_id}`}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 ui-card">
                    <ProductGrid
                        filteredProducts={filteredProducts}
                        quantities={categorizedItems.pending.reduce((acc, { item }) => {
                            acc[item.produitRef] = (acc[item.produitRef] || 0) + item.quantite;
                            return acc;
                        }, {} as Record<string, number>)}
                        onAdd={handleAddProduct}
                        activeCategoryId={activeCategoryId}
                        categories={categories}
                        onSelectCategory={setActiveCategoryId}
                        isProductAvailable={isProductAvailable}
                        handleProductPointerDown={handleProductPointerDown}
                        handleProductKeyDown={handleProductKeyDown}
                    />
                </div>

                <div className="lg:col-span-1">
                    <OrderSummary
                        categorizedItems={categorizedItems}
                        total={order.total || 0}
                        subtotal={subtotal}
                        onQuantityChange={handleQuantityChange}
                        onCommentChange={handleCommentChange}
                        onPersistComment={handlePersistComment}
                        onStartEditingComment={setEditingCommentId}
                        onSendToKitchen={handleSendToKitchen}
                        onServeOrder={handleServeOrder}
                        onOpenPayment={() => setIsPaymentModalOpen(true)}
                        isSending={isSendingToKitchen}
                        hasPending={categorizedItems.pending.length > 0}
                        orderStatus={order.estado_cocina}
                        editingCommentId={editingCommentId}
                        promotions={promotions}
                        onApplyPromoCode={handleApplyPromoCode}
                        onRemovePromoCode={handleRemovePromoCode}
                    />
                </div>
            </div>

            <ItemCustomizationModal
                isOpen={!!selectedProductForCustomization}
                product={selectedProductForCustomization}
                onClose={handleCustomizationCancel}
                onSave={handleCustomizationSave}
            />

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSubmit={handlePaymentSubmit}
                total={order.total || 0}
            />

            <Modal
                isOpen={isExitConfirmOpen}
                onClose={() => setExitConfirmOpen(false)}
                title="Quitter sans enregistrer ?"
            >
                <div className="space-y-4">
                    <p className="text-gray-200">
                        Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?
                    </p>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setExitConfirmOpen(false)}
                            className="ui-button-secondary"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleExitConfirm}
                            className="ui-button-danger"
                        >
                            Quitter
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Commande;
