// Kurze UI-Textbausteine, die von mehreren Komponenten gemeinsam genutzt
// werden (Header, Footer, Cookie-Banner, Karten). Seiteninhalte (Fließtext)
// leben direkt in den jeweiligen src/pages/en/*-Dateien, nicht hier.

export const defaultLocale = 'de';
export const locales = ['de', 'en'];

export function localePrefix(lang) {
  return lang === 'en' ? '/en' : '';
}

export const ui = {
  de: {
    nav: {
      home: 'Startseite',
      villa: 'Villa',
      apartments: 'Ferienwohnungen',
      winter: 'Wintervilla',
      sauna: 'Sauna & Fitness',
      contact: 'Kontakt',
      bookNow: 'Jetzt buchen',
    },
    footer: {
      tagline: 'Vier Ferienwohnungen in Burg auf Fehmarn.',
      amenities: 'Highspeed-WLAN · Sauna · Fitness · Hunde willkommen.',
      offeredBy: 'Ein Angebot von',
      impressum: 'Impressum',
      datenschutz: 'Datenschutz',
      agb: 'AGB',
      kurtaxe: 'Kurtaxe',
      cookieSettings: 'Cookie-Einstellungen',
      copyright: (year) => `© ${year} Villa Rosengarten · Burg auf Fehmarn`,
    },
    cookie: {
      text: 'Diese Website verwendet Cookies. Neben technisch notwendigen Cookies setzen wir – nur mit Ihrer Einwilligung – Google Analytics zur statistischen Auswertung der Nutzung ein. Details in unserer',
      privacyLink: 'Datenschutzerklärung',
      decline: 'Ablehnen',
      accept: 'Akzeptieren',
    },
    card: {
      from: 'ab',
      details: 'Details ansehen →',
    },
    testimonials: {
      heading: 'Das sagen unsere Gäste',
      onGoogle: 'auf Google',
      reviews: 'Bewertungen',
      seeAll: 'alle ansehen →',
      prev: 'Vorherige Bewertung',
      next: 'Nächste Bewertung',
      stars: (rating, max) => `${rating} von ${max} Sternen`,
    },
    langSwitch: { de: 'DE', en: 'EN' },
  },
  en: {
    nav: {
      home: 'Home',
      villa: 'The Villa',
      apartments: 'Apartments',
      winter: 'Winter Villa',
      sauna: 'Sauna & Fitness',
      contact: 'Contact',
      bookNow: 'Book now',
    },
    footer: {
      tagline: 'Four holiday apartments in Burg on Fehmarn.',
      amenities: 'High-speed WiFi · Sauna · Fitness · Dogs welcome.',
      offeredBy: 'An offering by',
      impressum: 'Legal notice',
      datenschutz: 'Privacy policy',
      agb: 'Terms & conditions',
      kurtaxe: 'Visitor’s tax',
      cookieSettings: 'Cookie settings',
      copyright: (year) => `© ${year} Villa Rosengarten · Burg on Fehmarn`,
    },
    cookie: {
      text: 'This website uses cookies. Alongside technically necessary cookies, we use Google Analytics – only with your consent – to statistically evaluate site usage. Details in our',
      privacyLink: 'privacy policy',
      decline: 'Decline',
      accept: 'Accept',
    },
    card: {
      from: 'from',
      details: 'View details →',
    },
    testimonials: {
      heading: 'What our guests say',
      onGoogle: 'on Google',
      reviews: 'reviews',
      seeAll: 'see all →',
      prev: 'Previous review',
      next: 'Next review',
      stars: (rating, max) => `${rating} out of ${max} stars`,
    },
    langSwitch: { de: 'DE', en: 'EN' },
  },
};

export function t(lang) {
  return ui[lang === 'en' ? 'en' : 'de'];
}
