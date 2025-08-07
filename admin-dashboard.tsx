'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface User {
  id: string
  phone: string
  nni: string
  matricule: string
  full_name: string
  user_category: string
  specific_role: string
  wilaya: string
  moughataa: string
  school: string
  is_new_school: boolean
  created_at: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_registration_stats')

      if (error) throw error
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const exportData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('phone, nni, matricule, full_name, user_category, specific_role, wilaya, moughataa, school, created_at')
        .csv()

      if (error) throw error

      // Create and download CSV file
      const blob = new Blob([data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tedris-registrations-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Tedris Registration Dashboard</h1>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recent_registrations}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Professors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.by_category?.professeur || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.by_category?.instituteur || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Button onClick={exportData} className="mb-4">
          Export Data (CSV)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Wilaya</th>
                  <th className="text-left p-2">School</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-2">{user.full_name}</td>
                    <td className="p-2">{user.phone}</td>
                    <td className="p-2">{user.user_category}</td>
                    <td className="p-2">{user.specific_role}</td>
                    <td className="p-2">{user.wilaya}</td>
                    <td className="p-2">
                      {user.school}
                      {user.is_new_school && <span className="text-blue-600 text-xs ml-1">(New)</span>}
                    </td>
                    <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
