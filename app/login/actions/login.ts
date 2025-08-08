'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import Database from 'better-sqlite3'
import path from 'path'

// Define validation schema
const loginSchema = z.object({
  phone: z.string().min(8).max(8),
  password: z.string().min(1)
})

// Initialize SQLite database
function getDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'tedris.db')
  return new Database(dbPath)
}

export async function submitLogin(prevState: any, formData: FormData) {
  try {
    // Extract and validate data
    const data = {
      phone: formData.get('phone') as string,
      password: formData.get('password') as string
    }

    // Validate data
    const validatedData = loginSchema.parse(data)

    // Additional phone validation
    const phoneNum = parseInt(validatedData.phone)
    if (phoneNum < 22000000 || phoneNum > 49999999) {
      return { error: 'Invalid phone number range' }
    }

    // Initialize database
    const db = getDatabase()

    // Find user by phone
    const user = db.prepare(`
      SELECT id, phone, full_name, password_hash, user_category, specific_role
      FROM users 
      WHERE phone = ?
    `).get(validatedData.phone) as any

    db.close()

    if (!user) {
      return { error: 'Invalid phone number or password' }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password_hash)

    if (!isValidPassword) {
      return { error: 'Invalid phone number or password' }
    }

    // In a real app, you would set up proper session management here
    // For now, we'll just redirect to dashboard
    redirect('/dashboard')

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data' }
    }
    
    return { error: 'Login failed. Please try again.' }
  }
}
