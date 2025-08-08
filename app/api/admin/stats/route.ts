import { NextResponse } from 'next/server'
import { getRegistrationStats } from '@/lib/database'

export async function GET() {
  try {
    const stats = getRegistrationStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
