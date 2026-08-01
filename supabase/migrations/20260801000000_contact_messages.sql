CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a contact message" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view contact messages" ON public.contact_messages
  FOR SELECT USING (public.is_staff(auth.uid()));
