import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rosengarten.casa',
  trailingSlash: 'always',
  output: 'static',
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      // Danke-Seiten sind nur Formular-Redirect-Ziele, kein Inhalt für Suchmaschinen.
      filter: (page) => !page.includes('/kontakt/danke/'),
    }),
  ],
});