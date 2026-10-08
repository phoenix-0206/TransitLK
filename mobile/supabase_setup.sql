-- =====================================================
-- TransitLK — Supabase Database Setup Script
-- Copy & paste this entire script into the Supabase SQL Editor and run it.
-- =====================================================

-- ─────────────────────────────────────────────────────
-- 1. PROFILES TABLE
-- Stores user profile details linked to Supabase Auth
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone_number TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'commuter',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS pass_category TEXT DEFAULT 'regular';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public avatar bucket. Profile pictures are optional.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Use a SECURITY DEFINER helper so the admin profile policy does not recurse
-- through the profiles table while checking the current user's role.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE TO authenticated
  USING (public.is_admin());

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────
-- 2. BUS_LOCATIONS TABLE
-- Stores real-time GPS coordinates of tracked buses
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bus_locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_number      TEXT NOT NULL,
  route_name      TEXT NOT NULL,
  latitude        DOUBLE PRECISION NOT NULL,
  longitude       DOUBLE PRECISION NOT NULL,
  eta_minutes     INT DEFAULT 0,
  crowding_level  TEXT DEFAULT 'Low' CHECK (crowding_level IN ('Low', 'Medium', 'High')),
  last_updated    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bus_locations ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.bus_locations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.bus_locations TO authenticated;

-- Bus locations are publicly readable (no auth needed for tracking)
DROP POLICY IF EXISTS "Bus locations are publicly readable" ON public.bus_locations;
CREATE POLICY "Bus locations are publicly readable"
  ON public.bus_locations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage bus locations" ON public.bus_locations;
CREATE POLICY "Admins manage bus locations"
  ON public.bus_locations FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────
-- 3. BUS_SCHEDULES TABLE
-- Stores timetable / schedule information per route
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bus_schedules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_number    TEXT NOT NULL,
  origin          TEXT NOT NULL,
  destination     TEXT NOT NULL,
  departure_time  TEXT NOT NULL,
  arrival_time    TEXT,
  frequency       TEXT,
  bus_type        TEXT DEFAULT 'Normal',
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Upgrade existing installations where the table predates these schedule fields.
ALTER TABLE public.bus_schedules
  ADD COLUMN IF NOT EXISTS arrival_time TEXT,
  ADD COLUMN IF NOT EXISTS bus_type TEXT DEFAULT 'Normal',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
NOTIFY pgrst, 'reload schema';

ALTER TABLE public.bus_schedules ENABLE ROW LEVEL SECURITY;

-- Schedules are publicly readable
DROP POLICY IF EXISTS "Bus schedules are publicly readable" ON public.bus_schedules;
CREATE POLICY "Bus schedules are publicly readable"
  ON public.bus_schedules FOR SELECT
  USING (true);

-- ─────────────────────────────────────────────────────
-- 4. SAVED_ROUTES TABLE
-- User-specific bookmarked / favorite routes
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_routes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_number    TEXT NOT NULL,
  origin          TEXT,
  destination     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  -- Prevent duplicate bookmarks per user
  UNIQUE(user_id, route_number)
);

-- Older installations may have required origin and destination. These values
-- are optional when a live bus has no matching timetable row.
ALTER TABLE public.saved_routes
  ALTER COLUMN origin DROP NOT NULL,
  ALTER COLUMN destination DROP NOT NULL;

ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;

-- Users can read their own saved routes
DROP POLICY IF EXISTS "Users can view own saved routes" ON public.saved_routes;
CREATE POLICY "Users can view own saved routes"
  ON public.saved_routes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own saved routes
DROP POLICY IF EXISTS "Users can insert own saved routes" ON public.saved_routes;
CREATE POLICY "Users can insert own saved routes"
  ON public.saved_routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved routes
DROP POLICY IF EXISTS "Users can delete own saved routes" ON public.saved_routes;
CREATE POLICY "Users can delete own saved routes"
  ON public.saved_routes FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────
-- 5. CONDUCTOR-REGISTERED BUSES AND LIVE PHONE GPS
-- Apply this updated setup script in the Supabase SQL Editor.
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conductor_buses (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  bus_number            TEXT NOT NULL,
  vehicle_registration  TEXT NOT NULL,
  route_name            TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, vehicle_registration)
);

-- Upgrade installations that created this table before conductor GPS was added.
ALTER TABLE public.conductor_buses
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS bus_number TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_registration TEXT,
  ADD COLUMN IF NOT EXISTS route_name TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.conductor_buses
  ALTER COLUMN owner_id SET DEFAULT auth.uid();

ALTER TABLE public.conductor_buses ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conductor_buses TO authenticated;

DROP POLICY IF EXISTS "Conductors manage their own bus registrations" ON public.conductor_buses;
CREATE POLICY "Conductors manage their own bus registrations"
  ON public.conductor_buses FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Admins manage conductor bus registrations" ON public.conductor_buses;
CREATE POLICY "Admins manage conductor bus registrations"
  ON public.conductor_buses FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.conductor_bus_locations (
  bus_id                UUID PRIMARY KEY REFERENCES public.conductor_buses(id) ON DELETE CASCADE,
  bus_number            TEXT NOT NULL,
  vehicle_registration  TEXT NOT NULL,
  route_name            TEXT NOT NULL,
  latitude              DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude             DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  accuracy_meters       DOUBLE PRECISION,
  heading               DOUBLE PRECISION,
  speed_mps             DOUBLE PRECISION,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Upgrade installations that already have the live-location table.
ALTER TABLE public.conductor_bus_locations
  ADD COLUMN IF NOT EXISTS bus_number TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_registration TEXT,
  ADD COLUMN IF NOT EXISTS route_name TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS accuracy_meters DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS heading DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS speed_mps DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.conductor_bus_locations ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.conductor_bus_locations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.conductor_bus_locations TO authenticated;

DROP POLICY IF EXISTS "Active conductor bus locations are public" ON public.conductor_bus_locations;
CREATE POLICY "Active conductor bus locations are public"
  ON public.conductor_bus_locations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Conductors publish locations for their own buses" ON public.conductor_bus_locations;
CREATE POLICY "Conductors publish locations for their own buses"
  ON public.conductor_bus_locations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conductor_buses AS bus
      WHERE bus.id = bus_id AND bus.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Conductors update locations for their own buses" ON public.conductor_bus_locations;
CREATE POLICY "Conductors update locations for their own buses"
  ON public.conductor_bus_locations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conductor_buses AS bus
      WHERE bus.id = bus_id AND bus.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conductor_buses AS bus
      WHERE bus.id = bus_id AND bus.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Conductors stop sharing their own bus locations" ON public.conductor_bus_locations;
CREATE POLICY "Conductors stop sharing their own bus locations"
  ON public.conductor_bus_locations FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conductor_buses AS bus
      WHERE bus.id = bus_id AND bus.owner_id = auth.uid()
    )
  );
-- Live bus and timetable rows are created through app workflows, not demo seeds.
NOTIFY pgrst, 'reload schema';
