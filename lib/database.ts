import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// Initialize SQLite database
export function getDatabase() {
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = path.join(dataDir, 'tedris.db')
  const db = new Database(dbPath)
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON')
  
  return db
}

// Initialize database tables
export function initializeDatabase() {
  const db = getDatabase()
  
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      nni TEXT UNIQUE NOT NULL,
      matricule TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      user_category TEXT NOT NULL,
      specific_role TEXT NOT NULL,
      wilaya TEXT NOT NULL,
      moughataa TEXT NOT NULL,
      school TEXT NOT NULL,
      is_new_school BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create schools table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      wilaya TEXT NOT NULL,
      moughataa TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_users_nni ON users(nni);
    CREATE INDEX IF NOT EXISTS idx_users_matricule ON users(matricule);
    CREATE INDEX IF NOT EXISTS idx_users_wilaya ON users(wilaya);
    CREATE INDEX IF NOT EXISTS idx_users_school ON users(school);
    CREATE INDEX IF NOT EXISTS idx_schools_wilaya ON schools(wilaya);
    CREATE INDEX IF NOT EXISTS idx_schools_moughataa ON schools(moughataa);
    CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
  `)

  // Insert sample schools if table is empty
  const schoolCount = db.prepare('SELECT COUNT(*) as count FROM schools').get() as { count: number }
  if (schoolCount.count === 0) {
    const insertSchool = db.prepare(`
      INSERT INTO schools (name, wilaya, moughataa) VALUES (?, ?, ?)
    `)
    
    const schools = [
      ['مدرسة النور الابتدائية', 'نواكشوط الشمالية', 'دار النعيم'],
      ['مدرسة الأمل الثانوية', 'نواكشوط الجنوبية', 'عرفات'],
      ['مدرسة المستقبل', 'الترارزة', 'روصو'],
      ['مدرسة الرسالة', 'أدرار', 'أطار'],
      ['مدرسة الفجر', 'الحوض الشرقي', 'النعمة'],
      ['مدرسة الهدى', 'الحوض الغربي', 'العيون'],
      ['مدرسة التقوى', 'العصابة', 'كيفة'],
      ['مدرسة الإيمان', 'كوركول', 'سيلبابي'],
      ['مدرسة الصلاح', 'كيدي ماغا', 'كيدي ماغا'],
      ['مدرسة النجاح', 'البراكنة', 'ألاك']
    ]
    
    schools.forEach(school => {
      try {
        insertSchool.run(school[0], school[1], school[2])
      } catch (error) {
        // Ignore duplicate entries
      }
    })
  }

  db.close()
}

// Get registration statistics
export function getRegistrationStats() {
  const db = getDatabase()
  
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  
  const byCategory = db.prepare(`
    SELECT user_category, COUNT(*) as count 
    FROM users 
    GROUP BY user_category
  `).all() as Array<{ user_category: string; count: number }>
  
  const byWilaya = db.prepare(`
    SELECT wilaya, COUNT(*) as count 
    FROM users 
    GROUP BY wilaya 
    ORDER BY count DESC 
    LIMIT 10
  `).all() as Array<{ wilaya: string; count: number }>
  
  const recentRegistrations = db.prepare(`
    SELECT COUNT(*) as count 
    FROM users 
    WHERE created_at >= datetime('now', '-7 days')
  `).get() as { count: number }
  
  db.close()
  
  return {
    total_users: totalUsers.count,
    by_category: byCategory.reduce((acc, item) => {
      acc[item.user_category] = item.count
      return acc
    }, {} as Record<string, number>),
    by_wilaya: byWilaya.reduce((acc, item) => {
      acc[item.wilaya] = item.count
      return acc
    }, {} as Record<string, number>),
    recent_registrations: recentRegistrations.count
  }
}

// Get all users (for admin)
export function getAllUsers() {
  const db = getDatabase()
  
  const users = db.prepare(`
    SELECT id, phone, nni, matricule, full_name, user_category, 
           specific_role, wilaya, moughataa, school, is_new_school, 
           created_at, updated_at
    FROM users 
    ORDER BY created_at DESC
  `).all()
  
  db.close()
  
  return users
}

// Get schools by wilaya and moughataa
export function getSchools(wilaya?: string, moughataa?: string) {
  const db = getDatabase()
  
  let query = 'SELECT * FROM schools WHERE is_active = 1'
  const params: string[] = []
  
  if (wilaya) {
    query += ' AND wilaya = ?'
    params.push(wilaya)
  }
  
  if (moughataa) {
    query += ' AND moughataa = ?'
    params.push(moughataa)
  }
  
  query += ' ORDER BY name'
  
  const schools = db.prepare(query).all(...params)
  
  db.close()
  
  return schools
}
