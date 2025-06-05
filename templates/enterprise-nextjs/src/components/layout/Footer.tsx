import { useTranslations } from 'next-intl'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export function Footer() {
  const t = useTranslations('Footer')

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'Email', icon: Mail, href: 'mailto:contact@example.com' },
  ]

  const footerLinks = {
    product: [
      { name: t('links.features'), href: '#features' },
      { name: t('links.pricing'), href: '#pricing' },
      { name: t('links.docs'), href: '#docs' },
      { name: t('links.api'), href: '#api' },
    ],
    company: [
      { name: t('links.about'), href: '#about' },
      { name: t('links.blog'), href: '#blog' },
      { name: t('links.careers'), href: '#careers' },
      { name: t('links.contact'), href: '#contact' },
    ],
    support: [
      { name: t('links.help'), href: '#help' },
      { name: t('links.community'), href: '#community' },
      { name: t('links.status'), href: '#status' },
    ],
    legal: [
      { name: t('links.privacy'), href: '#privacy' },
      { name: t('links.terms'), href: '#terms' },
      { name: t('links.security'), href: '#security' },
    ],
  }

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{{PROJECT_NAME_INITIAL}}</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                {{PROJECT_NAME}}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
              {t('description')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    aria-label={link.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('sections.product')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('sections.company')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('sections.support')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('sections.legal')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} {{PROJECT_NAME}}. {t('copyright')}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 sm:mt-0">
            {t('builtWith')} ❤️ {t('using')} Next.js
          </p>
        </div>
      </div>
    </footer>
  )
}
