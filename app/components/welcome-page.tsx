'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Languages, UserPlus, LogIn, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default function WelcomePage() {
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar')

  const content = {
    ar: {
      title: 'مرحباً بكم في تدريس',
      subtitle: 'منصة التعليم الرقمية الموريتانية',
      description: 'منصة شاملة لإدارة التعليم والتواصل بين المعلمين والطلاب في موريتانيا',
      loginButton: 'تسجيل الدخول',
      registerButton: 'إنشاء حساب جديد',
      loginDescription: 'إذا كان لديك حساب بالفعل',
      registerDescription: 'للمستخدمين الجدد',
      features: [
        'إدارة الفصول الدراسية',
        'متابعة الطلاب',
        'التواصل مع أولياء الأمور',
        'تقارير الأداء'
      ]
    },
    fr: {
      title: 'Bienvenue sur Tedris',
      subtitle: 'Plateforme éducative numérique mauritanienne',
      description: 'Une plateforme complète pour la gestion de l\'éducation et la communication entre enseignants et étudiants en Mauritanie',
      loginButton: 'Se connecter',
      registerButton: 'Créer un compte',
      loginDescription: 'Si vous avez déjà un compte',
      registerDescription: 'Pour les nouveaux utilisateurs',
      features: [
        'Gestion des classes',
        'Suivi des étudiants',
        'Communication avec les parents',
        'Rapports de performance'
      ]
    }
  }

  const currentContent = content[language]
  const isRTL = language === 'ar'

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Switch Button */}
      <div className={`fixed top-4 ${isRTL ? 'left-4' : 'right-4'} z-10`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
          className="bg-white shadow-md"
        >
          <Languages className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'FR' : 'AR'}
        </Button>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            {currentContent.title}
          </h1>
          <p className="text-xl md:text-2xl text-blue-600 mb-6">
            {currentContent.subtitle}
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {currentContent.description}
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Login Card */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <LogIn className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                {currentContent.loginButton}
              </CardTitle>
              <p className="text-gray-600">
                {currentContent.loginDescription}
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/login">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">
                  <LogIn className="w-5 h-5 mr-2" />
                  {currentContent.loginButton}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Register Card */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <UserPlus className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                {currentContent.registerButton}
              </CardTitle>
              <p className="text-gray-600">
                {currentContent.registerDescription}
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/register">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg">
                  <UserPlus className="w-5 h-5 mr-2" />
                  {currentContent.registerButton}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
                {language === 'ar' ? 'المميزات' : 'Fonctionnalités'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {currentContent.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>&copy; 2024 Tedris - {language === 'ar' ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}</p>
        </div>
      </div>
    </div>
  )
}
