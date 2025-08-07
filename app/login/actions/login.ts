'use server'

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { redirect } from 'next/navigation'

// Validation schema
const loginSchema = z.object({
  phone: z.string().min(8).max(8),
  password: z.string().min(1)
})

export async function loginUser(prevState: any, formData: FormData) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return { error: 'Server configuration error' }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

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

    // Find user by phone
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone, password_hash, full_name, user_category, specific_role')
      .eq('phone', validatedData.phone)
      .single()

    if (userError || !user) {
      return { error: 'Invalid phone number or password' }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(validatedData.password, user.password_hash)
    
    if (!passwordMatch) {
      return { error: 'Invalid phone number or password' }
    }

    // In a real app, you would set up session/JWT here
    // For now, we'll just redirect to a dashboard
    
    // You could store user info in cookies or session here
    // For example, using next-auth or your own session management
    
    redirect('/dashboard')

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data' }
    }
    
    return { error: 'Login failed. Please try again.' }
  }
}
