CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'owner', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parking_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parking_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES parking_locations(id) ON DELETE CASCADE,
    slot_number VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(location_id, slot_number)
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    slot_id UUID REFERENCES parking_slots(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status booking_status DEFAULT 'confirmed',
    qr_code_hash TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_timespan CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_bookings_availability ON bookings (slot_id, start_time, end_time);

INSERT INTO users (id, email, full_name, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'customer@parkease.com', 'Demo Customer', 'customer'),
  ('00000000-0000-0000-0000-000000000002', 'owner@parkease.com', 'Demo Owner', 'owner')
ON CONFLICT (id) DO NOTHING;

INSERT INTO parking_locations (id, owner_id, name, address, hourly_rate)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'Central Campus Lot A', 'Block 4 Main Boulevard', 15.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO parking_slots (location_id, slot_number, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'A-01', TRUE),
  ('11111111-1111-1111-1111-111111111111', 'A-02', TRUE),
  ('11111111-1111-1111-1111-111111111111', 'A-03', TRUE),
  ('11111111-1111-1111-1111-111111111111', 'B-01', TRUE),
  ('11111111-1111-1111-1111-111111111111', 'B-02', TRUE),
  ('11111111-1111-1111-1111-111111111111', 'B-03', TRUE)
ON CONFLICT DO NOTHING;
