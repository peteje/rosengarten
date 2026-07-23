// Zentrale Datenquelle für alle Ferienwohnungen.
// Neue Wohnung hinzufügen = neuer Eintrag hier. Erzeugt automatisch
// eine Detailseite unter /<slug>/ (siehe src/pages/[slug]/index.astro).
//
// Texte 1:1 von der bestehenden Seite rosengarten.casa übernommen.
// description ist ein Array aus Absätzen; features eine Liste von
// Ausstattungsmerkmalen (wie die Icon-Leiste auf der alten Seite).

export const apartments = [
  {
    slug: 'romantika',
    cover: '01-romantika-1',
    name: 'Romantika',
    subtitle: 'Romantika mit Kaminzimmer',
    location: 'Hochparterre im Haupthaus',
    teaser:
      'Die Hauptwohnung im Hochparterre – 145 m², 2 Bäder, 2 Schlafzimmer ' +
      'und große Terrasse für bis zu 6 Personen.',
    description: [
      'Die Wohnung ist das Highlight der Villa Rosengarten. Zwei Badezimmer mit ' +
        'Rainshower-Duschen und einer frei stehenden Badewanne, zwei Schlafräume mit ' +
        'Doppelbett, das Kaminzimmer und die große offene Wohnküche mit exklusiver ' +
        'Kochinsel sorgen für ein unvergessliches Erlebnis auf 145 qm Wohnfläche.',
      'In den Bädern sind die Wände aufwändig mit einem natürlichen Stuccolustro ' +
        'verputzt. Große Fenster sorgen für viel Licht und die Fußbodenheizung für ' +
        'angenehme Wärme. Neben der großen Dusche findet sich im Hauptbad eine ' +
        'freistehende Badewanne. Für stimmungsvolle Lichteffekte sorgt eine indirekte ' +
        'LED-Beleuchtung.',
      'Im Wohnzimmer steht ein großer, offener Kamin vor dem Ledersofa. Der helle ' +
        'Eiche-Esstisch bietet Platz für 6 Personen und die Kochinsel in der ' +
        'hervorragend ausgestatteten Küche lässt auch für ambitionierte Hobbyköche ' +
        'keine Wünsche offen. Ein Sansiba-Gasgrill auf der Terrasse rundet die ' +
        'exklusive Ausstattung ab.',
      'Auf der großen, privaten Terrasse genießen Sie Grillabende am Brunnen bei ' +
        'einem guten Wein aus dem Miele-Weinkühlschrank der Küche.',
    ],
    features: [
      'WLAN',
      '2 Bäder',
      '2 Schlafzimmer',
      '1–6 Personen',
      'Kaminzimmer mit Schlafcouch',
      'Streaming',
    ],
    priceFrom: 220,
    maxGuests: 6,
    sizeSqm: 145,
    smoobuUrl: 'https://9a350089.smoobu.net/de/apartment/Romantika/1070464',
    smoobuId: '1070464',
    smoobuVerification: '74311631a40877316c6d52761f337e36042f42dceaac92b7d4e1b82ef79658b1',
  },
  {
    slug: 'sommerwind',
    cover: '00-terrasse-1',
    name: 'Sommerwind',
    subtitle: 'Appartement mit sonniger Dachterrasse',
    location: 'Dachgeschoss im Haupthaus',
    teaser:
      'Wohnung im Dachgeschoss mit großer, sonniger Dachterrasse – für bis zu ' +
      '6 Personen.',
    note:
      'Mindestaufenthalt 7 Nächte bei flexiblem Anreisetag. Kürzere Aufenthalte ' +
      'sind gegen Aufpreis möglich – nutzen Sie dafür gerne das Kontaktformular ' +
      'für ein individuelles Angebot.',
    description: [
      'Unsere Wohnung Sommerwind liegt im Dachgeschoss des Haupthauses und hat einen ' +
        'eigenen Zugang über das Portal. Die original Dielen aus dem Altbau sind ' +
        'erhalten geblieben und machen den Charakter der Wohnung aus.',
      'Das Highlight ist die große Dachterrasse mit Lounge-Möbeln. Da hier von ' +
        'Vormittag bis in den Abend die Sonne scheint, haben wir auch einen großen ' +
        'Sonnenschirm dabei. Ein elektrischer Grill ergänzt die ansonsten voll ' +
        'ausgestattete Küche. So ist auch für den Fall vorgesorgt, dass einmal nicht ' +
        'das reichhaltige Angebot an Restaurants und Bars der nur wenige Meter ' +
        'entfernten Burger Altstadt genutzt werden soll.',
      'Ein Schlafzimmer ist mit einem Doppelbett (160×200) ausgestattet und direkt ' +
        'mit einem der beiden Badezimmer verbunden. Im zweiten Schlafzimmer befindet ' +
        'sich ein Stockbett (90×200). Dieses Zimmer ist als Kinderzimmer vorgesehen ' +
        'und entsprechend mit Spielzeug ausgestattet, kann aber wegen der normalen ' +
        'Bettgröße auch von Erwachsenen genutzt werden.',
      'Das zweite Bad mit Badewanne ist vom Flur aus erreichbar.',
      'Im großzügigen, offenen Wohn-Essbereich befinden sich die Küchenzeile und ' +
        'auch der Zugang zur Dachterrasse. Das Schlafsofa ist ein hochwertiger ' +
        'Dauerschläfer und bietet mit 160×200 Liegefläche zwei Personen Platz. Der ' +
        'großzügige Tisch ist für 6–8 Personen ausgelegt.',
      'Im Wohnzimmer steht auch ein Kanonenofen, der an kälteren Tagen eine ' +
        'gemütliche Wärme ausstrahlt.',
      'Ein LED-Fernseher mit angeschlossenem Apple TV, HD-Kabel und DVD-Player mit ' +
        'integriertem Surround-System sorgen für Unterhaltung. Das freie High-Speed-' +
        'WLAN ist in der gesamten Anlage verfügbar und auch für Remote Office bestens ' +
        'geeignet.',
    ],
    features: [
      'Free WLAN',
      '2 Bäder',
      '2 Schlafzimmer',
      '1–6 Personen',
      'Dauerschläfer-Sofa',
      'Streaming',
    ],
    priceFrom: 140,
    maxGuests: 6,
    sizeSqm: null,
    smoobuUrl: 'https://9a350089.smoobu.net/de/apartment/Sommerwind/1070467',
    smoobuId: '1070467',
    smoobuVerification: 'a04fd2add545e893912589d9bede9463dcb7067a61e6bf5199f2cf38a10eedba',
    video: '0Wo2iK679TY',
  },
  {
    slug: 'loft',
    cover: '00a-wohnen',
    name: 'Loft',
    subtitle: 'Helle, modern ausgestattete Wohnung',
    location: 'Souterrain der Villa',
    teaser:
      'Helles Souterrain-Apartment mit privater Terrasse und Gartenzugang – ' +
      'ideal für zwei Personen.',
    note:
      'Bitte beachten Sie: Aufgrund der Lage im Souterrain beträgt die Deckenhöhe ' +
      'etwa 210 cm.',
    description: [
      'Die Loft liegt im Souterrain der Villa Rosengarten und ist durch große Fenster ' +
        'sowie die Südwest-Ausrichtung angenehm hell. Der direkte Zugang zum Garten, ' +
        'die kleine private Terrasse mit Lounge-Möbeln und die moderne Ausstattung ' +
        'machen sie ideal für zwei Personen, die Ruhe, Komfort und kurze Wege schätzen.',
      'Der offen gestaltete Wohnbereich verbindet modernes Design mit entspannter ' +
        'Atmosphäre. Ein großzügiger Tisch eignet sich perfekt zum Arbeiten im ' +
        'Homeoffice oder für einen gemütlichen Abend bei einem Glas Wein. Apple TV ' +
        'ermöglicht komfortables Streaming, während der SONOS-Speaker für hochwertigen ' +
        'Klang sorgt.',
      'Die Kitchenette ist mit zwei Kochfeldern, einer Grill-Mikrowellen-Kombination ' +
        'sowie einem Geschirrspüler ausgestattet. Das elegante weiße Designersofa lädt ' +
        'zum Entspannen ein. Ein besonderes Highlight ist der große Philips 3D-TV mit ' +
        'Ambilight vor der roten Stucco-Lustro-Wand. 3D-Blu-rays, passende Brillen und ' +
        'ein Blu-ray-Player stehen ebenfalls zur Verfügung. Vier Artemide-Design-' +
        'Wandleuchten sorgen für eine angenehme Lichtstimmung.',
      'Im Schlafzimmer befindet sich ein komfortables Doppelbett (200×200 cm), eine ' +
        'Kommode sowie eine offene Ablage für Kleidung. Aufgrund der integrierten ' +
        'Wandheizung wurde bewusst auf einen klassischen Kleiderschrank verzichtet. ' +
        'Direkt angeschlossen sind das moderne Duschbad sowie ein praktischer ' +
        'Abstellraum.',
    ],
    features: [
      'WLAN',
      'Duschbad',
      'Kingsize-Doppelbett',
      '1–2 Personen',
      'Frühstück im Café gegenüber',
      'Arbeitsplatz',
    ],
    priceFrom: 120,
    maxGuests: 2,
    sizeSqm: null,
    smoobuUrl: 'https://9a350089.smoobu.net/de/apartment/Loft/1070470',
    smoobuId: '1070470',
    smoobuVerification: '06b7d6a6b3b11b029de831bcba4c659b095dfde56d5acdeeae8a7f44d35641a3',
    video: 'XVGpbYhyx1k',
  },
  {
    slug: 'zwergenfee',
    cover: '01-zf-3',
    name: 'Zwergenfee',
    subtitle: 'Moderne Wohnung im Garten der Anlage',
    location: 'Anbau der Villa',
    teaser:
      'Helle Ferienwohnung im Anbau mit sonniger Terrasse – ideal für Paare oder ' +
      'kleine Familien.',
    description: [
      'Zwergenfee ist eine helle Ferienwohnung im Anbau der Villa Rosengarten. Auf ' +
        'rund 55 m² bietet sie Wohnraum, Schlafzimmer, Küche, Bad und eine sonnige ' +
        'Terrasse. Ideal für Paare oder kleine Familien, die eine ruhige Wohnung mit ' +
        'direktem Außenbereich suchen.',
      'Im Wohnraum steht ein Schlafsofa, das auch als Dauerschlafgelegenheit geeignet ' +
        'ist. Es kann somit über einen längeren Zeitraum als Bett genutzt werden.',
      'Das Bad hat eine ebenerdige Rainshower-Dusche, die nach einem langen Strandtag ' +
        'für Erfrischung sorgt.',
      'Bei gutem Wetter bietet die große Terrasse mit Esstisch, Grill und Stühlen viel ' +
        'Raum für eine gemütliche Zeit.',
      'Die voll ausgestattete Küche hat einen kleinen Esstisch mit Barhockern und Platz ' +
        'für zwei Personen. Aufgrund dieser Einschränkung ist die Belegung mit mehr als ' +
        'zwei Erwachsenen nicht empfohlen. Sollten Sie dennoch mit mehr Personen ' +
        'einziehen wollen, kontaktieren Sie uns bitte.',
    ],
    features: [
      'WLAN',
      'Duschbad',
      'Doppelbett',
      '1–2 Personen + Kinder',
      'Schlafsofa',
      'Streaming',
    ],
    priceFrom: 100,
    maxGuests: 4,
    sizeSqm: 55,
    smoobuUrl: 'https://9a350089.smoobu.net/de/apartment/Zwergenfee/1070461',
    smoobuId: '1070461',
    smoobuVerification: '900172d33ba20ce93f7080069ed727da53bac133c4856f1576bca587f4ad8eec',
    video: 'SeFI4Ehe4xA',
  },
];

export function getApartment(slug) {
  return apartments.find((a) => a.slug === slug);
}
