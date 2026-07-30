-- Redes sociales oficiales de NovaTech Uni (mostradas en landing/footer)
CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL, -- instagram, facebook, tiktok, youtube, linkedin, whatsapp, x
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active social links" ON public.social_links
  FOR SELECT USING (is_active = true OR public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert social links" ON public.social_links
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update social links" ON public.social_links
  FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete social links" ON public.social_links
  FOR DELETE USING (public.is_staff(auth.uid()));
