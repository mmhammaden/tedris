'use server'

import { z } from 'zod'

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

export async function submitRegistration(formData: FormData) {
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

    // Hash password before storing
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Store in database (example with a hypothetical database)
    const user = await db.user.create({
      data: {
        phone: validatedData.phone,
        nni: validatedData.nni,
        matricule: validatedData.matricule,
        fullName: validatedData.fullName,
        password: hashedPassword,
        userCategory: validatedData.userCategory,
        specificRole: validatedData.specificRole,
        wilaya: validatedData.wilaya,
        moughataa: validatedData.moughataa,
        school: validatedData.school,
        isNewSchool: validatedData.isNewSchool,
        createdAt: new Date()
      }
    })

    return { 
      success: true, 
      message: 'Registration successful',
      userId: user.id 
    }

  } catch (error) {
    console.error('Registration error:', error)
    return { 
      success: false, 
      message: 'Registration failed. Please try again.' 
    }
  }
}
