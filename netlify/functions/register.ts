import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

interface RegistrationData {
  phone: string
  nni: string
  matricule: string
  fullName: string
  password: string
  userCategory: string
  specificRole: string
  wilaya: string
  moughataa: string
  school: string
  isNewSchool: boolean
}

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const data: RegistrationData = JSON.parse(event.body || '{}')
    
    // Validate required fields
    const requiredFields = ['phone', 'nni', 'matricule', 'fullName', 'password', 'userCategory', 'specificRole', 'wilaya', 'moughataa', 'school']
    
    for (const field of requiredFields) {
      if (!data[field as keyof RegistrationData]) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `${field} is required` })
        }
      }
    }

    // Validate phone number range
    const phoneNum = parseInt(data.phone)
    if (phoneNum < 22000000 || phoneNum > 49999999) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid phone number range' })
      }
    }

    // Validate NNI (numeric only)
    if (!/^\d+$/.test(data.nni)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'NNI must contain only numbers' })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`phone.eq.${data.phone},nni.eq.${data.nni},matricule.eq.${data.matricule}`)
      .single()

    if (existingUser) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'User already exists with this phone, NNI, or matricule' })
      }
    }

    // If it's a new school, add it to the schools table first
    if (data.isNewSchool) {
      const { error: schoolError } = await supabase
        .from('schools')
        .insert([{
          name: data.school,
          wilaya: data.wilaya,
          moughataa: data.moughataa,
          is_active: true
        }])

      // Ignore error if school already exists
      if (schoolError && !schoolError.message.includes('duplicate key')) {
        console.error('School creation error:', schoolError)
      }
    }

    // Insert user data
    const { data: result, error } = await supabase
      .from('users')
      .insert([{
        phone: data.phone,
        nni: data.nni,
        matricule: data.matricule,
        full_name: data.fullName,
        password_hash: hashedPassword,
        user_category: data.userCategory,
        specific_role: data.specificRole,
        wilaya: data.wilaya,
        moughataa: data.moughataa,
        school: data.school,
        is_new_school: data.isNewSchool
      }])
      .select('id')
      .single()

    if (error) {
      console.error('Database error:', error)
      
      // Handle specific database errors
      if (error.code === '23505') { // Unique constraint violation
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'User already exists with this information' })
        }
      }
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to save registration' })
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Registration successful',
        userId: result.id
      })
    }

  } catch (error) {
    console.error('Registration error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
