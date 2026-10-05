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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

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

-- Bus locations are publicly readable (no auth needed for tracking)
CREATE POLICY "Bus locations are publicly readable"
  ON public.bus_locations FOR SELECT
  USING (true);

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

ALTER TABLE public.bus_schedules ENABLE ROW LEVEL SECURITY;

-- Schedules are publicly readable
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

ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;

-- Users can read their own saved routes
CREATE POLICY "Users can view own saved routes"
  ON public.saved_routes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own saved routes
CREATE POLICY "Users can insert own saved routes"
  ON public.saved_routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved routes
CREATE POLICY "Users can delete own saved routes"
  ON public.saved_routes FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────
-- 5. SEED DATA — Sri Lankan Bus Routes
-- ─────────────────────────────────────────────────────

-- Bus Locations (live tracking mock data)
INSERT INTO public.bus_locations (bus_number, route_name, latitude, longitude, eta_minutes, crowding_level) VALUES
  ('138',  'Maharagama - Pettah',   6.8480, 79.9265, 4,  'Medium'),
  ('120',  'Horana - Pettah',       6.8700, 79.8800, 12, 'High'),
  ('100',  'Panadura - Pettah',     6.8300, 79.8650, 8,  'Low'),
  ('177',  'Kaduwela - Fort',       6.9320, 79.8830, 15, 'Medium'),
  ('154',  'Kottawa - Pettah',      6.8420, 79.9610, 6,  'Low'),
  ('255',  'Kandy - Colombo',       7.0800, 80.2200, 45, 'High'),
  ('2',    'Matara - Colombo',      6.5600, 80.0500, 90, 'Medium'),
  ('400',  'Negombo - Colombo',     7.0900, 79.8600, 25, 'Low')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────
-- 6. CONDUCTOR-REGISTERED BUSES AND LIVE PHONE GPS
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

ALTER TABLE public.conductor_buses ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conductor_buses TO authenticated;

DROP POLICY IF EXISTS "Conductors manage their own bus registrations" ON public.conductor_buses;
CREATE POLICY "Conductors manage their own bus registrations"
  ON public.conductor_buses FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

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

-- Bus Schedules (timetable mock data)
INSERT INTO public.bus_schedules (route_number, origin, destination, departure_time, arrival_time, frequency, bus_type) VALUES
  ('138',  'Maharagama',   'Pettah',    '05:30 AM', '06:15 AM', 'Every 10 mins', 'Normal'),
  ('138',  'Maharagama',   'Pettah',    '06:30 AM', '07:15 AM', 'Every 10 mins', 'Semi-Luxury'),
  ('120',  'Horana',       'Pettah',    '06:00 AM', '07:30 AM', 'Every 15 mins', 'Normal'),
  ('120',  'Horana',       'Pettah',    '07:00 AM', '08:30 AM', 'Every 15 mins', 'Normal'),
  ('100',  'Panadura',     'Pettah',    '05:45 AM', '06:45 AM', 'Every 12 mins', 'Normal'),
  ('100',  'Panadura',     'Pettah',    '06:15 AM', '07:15 AM', 'Every 12 mins', 'Semi-Luxury'),
  ('177',  'Kaduwela',     'Fort',      '06:00 AM', '06:50 AM', 'Every 20 mins', 'Normal'),
  ('154',  'Kottawa',      'Pettah',    '06:00 AM', '06:40 AM', 'Every 8 mins',  'Normal'),
  ('255',  'Kandy',        'Colombo',   '06:00 AM', '09:30 AM', 'Every 30 mins', 'A/C Luxury'),
  ('255',  'Kandy',        'Colombo',   '07:00 AM', '10:30 AM', 'Every 30 mins', 'Normal'),
  ('2',    'Matara',       'Colombo',   '05:00 AM', '09:00 AM', 'Every 45 mins', 'A/C Luxury'),
  ('400',  'Negombo',      'Colombo',   '06:00 AM', '07:00 AM', 'Every 15 mins', 'Normal')
ON CONFLICT DO NOTHING;
