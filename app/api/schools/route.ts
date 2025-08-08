import { NextResponse } from 'next/server'
import { getSchools } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wilaya = searchParams.get('wilaya') || undefined
    const moughataa = searchParams.get('moughataa') || undefined
    
    const schools = getSchools(wilaya, moughataa)
    return NextResponse.json(schools)
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    )
  }
}
