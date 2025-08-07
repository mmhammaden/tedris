-- Create users table for Tedris registration
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_nni ON users(nni);
CREATE INDEX idx_users_matricule ON users(matricule);
CREATE INDEX idx_users_wilaya ON users(wilaya);
CREATE INDEX idx_users_school ON users(school);

-- Create schools table for managing school data
CREATE TABLE IF NOT EXISTS schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  wilaya VARCHAR(100) NOT NULL,
  moughataa VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample schools
INSERT INTO schools (name, wilaya, moughataa) VALUES
('مدرسة النور الابتدائية', 'نواكشوط الشمالية', 'دار النعيم'),
('مدرسة الأمل الثانوية', 'نواكشوط الجنوبية', 'عرفات'),
('مدرسة المستقبل', 'الترارزة', 'روصو'),
('مدرسة الرسالة', 'أدرار', 'أطار'),
('مدرسة الفجر', 'الحوض الشرقي', 'النعمة');
