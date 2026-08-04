import { locales } from '@/i18n';

export const SEO_BASE_URL = 'https://openvid.dev';

export function getRouteAlternates(locale: string, path: string = '') {
  const languages: Record<string, string> = {};
  locales.forEach((loc) => {
    languages[loc] = `${SEO_BASE_URL}/${loc}${path}`;
  });

  return {
    canonical: `${SEO_BASE_URL}/${locale}${path}`,
    languages,
  };
}