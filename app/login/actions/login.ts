'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// Validation schema
const loginSchema = z.object({
  phone: z.string().min(8).max(8),
  password: z.string().min(1)
})

// Initialize SQLite database
function getDatabase() {
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = path.join(dataDir, 'tedris.db')
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

  return db
}

export async function loginUser(prevState: any, formData: FormData) {
  try {
    // Extract and validate data
    const rawData = {
      phone: formData.get('phone') as string,
      password: formData.get('password') as string
    }

    // Validate data
    const validatedData = loginSchema.parse(rawData)

    // Additional phone validation
    const phoneNum = parseInt(validatedData.phone)
    if (phoneNum < 22000000 || phoneNum > 49999999) {
      return { error: 'Invalid phone number range' }
    }

    // Initialize database
    const database = getDatabase()

    // Find user by phone
    const user = database.prepare(`
      SELECT id, phone, password_hash, full_name, user_category, specific_role
      FROM users 
      WHERE phone = ?
    `).get(validatedData.phone) as any

    if (!user) {
      database.close()
      return { error: 'Invalid phone number or password' }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(validatedData.password, user.password_hash)
    
    if (!passwordMatch) {
      database.close()
      return { error: 'Invalid phone number or password' }
    }

    database.close()

    // In a real app, you would set up session/JWT here
    // For now, we'll just redirect to a dashboard
    redirect('/dashboard')

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data' }
    }
    
    return { error: 'Login failed. Please try again.' }
  }
}
