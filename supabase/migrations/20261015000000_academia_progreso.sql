-- Academia Nova: progreso por lección guardado por cuenta, para que el avance
-- se comparta entre el celular y la computadora del convocado.
-- lesson_key tiene la forma "modulo/leccion" (por ejemplo "electronica/e1").

CREATE TABLE public.academia_progreso (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_key TEXT NOT NULL CHECK (lesson_key ~ '^[a-z]+/[a-z0-9]+$'),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, lesson_key)
);

ALTER TABLE public.academia_progreso ENABLE ROW LEVEL SECURITY;

-- Cada persona ve su propio avance; la directiva puede ver el de todos.
CREATE POLICY "Users can view own academia progress" ON public.academia_progreso
  FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- Solo quien tiene acceso vigente a la Academia puede registrar avance.
CREATE POLICY "Users can add own academia progress" ON public.academia_progreso
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.has_academy_access(auth.uid()));

CREATE POLICY "Users can remove own academia progress" ON public.academia_progreso
  FOR DELETE USING (auth.uid() = user_id);
