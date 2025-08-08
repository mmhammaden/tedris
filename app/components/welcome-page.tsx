'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Languages, UserPlus, LogIn, BookOpen, Users, Award, Globe } from 'lucide-react'
import Link from 'next/link'

export default function WelcomePage() {
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar')

  const labels = {
    ar: {
      title: 'مرحباً بكم في تدريس',
      subtitle: 'منصة التعليم الرقمية الشاملة',
      description: 'انضموا إلى منصة تدريس لتجربة تعليمية متميزة تجمع بين التقنية الحديثة والمحتوى التعليمي عالي الجودة',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب جديد',
      loginDesc: 'لديك حساب بالفعل؟ سجل دخولك الآن',
      registerDesc: 'مستخدم جديد؟ أنشئ حسابك مجاناً',
      features: 'مميزات المنصة',
      feature1: 'محتوى تعليمي متنوع',
      feature1Desc: 'مناهج شاملة تغطي جميع المراحل التعليمية',
      feature2: 'تفاعل مباشر',
      feature2Desc: 'تواصل مع المعلمين والطلاب في بيئة تفاعلية',
      feature3: 'شهادات معتمدة',
      feature3Desc: 'احصل على شهادات معتمدة عند إتمام الدورات',
      feature4: 'وصول عالمي',
      feature4Desc: 'تعلم من أي مكان وفي أي وقت يناسبك'
    },
    fr: {
      title: 'Bienvenue sur Tedris',
      subtitle: 'Plateforme éducative numérique complète',
      description: 'Rejoignez Tedris pour une expérience éducative exceptionnelle alliant technologie moderne et contenu pédagogique de haute qualité',
      login: 'Se connecter',
      register: 'Créer un compte',
      loginDesc: 'Vous avez déjà un compte ? Connectez-vous maintenant',
      registerDesc: 'Nouvel utilisateur ? Créez votre compte gratuitement',
      features: 'Fonctionnalités de la plateforme',
      feature1: 'Contenu éducatif diversifié',
      feature1Desc: 'Programmes complets couvrant tous les niveaux éducatifs',
      feature2: 'Interaction directe',
      feature2Desc: 'Communiquez avec les enseignants et étudiants dans un environnement interactif',
      feature3: 'Certificats accrédités',
      feature3Desc: 'Obtenez des certificats accrédités à la fin des cours',
      feature4: 'Accès mondial',
      feature4Desc: 'Apprenez de n\'importe où et à tout moment qui vous convient'
    }
  }

  const currentLabels = labels[language]
  const isRTL = language === 'ar'

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-full">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            {currentLabels.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-6">
            {currentLabels.subtitle}
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-12">
            {currentLabels.description}
          </p>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <LogIn className="w-12 h-12" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  {currentLabels.login}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-green-100">
                  {currentLabels.loginDesc}
                </p>
                <Link href="/login">
                  <Button size="lg" variant="secondary" className="w-full text-green-600 hover:text-green-700">
                    {currentLabels.login}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <UserPlus className="w-12 h-12" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  {currentLabels.register}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-blue-100">
                  {currentLabels.registerDesc}
                </p>
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="w-full text-blue-600 hover:text-blue-700">
                    {currentLabels.register}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            {currentLabels.features}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <BookOpen className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {currentLabels.feature1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {currentLabels.feature1Desc}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {currentLabels.feature2}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {currentLabels.feature2Desc}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {currentLabels.feature3}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {currentLabels.feature3Desc}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Globe className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {currentLabels.feature4}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {currentLabels.feature4Desc}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <p>&copy; 2024 Tedris. جميع الحقوق محفوظة - Tous droits réservés</p>
        </div>
      </div>
    </div>
  )
}
