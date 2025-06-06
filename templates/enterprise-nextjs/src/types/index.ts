export * from './game';
export * from './theme';

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  games: {
    defaultCategory: string;
    gamesPerPage: number;
    featuredCount: number;
    enableSearch: boolean;
    enableFilters: boolean;
  };
  seo: {
    keywords: string[];
    author: string;
    twitterHandle: string;
  };
  social: {
    twitter?: string;
    facebook?: string;
    github?: string;
  };
}

export interface LocaleConfig {
  locales: string[];
  defaultLocale: string;
  localeLabels: Record<string, string>;
}

export interface NavigationItem {
  href: string;
  label: string;
  external?: boolean;
}

export interface PageProps {
  params: {
    locale: string;
    [key: string]: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}
