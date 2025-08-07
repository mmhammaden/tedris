-- Create schools table for managing school data
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  wilaya VARCHAR(100) NOT NULL,
  moughataa VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_schools_wilaya ON schools(wilaya);
CREATE INDEX IF NOT EXISTS idx_schools_moughataa ON schools(moughataa);
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read schools (for the dropdown)
CREATE POLICY "Allow public read access to schools" ON schools
  FOR SELECT USING (is_active = true);

-- Insert sample schools
INSERT INTO schools (name, wilaya, moughataa) VALUES
('مدرسة النور الابتدائية', 'نواكشوط الشمالية', 'دار النعيم'),
('مدرسة الأمل الثانوية', 'نواكشوط الجنوبية', 'عرفات'),
('مدرسة المستقبل', 'الترارزة', 'روصو'),
('مدرسة الرسالة', 'أدرار', 'أطار'),
('مدرسة الفجر', 'الحوض الشرقي', 'النعمة'),
('مدرسة الهدى', 'الحوض الغربي', 'العيون'),
('مدرسة التقوى', 'العصابة', 'كيفة'),
('مدرسة الإيمان', 'كوركول', 'سيلبابي'),
('مدرسة الصلاح', 'كيدي ماغا', 'كيدي ماغا'),
('مدرسة النجاح', 'البراكنة', 'ألاك')
ON CONFLICT (name) DO NOTHING;
