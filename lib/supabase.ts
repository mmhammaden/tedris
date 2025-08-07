import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface UserRegistration {
  phone: string
  nni: string
  matricule: string
  full_name: string
  password_hash: string
  user_category: string
  specific_role: string
  wilaya: string
  moughataa: string
  school: string
  is_new_school: boolean
  created_at?: string
}

export async function registerUser(userData: UserRegistration) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data[0]
}
