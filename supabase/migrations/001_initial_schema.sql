-- ============================================================
-- Script inicial: esquema según diagrama ER
-- Ejecutar en el SQL Editor de Supabase o con Supabase CLI
-- ============================================================

-- Extensión UUID (ya viene en Supabase, por si acaso)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- ENUMs (solo se crean si no existen, para poder re-ejecutar el script)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_role') THEN
    CREATE TYPE profile_role AS ENUM (
      'admin',
      'security',
      'resident',
      'visitor'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visit_status') THEN
    CREATE TYPE visit_status AS ENUM (
      'pending',
      'approved',
      'rejected',
      'completed',
      'cancelled'
    );
  END IF;
END
$$;

-- Si el enum profile_role se creó antes con 'guard', renombrar a 'security'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'profile_role' AND e.enumlabel = 'guard'
  ) THEN
    ALTER TYPE profile_role RENAME VALUE 'guard' TO 'security';
  END IF;
END
$$;

-- ------------------------------------------------------------
-- Tabla: communities
-- ------------------------------------------------------------
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Tabla: profiles (1:1 con auth.users)
-- ------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  role profile_role NOT NULL DEFAULT 'resident',
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_community_id ON public.profiles(community_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ------------------------------------------------------------
-- Tabla: units
-- ------------------------------------------------------------
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(community_id, number)
);

CREATE INDEX idx_units_community_id ON public.units(community_id);
CREATE INDEX idx_units_owner_id ON public.units(owner_id);

-- ------------------------------------------------------------
-- Tabla: visits
-- ------------------------------------------------------------
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT,
  visit_date DATE NOT NULL,
  visit_time TIME,
  qr_token TEXT UNIQUE NOT NULL,
  status visit_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_visits_resident_id ON public.visits(resident_id);
CREATE INDEX idx_visits_visit_date ON public.visits(visit_date);
CREATE INDEX idx_visits_status ON public.visits(status);
CREATE UNIQUE INDEX idx_visits_qr_token ON public.visits(qr_token);

-- ------------------------------------------------------------
-- Tabla: access_logs
-- ------------------------------------------------------------
CREATE TABLE public.access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  guard_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exit_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_access_logs_visit_id ON public.access_logs(visit_id);
CREATE INDEX idx_access_logs_guard_id ON public.access_logs(guard_id);
CREATE INDEX idx_access_logs_entry_time ON public.access_logs(entry_time);

-- ------------------------------------------------------------
-- Trigger: crear profile al registrar usuario (auth.users)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- El trigger se ejecuta en el schema auth (DROP evita error si ya existe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- Row Level Security (RLS) — por rol: resident | security | admin
-- ------------------------------------------------------------
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Función auxiliar: rol del usuario actual (evita repetir subconsultas)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS profile_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Función auxiliar: community_id del usuario actual
CREATE OR REPLACE FUNCTION public.current_user_community_id()
RETURNS UUID AS $$
  SELECT community_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ----------
-- PROFILES
-- ----------
-- resident: READ su propio perfil
CREATE POLICY "profiles_resident_read_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

-- resident: puede actualizar su propio perfil (nombre, teléfono, etc.)
CREATE POLICY "profiles_resident_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- admin: CRUD profiles (solo dentro de su community)
CREATE POLICY "profiles_admin_select_community"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    current_user_role() = 'admin'
    AND (community_id = current_user_community_id() OR id = auth.uid())
  );

CREATE POLICY "profiles_admin_update_community"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    current_user_role() = 'admin'
    AND community_id = current_user_community_id()
  );

CREATE POLICY "profiles_admin_delete_community"
  ON public.profiles FOR DELETE TO authenticated
  USING (
    current_user_role() = 'admin'
    AND community_id = current_user_community_id()
    AND id != auth.uid()
  );

-- ----------
-- COMMUNITIES
-- ----------
-- resident / security: READ su comunidad (para contexto)
CREATE POLICY "communities_read_own"
  ON public.communities FOR SELECT TO authenticated
  USING (id = current_user_community_id());

-- admin: READ todas (estadísticas globales) y CRUD la suya
CREATE POLICY "communities_admin_select_all"
  ON public.communities FOR SELECT TO authenticated
  USING (current_user_role() = 'admin');

CREATE POLICY "communities_admin_insert"
  ON public.communities FOR INSERT TO authenticated
  WITH CHECK (current_user_role() = 'admin');

CREATE POLICY "communities_admin_update_own"
  ON public.communities FOR UPDATE TO authenticated
  USING (
    current_user_role() = 'admin'
    AND id = current_user_community_id()
  );

CREATE POLICY "communities_admin_delete_own"
  ON public.communities FOR DELETE TO authenticated
  USING (
    current_user_role() = 'admin'
    AND id = current_user_community_id()
  );

-- ----------
-- UNITS
-- ----------
-- admin: CRUD units dentro de su community
CREATE POLICY "units_admin_select"
  ON public.units FOR SELECT TO authenticated
  USING (
    current_user_role() = 'admin'
    AND community_id = current_user_community_id()
  );

CREATE POLICY "units_admin_insert"
  ON public.units FOR INSERT TO authenticated
  WITH CHECK (
    current_user_role() = 'admin'
    AND community_id = current_user_community_id()
  );

CREATE POLICY "units_admin_update"
  ON public.units FOR UPDATE TO authenticated
  USING (
    current_user_role() = 'admin'
    AND community_id = current_user_community_id()
  );

CREATE POLICY "units_admin_delete"
  ON public.units FOR DELETE TO authenticated
  USING (
    current_user_role() = 'admin'
    AND community_id = current_user_community_id()
  );

-- ----------
-- VISITS
-- ----------
-- resident: CRUD sus propias visitas
CREATE POLICY "visits_resident_select"
  ON public.visits FOR SELECT TO authenticated
  USING (resident_id = auth.uid());

CREATE POLICY "visits_resident_insert"
  ON public.visits FOR INSERT TO authenticated
  WITH CHECK (resident_id = auth.uid());

CREATE POLICY "visits_resident_update"
  ON public.visits FOR UPDATE TO authenticated
  USING (resident_id = auth.uid());

CREATE POLICY "visits_resident_delete"
  ON public.visits FOR DELETE TO authenticated
  USING (resident_id = auth.uid());

-- security: READ todas las visitas, UPDATE status
CREATE POLICY "visits_security_select_all"
  ON public.visits FOR SELECT TO authenticated
  USING (current_user_role() = 'security');

CREATE POLICY "visits_security_update_status"
  ON public.visits FOR UPDATE TO authenticated
  USING (current_user_role() = 'security');

-- admin: CRUD visitas dentro de su community (residente en su comunidad)
CREATE POLICY "visits_admin_select"
  ON public.visits FOR SELECT TO authenticated
  USING (
    current_user_role() = 'admin'
    AND resident_id IN (
      SELECT id FROM public.profiles
      WHERE community_id = current_user_community_id()
    )
  );

CREATE POLICY "visits_admin_insert"
  ON public.visits FOR INSERT TO authenticated
  WITH CHECK (
    current_user_role() = 'admin'
    AND resident_id IN (
      SELECT id FROM public.profiles
      WHERE community_id = current_user_community_id()
    )
  );

CREATE POLICY "visits_admin_update"
  ON public.visits FOR UPDATE TO authenticated
  USING (
    current_user_role() = 'admin'
    AND resident_id IN (
      SELECT id FROM public.profiles
      WHERE community_id = current_user_community_id()
    )
  );

CREATE POLICY "visits_admin_delete"
  ON public.visits FOR DELETE TO authenticated
  USING (
    current_user_role() = 'admin'
    AND resident_id IN (
      SELECT id FROM public.profiles
      WHERE community_id = current_user_community_id()
    )
  );

-- ----------
-- ACCESS_LOGS
-- ----------
-- resident: READ access_logs de sus visitas
CREATE POLICY "access_logs_resident_select"
  ON public.access_logs FOR SELECT TO authenticated
  USING (
    visit_id IN (
      SELECT id FROM public.visits WHERE resident_id = auth.uid()
    )
  );

-- security: INSERT access_logs (registro de entrada/salida)
CREATE POLICY "access_logs_security_insert"
  ON public.access_logs FOR INSERT TO authenticated
  WITH CHECK (
    current_user_role() = 'security'
    AND guard_id = auth.uid()
  );

-- security: UPDATE para marcar exit_time
CREATE POLICY "access_logs_security_update"
  ON public.access_logs FOR UPDATE TO authenticated
  USING (
    current_user_role() = 'security'
    AND guard_id = auth.uid()
  );

-- security: READ todos (para consultar al registrar entrada/salida)
CREATE POLICY "access_logs_security_select"
  ON public.access_logs FOR SELECT TO authenticated
  USING (current_user_role() = 'security');

-- admin: CRUD access_logs de visitas de su community
CREATE POLICY "access_logs_admin_select"
  ON public.access_logs FOR SELECT TO authenticated
  USING (
    current_user_role() = 'admin'
    AND visit_id IN (
      SELECT v.id FROM public.visits v
      JOIN public.profiles p ON p.id = v.resident_id
      WHERE p.community_id = current_user_community_id()
    )
  );

CREATE POLICY "access_logs_admin_insert"
  ON public.access_logs FOR INSERT TO authenticated
  WITH CHECK (
    current_user_role() = 'admin'
    AND visit_id IN (
      SELECT v.id FROM public.visits v
      JOIN public.profiles p ON p.id = v.resident_id
      WHERE p.community_id = current_user_community_id()
    )
  );

CREATE POLICY "access_logs_admin_update"
  ON public.access_logs FOR UPDATE TO authenticated
  USING (
    current_user_role() = 'admin'
    AND visit_id IN (
      SELECT v.id FROM public.visits v
      JOIN public.profiles p ON p.id = v.resident_id
      WHERE p.community_id = current_user_community_id()
    )
  );

CREATE POLICY "access_logs_admin_delete"
  ON public.access_logs FOR DELETE TO authenticated
  USING (
    current_user_role() = 'admin'
    AND visit_id IN (
      SELECT v.id FROM public.visits v
      JOIN public.profiles p ON p.id = v.resident_id
      WHERE p.community_id = current_user_community_id()
    )
  );

-- ------------------------------------------------------------
-- Comentarios (opcional)
-- ------------------------------------------------------------
COMMENT ON TABLE public.profiles IS 'Perfil 1:1 con auth.users';
COMMENT ON TABLE public.communities IS 'Comunidades/residencias';
COMMENT ON TABLE public.units IS 'Unidades por comunidad, con dueño (profile)';
COMMENT ON TABLE public.visits IS 'Visitas registradas por residente';
COMMENT ON TABLE public.access_logs IS 'Registro de entrada/salida por visita y guardia';
