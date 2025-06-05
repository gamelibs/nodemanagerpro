import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function Hero() {
  const t = useTranslations('Hero')

  return (
    <section id="home" className="relative section pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-950/20 dark:to-secondary-950/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/30 dark:bg-primary-800/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-200/30 dark:bg-secondary-800/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            {t('badge')}
          </div>

          {/* Main Heading */}
          <h1 className="heading-1 text-gray-900 dark:text-white mb-6 animate-slide-up">
            {t('title.line1')}
            <br />
            <span className="gradient-text">
              {t('title.line2')}
            </span>
          </h1>

          {/* Description */}
          <p className="text-large max-w-2xl mx-auto mb-8 animate-slide-up animation-delay-200">
            {t('description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up animation-delay-400">
            <Button size="lg" className="group">
              {t('cta.primary')}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              {t('cta.secondary')}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto animate-fade-in animation-delay-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('stats.uptime')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">50ms</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('stats.response')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">10k+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('stats.users')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
