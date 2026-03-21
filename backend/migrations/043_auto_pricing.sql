-- 043_auto_pricing.sql
-- Add automatic pricing columns to the products table.
--
-- cost_price    – the purchase/wholesale cost (mirrors price_net for central-catalog products)
-- margin_value  – computed absolute margin:  MAX(cost_price * 0.3, 30)
-- margin_percent – computed margin percentage: margin_value / cost_price * 100

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS cost_price     NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS margin_value   NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS margin_percent NUMERIC(8,4);

-- Backfill cost_price from price_net for existing rows
UPDATE products
   SET cost_price = price_net
 WHERE cost_price IS NULL AND price_net IS NOT NULL;
