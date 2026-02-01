-- Enum para estados de impresión
CREATE TYPE public.print_status AS ENUM ('pending', 'approved', 'in_progress', 'completed', 'cancelled');

-- Enum para tipo de impresora
CREATE TYPE public.printer_type AS ENUM ('filament', 'resin');

-- Enum para estado de orden
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'delivered', 'cancelled');

-- Tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabla de impresoras 3D
CREATE TABLE public.printers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type printer_type NOT NULL DEFAULT 'filament',
  cost_per_gram DECIMAL(10,2) NOT NULL DEFAULT 0.10,
  cost_per_hour DECIMAL(10,2) NOT NULL DEFAULT 2.00,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabla de reservas de impresión 3D
CREATE TABLE public.print_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  printer_id UUID REFERENCES public.printers(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  description TEXT,
  estimated_grams DECIMAL(10,2) NOT NULL,
  estimated_hours DECIMAL(10,2) NOT NULL,
  estimated_cost DECIMAL(10,2) GENERATED ALWAYS AS (estimated_grams * 0.10 + estimated_hours * 2.00) STORED,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status print_status DEFAULT 'pending' NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabla de productos de la tienda
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabla de órdenes
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending' NOT NULL,
  transaction_code TEXT UNIQUE NOT NULL DEFAULT 'NT-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabla de items de orden
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies para printers (todos pueden ver)
CREATE POLICY "Anyone can view printers" ON public.printers FOR SELECT USING (true);

-- Policies para print_reservations
CREATE POLICY "Users can view own reservations" ON public.print_reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reservations" ON public.print_reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reservations" ON public.print_reservations FOR UPDATE USING (auth.uid() = user_id);

-- Policies para products (todos pueden ver productos activos)
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);

-- Policies para orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies para order_items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can create own order items" ON public.order_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- Trigger para crear perfil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insertar datos de ejemplo para productos
INSERT INTO public.products (name, description, category, price, stock, image_url) VALUES
('ESP32 DevKit', 'Microcontrolador ESP32 con WiFi y Bluetooth integrado', 'Microcontroladores', 15.00, 25, '🔌'),
('Puente H L298N', 'Driver de motor dual L298N para control de motores DC', 'Drivers', 8.00, 30, '⚡'),
('PCB Perforada 5x7cm', 'Placa PCB perforada para prototipos', 'PCB', 2.50, 100, '🟢'),
('Motor DC 12V', 'Motor DC de alto torque con encoder', 'Motores', 12.00, 20, '⚙️'),
('Rueda de Goma 65mm', 'Rueda de goma con llanta para robots', 'Mecánica', 5.00, 40, '🛞'),
('Servo Motor MG996R', 'Servo motor de alto torque con engranajes metálicos', 'Motores', 10.00, 15, '🤖'),
('Arduino Nano', 'Placa Arduino Nano con ATmega328P', 'Microcontroladores', 8.00, 35, '💻'),
('Sensor Ultrasónico HC-SR04', 'Sensor de distancia ultrasónico', 'Sensores', 3.50, 50, '📡'),
('Batería LiPo 3S 2200mAh', 'Batería de polímero de litio 11.1V', 'Energía', 25.00, 10, '🔋'),
('Driver A4988', 'Driver para motores paso a paso', 'Drivers', 4.00, 25, '🎛️');

-- Insertar impresoras de ejemplo
INSERT INTO public.printers (name, type, cost_per_gram, cost_per_hour, is_available) VALUES
('Ender 3 Pro', 'filament', 0.08, 1.50, true),
('Prusa i3 MK3S+', 'filament', 0.10, 2.00, true),
('Elegoo Mars 3', 'resin', 0.15, 3.00, true);