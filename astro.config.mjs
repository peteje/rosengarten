import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rosengarten.casa',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    sitemap({
      // Danke-Seite ist nur ein Formular-Redirect-Ziel, kein Inhalt für Suchmaschinen.
      filter: (page) => !page.includes('/kontakt/danke/'),
    }),
  ],
});