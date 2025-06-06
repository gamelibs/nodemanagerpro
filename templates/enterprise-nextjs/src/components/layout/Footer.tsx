import { useTranslations } from 'next-intl';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { projectConfig } from '@/config/project';

export function Footer() {
  const t = useTranslations('footer');

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com',
      icon: Github,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com',
      icon: Twitter,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: Linkedin,
    },
    {
      name: 'Email',
      href: 'mailto:contact@example.com',
      icon: Mail,
    },
  ];

  const navigationLinks = [
    {
      title: t('product'),
      links: [
        { name: t('games'), href: '/games' },
        { name: t('categories'), href: '/categories' },
        { name: t('featured'), href: '/featured' },
        { name: t('newGames'), href: '/new' },
      ],
    },
    {
      title: t('company'),
      links: [
        { name: t('about'), href: '/about' },
        { name: t('contact'), href: '/contact' },
        { name: t('careers'), href: '/careers' },
        { name: t('news'), href: '/news' },
      ],
    },
    {
      title: t('support'),
      links: [
        { name: t('help'), href: '/help' },
        { name: t('faq'), href: '/faq' },
        { name: t('terms'), href: '/terms' },
        { name: t('privacy'), href: '/privacy' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{projectConfig.nameInitial}</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                {projectConfig.name}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
              {t('description')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          {navigationLinks.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {projectConfig.name}. {t('copyright')}
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                {t('privacyPolicy')}
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                {t('terms')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
