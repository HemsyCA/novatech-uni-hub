-- Academia Nova: fichas de bitácora (Quería, Hice, Pasó, Aprendí).
-- Cada convocado llena una ficha obligatoria al cerrar cada módulo y puede
-- agregar fichas opcionales en cualquier lección. Quedan guardadas para que la
-- directiva las revise y, más adelante, compartirlas como aportes.

CREATE TABLE public.academia_fichas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  modulo TEXT NOT NULL CHECK (modulo IN ('electronica', 'mecanica', 'programacion')),
  lesson_key TEXT NOT NULL CHECK (lesson_key ~ '^[a-z]+/[a-z0-9]+$'),
  -- true en la ficha obligatoria que cierra el módulo (solo una por módulo).
  es_del_modulo BOOLEAN NOT NULL DEFAULT false,
  titulo TEXT NOT NULL CHECK (char_length(btrim(titulo)) BETWEEN 3 AND 120),
  queria TEXT NOT NULL CHECK (char_length(btrim(queria)) BETWEEN 3 AND 300),
  hice TEXT NOT NULL CHECK (char_length(btrim(hice)) BETWEEN 3 AND 800),
  paso TEXT NOT NULL CHECK (char_length(btrim(paso)) BETWEEN 3 AND 800),
  aprendi TEXT NOT NULL CHECK (char_length(btrim(aprendi)) BETWEEN 3 AND 300),
  fuentes TEXT NOT NULL CHECK (char_length(btrim(fuentes)) BETWEEN 3 AND 500),
  evidencia_url TEXT NOT NULL CHECK (evidencia_url ~ '^https?://'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX academia_fichas_una_por_modulo
  ON public.academia_fichas (user_id, modulo) WHERE es_del_modulo;

CREATE INDEX academia_fichas_user_idx ON public.academia_fichas (user_id);

ALTER TABLE public.academia_fichas ENABLE ROW LEVEL SECURITY;

-- Cada persona ve sus fichas; la directiva puede ver las de todos.
CREATE POLICY "Users can view own academia fichas" ON public.academia_fichas
  FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- Solo quien tiene acceso vigente a la Academia puede crear o editar fichas.
CREATE POLICY "Users can add own academia fichas" ON public.academia_fichas
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.has_academy_access(auth.uid()));

CREATE POLICY "Users can edit own academia fichas" ON public.academia_fichas
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND public.has_academy_access(auth.uid()));

CREATE POLICY "Users can remove own academia fichas" ON public.academia_fichas
  FOR DELETE USING (auth.uid() = user_id);
