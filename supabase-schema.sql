-- NIDDLE Database Schema for Supabase PostgreSQL

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'staff',
  email_verified BOOLEAN DEFAULT false,
  email_verify_token TEXT,
  created_at TEXT NOT NULL,
  notif_settings JSONB DEFAULT '{"email":true,"sms":false,"push":true}'
);

-- 2. Deliveries
CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  package_type TEXT NOT NULL,
  package_size TEXT NOT NULL,
  handling TEXT DEFAULT 'None',
  description TEXT DEFAULT '',
  weight TEXT DEFAULT '',
  value TEXT DEFAULT '',
  special_instructions TEXT DEFAULT '',
  rider_name TEXT DEFAULT '',
  time_slot TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  negotiation_status TEXT,
  rider_id INTEGER,
  status TEXT NOT NULL DEFAULT 'order-placed',
  created_at TEXT NOT NULL,
  delivered_at TEXT,
  received_by TEXT,
  proof_note TEXT
);

-- 3. Receive Requests
CREATE TABLE IF NOT EXISTS receive_requests (
  id TEXT PRIMARY KEY,
  package_type TEXT NOT NULL,
  description TEXT DEFAULT '',
  delivery_pref TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  preferred_time TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  negotiated_price NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending'
);

-- 4. Riders
CREATE TABLE IF NOT EXISTS riders (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  rating NUMERIC NOT NULL DEFAULT 4.5,
  rides INTEGER NOT NULL DEFAULT 0,
  badge TEXT DEFAULT '',
  active BOOLEAN DEFAULT true
);

-- 5. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TEXT NOT NULL
);

-- 6. Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT DEFAULT '',
  is_default BOOLEAN DEFAULT false
);

-- 7. Payments
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delivery_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  method TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL
);

-- 8. Rider Locations
CREATE TABLE IF NOT EXISTS rider_locations (
  rider_id INTEGER PRIMARY KEY,
  rider_name TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  heading NUMERIC,
  speed NUMERIC,
  updated_at TEXT NOT NULL
);

-- 9. Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TEXT NOT NULL
);

-- Insert default riders
INSERT INTO riders (id, name, rating, rides, badge, active) VALUES
  (1, 'Chidi O.', 4.9, 342, 'Top Rider', true),
  (2, 'Amara K.', 4.8, 287, 'Fast', true),
  (3, 'Femi A.', 4.7, 198, 'Eco', true),
  (4, 'Zainab B.', 4.9, 415, 'Top Rider', true)
ON CONFLICT (id) DO NOTHING;
