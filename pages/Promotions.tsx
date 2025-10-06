import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Percent, 
  DollarSign, 
  Gift, 
  ShoppingBag,
  Calendar,
  BarChart3,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { 
  Promotion, 
  PromotionType,
  BuyXGetYConfig,
  PercentageConfig,
  FixedAmountConfig,
  FreeItemConfig,
  CodePromoConfig,
  PromotionCondition,
  PromotionConfig
} from '../types';
import { 
  fetchAllPromotions, 
  createPromotion, 
  updatePromotion, 
  deletePromotion 
} from '../services/promotions';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const Promotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Partial<Promotion> | null>(null);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);

  // États pour le formulaire
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [promotionType, setPromotionType] = useState<PromotionType>('percentage');
  const [priority, setPriority] = useState(1);
  const [stackable, setStackable] = useState(false);
  const [usageLimit, setUsageLimit] = useState<number | undefined>(undefined);
  
  // États pour les configurations spécifiques
  const [buyQuantity, setBuyQuantity] = useState(2);
  const [getQuantity, setGetQuantity] = useState(1);
  const [percentage, setPercentage] = useState(10);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(undefined);
  const [fixedAmount, setFixedAmount] = useState(5000);
  const [freeItemId, setFreeItemId] = useState('');
  const [freeItemQuantity, setFreeItemQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeUsageLimit, setPromoCodeUsageLimit] = useState<number | undefined>(100);
  const [promoCodePerCustomer, setPromoCodePerCustomer] = useState(false);
  
  // États pour les conditions
  const [minOrderAmount, setMinOrderAmount] = useState<number | undefined>(undefined);
  const [minItems, setMinItems] = useState<number | undefined>(undefined);
  const [specificProducts, setSpecificProducts] = useState<string[]>([]);
  const [specificCategory, setSpecificCategory] = useState<string[]>([]);
  const [specificDays, setSpecificDays] = useState<string[]>([]);
  const [specificTimeRange, setSpecificTimeRange] = useState('');

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const data = await fetchAllPromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (promotion?: Promotion) => {
    if (promotion) {
      setCurrentPromotion(promotion);
      setName(promotion.name);
      setDescription(promotion.description || '');
      setActive(promotion.active);
      setStartDate(new Date(promotion.startDate).toISOString().split('T')[0]);
      setEndDate(promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '');
      setPromotionType(promotion.config.type);
      setPriority(promotion.priority);
      setStackable(promotion.stackable);
      setUsageLimit(promotion.usageLimit);
      
      // Configurer les champs spécifiques au type de promotion
      switch (promotion.config.type) {
        case 'buy_x_get_y':
          setBuyQuantity(promotion.config.config.buyQuantity);
          setGetQuantity(promotion.config.config.getQuantity);
          break;
        case 'percentage':
          setPercentage(promotion.config.config.percentage);
          setMaxDiscount(promotion.config.config.maxDiscount);
          break;
        case 'fixed_amount':
          setFixedAmount(promotion.config.config.amount);
          break;
        case 'free_item':
          setFreeItemId(promotion.config.config.itemId);
          setFreeItemQuantity(promotion.config.config.quantity);
          break;
        case 'code_promo':
          setPromoCode(promotion.config.config.code);
          setPromoCodeUsageLimit(promotion.config.config.usageLimit);
          setPromoCodePerCustomer(promotion.config.config.perCustomer || false);
          break;
      }
      
      // Configurer les conditions
      const conditions = promotion.conditions || [];
      
      const minOrderAmountCondition = conditions.find(c => c.type === 'min_order_amount');
      setMinOrderAmount(minOrderAmountCondition ? Number(minOrderAmountCondition.value) : undefined);
      
      const minItemsCondition = conditions.find(c => c.type === 'min_items');
      setMinItems(minItemsCondition ? Number(minItemsCondition.value) : undefined);
      
      const specificProductsCondition = conditions.find(c => c.type === 'specific_products');
      setSpecificProducts(specificProductsCondition ? specificProductsCondition.value as string[] : []);
      
      const specificCategoryCondition = conditions.find(c => c.type === 'specific_category');
      setSpecificCategory(specificCategoryCondition ? specificCategoryCondition.value as string[] : []);
      
      const specificDaysCondition = conditions.find(c => c.type === 'specific_day');
      setSpecificDays(specificDaysCondition ? specificDaysCondition.value as string[] : []);
      
      const specificTimeCondition = conditions.find(c => c.type === 'specific_time');
      setSpecificTimeRange(specificTimeCondition ? specificTimeCondition.value as string : '');
    } else {
      // Réinitialiser le formulaire pour une nouvelle promotion
      setCurrentPromotion(null);
      setName('');
      setDescription('');
      setActive(true);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setPromotionType('percentage');
      setPriority(1);
      setStackable(false);
      setUsageLimit(undefined);
      
      // Réinitialiser les configurations spécifiques
      setBuyQuantity(2);
      setGetQuantity(1);
      setPercentage(10);
      setMaxDiscount(undefined);
      setFixedAmount(5000);
      setFreeItemId('');
      setFreeItemQuantity(1);
      setPromoCode('');
      setPromoCodeUsageLimit(100);
      setPromoCodePerCustomer(false);
      
      // Réinitialiser les conditions
      setMinOrderAmount(undefined);
      setMinItems(undefined);
      setSpecificProducts([]);
      setSpecificCategory([]);
      setSpecificDays([]);
      setSpecificTimeRange('');
    }
    
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (promotion: Promotion) => {
    setPromotionToDelete(promotion);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!promotionToDelete) return;
    
    try {
      await deletePromotion(promotionToDelete.id);
      setPromotions(promotions.filter(p => p.id !== promotionToDelete.id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression de la promotion:', error);
    }
  };

  const buildPromotionConfig = (): PromotionConfig => {
    switch (promotionType) {
      case 'buy_x_get_y':
        return {
          type: 'buy_x_get_y',
          config: {
            buyQuantity,
            getQuantity,
            targetProducts: specificProducts.length > 0 ? specificProducts : undefined
          } as BuyXGetYConfig
        };
      case 'percentage':
        return {
          type: 'percentage',
          config: {
            percentage,
            maxDiscount
          } as PercentageConfig
        };
      case 'fixed_amount':
        return {
          type: 'fixed_amount',
          config: {
            amount: fixedAmount
          } as FixedAmountConfig
        };
      case 'free_item':
        return {
          type: 'free_item',
          config: {
            itemId: freeItemId,
            quantity: freeItemQuantity
          } as FreeItemConfig
        };
      case 'code_promo':
        return {
          type: 'code_promo',
          config: {
            code: promoCode,
            usageLimit: promoCodeUsageLimit,
            usageCount: currentPromotion?.config.type === 'code_promo' 
              ? currentPromotion.config.config.usageCount 
              : 0,
            perCustomer: promoCodePerCustomer
          } as CodePromoConfig
        };
      default:
        return {
          type: 'percentage',
          config: {
            percentage: 10
          } as PercentageConfig
        };
    }
  };

  const buildPromotionConditions = (): PromotionCondition[] => {
    const conditions: PromotionCondition[] = [];
    
    if (minOrderAmount !== undefined && minOrderAmount > 0) {
      conditions.push({
        type: 'min_order_amount',
        value: minOrderAmount
      });
    }
    
    if (minItems !== undefined && minItems > 0) {
      conditions.push({
        type: 'min_items',
        value: minItems
      });
    }
    
    if (specificProducts.length > 0) {
      conditions.push({
        type: 'specific_products',
        value: specificProducts
      });
    }
    
    if (specificCategory.length > 0) {
      conditions.push({
        type: 'specific_category',
        value: specificCategory
      });
    }
    
    if (specificDays.length > 0) {
      conditions.push({
        type: 'specific_day',
        value: specificDays
      });
    }
    
    if (specificTimeRange) {
      conditions.push({
        type: 'specific_time',
        value: specificTimeRange
      });
    }
    
    return conditions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const promotionData: Omit<Promotion, 'id'> = {
      name,
      description: description || undefined,
      active,
      startDate: new Date(startDate).getTime(),
      endDate: endDate ? new Date(endDate).getTime() : undefined,
      conditions: buildPromotionConditions(),
      config: buildPromotionConfig(),
      priority,
      stackable,
      usageLimit,
      usageCount: currentPromotion?.usageCount || 0
    };
    
    try {
      if (currentPromotion?.id) {
        // Mise à jour d'une promotion existante
        const updatedPromotion = await updatePromotion(currentPromotion.id, promotionData);
        if (updatedPromotion) {
          setPromotions(promotions.map(p => p.id === currentPromotion.id ? updatedPromotion : p));
        }
      } else {
        // Création d'une nouvelle promotion
        const newPromotion = await createPromotion(promotionData);
        if (newPromotion) {
          setPromotions([...promotions, newPromotion]);
        }
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la promotion:', error);
    }
  };

  const getPromotionTypeIcon = (type: PromotionType) => {
    switch (type) {
      case 'buy_x_get_y':
        return <ShoppingBag size={20} />;
      case 'percentage':
        return <Percent size={20} />;
      case 'fixed_amount':
        return <DollarSign size={20} />;
      case 'free_item':
        return <Gift size={20} />;
      case 'code_promo':
        return <Tag size={20} />;
      default:
        return <Tag size={20} />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR');
  };

  const getPromotionTypeLabel = (type: PromotionType) => {
    switch (type) {
      case 'buy_x_get_y':
        return 'Achetez X, obtenez Y';
      case 'percentage':
        return 'Pourcentage';
      case 'fixed_amount':
        return 'Montant fixe';
      case 'free_item':
        return 'Article gratuit';
      case 'code_promo':
        return 'Code promo';
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-secondary">Gestion des Promotions</h1>
        <button
          onClick={() => handleOpenModal()}
          className="ui-button-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Nouvelle Promotion</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-10 bg-gray-100 rounded-lg">
          <Tag size={48} className="mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">Aucune promotion n'a été créée.</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 ui-button-secondary"
          >
            Créer votre première promotion
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className={`border rounded-lg overflow-hidden shadow-sm ${
                promotion.active ? 'border-green-300' : 'border-gray-300'
              }`}
            >
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getPromotionTypeIcon(promotion.config.type)}
                  <span className="font-semibold">{getPromotionTypeLabel(promotion.config.type)}</span>
                </div>
                <div className="flex items-center">
                  {promotion.active ? (
                    <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full flex items-center gap-1">
                      <ToggleRight size={14} />
                      Actif
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-800 py-1 px-2 rounded-full flex items-center gap-1">
                      <ToggleLeft size={14} />
                      Inactif
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2">{promotion.name}</h3>
                {promotion.description && (
                  <p className="text-sm text-gray-600 mb-3">{promotion.description}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span>
                      Du {formatDate(promotion.startDate)}
                      {promotion.endDate ? ` au ${formatDate(promotion.endDate)}` : ' (sans fin)'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-gray-500" />
                    <span>Utilisée {promotion.usageCount} fois</span>
                    {promotion.usageLimit && (
                      <span className="text-xs text-gray-500">
                        (limite: {promotion.usageLimit})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(promotion)}
                  className="ui-button-secondary py-1 px-3 flex items-center gap-1"
                >
                  <Edit size={16} />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => handleOpenDeleteModal(promotion)}
                  className="ui-button-danger py-1 px-3 flex items-center gap-1"
                >
                  <Trash2 size={16} />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de création/édition de promotion */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentPromotion ? `Modifier ${currentPromotion.name}` : 'Nouvelle Promotion'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Nom de la promotion
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="ui-input w-full"
              placeholder="ex: Offre de bienvenue"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Description (optionnelle)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="ui-input w-full"
              rows={2}
              placeholder="Description de la promotion..."
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="ui-checkbox"
              />
              <label htmlFor="active" className="ml-2 text-sm text-gray-200">
                Promotion active
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="stackable"
                checked={stackable}
                onChange={(e) => setStackable(e.target.checked)}
                className="ui-checkbox"
              />
              <label htmlFor="stackable" className="ml-2 text-sm text-gray-200">
                Cumulable avec d'autres promotions
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="ui-input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Date de fin (optionnelle)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="ui-input w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Priorité
              </label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                min="1"
                max="100"
                required
                className="ui-input w-full"
              />
              <p className="text-xs text-gray-400 mt-1">
                Les promotions à priorité plus élevée sont appliquées en premier.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Limite d'utilisation (optionnelle)
              </label>
              <input
                type="number"
                value={usageLimit === undefined ? '' : usageLimit}
                onChange={(e) => setUsageLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                min="1"
                className="ui-input w-full"
                placeholder="Illimité"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Type de promotion
            </label>
            <select
              value={promotionType}
              onChange={(e) => setPromotionType(e.target.value as PromotionType)}
              className="ui-input w-full"
            >
              <option value="buy_x_get_y">Achetez X, obtenez Y gratuit (ex: 2x1)</option>
              <option value="percentage">Remise en pourcentage</option>
              <option value="fixed_amount">Remise d'un montant fixe</option>
              <option value="free_item">Article gratuit</option>
              <option value="code_promo">Code promotionnel</option>
            </select>
          </div>
          
          {/* Champs spécifiques selon le type de promotion */}
          {promotionType === 'buy_x_get_y' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Quantité à acheter
                </label>
                <input
                  type="number"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(parseInt(e.target.value))}
                  min="1"
                  required
                  className="ui-input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Quantité offerte
                </label>
                <input
                  type="number"
                  value={getQuantity}
                  onChange={(e) => setGetQuantity(parseInt(e.target.value))}
                  min="1"
                  required
                  className="ui-input w-full"
                />
              </div>
            </div>
          )}
          
          {promotionType === 'percentage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Pourcentage de remise
                </label>
                <input
                  type="number"
                  value={percentage}
                  onChange={(e) => setPercentage(parseInt(e.target.value))}
                  min="1"
                  max="100"
                  required
                  className="ui-input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Montant maximum de remise (optionnel)
                </label>
                <input
                  type="number"
                  value={maxDiscount === undefined ? '' : maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value ? parseInt(e.target.value) : undefined)}
                  min="1"
                  className="ui-input w-full"
                  placeholder="Sans limite"
                />
              </div>
            </div>
          )}
          
          {promotionType === 'fixed_amount' && (
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Montant de la remise
              </label>
              <input
                type="number"
                value={fixedAmount}
                onChange={(e) => setFixedAmount(parseInt(e.target.value))}
                min="1"
                required
                className="ui-input w-full"
              />
            </div>
          )}
          
          {promotionType === 'free_item' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  ID du produit offert
                </label>
                <input
                  type="text"
                  value={freeItemId}
                  onChange={(e) => setFreeItemId(e.target.value)}
                  required
                  className="ui-input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Quantité offerte
                </label>
                <input
                  type="number"
                  value={freeItemQuantity}
                  onChange={(e) => setFreeItemQuantity(parseInt(e.target.value))}
                  min="1"
                  required
                  className="ui-input w-full"
                />
              </div>
            </div>
          )}
          
          {promotionType === 'code_promo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Code promotionnel
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  required
                  className="ui-input w-full"
                  placeholder="ex: BIENVENUE10"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Limite d'utilisation du code
                  </label>
                  <input
                    type="number"
                    value={promoCodeUsageLimit === undefined ? '' : promoCodeUsageLimit}
                    onChange={(e) => setPromoCodeUsageLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                    min="1"
                    className="ui-input w-full"
                    placeholder="Illimité"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perCustomer"
                    checked={promoCodePerCustomer}
                    onChange={(e) => setPromoCodePerCustomer(e.target.checked)}
                    className="ui-checkbox"
                  />
                  <label htmlFor="perCustomer" className="ml-2 text-sm text-gray-200">
                    Limiter à une utilisation par client
                  </label>
                </div>
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-700 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Conditions d'application</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Montant minimum de commande
                </label>
                <input
                  type="number"
                  value={minOrderAmount === undefined ? '' : minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value ? parseInt(e.target.value) : undefined)}
                  min="1"
                  className="ui-input w-full"
                  placeholder="Aucun minimum"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Nombre minimum d'articles
                </label>
                <input
                  type="number"
                  value={minItems === undefined ? '' : minItems}
                  onChange={(e) => setMinItems(e.target.value ? parseInt(e.target.value) : undefined)}
                  min="1"
                  className="ui-input w-full"
                  placeholder="Aucun minimum"
                />
              </div>
            </div>
            
            {/* Note: Dans une version complète, il faudrait ajouter des sélecteurs pour les produits, 
                catégories, jours et plages horaires spécifiques */}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="ui-button-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="ui-button-primary"
            >
              {currentPromotion ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p className="text-gray-200">
            Êtes-vous sûr de vouloir supprimer la promotion "{promotionToDelete?.name}" ?
            Cette action est irréversible.
          </p>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="ui-button-secondary"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="ui-button-danger"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Promotions;
