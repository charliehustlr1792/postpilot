import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://postpilot.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private/auth areas shouldn't be crawled.
      disallow: [
        '/dashboard',
        '/posts',
        '/calendar',
        '/analytics',
        '/accounts',
        '/settings',
        '/sign-in',
        '/sign-up',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
