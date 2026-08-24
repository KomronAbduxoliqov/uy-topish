import { MetadataRoute } from 'next';
import { TASHKENT_DISTRICTS } from '@uytop/shared-types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://uytop.uz';
  const locales = ['uz', 'ru'];
  const routes: MetadataRoute.Sitemap = [];

  // Homepages for each locale
  locales.forEach((locale) => {
    routes.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });
  });

  // District Landing Pages for Localized SEO
  locales.forEach((locale) => {
    TASHKENT_DISTRICTS.forEach((d) => {
      routes.push({
        url: `${baseUrl}/${locale}/toshkent/${d.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });
    });
  });

  // Individual Property Detail Pages (Primary Seed Listings)
  const defaultPropertyIds = [
    '11111111-1111-1111-1111-111111111101',
    '11111111-1111-1111-1111-111111111102',
    '11111111-1111-1111-1111-111111111103',
    '11111111-1111-1111-1111-111111111104',
    '11111111-1111-1111-1111-111111111105',
    '11111111-1111-1111-1111-111111111106',
    '11111111-1111-1111-1111-111111111107',
    '11111111-1111-1111-1111-111111111108',
    '11111111-1111-1111-1111-111111111109',
    '11111111-1111-1111-1111-111111111110',
  ];

  locales.forEach((locale) => {
    defaultPropertyIds.forEach((id) => {
      routes.push({
        url: `${baseUrl}/${locale}/properties/${id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    });
  });

  return routes;
}
