'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import Database from 'better-sqlite3'
import path from 'path'

// Define validation schema
const registrationSchema = z.object({
  phone: z.string().min(8).max(8),
  nni: z.string().min(1),
  matricule: z.string().min(1),
  fullName: z.string().min(1),
  password: z.string().min(6),
  userCategory: z.string(),
  specificRole: z.string(),
  wilaya: z.string(),
  moughataa: z.string(),
  school: z.string(),
  isNewSchool: z.boolean()
})

// Initialize SQLite database
function getDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'tedris.db')
  const db = new Database(dbPath)
  
  // Create users table if it doesn't exist
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

  // Create schools table if it doesn't exist
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

  return db
}

export async function submitRegistration(prevState: any, formData: FormData) {
  try {
    // Extract and validate data
    const data = {
      phone: formData.get('phone') as string,
      nni: formData.get('nni') as string,
      matricule: formData.get('matricule') as string,
      fullName: formData.get('fullName') as string,
      password: formData.get('password') as string,
      userCategory: formData.get('userCategory') as string,
      specificRole: formData.get('specificRole') as string,
      wilaya: formData.get('wilaya') as string,
      moughataa: formData.get('moughataa') as string,
      school: formData.get('school') as string,
      isNewSchool: formData.get('isNewSchool') === 'true'
    }

    // Validate data
    const validatedData = registrationSchema.parse(data)

    // Additional phone validation
    const phoneNum = parseInt(validatedData.phone)
    if (phoneNum < 22000000 || phoneNum > 49999999) {
      return { error: 'Invalid phone number range' }
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Initialize database
    const db = getDatabase()

    // Check if user already exists
    const existingUser = db.prepare(`
      SELECT phone, nni, matricule FROM users 
      WHERE phone = ? OR nni = ? OR matricule = ?
    `).get(validatedData.phone, validatedData.nni, validatedData.matricule)

    if (existingUser) {
      db.close()
      return { error: 'User already exists with this phone, NNI, or matricule' }
    }

    // Insert new user
    const insertUser = db.prepare(`
      INSERT INTO users (
        phone, nni, matricule, full_name, password_hash,
        user_category, specific_role, wilaya, moughataa, school, is_new_school
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = insertUser.run(
      validatedData.phone,
      validatedData.nni,
      validatedData.matricule,
      validatedData.fullName,
      hashedPassword,
      validatedData.userCategory,
      validatedData.specificRole,
      validatedData.wilaya,
      validatedData.moughataa,
      validatedData.school,
      validatedData.isNewSchool ? 1 : 0
    )

    db.close()

    if (result.changes > 0) {
      // Redirect to login page after successful registration
      redirect('/login?message=Registration successful! Please login.')
    } else {
      return { error: 'Registration failed. Please try again.' }
    }

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data' }
    }
    
    return { error: 'Registration failed. Please try again.' }
  }
}
