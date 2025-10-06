-- Table des promotions
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  conditions JSONB NOT NULL DEFAULT '[]'::JSONB,
  config JSONB NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1,
  stackable BOOLEAN NOT NULL DEFAULT false,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Fonction pour incrémenter le compteur d'utilisation
CREATE OR REPLACE FUNCTION increment(row_id UUID, increment_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT usage_count INTO current_count FROM promotions WHERE id = row_id;
  RETURN current_count + increment_amount;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le champ updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_promotions_modtime
BEFORE UPDATE ON promotions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(active);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_priority ON promotions(priority);

-- Exemples de promotions
INSERT INTO promotions (name, description, active, start_date, end_date, conditions, config, priority, stackable, usage_limit)
VALUES
  (
    '2x1 sur les burgers',
    'Achetez un burger, obtenez-en un gratuit',
    true,
    NOW(),
    NOW() + INTERVAL '30 days',
    '[{"type": "specific_category", "value": ["burgers"]}]',
    '{"type": "buy_x_get_y", "config": {"buyQuantity": 1, "getQuantity": 1}}',
    10,
    false,
    NULL
  ),
  (
    'Remise de 15%',
    'Remise de 15% sur toute commande de plus de 50 000 COP',
    true,
    NOW(),
    NOW() + INTERVAL '15 days',
    '[{"type": "min_order_amount", "value": 50000}]',
    '{"type": "percentage", "config": {"percentage": 15}}',
    5,
    true,
    NULL
  ),
  (
    'BIENVENUE10',
    'Code promo de bienvenue : 10% de réduction',
    true,
    NOW(),
    NOW() + INTERVAL '60 days',
    '[]',
    '{"type": "code_promo", "config": {"code": "BIENVENUE10", "usageLimit": 100, "usageCount": 0, "perCustomer": true}}',
    1,
    true,
    100
  );

-- Ajouter une colonne promotions à la table orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS promotions JSONB;
