'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export function GameFooter() {
  const t = useTranslations('footer');
  const tNav = useTranslations('navigation');
  const tCategories = useTranslations('categories');
  const locale = useLocale();

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: tNav('home'), href: `/${locale}` },
    { name: tNav('games'), href: `/${locale}/games` },
    { name: tNav('about'), href: `/${locale}/about` },
    { name: tNav('contact'), href: `/${locale}/contact` }
  ];

  const gameCategories = [
    { name: tCategories('puzzle'), href: `/${locale}/categories/puzzle` },
    { name: tCategories('action'), href: `/${locale}/categories/action` },
    { name: tCategories('arcade'), href: `/${locale}/categories/arcade` },
    { name: tCategories('casual'), href: `/${locale}/categories/casual` }
  ];

  const legalLinks = [
    { name: tNav('privacy'), href: `/${locale}/privacy` },
    { name: tNav('terms'), href: `/${locale}/terms` }
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href={`/${locale}`} className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                GameHub
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {t('description')}
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href as any}
                    className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Game Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              {t('categories')}
            </h3>
            <ul className="space-y-3">
              {gameCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href as any}
                    className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              {t('legal')}
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href as any}
                    className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {currentYear} GameHub. {t('copyright')}.
            </p>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-6">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {t('followUs')}:
              </span>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  <span className="sr-only">WeChat</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.298c-.115.379.047.4.23.302l1.75-.87a.588.588 0 01.414-.024 8.973 8.973 0 002.462.336c-.019-.193-.03-.39-.03-.591 0-3.811 3.317-6.901 7.396-6.901a8.142 8.142 0 011.145.08C15.777 4.758 12.716 2.188 8.691 2.188zm-2.46 2.69c.55 0 .995.424.995.947 0 .523-.446.947-.995.947s-.995-.424-.995-.947c0-.523.446-.947.995-.947zm4.919 0c.55 0 .995.424.995.947 0 .523-.446.947-.995.947s-.995-.424-.995-.947c0-.523.446-.947.995-.947z"/>
                    <path d="M17.308 11.537c-3.718 0-6.73 2.674-6.73 5.973 0 3.298 3.012 5.973 6.73 5.973a7.83 7.83 0 002.016-.262.588.588 0 01.414.024l1.35.672c.14.07.301.047.230-.302l-.301-1.004a.59.59 0 01.213-.665c1.417-1.032 2.322-2.548 2.322-4.436 0-3.299-3.012-5.973-6.73-5.973h-.514zm-2.572 2.025c.377 0 .683.283.683.632 0 .349-.306.632-.683.632-.377 0-.683-.283-.683-.632 0-.349.306-.632.683-.632zm5.144 0c.377 0 .683.283.683.632 0 .349-.306.632-.683.632-.377 0-.683-.283-.683-.632 0-.349.306-.632.683-.632z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  <span className="sr-only">Weibo</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.31 8.17c-2.897-.074-5.234 1.41-5.234 3.321 0 1.91 2.337 3.395 5.234 3.321 2.897.074 5.234-1.41 5.234-3.321 0-1.91-2.337-3.395-5.234-3.321z"/>
                    <path d="M20.08 6.37c-.378-.378-.95-.42-1.42-.126-.47.294-.588.798-.294 1.176.588.756.882 1.68.882 2.688 0 2.226-1.764 4.032-3.99 4.032-1.176 0-2.268-.504-3.024-1.344-.378-.42-.924-.462-1.302-.084s-.462.924-.084 1.302c1.008 1.134 2.478 1.806 4.074 1.806 3.024 0 5.49-2.436 5.49-5.46 0-1.344-.378-2.646-1.092-3.738-.294-.378-.798-.504-1.176-.21-.378.294-.504.798-.21 1.176.588.756.882 1.68.882 2.688 0 2.226-1.764 4.032-3.99 4.032-1.176 0-2.268-.504-3.024-1.344-.378-.42-.924-.462-1.302-.084s-.462.924-.084 1.302c1.008 1.134 2.478 1.806 4.074 1.806 3.024 0 5.49-2.436 5.49-5.46 0-1.344-.378-2.646-1.092-3.738-.294-.42-.798-.546-1.24-.252z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
