-- Materiales de impresión 3D (PLA por defecto) y adjunto de archivo de diseño

CREATE TABLE public.print_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- PLA, PETG, ABS, Resina
  cost_per_gram DECIMAL(10,2) NOT NULL DEFAULT 0.10,
  cost_per_hour DECIMAL(10,2) NOT NULL DEFAULT 2.00,
  print_speed_g_per_hour DECIMAL(10,2) NOT NULL DEFAULT 20, -- referencia para estimar horas a partir de gramos
  is_default BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.print_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active materials" ON public.print_materials
  FOR SELECT USING (is_active = true OR public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert materials" ON public.print_materials
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update materials" ON public.print_materials
  FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete materials" ON public.print_materials
  FOR DELETE USING (public.is_staff(auth.uid()));

INSERT INTO public.print_materials (name, cost_per_gram, cost_per_hour, print_speed_g_per_hour, is_default) VALUES
('PLA', 0.10, 2.00, 20, true),
('PETG', 0.13, 2.00, 15, false),
('ABS', 0.12, 2.50, 15, false),
('Resina', 0.20, 3.00, 8, false);

-- print_reservations: material seleccionado y archivo de diseño adjunto
ALTER TABLE public.print_reservations
  ADD COLUMN IF NOT EXISTS material_id UUID REFERENCES public.print_materials(id),
  ADD COLUMN IF NOT EXISTS design_file_path TEXT;

UPDATE public.print_reservations
  SET material_id = (SELECT id FROM public.print_materials WHERE is_default = true LIMIT 1)
  WHERE material_id IS NULL;

-- Bucket privado para archivos de diseño (STL/GCODE/etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('print-files', 'print-files', false)
ON CONFLICT (id) DO NOTHING;

-- Usuarios autenticados suben a su propia carpeta {user_id}/...
CREATE POLICY "Users can upload own design files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'print-files'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuarios no autenticados suben a la carpeta anon/... (reservas públicas de impresión)
CREATE POLICY "Anonymous can upload to anon folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'print-files'
    AND auth.uid() IS NULL
    AND (storage.foldername(name))[1] = 'anon'
  );

CREATE POLICY "Users can view own design files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'print-files'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Staff can view all design files" ON storage.objects
  FOR SELECT USING (bucket_id = 'print-files' AND public.is_staff(auth.uid()));
