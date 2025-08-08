'use client'

import { useState, useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Phone, Lock, ArrowLeft, Globe } from 'lucide-react'
import Link from 'next/link'
import { loginUser } from '../actions/login'

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar')
  const [state, formAction, isPending] = useActionState(loginUser, null)

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'fr' : 'ar')
  }

  const text = {
    ar: {
      title: 'تسجيل الدخول',
      subtitle: 'ادخل إلى حسابك في منصة تدريس',
      phone: 'رقم الهاتف',
      phonePlaceholder: 'أدخل رقم هاتفك',
      password: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      login: 'تسجيل الدخول',
      noAccount: 'ليس لديك حساب؟',
      register: 'إنشاء حساب جديد',
      backToHome: 'العودة للرئيسية',
      loggingIn: 'جاري تسجيل الدخول...'
    },
    fr: {
      title: 'Connexion',
      subtitle: 'Connectez-vous à votre compte Tedris',
      phone: 'Numéro de téléphone',
      phonePlaceholder: 'Entrez votre numéro',
      password: 'Mot de passe',
      passwordPlaceholder: 'Entrez votre mot de passe',
      login: 'Se connecter',
      noAccount: "Vous n'avez pas de compte ?",
      register: 'Créer un compte',
      backToHome: "Retour à l'accueil",
      loggingIn: 'Connexion en cours...'
    }
  }

  const currentText = text[language]
  const isRTL = language === 'ar'

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">ت</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">تدريس</h1>
          </div>
          
          {/* Language Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="mb-4"
          >
            <Globe className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'Français' : 'العربية'}
          </Button>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {currentText.title}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {currentText.subtitle}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  {currentText.phone}
                </Label>
                <div className="relative">
                  <Phone className={`absolute top-3 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    maxLength={8}
                    placeholder={currentText.phonePlaceholder}
                    className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} h-12`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {currentText.password}
                </Label>
                <div className="relative">
                  <Lock className={`absolute top-3 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={currentText.passwordPlaceholder}
                    className={`${isRTL ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10'} h-12`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-3 w-5 h-5 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isPending ? currentText.loggingIn : currentText.login}
              </Button>
            </form>

            {/* Links */}
            <div className="space-y-4 pt-4 border-t">
              <div className="text-center">
                <span className="text-sm text-gray-600">{currentText.noAccount} </span>
                <Link 
                  href="/register" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  {currentText.register}
                </Link>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/" 
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-1 rotate-180' : 'mr-1'}`} />
                  {currentText.backToHome}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
