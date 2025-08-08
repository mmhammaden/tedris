'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import Database from 'better-sqlite3'
import path from 'path'

// Validation schema
const loginSchema = z.object({
  phone: z.string().min(8).max(8),
  password: z.string().min(1)
})

// Initialize SQLite database
function getDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'tedris.db')
  return new Database(dbPath)
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
    const db = getDatabase()

    // Find user by phone
    const user = db.prepare(`
      SELECT id, phone, password_hash, full_name, user_category, specific_role
      FROM users 
      WHERE phone = ?
    `).get(validatedData.phone) as any

    if (!user) {
      db.close()
      return { error: 'Invalid phone number or password' }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(validatedData.password, user.password_hash)
    
    if (!passwordMatch) {
      db.close()
      return { error: 'Invalid phone number or password' }
    }

    db.close()

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
