import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'UyTop — O\'zbekistonda AI va Xarita orqali Uy Topish',
    template: '%s | UyTop'
  },
  description: 'Toshkent va butun O\'zbekistonda xaritadan radius tanlang yoki sun\'iy intellekt yordamchisiga qanday uy kerakligini tabiiy tilda ayting.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://uytop.uz'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="h-full bg-slate-50 dark:bg-slate-950 antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('uytop_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="UyTop" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Leaflet CSS loaded as direct HTML link tag to prevent @import conflicts */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="h-full font-sans text-slate-900 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 selection:bg-brand-500 selection:text-white transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
