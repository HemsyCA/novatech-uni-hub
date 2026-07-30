-- Vitrina pública del equipo: robots, dueños/integrantes, competencias y premios

CREATE TABLE public.robots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT, -- ej: sumo, seguidor de línea, combate, dron
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.robot_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  robot_id UUID REFERENCES public.robots(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  team_role TEXT, -- ej: capitán, integrante, mentor
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organizer TEXT,
  location TEXT,
  event_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.robot_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  robot_id UUID REFERENCES public.robots(id) ON DELETE CASCADE NOT NULL,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  result TEXT, -- ej: "1er lugar", "finalista", "participante"
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (robot_id, competition_id)
);

CREATE TABLE public.awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  robot_competition_id UUID REFERENCES public.robot_competitions(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, -- ej: "1er lugar", "Mejor diseño"
  description TEXT,
  awarded_date DATE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.robots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robot_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robot_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- Lectura pública (vitrina del equipo)
CREATE POLICY "Anyone can view active robots" ON public.robots
  FOR SELECT USING (is_active = true OR public.is_staff(auth.uid()));
CREATE POLICY "Anyone can view robot owners" ON public.robot_owners
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view competitions" ON public.competitions
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view robot competitions" ON public.robot_competitions
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view awards" ON public.awards
  FOR SELECT USING (true);

-- Gestión solo por la directiva
CREATE POLICY "Staff can manage robots insert" ON public.robots FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage robots update" ON public.robots FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage robots delete" ON public.robots FOR DELETE USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage robot_owners insert" ON public.robot_owners FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage robot_owners update" ON public.robot_owners FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage robot_owners delete" ON public.robot_owners FOR DELETE USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage competitions insert" ON public.competitions FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage competitions update" ON public.competitions FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage competitions delete" ON public.competitions FOR DELETE USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage robot_competitions insert" ON public.robot_competitions FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage robot_competitions update" ON public.robot_competitions FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage robot_competitions delete" ON public.robot_competitions FOR DELETE USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage awards insert" ON public.awards FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage awards update" ON public.awards FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage awards delete" ON public.awards FOR DELETE USING (public.is_staff(auth.uid()));
