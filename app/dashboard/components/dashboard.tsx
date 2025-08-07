'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Languages, LogOut, User, Settings, BookOpen, Users } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar')

  const content = {
    ar: {
      title: 'لوحة التحكم - تدريس',
      welcome: 'مرحباً بك',
      logout: 'تسجيل الخروج',
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
      classes: 'الفصول الدراسية',
      students: 'الطلاب',
      quickActions: 'الإجراءات السريعة',
      viewProfile: 'عرض الملف الشخصي',
      manageClasses: 'إدارة الفصول',
      viewStudents: 'عرض الطلاب',
      systemSettings: 'إعدادات النظام'
    },
    fr: {
      title: 'Tableau de bord - Tedris',
      welcome: 'Bienvenue',
      logout: 'Se déconnecter',
      profile: 'Profil',
      settings: 'Paramètres',
      classes: 'Classes',
      students: 'Étudiants',
      quickActions: 'Actions rapides',
      viewProfile: 'Voir le profil',
      manageClasses: 'Gérer les classes',
      viewStudents: 'Voir les étudiants',
      systemSettings: 'Paramètres système'
    }
  }

  const currentContent = content[language]
  const isRTL = language === 'ar'

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-blue-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {currentContent.title}
            </h1>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Language Switch */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
              >
                <Languages className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'FR' : 'AR'}
              </Button>
              
              {/* Logout */}
              <Link href="/">
                <Button variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  {currentContent.logout}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardContent className="p-6">
              <h2 className="text-3xl font-bold mb-2">
                {currentContent.welcome}!
              </h2>
              <p className="text-blue-100">
                {language === 'ar' 
                  ? 'مرحباً بك في منصة تدريس التعليمية' 
                  : 'Bienvenue sur la plateforme éducative Tedris'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {currentContent.quickActions}
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Profile Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-lg">
                  {currentContent.profile}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  {currentContent.viewProfile}
                </Button>
              </CardContent>
            </Card>

            {/* Classes Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-lg">
                  {currentContent.classes}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  {currentContent.manageClasses}
                </Button>
              </CardContent>
            </Card>

            {/* Students Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-lg">
                  {currentContent.students}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  {currentContent.viewStudents}
                </Button>
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <Settings className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <CardTitle className="text-lg">
                  {currentContent.settings}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  {currentContent.systemSettings}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {language === 'ar' ? 'النشاط الأخير' : 'Activité récente'}
          </h3>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <p>
                  {language === 'ar' 
                    ? 'لا توجد أنشطة حديثة' 
                    : 'Aucune activité récente'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
