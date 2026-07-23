// Ordner-basierte Galerien.
//
// Lege die Originalfotos einfach hier ab:
//   src/images/apartments/<slug>/...   (z. B. src/images/apartments/romantika/01-kamin.jpg)
//   src/images/villa/...               (Aussen-/Story-Fotos der Villa)
//
// Jede Datei wird von Astro automatisch optimiert (AVIF/WebP, responsive,
// lazy). Die Reihenfolge in der Galerie ergibt sich aus dem Dateinamen
// (alphabetisch/numerisch) – am einfachsten mit Zahlen-Präfix steuern:
//   01-..., 02-..., 03-...
//
// import.meta.glob mit eager:true bindet die Bilder zur Build-Zeit ein.
const apartmentModules = import.meta.glob(
  '/src/images/apartments/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true }
);

const villaModules = import.meta.glob(
  '/src/images/villa/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true }
);

function sortByPath(entries) {
  return entries.sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );
}

// Alle Galeriebilder einer Wohnung (ImageMetadata[]), in Dateinamen-Reihenfolge.
export function getGallery(slug) {
  return sortByPath(
    Object.entries(apartmentModules).filter(([path]) =>
      path.includes(`/apartments/${slug}/`)
    )
  ).map(([, mod]) => mod.default);
}

// Titel-/Kartenbild einer Wohnung. Ist ein cover-Dateiname (Teilstring)
// angegeben, wird dieses Bild bevorzugt – sonst das erste der Galerie.
export function getCover(slug, cover) {
  const gallery = getGalleryEntries(slug);
  if (gallery.length === 0) return null;
  if (cover) {
    const match = gallery.find(([path]) => path.includes(cover));
    if (match) return match[1].default;
  }
  return gallery[0][1].default;
}

// interne Helper: Galerie-Einträge (Pfad + Modul) einer Wohnung, sortiert.
function getGalleryEntries(slug) {
  return sortByPath(
    Object.entries(apartmentModules).filter(([path]) =>
      path.includes(`/apartments/${slug}/`)
    )
  );
}

// Villa-/Story-Fotos.
export function getVillaImages() {
  return sortByPath(Object.entries(villaModules)).map(([, mod]) => mod.default);
}
