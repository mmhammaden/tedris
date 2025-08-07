'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Languages, ArrowLeft, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useActionState } from 'react'
import { loginUser } from '../actions/login'

interface FormData {
  phone: string
  password: string
}

interface FormErrors {
  [key: string]: string
}

export default function LoginForm() {
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [state, formAction, isPending] = useActionState(loginUser, null)

  const labels = {
    ar: {
      title: 'تسجيل الدخول - تدريس',
      phone: 'رقم الهاتف',
      password: 'كلمة المرور',
      login: 'تسجيل الدخول',
      backToHome: 'العودة للرئيسية',
      phonePlaceholder: 'أدخل رقم الهاتف',
      passwordPlaceholder: 'أدخل كلمة المرور',
      noAccount: 'ليس لديك حساب؟',
      createAccount: 'إنشاء حساب جديد',
      forgotPassword: 'نسيت كلمة المرور؟'
    },
    fr: {
      title: 'Connexion - Tedris',
      phone: 'Numéro de téléphone',
      password: 'Mot de passe',
      login: 'Se connecter',
      backToHome: 'Retour à l\'accueil',
      phonePlaceholder: 'Entrez le numéro de téléphone',
      passwordPlaceholder: 'Entrez le mot de passe',
      noAccount: 'Pas de compte ?',
      createAccount: 'Créer un compte',
      forgotPassword: 'Mot de passe oublié ?'
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Phone validation
    const phoneNum = parseInt(formData.phone)
    if (!formData.phone) {
      newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Numéro de téléphone requis'
    } else if (phoneNum < 22000000 || phoneNum > 49999999) {
      newErrors.phone = language === 'ar' ? 'رقم الهاتف يجب أن يكون بين 22000000 و 49999999' : 'Le numéro doit être entre 22000000 et 49999999'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = language === 'ar' ? 'كلمة المرور مطلوبة' : 'Mot de passe requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (formDataObj: FormData) => {
    if (validateForm()) {
      formAction(formDataObj)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const currentLabels = labels[language]
  const isRTL = language === 'ar'

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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

      {/* Back to Home Button */}
      <div className={`fixed top-4 ${isRTL ? 'right-4' : 'left-4'} z-10`}>
        <Link href="/">
          <Button variant="outline" size="sm" className="bg-white shadow-md">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentLabels.backToHome}
          </Button>
        </Link>
      </div>

      <div className="max-w-md mx-auto pt-20">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 p-3 rounded-full">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {currentLabels.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  {currentLabels.phone}
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={currentLabels.phonePlaceholder}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {currentLabels.password}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={currentLabels.passwordPlaceholder}
                    className={`${errors.password ? 'border-red-500' : ''} ${isRTL ? 'pl-10' : 'pr-10'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'}`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
              </div>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  {currentLabels.forgotPassword}
                </button>
              </div>

              {state?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {state.error}
                </div>
              )}

              {state?.success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  {language === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Connexion réussie!'}
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 text-lg"
              >
                {isPending 
                  ? (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Connexion...') 
                  : currentLabels.login
                }
              </Button>

              {/* Register Link */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  {currentLabels.noAccount}
                </p>
                <Link href="/register">
                  <Button variant="outline" className="w-full">
                    {currentLabels.createAccount}
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
