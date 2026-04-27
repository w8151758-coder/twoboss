"use client"

import Link from "next/link"
import { ArrowRight, FileText, ClipboardCheck, CheckCircle2, MessageCircle, Users, Truck, Shield, Award, Headphones, Search, Zap, Globe, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStorefrontI18n, interpolate } from "@/lib/i18n/storefront-context"

export function HomePage() {
  const { t } = useStorefrontI18n()
  const whatsappNumber = "8613800138000"
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hello`

  const stats = [
    { value: "10+", label: t.stats.yearsExperience },
    { value: "500+", label: t.products.totalProducts.replace('{count}', '') },
    { value: "50+", label: t.stats.globalPartners },
    { value: "2000+", label: t.customer.title },
  ]

  const steps = [
    {
      number: "01",
      title: t.process.step1Title,
      description: t.process.step1Desc,
      icon: Search,
    },
    {
      number: "02", 
      title: t.process.step2Title,
      description: t.process.step2Desc,
      icon: FileText,
    },
    {
      number: "03",
      title: t.process.step3Title,
      description: t.process.step3Desc,
      icon: CheckCircle2,
    },
    {
      number: "04",
      title: t.process.step4Title,
      description: t.process.step4Desc,
      icon: ClipboardCheck,
    },
  ]

  const features = [
    {
      icon: Award,
      title: t.features.price,
      description: t.features.priceDesc,
    },
    {
      icon: Shield,
      title: t.features.quality,
      description: t.features.qualityDesc,
    },
    {
      icon: Users,
      title: t.features.factory,
      description: t.features.factoryDesc,
    },
    {
      icon: Truck,
      title: t.features.delivery,
      description: t.features.deliveryDesc,
    },
    {
      icon: Star,
      title: t.features.custom,
      description: t.features.customDesc,
    },
    {
      icon: Headphones,
      title: t.features.service,
      description: t.features.serviceDesc,
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section - Soft Ocean Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#5B8FB9] via-[#7AB8B8] to-[#B8C98F] py-12 sm:py-16 lg:py-28">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-white/10" />
        
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium mb-6 sm:mb-8">
                <Globe className="h-4 w-4" />
                {t.hero.badge}
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                {t.hero.title}
                <span className="block mt-1 sm:mt-2 text-white/95">
                  {t.hero.subtitle}
                </span>
              </h1>
              
              <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-lg">
                {t.hero.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Link href="/products" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base rounded-xl bg-white text-[#5B8FB9] hover:bg-white/95 shadow-lg font-semibold">
                    {t.hero.browseProducts}
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-medium">
                    <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {t.hero.whatsappConsult}
                  </Button>
                </a>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 sm:gap-6 text-sm sm:text-base text-white/90">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{t.hero.minOrder}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{t.hero.customLogo}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{t.hero.fastShipping}</span>
                </div>
              </div>
            </div>
            
            {/* Right - Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 lg:mt-0">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className={`bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl ${
                    index === 1 ? 'lg:translate-y-4' : index === 2 ? 'lg:-translate-y-4' : ''
                  }`}
                >
                  <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-[#5B8FB9] to-[#7AB8B8] bg-clip-text text-transparent mb-0.5 sm:mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-base text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#5B8FB9]/8 via-[#7AB8B8]/8 to-[#B8C98F]/8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-[#7AB8B8]/15 text-[#5B8FB9] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium mb-3 sm:mb-4">
              <Zap className="h-4 w-4" />
              {t.process.badge}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-3 sm:mb-4">
              {t.process.title}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              {t.process.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {steps.map((step, index) => {
              const borderColors = [
                'border-t-[#5B8FB9]',
                'border-t-[#7AB8B8]',
                'border-t-[#95C4A0]',
                'border-t-[#B8C98F]',
              ]
              const iconBgColors = [
                'bg-[#5B8FB9]/12',
                'bg-[#7AB8B8]/12',
                'bg-[#95C4A0]/12',
                'bg-[#B8C98F]/12',
              ]
              const iconColors = [
                'text-[#5B8FB9]',
                'text-[#7AB8B8]',
                'text-[#7AB8B8]',
                'text-[#8AB880]',
              ]
              return (
                <div key={step.number} className="relative">
                  <Card className={`border-t-4 ${borderColors[index]} bg-white shadow-sm hover:shadow-md transition-shadow h-full`}>
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl ${iconBgColors[index]} flex items-center justify-center mb-2 sm:mb-3 lg:mb-4`}>
                        <step.icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${iconColors[index]}`} />
                      </div>
                      <div className="text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-400 mb-1 sm:mb-1.5 lg:mb-2">
                        STEP {step.number}
                      </div>
                      <h3 className="text-sm sm:text-base lg:text-xl font-semibold text-foreground mb-1 sm:mb-1.5 lg:mb-2">{step.title}</h3>
                      <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">{step.description}</p>
                    </CardContent>
                  </Card>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 z-10 transform -translate-y-1/2">
                      <ArrowRight className="h-5 w-5 text-[#7AB8B8]" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="text-center mt-8 sm:mt-12">
            <Link href="/products">
              <Button size="lg" className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base rounded-xl bg-gradient-to-r from-[#5B8FB9] to-[#7AB8B8] hover:opacity-90 shadow-md font-semibold text-white">
                {t.process.startPurchasing}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-[#95C4A0]/15 text-[#5B8FB9] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium mb-3 sm:mb-4">
              <Star className="h-4 w-4" />
              {t.features.badge}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-3 sm:mb-4">
              {t.features.title}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              {t.features.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {features.map((feature, index) => {
              const borderColors = [
                'border-l-[#5B8FB9]',
                'border-l-[#6BA5C4]',
                'border-l-[#7AB8B8]',
                'border-l-[#95C4A0]',
                'border-l-[#A8C990]',
                'border-l-[#B8C98F]',
              ]
              const iconBgColors = [
                'bg-[#5B8FB9]/10',
                'bg-[#6BA5C4]/10',
                'bg-[#7AB8B8]/10',
                'bg-[#95C4A0]/10',
                'bg-[#A8C990]/10',
                'bg-[#B8C98F]/10',
              ]
              const iconColors = [
                'text-[#5B8FB9]',
                'text-[#5B8FB9]',
                'text-[#7AB8B8]',
                'text-[#7AB8B8]',
                'text-[#8AB880]',
                'text-[#8AB880]',
              ]
              return (
                <Card key={feature.title} className={`border-l-4 ${borderColors[index]} bg-white shadow-sm hover:shadow-md transition-shadow`}>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl ${iconBgColors[index]} flex items-center justify-center mb-2 sm:mb-3 lg:mb-5`}>
                      <feature.icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${iconColors[index]}`} />
                    </div>
                    <h3 className="text-sm sm:text-base lg:text-xl font-semibold text-foreground mb-1 sm:mb-1.5 lg:mb-2">{feature.title}</h3>
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-[#5B8FB9] via-[#7AB8B8] to-[#B8C98F]">
        <div className="absolute inset-0 bg-white/5" />
        
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4 sm:mb-6">
            {t.cta.title}
          </h2>
          <p className="text-white/90 text-base sm:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.cta.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/products" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base rounded-xl bg-white text-[#5B8FB9] hover:bg-white/95 shadow-lg font-semibold">
                {t.hero.browseProducts}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg font-semibold">
                <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {t.hero.whatsappConsult}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* WhatsApp Float */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </a>
    </div>
  )
}
