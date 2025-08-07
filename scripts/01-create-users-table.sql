-- Create users table for Tedris registration
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(8) UNIQUE NOT NULL,
  nni VARCHAR(20) UNIQUE NOT NULL,
  matricule VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_category VARCHAR(50) NOT NULL,
  specific_role VARCHAR(100) NOT NULL,
  wilaya VARCHAR(100) NOT NULL,
  moughataa VARCHAR(100) NOT NULL,
  school VARCHAR(255) NOT NULL,
  is_new_school BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_nni ON users(nni);
CREATE INDEX IF NOT EXISTS idx_users_matricule ON users(matricule);
CREATE INDEX IF NOT EXISTS idx_users_wilaya ON users(wilaya);
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for registration)
CREATE POLICY "Allow registration inserts" ON users
  FOR INSERT WITH CHECK (true);

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);
