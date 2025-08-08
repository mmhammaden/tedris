'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, School, MapPin, Calendar, Download, RefreshCw } from 'lucide-react'

interface AdminStats {
  total_users: number
  by_category: Record<string, number>
  by_wilaya: Record<string, number>
  recent_registrations: number
}

interface User {
  id: number
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
  updated_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar')

  const labels = {
    ar: {
      title: 'لوحة تحكم المدير',
      totalUsers: 'إجمالي المستخدمين',
      recentRegistrations: 'التسجيلات الأخيرة (7 أيام)',
      usersByCategory: 'المستخدمون حسب الفئة',
      usersByWilaya: 'المستخدمون حسب الولاية',
      allUsers: 'جميع المستخدمين',
      refresh: 'تحديث',
      export: 'تصدير البيانات',
      phone: 'الهاتف',
      name: 'الاسم الكامل',
      category: 'الفئة',
      role: 'الدور',
      wilaya: 'الولاية',
      school: 'المدرسة',
      registrationDate: 'تاريخ التسجيل',
      loading: 'جاري التحميل...',
      noData: 'لا توجد بيانات'
    },
    fr: {
      title: 'Tableau de bord Admin',
      totalUsers: 'Total des utilisateurs',
      recentRegistrations: 'Inscriptions récentes (7 jours)',
      usersByCategory: 'Utilisateurs par catégorie',
      usersByWilaya: 'Utilisateurs par wilaya',
      allUsers: 'Tous les utilisateurs',
      refresh: 'Actualiser',
      export: 'Exporter les données',
      phone: 'Téléphone',
      name: 'Nom complet',
      category: 'Catégorie',
      role: 'Rôle',
      wilaya: 'Wilaya',
      school: 'École',
      registrationDate: 'Date d\'inscription',
      loading: 'Chargement...',
      noData: 'Aucune donnée'
    }
  }

  const t = labels[language]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch users
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Phone', 'NNI', 'Matricule', 'Full Name', 'Category', 'Role', 'Wilaya', 'Moughataa', 'School', 'Registration Date'].join(','),
      ...users.map(user => [
        user.phone,
        user.nni,
        user.matricule,
        user.full_name,
        user.user_category,
        user.specific_role,
        user.wilaya,
        user.moughataa,
        user.school,
        new Date(user.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tedris-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
            >
              {language === 'ar' ? 'Français' : 'العربية'}
            </Button>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.refresh}
            </Button>
            <Button onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              {t.export}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalUsers}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.recentRegistrations}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recent_registrations}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.usersByCategory}</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {Object.entries(stats.by_category).map(([category, count]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.usersByWilaya}</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {Object.entries(stats.by_wilaya).slice(0, 5).map(([wilaya, count]) => (
                    <div key={wilaya} className="flex justify-between text-sm">
                      <span className="truncate">{wilaya}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t.allUsers}</CardTitle>
            <CardDescription>
              {users.length > 0 ? `${users.length} utilisateurs enregistrés` : t.noData}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t.phone}</th>
                      <th className="text-left p-2">{t.name}</th>
                      <th className="text-left p-2">{t.category}</th>
                      <th className="text-left p-2">{t.role}</th>
                      <th className="text-left p-2">{t.wilaya}</th>
                      <th className="text-left p-2">{t.school}</th>
                      <th className="text-left p-2">{t.registrationDate}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono">{user.phone}</td>
                        <td className="p-2">{user.full_name}</td>
                        <td className="p-2">{user.user_category}</td>
                        <td className="p-2">{user.specific_role}</td>
                        <td className="p-2">{user.wilaya}</td>
                        <td className="p-2">{user.school}</td>
                        <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t.noData}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
