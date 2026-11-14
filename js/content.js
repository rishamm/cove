/* Default content — used when Supabase isn't configured or can't be reached.
   The same shape is stored in Supabase (table `settings`, row id=1, column `data`; table `projects`).
   In text fields, wrap words in *asterisks* to set them in the italic serif. Use \n for a line break. */
window.COVE_DEFAULT = {
  settings: {
    brand: { name: "COVE", city: "Doha", timezone: "Asia/Qatar", established: "2019" },
    hero: {
      eyebrow: "Photography & direction",
      tagline: "Photographer and visual director working between commissioned work and quiet, personal studies of light, form and the people inside them.",
      specialties: ["Portrait", "Editorial", "Still life"]
    },
    contact: { email: "hello@cove.studio", phone: "+974 5500 0000", instagram: "@cove.studio", instagramUrl: "https://www.instagram.com/" },
    manifesto: { label: "Approach", text: "We photograph the *quiet* between moments — light falling on a wall, the weight of a shadow, the shape a person leaves behind. Nothing more than it needs to be." },
    work: { title: "Selected\n*work*", label: "2024—2026" },
    latest: { title: "The *latest*", label: "Recent commissions" },
    archive: {
      title: "Arch*ive*",
      filters: [
        { key: "editorial", label: "Editorial" },
        { key: "studio", label: "Studio" },
        { key: "street", label: "Street" },
        { key: "detail", label: "Detail" }
      ]
    },
    about: {
      label: "About the studio",
      text: "COVE is a one-person photography studio making images for brands, magazines and musicians — slow, considered and made to *last.*",
      portraitUrl: "images/fashion-02.jpg",
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
        { title: "Enquiries", lines: ["hello@cove.studio", "+974 5500 0000"] }
      ],
      socials: [ { label: "Instagram", url: "https://www.instagram.com/" }, { label: "Behance", url: "https://www.behance.net/" } ],
      copyright: "© 2026 COVE Studio"
    }
  },
  projects: [
    { title: "Silk in Motion", category: "Studio",    grp: "studio",    client: "Maison Noir",   year: 2026, image_url: "images/fashion-01.jpg", width: 1800, height: 1344, sort: 1, show_hero: true, show_index: true, show_latest: true,  show_archive: true },
    { title: "Camel",          category: "Editorial", grp: "editorial", client: "Atelier Sable", year: 2026, image_url: "images/fashion-02.jpg", width: 1344, height: 1800, sort: 2, show_hero: true, show_index: true, show_latest: true,  show_archive: true },
    { title: "Dune Walk",      category: "Editorial", grp: "editorial", client: "Grey Journal",  year: 2025, image_url: "images/fashion-03.jpg", width: 1344, height: 1800, sort: 3, show_hero: true, show_index: true, show_latest: true,  show_archive: true },
    { title: "Gold Cuff",      category: "Detail",    grp: "detail",    client: "Vessel Jewellery", year: 2025, image_url: "images/fashion-04.jpg", width: 1800, height: 1800, sort: 4, show_hero: true, show_index: true, show_latest: false, show_archive: true },
    { title: "Concrete",       category: "Editorial", grp: "editorial", client: "Studio Ostra",  year: 2025, image_url: "images/fashion-05.jpg", width: 1344, height: 1800, sort: 5, show_hero: true, show_index: true, show_latest: true,  show_archive: true },
    { title: "Rue",            category: "Street",    grp: "street",    client: "Lumen Magazine", year: 2024, image_url: "images/fashion-06.jpg", width: 1800, height: 1344, sort: 6, show_hero: true, show_index: true, show_latest: true,  show_archive: true },
    { title: "Evening",        category: "Studio",    grp: "studio",    client: "Quiet Hours",   year: 2024, image_url: "images/fashion-07.jpg", width: 1344, height: 1800, sort: 7, show_hero: true, show_index: true, show_latest: true,  show_archive: true }
  ]
};
