-- Academia Nova · práctica presencial de soldadura.
-- El encargado de la convocatoria cita a quienes aprobaron la tarea final,
-- les entrega un kit de placa y registra si asistieron. Una cita por persona:
-- reprogramar es actualizar la misma fila.

CREATE TYPE public.practica_estado AS ENUM ('programada', 'asistio', 'no_asistio');

CREATE TABLE public.academia_practicas (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  lugar TEXT NOT NULL CHECK (char_length(btrim(lugar)) BETWEEN 3 AND 200),
  indicaciones TEXT CHECK (char_length(indicaciones) <= 1000),
  estado public.practica_estado NOT NULL DEFAULT 'programada',
  -- Comentario para el convocado después de la práctica.
  comentario TEXT CHECK (char_length(comentario) <= 1000),
  asignado_por UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.academia_practicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own academia practica" ON public.academia_practicas
  FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- Solo la directiva cita, y solo a quien tiene la tarea final aprobada.
CREATE POLICY "Staff can schedule academia practicas" ON public.academia_practicas
  FOR INSERT WITH CHECK (
    public.is_staff(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.academia_entregas e
      WHERE e.user_id = academia_practicas.user_id AND e.estado = 'aprobada'
    )
  );

CREATE POLICY "Staff can update academia practicas" ON public.academia_practicas
  FOR UPDATE USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete academia practicas" ON public.academia_practicas
  FOR DELETE USING (public.is_staff(auth.uid()));
