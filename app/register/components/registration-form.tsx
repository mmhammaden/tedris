'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Languages, ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { submitRegistration } from '../actions/registration'
import { useActionState } from 'react'

interface FormData {
  phone: string
  nni: string
  matricule: string
  fullName: string
  password: string
  confirmPassword: string
  userCategory: string
  specificRole: string
  wilaya: string
  moughataa: string
  school: string
  isNewSchool: boolean
}

interface FormErrors {
  [key: string]: string
}

export default function RegistrationForm() {
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    nni: '',
    matricule: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    userCategory: '',
    specificRole: '',
    wilaya: '',
    moughataa: '',
    school: '',
    isNewSchool: false
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [state, formAction, isPending] = useActionState(submitRegistration, null)

  const labels = {
    ar: {
      title: 'تسجيل جديد - تدريس',
      phone: 'رقم الهاتف',
      nni: 'رقم التعريف الوطني',
      matricule: 'الرقم الوظيفي',
      fullName: 'الاسم الكامل',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      userCategory: 'فئة المستخدم',
      specificRole: 'الدور المحدد',
      wilaya: 'الولاية',
      moughataa: 'المقاطعة',
      school: 'المدرسة',
      newSchool: 'مدرسة جديدة',
      existingSchool: 'مدرسة موجودة',
      register: 'تسجيل',
      backToHome: 'العودة للرئيسية',
      phonePlaceholder: 'أدخل رقم الهاتف',
      nniPlaceholder: 'أدخل رقم التعريف الوطني',
      matriculePlaceholder: 'أدخل الرقم الوظيفي',
      fullNamePlaceholder: 'أدخل الاسم الكامل',
      passwordPlaceholder: 'أدخل كلمة المرور',
      confirmPasswordPlaceholder: 'أكد كلمة المرور',
      schoolPlaceholder: 'أدخل اسم المدرسة',
      haveAccount: 'لديك حساب بالفعل؟',
      loginLink: 'تسجيل الدخول'
    },
    fr: {
      title: 'Inscription - Tedris',
      phone: 'Numéro de téléphone',
      nni: 'Numéro National d\'Identité',
      matricule: 'Matricule',
      fullName: 'Nom complet',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      userCategory: 'Catégorie d\'utilisateur',
      specificRole: 'Rôle spécifique',
      wilaya: 'Wilaya',
      moughataa: 'Moughataa',
      school: 'École',
      newSchool: 'Nouvelle école',
      existingSchool: 'École existante',
      register: 'S\'inscrire',
      backToHome: 'Retour à l\'accueil',
      phonePlaceholder: 'Entrez le numéro de téléphone',
      nniPlaceholder: 'Entrez le NNI',
      matriculePlaceholder: 'Entrez le matricule',
      fullNamePlaceholder: 'Entrez le nom complet',
      passwordPlaceholder: 'Entrez le mot de passe',
      confirmPasswordPlaceholder: 'Confirmez le mot de passe',
      schoolPlaceholder: 'Entrez le nom de l\'école',
      haveAccount: 'Vous avez déjà un compte ?',
      loginLink: 'Se connecter'
    }
  }

  const userCategories = {
    ar: [
      { value: 'professeur', label: 'أستاذ' },
      { value: 'instituteur', label: 'معلم' },
      { value: 'direction', label: 'الإدارة' }
    ],
    fr: [
      { value: 'professeur', label: 'Professeur' },
      { value: 'instituteur', label: 'Instituteur' },
      { value: 'direction', label: 'Direction' }
    ]
  }

  const specificRoles = {
    professeur: {
      ar: [
        { value: 'prof_1er_cycle', label: 'أستاذ تعليم أساسي' },
        { value: 'prof_2e_cycle', label: 'أستاذ تعليم إعدادي' }
      ],
      fr: [
        { value: 'prof_1er_cycle', label: 'Professeur 1er cycle' },
        { value: 'prof_2e_cycle', label: 'Professeur 2e cycle' }
      ]
    },
    instituteur: {
      ar: [
        { value: 'inst_arabe', label: 'معلم لغة عربية' },
        { value: 'inst_francais', label: 'معلم لغة فرنسية' },
        { value: 'inst_bilingue', label: 'معلم مزدوج' }
      ],
      fr: [
        { value: 'inst_arabe', label: 'Instituteur Arabe' },
        { value: 'inst_francais', label: 'Instituteur Français' },
        { value: 'inst_bilingue', label: 'Instituteur Bilingue' }
      ]
    },
    direction: {
      ar: [
        { value: 'dir_general', label: 'المدير العام' },
        { value: 'dir_etudes', label: 'المدير الدراسي' },
        { value: 'surveillant', label: 'المراقب العام' }
      ],
      fr: [
        { value: 'dir_general', label: 'Directeur Général' },
        { value: 'dir_etudes', label: 'Directeur d\'Études' },
        { value: 'surveillant', label: 'Surveillant Général' }
      ]
    }
  }

  const wilayas = [
    'الحوض الشرقي', 'الحوض الغربي', 'العصابة', 'كوركول', 'كيدي ماغا',
    'البراكنة', 'الترارزة', 'أدرار', 'داخلت نواذيبو', 'تكانت',
    'كيدي', 'تيرس زمور', 'إنشيري', 'نواكشوط الشمالية', 'نواكشوط الجنوبية'
  ]

  const moughataas: { [key: string]: string[] } = {
    'الحوض الشرقي': ['النعمة', 'الباسكنو', 'فصالة', 'تمبدغة'],
    'الحوض الغربي': ['العيون', 'كوبني', 'تامشكط', 'كنكوصة'],
    'العصابة': ['كيفة', 'العصابة', 'أمورج', 'بوستيلة'],
    'كوركول': ['سيلبابي', 'مقطع لحجار', 'كاوري', 'لكصر'],
    'كيدي ماغا': ['كيدي ماغا', 'بوكي', 'مالي', 'ولد يونس'],
    'البراكنة': ['ألاك', 'أفديرك', 'بوكي', 'مقطع لحجار'],
    'الترارزة': ['روصو', 'مدردرة', 'بوتلميت', 'كور'],
    'أدرار': ['أطار', 'شنقيط', 'وادان', 'أوجفت'],
    'داخلت نواذيبو': ['نواذيبو', 'شامي', 'بنشاب'],
    'تكانت': ['تكانت', 'تجكجة', 'أزويرات', 'فديرك'],
    'كيدي': ['كيدي', 'لعصابة', 'مولاي إدريس'],
    'تيرس زمور': ['زويرات', 'فديرك', 'بير أم كرين'],
    'إنشيري': ['أكجوجت', 'بنشاب', 'أوجفت'],
    'نواكشوط الشمالية': ['دار النعيم', 'تيارت', 'توجنين'],
    'نواكشوط الجنوبية': ['عرفات', 'الرياض', 'السبخة']
  }

  const existingSchools = [
    'مدرسة النور الابتدائية',
    'مدرسة الأمل الثانوية',
    'مدرسة المستقبل',
    'مدرسة الرسالة',
    'مدرسة الفجر'
  ]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Phone validation
    const phoneNum = parseInt(formData.phone)
    if (!formData.phone) {
      newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Numéro de téléphone requis'
    } else if (phoneNum < 22000000 || phoneNum > 49999999) {
      newErrors.phone = language === 'ar' ? 'رقم الهاتف يجب أن يكون بين 22000000 و 49999999' : 'Le numéro doit être entre 22000000 et 49999999'
    }

    // NNI validation
    if (!formData.nni) {
      newErrors.nni = language === 'ar' ? 'رقم التعريف الوطني مطلوب' : 'NNI requis'
    } else if (!/^\d+$/.test(formData.nni)) {
      newErrors.nni = language === 'ar' ? 'رقم التعريف الوطني يجب أن يكون أرقام فقط' : 'NNI doit contenir uniquement des chiffres'
    }

    // Required fields
    if (!formData.matricule) newErrors.matricule = language === 'ar' ? 'الرقم الوظيفي مطلوب' : 'Matricule requis'
    if (!formData.fullName) newErrors.fullName = language === 'ar' ? 'الاسم الكامل مطلوب' : 'Nom complet requis'
    if (!formData.password) newErrors.password = language === 'ar' ? 'كلمة المرور مطلوبة' : 'Mot de passe requis'
    if (!formData.confirmPassword) newErrors.confirmPassword = language === 'ar' ? 'تأكيد كلمة المرور مطلوب' : 'Confirmation requise'
    if (!formData.userCategory) newErrors.userCategory = language === 'ar' ? 'فئة المستخدم مطلوبة' : 'Catégorie requise'
    if (!formData.specificRole) newErrors.specificRole = language === 'ar' ? 'الدور المحدد مطلوب' : 'Rôle spécifique requis'
    if (!formData.wilaya) newErrors.wilaya = language === 'ar' ? 'الولاية مطلوبة' : 'Wilaya requise'
    if (!formData.moughataa) newErrors.moughataa = language === 'ar' ? 'المقاطعة مطلوبة' : 'Moughataa requise'
    if (!formData.school) newErrors.school = language === 'ar' ? 'المدرسة مطلوبة' : 'École requise'

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (formDataObj: FormData) => {
    if (validateForm()) {
      formAction(formDataObj)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleUserCategoryChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      userCategory: value, 
      specificRole: '' // Reset specific role when category changes
    }))
  }

  const handleWilayaChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      wilaya: value, 
      moughataa: '' // Reset moughataa when wilaya changes
    }))
  }

  const currentLabels = labels[language]
  const isRTL = language === 'ar'

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
              <div className="bg-blue-600 p-3 rounded-full">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {currentLabels.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
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

              {/* NNI */}
              <div className="space-y-2">
                <Label htmlFor="nni" className="text-sm font-medium">
                  {currentLabels.nni}
                </Label>
                <Input
                  id="nni"
                  name="nni"
                  type="text"
                  value={formData.nni}
                  onChange={(e) => handleInputChange('nni', e.target.value)}
                  placeholder={currentLabels.nniPlaceholder}
                  className={errors.nni ? 'border-red-500' : ''}
                />
                {errors.nni && <p className="text-red-500 text-xs">{errors.nni}</p>}
              </div>

              {/* Matricule */}
              <div className="space-y-2">
                <Label htmlFor="matricule" className="text-sm font-medium">
                  {currentLabels.matricule}
                </Label>
                <Input
                  id="matricule"
                  name="matricule"
                  type="text"
                  value={formData.matricule}
                  onChange={(e) => handleInputChange('matricule', e.target.value)}
                  placeholder={currentLabels.matriculePlaceholder}
                  className={errors.matricule ? 'border-red-500' : ''}
                />
                {errors.matricule && <p className="text-red-500 text-xs">{errors.matricule}</p>}
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  {currentLabels.fullName}
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder={currentLabels.fullNamePlaceholder}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  {currentLabels.confirmPassword}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder={currentLabels.confirmPasswordPlaceholder}
                    className={`${errors.confirmPassword ? 'border-red-500' : ''} ${isRTL ? 'pl-10' : 'pr-10'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'}`}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
              </div>

              {/* Hidden fields for form data */}
              <input type="hidden" name="userCategory" value={formData.userCategory} />
              <input type="hidden" name="specificRole" value={formData.specificRole} />
              <input type="hidden" name="wilaya" value={formData.wilaya} />
              <input type="hidden" name="moughataa" value={formData.moughataa} />
              <input type="hidden" name="school" value={formData.school} />
              <input type="hidden" name="isNewSchool" value={formData.isNewSchool.toString()} />

              {/* User Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {currentLabels.userCategory}
                </Label>
                <Select value={formData.userCategory} onValueChange={handleUserCategoryChange}>
                  <SelectTrigger className={errors.userCategory ? 'border-red-500' : ''}>
                    <SelectValue placeholder={`${language === 'ar' ? 'اختر' : 'Choisir'} ${currentLabels.userCategory}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {userCategories[language].map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.userCategory && <p className="text-red-500 text-xs">{errors.userCategory}</p>}
              </div>

              {/* Specific Role */}
              {formData.userCategory && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {currentLabels.specificRole}
                  </Label>
                  <Select value={formData.specificRole} onValueChange={(value) => handleInputChange('specificRole', value)}>
                    <SelectTrigger className={errors.specificRole ? 'border-red-500' : ''}>
                      <SelectValue placeholder={`${language === 'ar' ? 'اختر' : 'Choisir'} ${currentLabels.specificRole}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {specificRoles[formData.userCategory as keyof typeof specificRoles]?.[language]?.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.specificRole && <p className="text-red-500 text-xs">{errors.specificRole}</p>}
                </div>
              )}

              {/* Wilaya */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {currentLabels.wilaya}
                </Label>
                <Select value={formData.wilaya} onValueChange={handleWilayaChange}>
                  <SelectTrigger className={errors.wilaya ? 'border-red-500' : ''}>
                    <SelectValue placeholder={`${language === 'ar' ? 'اختر' : 'Choisir'} ${currentLabels.wilaya}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {wilayas.map((wilaya) => (
                      <SelectItem key={wilaya} value={wilaya}>
                        {wilaya}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.wilaya && <p className="text-red-500 text-xs">{errors.wilaya}</p>}
              </div>

              {/* Moughataa */}
              {formData.wilaya && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {currentLabels.moughataa}
                  </Label>
                  <Select value={formData.moughataa} onValueChange={(value) => handleInputChange('moughataa', value)}>
                    <SelectTrigger className={errors.moughataa ? 'border-red-500' : ''}>
                      <SelectValue placeholder={`${language === 'ar' ? 'اختر' : 'Choisir'} ${currentLabels.moughataa}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {moughataas[formData.wilaya]?.map((moughataa) => (
                        <SelectItem key={moughataa} value={moughataa}>
                          {moughataa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.moughataa && <p className="text-red-500 text-xs">{errors.moughataa}</p>}
                </div>
              )}

              {/* School Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {currentLabels.school}
                </Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.isNewSchool ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange('isNewSchool', false)}
                      className="flex-1"
                    >
                      {currentLabels.existingSchool}
                    </Button>
                    <Button
                      type="button"
                      variant={formData.isNewSchool ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange('isNewSchool', true)}
                      className="flex-1"
                    >
                      {currentLabels.newSchool}
                    </Button>
                  </div>
                  
                  {formData.isNewSchool ? (
                    <Input
                      type="text"
                      value={formData.school}
                      onChange={(e) => handleInputChange('school', e.target.value)}
                      placeholder={currentLabels.schoolPlaceholder}
                      className={errors.school ? 'border-red-500' : ''}
                    />
                  ) : (
                    <Select value={formData.school} onValueChange={(value) => handleInputChange('school', value)}>
                      <SelectTrigger className={errors.school ? 'border-red-500' : ''}>
                        <SelectValue placeholder={`${language === 'ar' ? 'اختر' : 'Choisir'} ${currentLabels.school}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {existingSchools.map((school) => (
                          <SelectItem key={school} value={school}>
                            {school}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {errors.school && <p className="text-red-500 text-xs">{errors.school}</p>}
              </div>

              {state?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {state.error}
                </div>
              )}

              {state?.success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  {language === 'ar' ? 'تم التسجيل بنجاح!' : 'Registration successful!'}
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 mt-6"
              >
                {isPending 
                  ? (language === 'ar' ? 'جاري التسجيل...' : 'Registering...') 
                  : currentLabels.register
                }
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  {currentLabels.haveAccount}
                </p>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    {currentLabels.loginLink}
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
