// Englische Übersetzungen der Wohnungstexte, keyed by slug (siehe
// src/data/apartments.js für die deutsche Quelle und alle nicht zu
// übersetzenden Felder wie priceFrom, smoobuId, cover, video etc.).
// Bewusst als separate Datei statt {de:{},en:{}}-Verschachtelung in
// apartments.js -> die bestehenden deutschen Seiten bleiben unverändert.

export const apartmentTranslations = {
  romantika: {
    name: 'Romantika',
    subtitle: 'Romantika with fireplace lounge',
    location: 'Raised ground floor of the main house',
    teaser:
      'The main apartment on the raised ground floor – 145 m², 2 bathrooms, ' +
      '2 bedrooms and a large terrace for up to 6 guests.',
    description: [
      'This apartment is the highlight of Villa Rosengarten. Two bathrooms with ' +
        'rainshower showers and a free-standing bathtub, two bedrooms with double ' +
        'beds, the fireplace lounge and the large open-plan kitchen-living room ' +
        'with its exclusive kitchen island make for an unforgettable stay across ' +
        '145 m² of living space.',
      'The bathroom walls are elaborately finished in a natural stuccolustro ' +
        'plaster. Large windows let in plenty of light, while underfloor heating ' +
        'keeps things cosy. Alongside the large shower, the main bathroom also has ' +
        'a free-standing bathtub, and indirect LED lighting creates a warm ' +
        'atmosphere.',
      'The living room has a large open fireplace in front of the leather sofa. ' +
        'The light oak dining table seats 6, and the kitchen island in the ' +
        'superbly equipped kitchen leaves nothing to be desired, even for ' +
        'ambitious home cooks. A Sansiba gas grill on the terrace rounds off the ' +
        'exclusive fittings.',
      'On the large, private terrace, enjoy barbecue evenings by the well with a ' +
        'good wine from the kitchen’s Miele wine fridge.',
    ],
    features: [
      'WiFi',
      '2 bathrooms',
      '2 bedrooms',
      '1–6 guests',
      'Fireplace lounge with sofa bed',
      'Streaming',
    ],
  },
  sommerwind: {
    name: 'Sommerwind',
    subtitle: 'Apartment with sunny roof terrace',
    location: 'Top floor of the main house',
    teaser:
      'Top-floor apartment with a large, sunny roof terrace – for up to 6 guests.',
    note:
      'Minimum stay of 7 nights with flexible arrival day. Shorter stays are ' +
      'possible for a surcharge – feel free to use the contact form for an ' +
      'individual offer.',
    description: [
      'Our Sommerwind apartment is on the top floor of the main house and has its ' +
        'own entrance via the portal. The original floorboards from the historic ' +
        'building have been preserved and give the apartment its character.',
      'The highlight is the large roof terrace with lounge furniture. Because the ' +
        'sun shines here from late morning into the evening, we also provide a ' +
        'large parasol. An electric grill complements the otherwise fully ' +
        'equipped kitchen – handy for the times you don’t feel like the wide range ' +
        'of restaurants and bars in the old town of Burg, just a few metres away.',
      'One bedroom has a double bed (160×200) and is directly connected to one of ' +
        'the two bathrooms. The second bedroom has a bunk bed (90×200). This room ' +
        'is set up as a children’s room with toys, but thanks to its standard bed ' +
        'size it can also be used by adults.',
      'The second bathroom, with a bathtub, is accessible from the hallway.',
      'The spacious, open-plan living and dining area holds the kitchenette and ' +
        'also gives access to the roof terrace. The sofa bed is a high-quality ' +
        'permanent sleeper offering a 160×200 sleeping surface for two people. The ' +
        'generous table seats 6–8.',
      'The living room also has a pot-belly stove, which radiates a cosy warmth ' +
        'on cooler days.',
      'An LED TV with connected Apple TV, HD cable and a DVD player with built-in ' +
        'surround sound provide entertainment. Free high-speed WiFi is available ' +
        'throughout the property and is well suited to remote work too.',
    ],
    features: [
      'Free WiFi',
      '2 bathrooms',
      '2 bedrooms',
      '1–6 guests',
      'Permanent sofa bed',
      'Streaming',
    ],
  },
  loft: {
    name: 'Loft',
    subtitle: 'Bright, modern apartment',
    location: 'Garden level of the villa',
    teaser:
      'Bright garden-level apartment with a private terrace and garden access – ' +
      'ideal for two.',
    note:
      'Please note: due to its garden-level location, the ceiling height is ' +
      'around 210 cm.',
    description: [
      'The Loft is located on the garden level of Villa Rosengarten and is ' +
        'pleasantly bright thanks to large windows and its south-west orientation. ' +
        'Direct garden access, a small private terrace with lounge furniture and ' +
        'the modern fittings make it ideal for two guests who value peace and ' +
        'quiet, comfort and short distances.',
      'The open-plan living area combines modern design with a relaxed ' +
        'atmosphere. A generous table is perfect for working from home or for a ' +
        'relaxed evening with a glass of wine. Apple TV enables comfortable ' +
        'streaming, while the SONOS speaker delivers high-quality sound.',
      'The kitchenette is equipped with two hobs, a combined grill/microwave and ' +
        'a dishwasher. The elegant white designer sofa invites you to relax, and a ' +
        'particular highlight is the large Philips 3D TV with Ambilight in front ' +
        'of the red stuccolustro wall. 3D Blu-rays, matching glasses and a ' +
        'Blu-ray player are also provided. Four Artemide designer wall lights ' +
        'create a pleasant lighting mood.',
      'The bedroom has a comfortable double bed (200×200 cm), a chest of drawers ' +
        'and open storage for clothes. Because of the integrated wall heating, we ' +
        'deliberately did without a classic wardrobe. Directly attached are the ' +
        'modern shower room and a practical storage room.',
    ],
    features: [
      'WiFi',
      'Shower room',
      'King-size double bed',
      '1–2 guests',
      'Breakfast at the café across the street',
      'Workspace',
    ],
  },
  zwergenfee: {
    name: 'Zwergenfee',
    subtitle: 'Modern apartment in the garden of the estate',
    location: 'Annex of the villa',
    teaser:
      'Bright holiday apartment in the annex with a sunny terrace – ideal for ' +
      'couples or small families.',
    description: [
      'Zwergenfee is a bright holiday apartment in the annex of Villa ' +
        'Rosengarten. Across roughly 55 m² it offers a living area, bedroom, ' +
        'kitchen, bathroom and a sunny terrace. Ideal for couples or small ' +
        'families looking for a quiet apartment with direct outdoor space.',
      'The living area has a sofa bed that is also suitable for permanent use, so ' +
        'it can serve as a bed over a longer stay.',
      'The bathroom has a level-access rainshower, perfect for freshening up ' +
        'after a long beach day.',
      'In good weather, the large terrace with dining table, grill and chairs ' +
        'offers plenty of room for relaxed time outdoors.',
      'The fully equipped kitchen has a small dining table with bar stools and ' +
        'seats two people. Because of this, we don’t recommend occupancy with ' +
        'more than two adults. If you’d still like to stay with more people, ' +
        'please get in touch with us.',
    ],
    features: [
      'WiFi',
      'Shower room',
      'Double bed',
      '1–2 guests + children',
      'Sofa bed',
      'Streaming',
    ],
  },
};

export function getApartmentTranslation(slug) {
  return apartmentTranslations[slug];
}
