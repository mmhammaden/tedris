import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['phone', 'nni', 'matricule', 'fullName', 'password', 'userCategory', 'specificRole', 'wilaya', 'moughataa', 'school']
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate phone number range
    const phoneNum = parseInt(body.phone)
    if (phoneNum < 22000000 || phoneNum > 49999999) {
      return NextResponse.json(
        { error: 'Invalid phone number range' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12)

    // Store in database (replace with your actual database logic)
    const userData = {
      ...body,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    }

    // Example: Store in a JSON file (for development only)
    // In production, use a proper database
    const fs = require('fs').promises
    const path = require('path')
    
    try {
      const filePath = path.join(process.cwd(), 'data', 'users.json')
      let users = []
      
      try {
        const fileContent = await fs.readFile(filePath, 'utf8')
        users = JSON.parse(fileContent)
      } catch (error) {
        // File doesn't exist, start with empty array
      }
      
      // Check if user already exists
      const existingUser = users.find((user: any) => 
        user.phone === body.phone || user.nni === body.nni || user.matricule === body.matricule
      )
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists with this phone, NNI, or matricule' },
          { status: 409 }
        )
      }
      
      // Add new user
      const newUser = {
        id: Date.now().toString(),
        ...userData
      }
      
      users.push(newUser)
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      
      // Save to file
      await fs.writeFile(filePath, JSON.stringify(users, null, 2))
      
      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        userId: newUser.id
      })
      
    } catch (fileError) {
      console.error('File operation error:', fileError)
      return NextResponse.json(
        { error: 'Failed to save user data' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
