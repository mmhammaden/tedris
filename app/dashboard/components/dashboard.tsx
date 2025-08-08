'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Languages, LogOut, BookOpen, Users, Calendar, Settings, Bell, User } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar')

  const labels = {
    ar: {
      title: 'لوحة التحكم - تدريس',
      welcome: 'مرحباً بك',
      quickActions: 'الإجراءات السريعة',
      courses: 'الدورات التدريبية',
      coursesDesc: 'تصفح وإدارة الدورات المتاحة',
      students: 'الطلاب',
      studentsDesc: 'إدارة بيانات الطلاب والمتدربين',
      schedule: 'الجدول الزمني',
      scheduleDesc: 'عرض وتنظيم الجدول الدراسي',
      settings: 'الإعدادات',
      settingsDesc: 'تخصيص إعدادات الحساب والمنصة',
      notifications: 'الإشعارات',
      notificationsDesc: 'عرض الإشعارات والتحديثات',
      profile: 'الملف الشخصي',
      profileDesc: 'عرض وتحديث بيانات الملف الشخصي',
      logout: 'تسجيل الخروج',
      recentActivity: 'النشاط الأخير',
      noActivity: 'لا توجد أنشطة حديثة'
    },
    fr: {
      title: 'Tableau de bord - Tedris',
      welcome: 'Bienvenue',
      quickActions: 'Actions rapides',
      courses: 'Cours',
      coursesDesc: 'Parcourir et gérer les cours disponibles',
      students: 'Étudiants',
      studentsDesc: 'Gérer les données des étudiants et apprenants',
      schedule: 'Emploi du temps',
      scheduleDesc: 'Afficher et organiser l\'emploi du temps',
      settings: 'Paramètres',
      settingsDesc: 'Personnaliser les paramètres du compte et de la plateforme',
      notifications: 'Notifications',
      notificationsDesc: 'Afficher les notifications et mises à jour',
      profile: 'Profil',
      profileDesc: 'Afficher et mettre à jour les données du profil',
      logout: 'Se déconnecter',
      recentActivity: 'Activité récente',
      noActivity: 'Aucune activité récente'
    }
  }

  const currentLabels = labels[language]
  const isRTL = language === 'ar'

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-green-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                {currentLabels.title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
              >
                <Languages className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'FR' : 'AR'}
              </Button>
              
              <Link href="/">
                <Button variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  {currentLabels.logout}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentLabels.welcome}!
          </h2>
          <p className="text-gray-600">
            {language === 'ar' 
              ? 'إليك نظرة سريعة على أنشطتك وإمكانياتك في المنصة' 
              : 'Voici un aperçu rapide de vos activités et fonctionnalités sur la plateforme'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentLabels.quickActions}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="ml-3 text-lg">
                  {currentLabels.courses}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {currentLabels.coursesDesc}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="ml-3 text-lg">
                  {currentLabels.students}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {currentLabels.studentsDesc}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="ml-3 text-lg">
                  {currentLabels.schedule}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {currentLabels.scheduleDesc}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Settings className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="ml-3 text-lg">
                  {currentLabels.settings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {currentLabels.settingsDesc}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Bell className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="ml-3 text-lg">
                  {currentLabels.notifications}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {currentLabels.notificationsDesc}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="ml-3 text-lg">
                  {currentLabels.profile}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {currentLabels.profileDesc}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentLabels.recentActivity}
          </h3>
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>{currentLabels.noActivity}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
