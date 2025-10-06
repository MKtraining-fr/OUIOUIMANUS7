# Système de Gestion des Promotions

Ce document décrit le système de gestion des promotions intégré à l'application OUIOUIMANUS7.

## Table des matières

1. [Types de promotions](#types-de-promotions)
2. [Conditions d'application](#conditions-dapplication)
3. [Interface utilisateur](#interface-utilisateur)
4. [Intégration technique](#intégration-technique)
5. [Base de données](#base-de-données)
6. [Exemples d'utilisation](#exemples-dutilisation)

## Types de promotions

Le système supporte 5 types de promotions :

### 1. Achetez X, obtenez Y gratuit (buy_x_get_y)

- Exemple : 2x1 sur les burgers
- Configuration : 
  - `buyQuantity` : Quantité à acheter
  - `getQuantity` : Quantité offerte
  - `targetProducts` : Liste d'IDs de produits concernés (optionnel)

### 2. Remise en pourcentage (percentage)

- Exemple : 15% de réduction sur toute la commande
- Configuration :
  - `percentage` : Pourcentage de réduction
  - `maxDiscount` : Montant maximum de la réduction (optionnel)

### 3. Remise d'un montant fixe (fixed_amount)

- Exemple : 5000 COP de réduction
- Configuration :
  - `amount` : Montant fixe de la réduction

### 4. Article gratuit (free_item)

- Exemple : Dessert gratuit pour toute commande
- Configuration :
  - `itemId` : ID du produit offert
  - `quantity` : Quantité offerte

### 5. Code promotionnel (code_promo)

- Exemple : Code "BIENVENUE10" pour 10% de réduction
- Configuration :
  - `code` : Code à saisir
  - `usageLimit` : Limite d'utilisation (optionnel)
  - `usageCount` : Nombre d'utilisations actuel
  - `perCustomer` : Limite par client (optionnel)

## Conditions d'application

Les promotions peuvent être soumises à différentes conditions :

### 1. Montant minimum de commande (min_order_amount)

- Exemple : Commande d'au moins 50 000 COP

### 2. Nombre minimum d'articles (min_items)

- Exemple : Au moins 3 articles dans la commande

### 3. Produits spécifiques (specific_products)

- Exemple : Applicable uniquement aux burgers spécifiés

### 4. Catégorie spécifique (specific_category)

- Exemple : Applicable uniquement à la catégorie "Desserts"

### 5. Jour spécifique (specific_day)

- Exemple : Applicable uniquement le lundi et le mardi

### 6. Plage horaire spécifique (specific_time)

- Exemple : Applicable uniquement entre 18h et 20h

## Interface utilisateur

### Page de gestion des promotions

Une nouvelle page "Promotions" a été ajoutée à l'application, accessible depuis le menu principal. Cette page permet de :

- Visualiser toutes les promotions existantes
- Créer de nouvelles promotions
- Modifier les promotions existantes
- Supprimer des promotions
- Activer/désactiver des promotions

### Intégration dans la page de commande

Le système de promotions est intégré à la page de commande avec :

- Une section dédiée aux promotions
- Un champ pour saisir les codes promo
- L'affichage des promotions appliquées
- L'affichage des remises sur le total

## Intégration technique

### Services

Le système utilise les services suivants :

- `promotions.ts` : Service principal pour la gestion des promotions
  - `fetchActivePromotions()` : Récupère les promotions actives
  - `fetchAllPromotions()` : Récupère toutes les promotions
  - `createPromotion()` : Crée une nouvelle promotion
  - `updatePromotion()` : Met à jour une promotion existante
  - `deletePromotion()` : Supprime une promotion
  - `validatePromoCode()` : Valide un code promo
  - `calculateOrderPromotions()` : Calcule les promotions applicables à une commande

### Composants

Les composants suivants ont été créés :

- `PromotionsSection.tsx` : Section des promotions dans la commande
- `PromoCodeInput.tsx` : Champ de saisie des codes promo
- `PromotionBadge.tsx` : Badge affichant une promotion appliquée

### Types

Les types suivants ont été définis dans `types/promotions.ts` :

- `PromotionType` : Type de promotion
- `PromotionCondition` : Condition d'application
- `PromotionConfig` : Configuration spécifique au type
- `Promotion` : Modèle principal d'une promotion
- `AppliedPromotion` : Promotion appliquée à une commande
- `AppliedPromoCode` : Code promo appliqué
- `OrderPromotions` : Promotions appliquées à une commande

## Base de données

Une nouvelle table `promotions` a été créée avec les champs suivants :

- `id` : Identifiant unique
- `name` : Nom de la promotion
- `description` : Description (optionnelle)
- `active` : État d'activation
- `start_date` : Date de début
- `end_date` : Date de fin (optionnelle)
- `conditions` : Conditions d'application (JSONB)
- `config` : Configuration spécifique au type (JSONB)
- `priority` : Priorité d'application
- `stackable` : Si la promotion peut être cumulée
- `usage_limit` : Limite d'utilisation (optionnelle)
- `usage_count` : Nombre d'utilisations actuel
- `created_at` : Date de création
- `updated_at` : Date de dernière modification

La table `orders` a été modifiée pour ajouter un champ `promotions` de type JSONB.

## Exemples d'utilisation

### Création d'une promotion 2x1

```javascript
const promotion = {
  name: '2x1 sur les burgers',
  description: 'Achetez un burger, obtenez-en un gratuit',
  active: true,
  startDate: Date.now(),
  endDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 jours
  conditions: [
    {
      type: 'specific_category',
      value: ['burgers']
    }
  ],
  config: {
    type: 'buy_x_get_y',
    config: {
      buyQuantity: 1,
      getQuantity: 1
    }
  },
  priority: 10,
  stackable: false,
  usageCount: 0
};

const newPromotion = await createPromotion(promotion);
```

### Application d'un code promo

```javascript
const handleApplyPromoCode = async (code) => {
  try {
    const validation = await validatePromoCode(code);
    
    if (!validation.valid) {
      throw new Error(validation.message || 'Code promo invalide');
    }
    
    const newAppliedCode = {
      code,
      promotionId: validation.promotion.id,
      valid: true
    };
    
    setAppliedPromoCodes(prev => [...prev, newAppliedCode]);
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};
```

### Calcul des promotions applicables

```javascript
const orderWithPromotions = async (order) => {
  const promotions = await calculateOrderPromotions(order, appliedPromoCodes);
  
  // Mettre à jour le total avec les remises
  const updatedTotal = order.total - promotions.totalDiscount;
  
  return {
    ...order,
    total: updatedTotal,
    promotions
  };
};
```
