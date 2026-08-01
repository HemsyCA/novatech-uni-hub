-- Nuevo paso intermedio para el tracker de pedidos: pending -> paid -> preparing -> delivered
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'preparing' AFTER 'paid';
