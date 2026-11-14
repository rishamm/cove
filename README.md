# COVE — Photography portfolio

A minimal, black & white portfolio site for COVE with liquid "wave" motion built from the logo's own letterforms, smooth scrolling and a Supabase backend for every piece of content.

```
index.html        the site
css/style.css     styles
js/wave.js        wave engine — warps the COVE logo outlines in real time
js/main.js        rendering, loader, scroll + hover animation
js/data.js        loads content from Supabase (falls back to js/content.js)
js/content.js     default content (same shape as the database)
js/config.js      your Supabase URL + anon key
admin/            password-protected editor for text and photos
supabase/         schema.sql (tables, security, storage) + seed.sql (starter content)
images/           placeholder photos
```

The site works with no backend: it runs from `js/content.js` until Supabase is configured.

## Connect Supabase (10 minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query**: paste `supabase/schema.sql` and run it.
3. Add yourself as an admin (same SQL editor):
   ```sql
   insert into public.admins (email) values ('you@example.com');
   ```
4. **Authentication → Users → Add user**: create a user with that email and a password.
   Under **Authentication → Providers → Email**, you can switch off "Allow new users to sign up" so nobody else can register.
5. Optional: run `supabase/seed.sql` to load the starter text and placeholder photos.
6. **Project Settings → API**: copy the Project URL and the `anon` public key into `js/config.js`.
7. Open `/admin/`, sign in, and edit.

Only emails in the `admins` table can write; everyone can read. The anon key is meant to be public.

## Editing content

- **Content tab**: every text on the site — hero, contact details, manifesto, section titles, about, services, recognition, stats, footer blocks, social links. Wrap words in `*asterisks*` to set them in the italic serif; use a new line for a line break.
- **Photos tab**: upload photos (resized to 2400px, stored in the `photos` bucket), set title, category, client, year and archive filter, choose where each appears (hero collage — first 8, Selected work, The latest, Archive) and reorder with ↑ ↓.

Changes are live as soon as you save — no rebuild.

## Run locally

Any static server works:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Deploy

It's a static site: push to GitHub and connect the repo to Vercel, Netlify, Cloudflare Pages or GitHub Pages (no build command, output directory `/`).

## Tech

GSAP + ScrollTrigger, Lenis smooth scroll, Supabase JS v2, Google Fonts (Inter Tight, Cormorant Garamond). No build step.
