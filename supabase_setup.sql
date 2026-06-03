-- Ejecuta todo esto en el SQL Editor de Supabase

-- 1. Crear tabla users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  access_code TEXT,
  plan TEXT NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'pro')),
  messages_limit INTEGER NOT NULL DEFAULT 100,
  messages_used_this_month INTEGER NOT NULL DEFAULT 0,
  activation_date DATE DEFAULT CURRENT_DATE,
  expiration_date DATE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'expired')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nueva consulta',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear tabla messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS en las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para Users
CREATE POLICY "users_service_all" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_select_own" ON public.users FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "users_update_own" ON public.users FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- 6. Políticas RLS para Conversations
CREATE POLICY "conversations_service_all" ON public.conversations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "conversations_select_own" ON public.conversations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "conversations_insert_own" ON public.conversations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "conversations_delete_own" ON public.conversations FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 7. Políticas RLS para Messages
CREATE POLICY "messages_service_all" ON public.messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT TO authenticated
  USING (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()));
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()));

-- 8. Función para crear perfil y trigger para nuevos usuarios de Auth
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (
    id, email, full_name, plan, messages_limit,
    activation_date, payment_status, status, is_admin, messages_used_this_month
  ) VALUES (
    new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''), 'basic', 100,
    CURRENT_DATE, 'paid', 'active', false, 0
  );
  RETURN new;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE create_user_profile();

-- 9. Storage para archivos del chat
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files', 'chat-files', false);

CREATE POLICY "chat_files_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "chat_files_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'chat-files' AND (storage.foldername(name))[1] = auth.uid()::text);
