-- Inventario con descuento automático, registro del pago e indicadores para la directiva.
--
--  1. Los pedidos se crean con crear_pedido(): valida el stock, toma los precios de la base
--     (no del navegador) y descuenta todo en una sola operación. Ya no se pueden vender
--     unidades que no hay, ni siquiera si dos personas compran a la vez.
--  2. Al cancelar un pedido el stock vuelve; si se reabre, se vuelve a descontar.
--  3. Productos con stock mínimo y materiales de impresión con stock en kg. El material se
--     descuenta cuando una reserva de impresión pasa a "completada".
--  4. Los pedidos guardan cómo se pagó (Yape, efectivo o transferencia) y cuándo.
--  5. indicadores_negocio(): resumen de ventas, pedidos, stock bajo y más, solo para staff.

-- ============================== 1. Columnas nuevas ==============================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS min_stock INTEGER NOT NULL DEFAULT 5 CHECK (min_stock >= 0);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('yape', 'efectivo', 'transferencia')),
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.print_materials
  ADD COLUMN IF NOT EXISTS stock_kg NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (stock_kg >= 0),
  ADD COLUMN IF NOT EXISTS min_stock_kg NUMERIC(10,3) NOT NULL DEFAULT 1 CHECK (min_stock_kg >= 0);

-- Marca si ya se descontó el material de una reserva, para no descontarlo dos veces.
ALTER TABLE public.print_reservations
  ADD COLUMN IF NOT EXISTS stock_descontado BOOLEAN NOT NULL DEFAULT false;

-- Las reservas que ya estaban completadas no deben descontar material retroactivamente.
UPDATE public.print_reservations SET stock_descontado = true WHERE status = 'completed';

-- ============================== 2. Crear pedido con stock ==============================
CREATE OR REPLACE FUNCTION public.crear_pedido(_items JSONB)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _order public.orders;
  _product public.products;
  _line RECORD;
  _total NUMERIC(10,2) := 0;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Inicia sesión para hacer un pedido';
  END IF;
  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'El carrito está vacío';
  END IF;

  -- Paso 1: bloquear cada producto, validar el stock y calcular el total con los precios reales.
  -- Se recorren en orden fijo para que dos compras simultáneas no se bloqueen entre sí.
  FOR _line IN
    SELECT (i->>'product_id')::UUID AS product_id, SUM((i->>'quantity')::INT) AS quantity
    FROM jsonb_array_elements(_items) AS i
    GROUP BY 1
    ORDER BY 1
  LOOP
    IF _line.quantity IS NULL OR _line.quantity < 1 THEN
      RAISE EXCEPTION 'Cantidad no válida';
    END IF;
    SELECT * INTO _product FROM public.products WHERE id = _line.product_id AND is_active = true FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Un producto del carrito ya no está disponible';
    END IF;
    IF _product.stock < _line.quantity THEN
      RAISE EXCEPTION 'Stock insuficiente de "%": quedan %', _product.name, _product.stock;
    END IF;
    _total := _total + _product.price * _line.quantity;
  END LOOP;

  INSERT INTO public.orders (user_id, total) VALUES (_uid, _total) RETURNING * INTO _order;

  -- Paso 2: guardar los productos del pedido y descontar el stock.
  FOR _line IN
    SELECT (i->>'product_id')::UUID AS product_id, SUM((i->>'quantity')::INT) AS quantity
    FROM jsonb_array_elements(_items) AS i
    GROUP BY 1
    ORDER BY 1
  LOOP
    SELECT * INTO _product FROM public.products WHERE id = _line.product_id;
    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
    VALUES (_order.id, _product.id, _line.quantity, _product.price);
    UPDATE public.products SET stock = stock - _line.quantity WHERE id = _product.id;
  END LOOP;

  RETURN _order;
END;
$$;

REVOKE ALL ON FUNCTION public.crear_pedido(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.crear_pedido(JSONB) TO authenticated;

-- Desde ahora los pedidos solo se crean con crear_pedido(); así nadie puede saltarse el stock.
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own order items" ON public.order_items;

-- ============================== 3. Cancelar y reabrir un pedido ==============================
CREATE OR REPLACE FUNCTION public.ajustar_stock_por_estado()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _line RECORD;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    -- Cancelado: las unidades vuelven al stock.
    UPDATE public.products p
    SET stock = p.stock + i.quantity
    FROM (
      SELECT product_id, SUM(quantity) AS quantity
      FROM public.order_items
      WHERE order_id = NEW.id AND product_id IS NOT NULL
      GROUP BY product_id
    ) i
    WHERE p.id = i.product_id;
  ELSIF OLD.status = 'cancelled' AND NEW.status <> 'cancelled' THEN
    -- Reabierto: se vuelven a descontar, solo si todavía alcanza.
    FOR _line IN
      SELECT product_id, SUM(quantity) AS quantity
      FROM public.order_items
      WHERE order_id = NEW.id AND product_id IS NOT NULL
      GROUP BY product_id
    LOOP
      UPDATE public.products SET stock = stock - _line.quantity
      WHERE id = _line.product_id AND stock >= _line.quantity;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'No hay stock suficiente para reabrir este pedido';
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_ajustar_stock ON public.orders;
CREATE TRIGGER orders_ajustar_stock
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.ajustar_stock_por_estado();

-- ============================== 4. Fecha del pago ==============================
CREATE OR REPLACE FUNCTION public.marcar_fecha_pago()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status = 'pending' AND NEW.paid_at IS NULL THEN
    NEW.paid_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_marcar_fecha_pago ON public.orders;
CREATE TRIGGER orders_marcar_fecha_pago
  BEFORE UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.marcar_fecha_pago();

-- ============================== 5. Material de impresión ==============================
CREATE OR REPLACE FUNCTION public.descontar_material_reserva()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status <> 'completed' AND NOT NEW.stock_descontado THEN
    IF NEW.material_id IS NOT NULL THEN
      -- Los gramos estimados pasan a kg; el stock nunca baja de 0.
      UPDATE public.print_materials
      SET stock_kg = GREATEST(0, stock_kg - (NEW.estimated_grams / 1000.0))
      WHERE id = NEW.material_id;
    END IF;
    NEW.stock_descontado := true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS print_reservations_descontar_material ON public.print_reservations;
CREATE TRIGGER print_reservations_descontar_material
  BEFORE UPDATE OF status ON public.print_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.descontar_material_reserva();

-- ============================== 6. Indicadores para la directiva ==============================
CREATE OR REPLACE FUNCTION public.indicadores_negocio()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Los meses se cuentan con la hora de Lima.
  _mes_actual TIMESTAMP := date_trunc('month', now() AT TIME ZONE 'America/Lima');
  _inicio_mes TIMESTAMP WITH TIME ZONE;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Solo la directiva puede ver los indicadores';
  END IF;
  _inicio_mes := _mes_actual AT TIME ZONE 'America/Lima';

  RETURN jsonb_build_object(
    -- Ventas = pedidos confirmados, en preparación o entregados (no pendientes ni cancelados).
    'ventas_mes', (
      SELECT COALESCE(SUM(total), 0) FROM public.orders
      WHERE status IN ('paid', 'preparing', 'delivered') AND created_at >= _inicio_mes
    ),
    'pedidos_mes', (
      SELECT COUNT(*) FROM public.orders WHERE status <> 'cancelled' AND created_at >= _inicio_mes
    ),
    'pedidos_por_estado', (
      SELECT COALESCE(jsonb_object_agg(status, n), '{}'::jsonb)
      FROM (SELECT status::TEXT AS status, COUNT(*) AS n FROM public.orders GROUP BY status) s
    ),
    'reservas_por_estado', (
      SELECT COALESCE(jsonb_object_agg(status, n), '{}'::jsonb)
      FROM (SELECT status::TEXT AS status, COUNT(*) AS n FROM public.print_reservations GROUP BY status) s
    ),
    -- Tiempo desde que se hizo el pedido hasta su última actualización, solo en los entregados.
    'horas_promedio_entrega', (
      SELECT ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600)::NUMERIC, 1)
      FROM public.orders WHERE status = 'delivered'
    ),
    'ventas_por_mes', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('mes', to_char(m, 'YYYY-MM'), 'total', COALESCE(v.total, 0)) ORDER BY m), '[]'::jsonb)
      FROM generate_series(_mes_actual - INTERVAL '5 months', _mes_actual, INTERVAL '1 month') AS m
      LEFT JOIN LATERAL (
        SELECT SUM(o.total) AS total FROM public.orders o
        WHERE o.status IN ('paid', 'preparing', 'delivered')
          AND date_trunc('month', o.created_at AT TIME ZONE 'America/Lima') = m
      ) v ON true
    ),
    'stock_bajo', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'stock', stock, 'min_stock', min_stock) ORDER BY stock, name), '[]'::jsonb)
      FROM public.products WHERE is_active = true AND stock <= min_stock
    ),
    'material_bajo', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'stock_kg', stock_kg, 'min_stock_kg', min_stock_kg) ORDER BY stock_kg, name), '[]'::jsonb)
      FROM public.print_materials WHERE is_active = true AND stock_kg <= min_stock_kg
    ),
    'top_productos', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('name', name, 'unidades', unidades) ORDER BY unidades DESC), '[]'::jsonb)
      FROM (
        SELECT p.name, SUM(oi.quantity) AS unidades
        FROM public.order_items oi
        JOIN public.orders o ON o.id = oi.order_id
        JOIN public.products p ON p.id = oi.product_id
        WHERE o.status <> 'cancelled' AND o.created_at >= now() - INTERVAL '90 days'
        GROUP BY p.name
        ORDER BY unidades DESC
        LIMIT 5
      ) t
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.indicadores_negocio() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.indicadores_negocio() TO authenticated;
