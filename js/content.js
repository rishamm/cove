/* Default content — used when Supabase isn't configured or can't be reached.
   The same shape is stored in Supabase (table `settings`, row id=1, column `data`; table `projects`).
   In text fields, wrap words in *asterisks* to set them in the italic serif. Use \n for a line break. */
window.COVE_DEFAULT = {
  settings: {
    brand: { name: "COVE", city: "Doha", timezone: "Asia/Qatar", established: "2019", loaderCaption: "Visual studio — Doha" },
    hero: {
      eyebrow: "Photography & direction",
      tagline: "Photographer and visual director working between commissioned work and quiet, personal studies of light, form and the people inside them.",
      specialties: ["Portrait", "Editorial", "Still life"]
    },
    contact: { email: "hello@cove.studio", phone: "+974 5500 0000", instagram: "@cove.studio", instagramUrl: "https://www.instagram.com/" },
    manifesto: { label: "Approach", text: "We photograph the *quiet* between moments — light falling on a wall, the weight of a shadow, the shape a person leaves behind. Everything in *black* and *white*, nothing more than it needs to be." },
    work: { title: "Selected\n*work*", label: "2024—2026" },
    latest: { title: "The *latest*", label: "Recent commissions" },
    archive: {
      title: "Arch*ive*",
      filters: [
        { key: "people", label: "People" },
        { key: "land", label: "Land" },
        { key: "objects", label: "Objects" },
        { key: "abstract", label: "Abstract" }
      ]
    },
    about: {
      label: "About the studio",
      text: "COVE is a one-person photography studio making images for brands, magazines and musicians — slow, considered and always in *monochrome.*",
      portraitUrl: "images/05.jpg",
      services: [
        { name: "Portrait", meta: "01" }, { name: "Editorial & fashion", meta: "02" }, { name: "Still life & product", meta: "03" },
        { name: "Architecture", meta: "04" }, { name: "Art direction", meta: "05" }
      ],
      recognition: [
        { name: "Monochrome Awards", meta: "2025" }, { name: "Solo show — Gallery 7", meta: "2025" },
        { name: "Book: *Low Light*", meta: "2024" }, { name: "Young Talent shortlist", meta: "2023" }
      ]
    },
    footer: {
      title: "Let’s make\nsomething *quiet.*",
      blocks: [
        { title: "Studio", lines: ["COVE Studio", "West Bay, Doha, Qatar"] },
        { title: "Enquiries", lines: ["hello@cove.studio", "+974 5500 0000"] },
        { title: "Represented", lines: ["Available worldwide", "agent@cove.studio"] },
        { title: "Press", lines: ["press@cove.studio"] }
      ],
      socials: [ { label: "Instagram", url: "https://www.instagram.com/" }, { label: "Behance", url: "https://www.behance.net/" } ],
      formTitle: "Send a message",
      formEmail: "hello@cove.studio",
      copyright: "© 2026 COVE Studio"
    }
  },
  projects: [
    { title: "Dune I",      category: "Landscape",     grp: "land",     client: "Maison Noir",   year: 2026, image_url: "images/00.jpg", width: 1000, height: 1300, sort: 1,  show_hero: false, show_index: false, show_latest: true,  show_archive: true },
    { title: "Orb",         category: "Still life",    grp: "objects",  client: "Atelier Sable", year: 2026, image_url: "images/01.jpg", width: 1300, height: 1000, sort: 2,  show_hero: true,  show_index: true,  show_latest: true,  show_archive: true },
    { title: "Night Drive", category: "Long exposure", grp: "land",     client: "Halo Records",  year: 2025, image_url: "images/02.jpg", width: 1300, height: 900,  sort: 3,  show_hero: true,  show_index: false, show_latest: true,  show_archive: true },
    { title: "Horizon",     category: "Seascape",      grp: "land",     client: "Grey Journal",  year: 2025, image_url: "images/03.jpg", width: 1400, height: 900,  sort: 4,  show_hero: true,  show_index: true,  show_latest: false, show_archive: true },
    { title: "Stairwell",   category: "Architecture",  grp: "abstract", client: "Studio Ostra",  year: 2025, image_url: "images/04.jpg", width: 1000, height: 1300, sort: 5,  show_hero: true,  show_index: true,  show_latest: false, show_archive: true },
    { title: "The Window",  category: "Portrait",      grp: "people",   client: "Kinfolk Rooms", year: 2024, image_url: "images/05.jpg", width: 1000, height: 1350, sort: 6,  show_hero: true,  show_index: true,  show_latest: false, show_archive: true },
    { title: "Still Water", category: "Abstract",      grp: "abstract", client: "Lumen Magazine",year: 2026, image_url: "images/06.jpg", width: 1200, height: 1200, sort: 7,  show_hero: false, show_index: false, show_latest: true,  show_archive: true },
    { title: "Exhale",      category: "Studio",        grp: "people",   client: "North & Salt",  year: 2025, image_url: "images/07.jpg", width: 950,  height: 1350, sort: 8,  show_hero: true,  show_index: true,  show_latest: false, show_archive: true },
    { title: "Drape",       category: "Fashion",       grp: "people",   client: "Vessel Ceramics",year: 2026, image_url: "images/08.jpg", width: 1000, height: 1300, sort: 9,  show_hero: true,  show_index: true,  show_latest: true,  show_archive: true },
    { title: "Afternoon",   category: "Interior",      grp: "objects",  client: "Field Notes",   year: 2024, image_url: "images/09.jpg", width: 1350, height: 950,  sort: 10, show_hero: false, show_index: false, show_latest: true,  show_archive: true },
    { title: "Bloom",       category: "Botanical",     grp: "objects",  client: "Quiet Hours",   year: 2025, image_url: "images/10.jpg", width: 1100, height: 1100, sort: 11, show_hero: true,  show_index: true,  show_latest: false, show_archive: true },
    { title: "City Rain",   category: "Street",        grp: "abstract", client: "Monolith",      year: 2024, image_url: "images/11.jpg", width: 1300, height: 900,  sort: 12, show_hero: false, show_index: true,  show_latest: true,  show_archive: true }
  ]
};
