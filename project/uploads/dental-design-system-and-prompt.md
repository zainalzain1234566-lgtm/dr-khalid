# Dr. Khalid Al-Attar Dental Clinic: Design System + Build Prompt

---

## PART 1: DESIGN SYSTEM

### 1. Brand personality
- **Warm, precise, trustworthy.** Premium without being cold.
- The coral (#DD6461) is the voice of the brand. Use it for actions and highlights, never as a large background (red in a medical context reads as blood or alarm).
- Airy layouts, generous whitespace, real photography, soft rounded shapes.

### 2. Color tokens

```css
:root {
  /* Brand */
  --brand-500: #DD6461;   /* primary: buttons, links, icons, highlights */
  --brand-600: #C9504D;   /* hover / pressed */
  --brand-700: #A83E3C;   /* text on light coral, focus rings */
  --brand-100: #FBE9E8;   /* soft tint: badges, icon circles, section accents */
  --brand-50:  #FDF5F4;   /* very soft tint: alternating section bg */

  /* Neutrals (warm) */
  --bg:        #FFFCFA;   /* page background, warm white */
  --surface:   #FFFFFF;   /* cards */
  --ink-900:   #1F2328;   /* headings */
  --ink-700:   #3D434A;   /* body text */
  --ink-500:   #6B7178;   /* secondary text */
  --line:      #EDE6E3;   /* borders, dividers */

  /* Support */
  --deep:      #22303C;   /* dark sections: footer, lab section */
  --success:   #2E9E6B;
  --warning:   #E0A33B;   /* star ratings */
  --whatsapp:  #25D366;   /* WhatsApp button only */
}
```

**Usage rules**
- Coral on white for buttons. White text on #DD6461 passes AA only at large/bold sizes, so buttons use **16px semibold minimum**. For small coral text, use `--brand-700`.
- Maximum one coral-filled element per screen area. Everything else is outline, tint, or neutral.
- Alternate sections between `--bg` and `--brand-50` for rhythm.
- One dark section (`--deep`) for the in-house lab, to make it feel technical and special.

### 3. Typography

| Role | Arabic | English |
|---|---|---|
| Headings | **Readex Pro** (600/700) | **Plus Jakarta Sans** (600/700) |
| Body | **IBM Plex Sans Arabic** (400/500) | **Inter** (400/500) |

Scale (mobile → desktop):
| Token | Size | Line height |
|---|---|---|
| display | 36 → 56px | 1.15 |
| h1 | 30 → 44px | 1.2 |
| h2 | 24 → 34px | 1.25 |
| h3 | 19 → 22px | 1.35 |
| body | 16 → 17px | 1.7 (Arabic) / 1.6 (English) |
| small | 14px | 1.5 |

- Arabic needs more line height than English; never go below 1.6 for Arabic body.
- Never use letter-spacing on Arabic text (it breaks letter joining).
- Use Western digits (0-9) in both languages for phone numbers and prices unless the doctor prefers Eastern Arabic digits.

### 4. Spacing, radius, shadow

- Spacing scale (4px base): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
- Section padding: 64px mobile / 112px desktop (vertical)
- Container: max 1200px, side gutter 20px mobile / 32px desktop
- Radius: `sm 8px` (inputs, tags) · `md 16px` (cards) · `lg 28px` (images, hero media) · `full` (buttons, avatars)
- Shadows (soft, warm-tinted):
  - `--shadow-sm: 0 2px 8px rgba(221,100,97,0.06)`
  - `--shadow-md: 0 8px 28px rgba(31,35,40,0.08)`
  - `--shadow-lg: 0 20px 50px rgba(31,35,40,0.12)`

### 5. Components

**Buttons**
- Primary: coral fill, white text, pill shape, 52px height, hover `--brand-600`, subtle lift on hover.
- Secondary: white fill, coral 1.5px border, coral-700 text.
- WhatsApp: green (#25D366), WhatsApp icon, text "احجز عبر واتساب" / "Book on WhatsApp".
- Sticky mobile bar (bottom): two buttons side by side, WhatsApp + Call. Always visible on mobile.

**Cards**
- Service card: white, radius 16, icon in a 56px `--brand-100` circle with coral icon, title, one-line description, hover lift + shadow-md.
- Doctor card: portrait photo (4:5), radius 28, name, specialty, years of experience. Main doctor card is 2x larger.
- Review card: white, 5 stars (`--warning`), quote text, patient first name + treatment tag, date.

**Before/after slider**
- Drag handle in the middle (white circle with coral arrows ↔).
- Labels "قبل / Before" and "بعد / After" in small pills on each side.
- Treatment tag under each case (e.g. Veneers, Implants).
- Same crop and angle for both photos in each pair.

**Forms (review submission)**
- Input height 52px, radius 8, border `--line`, focus ring 3px `--brand-100` + border `--brand-500`.
- Star rating selector: 5 large tappable stars (44px touch targets).
- Clear success state after submit: "Thank you, your review will appear after approval."

**Language switcher**
- Top bar pill: "EN | ع". Switches the whole page and flips direction.

### 6. RTL / bilingual rules
- Arabic is the default (`<html lang="ar" dir="rtl">`); English at `/en` with `dir="ltr"`.
- Use CSS logical properties everywhere (`margin-inline-start`, `padding-inline-end`, `inset-inline-start`), never left/right.
- Flip directional icons (arrows, chevrons) in RTL; do NOT flip logos, phone icons, or the before/after slider logic.
- All text lives in translation files (`ar.json`, `en.json`), never hardcoded.

### 7. Imagery
- Real clinic photos only. No stock "smiling model" images.
- Warm color grading, consistent across all photos.
- Doctors: consistent background and framing across all three portraits.
- Format: WebP, lazy-loaded except hero, max ~200KB each.

### 8. Motion
- Subtle only: fade-up on scroll (200–400ms, ease-out), hover lifts of 2–4px.
- Respect `prefers-reduced-motion`.
- No autoplay carousels.

### 9. Brand assets (from real files)

**Logo**
- A tooth outline drawn in one continuous brush stroke, with a script "K" inside. The style is elegant and calligraphic.
- The logo's red is **#F73E40**, brighter than the UI coral #DD6461. Keep the logo in its own color and never recolor it to #DD6461. The UI uses #DD6461 so the two reds don't clash. If they look off side by side, confirm with the doctor which red is the official one.
- Minimum size: 32px (favicon), 40px in the header.
- Clear space around the logo: at least half the logo's width.
- On dark sections (footer, lab), use an all-white version of the logo.
- Allowed as a decoration: the tooth outline stroke at 4–6% opacity, used as a large watermark behind the hero or doctors section.

**Doctor photos**
All three photos are **transparent cutouts** with no background, which gives the design a lot of freedom:
| Doctor | Photo | Role on site |
|---|---|---|
| **Dr. Khalid Jamal Al-Attar, B.D.S** (main) | White coat, black tie, facing forward, smiling | Hero image + large card in Doctors section |
| **Dr. Karrar Abdulhadi** | Black scrubs, arms crossed, blue gloves | Doctors section (secondary card) |
| **Dr. Ali Al-Aboudi** (د. علي العبودي) | Black scrubs, arms crossed, three-quarter pose | Doctors section (secondary card) |

Rules for the cutouts:
- Place every cutout on the **same backdrop**: a soft `--brand-100` circle or arch shape with the photo breaking out of the top edge (head overlaps the shape). This makes the three different photos look like one set.
- Dr. Khalid wears white while the other two wear black. Use this on purpose: he is the lead doctor, and the team shares one look.
- Align all portraits so heads sit at the same height and are about the same size.
- Dr. Khalid in the hero: large, on the end side, with a floating white card overlapping his shoulder, e.g. "B.D.S · Lead Dentist" plus a small rating chip.

---

## PART 2: SITE STRUCTURE

### Homepage (`/` Arabic, `/en` English)
1. **Header:** logo, nav (Services, Lab, Cases, Doctors, Reviews, Contact), language switcher, "Book" button
2. **Hero:** main doctor photo or clinic photo, headline, subheadline, WhatsApp + Call buttons, 3 trust badges (years of experience, number of patients, in-house lab)
3. **Services:** grid of service cards (from Instagram content)
4. **In-house lab (dark section):** photo of the lab, 3 benefits (faster delivery, precise fit, quality control)
5. **Before/after:** 3–4 slider cases + link to all cases
6. **Our doctors:** main doctor large, two doctors beside
7. **Clinic gallery:** masonry grid of the 10 photos with lightbox
8. **Reviews preview:** average rating + 3 cards + "See all" + "Write a review"
9. **Location & hours:** Google Maps embed, hours table, address
10. **Footer (dark):** logo, contacts, Instagram, hours, copyright

### Reviews page (`/reviews`)
- Header with average rating (big number + stars) and total count
- Filter by treatment
- Grid of approved reviews
- "Write a review" form: name, phone (private, not shown), treatment (dropdown), star rating, review text, consent checkbox
- Reviews are saved as **pending** and only appear after the doctor approves them

### Admin (`/admin`, password protected)
- Simple list of pending reviews: Approve / Reject / Delete
- Mobile-friendly (the doctor will use it from his phone)

---

## PART 3: BUILD PROMPT

Paste this into your coding tool with this whole file attached.

```
You are building a production website for a dental clinic: Dr. Khalid Al-Attar Dental Clinic in Iraq.
Follow the attached design system file exactly (colors, typography, spacing, components, RTL rules).
Do not invent new colors, fonts, or components outside it.

STACK
- Next.js (App Router) + TypeScript + Tailwind CSS
- Map every design token from the design system into tailwind.config and CSS variables
- i18n: Arabic default (RTL) at "/", English (LTR) at "/en". All text in ar.json / en.json
- Fonts via next/font: Readex Pro, IBM Plex Sans Arabic, Plus Jakarta Sans, Inter
- Reviews backend: Supabase (table `reviews`: id, name, phone, treatment, rating 1-5,
  text, status ['pending','approved','rejected'], created_at, locale)
- Row Level Security: public can INSERT with status='pending' only and SELECT only approved rows
- Admin page /admin protected by Supabase auth (one admin account)
- Basic spam protection on the review form: honeypot field + rate limit per IP
- Deploy target: Vercel

ASSETS (in /public)
- /logo.svg (or .png)
- /doctors/dr-khalid.webp, /doctors/dr-karrar.webp, /doctors/dr-ali.webp
- /clinic/01.webp ... /clinic/10.webp
- /lab/*.webp
- /cases/<case-name>/before.webp and after.webp
- Services list: see services section in content file

BUILD ORDER (one step at a time, wait for my approval between steps)
1. Set up project, tokens, fonts, i18n, and layout (header, footer, sticky mobile bar)
2. Hero section
3. Services section
4. In-house lab section
5. Before/after slider component + section
6. Doctors section
7. Clinic gallery with lightbox
8. Reviews: preview section, /reviews page, submission form, Supabase integration
9. /admin approval dashboard
10. Location & hours section
11. SEO: metadata per language, Open Graph image, sitemap, hreflang, favicon, LocalBusiness/Dentist schema

QUALITY RULES
- Mobile-first. Test every section at 375px width first
- Use logical CSS properties only (no left/right)
- Every image: next/image, WebP, alt text in both languages, lazy except hero
- Lighthouse target: 90+ on performance, accessibility, SEO
- Touch targets 44px minimum
- Respect prefers-reduced-motion
- WhatsApp link format: https://wa.me/964XXXXXXXXXX?text=<prefilled message in current language>
```

### Section prompts (use one at a time, after step 1)

**Hero**
```
Build the hero section per the design system. Split layout on desktop (text on the
start side, main doctor photo on the end side, radius 28, soft coral blob shape behind it).
Stacked on mobile (photo first, then text). Headline, subheadline, primary WhatsApp button,
secondary Call button, then a row of 3 trust badges with icons in --brand-100 circles.
```

**In-house lab**
```
Build the in-house lab section with the --deep background and white text. Lab photo
on one side, on the other side a short heading, one paragraph, and 3 benefit items
(fast delivery, precise fit, full quality control) with coral icons. This section
must feel technical and premium; it's our main differentiator.
```

**Before/after**
```
Build a reusable BeforeAfterSlider component: two stacked images, draggable vertical
handle (mouse + touch + keyboard arrows), "Before/After" pills, treatment tag below.
Works identically in RTL and LTR. Then build the section showing 4 cases in a grid
(1 column mobile, 2 columns desktop).
```

**Reviews page**
```
Build /reviews: rating summary header (average + stars + count), treatment filter
chips, grid of approved review cards, and the "Write a review" form per the design
system. On submit, insert as pending into Supabase and show the success state.
Phone number is never displayed publicly.
```

**Admin**
```
Build /admin: login screen, then a mobile-friendly list of pending reviews showing
name, rating, treatment, text, date, with Approve / Reject buttons. Tabs for
Pending / Approved / Rejected.
```

---

## PART 4: CLAUDE DESIGN PROMPT

Upload the logo and the 3 doctor photos (name the files `logo`, `dr-khalid`, `dr-karrar`, `dr-ali`), paste Parts 1 and 2, then send:

```
Design the homepage for Dr. Khalid Al-Attar Dental Clinic (Iraq), following the
design system and site structure above exactly.

- Arabic first (RTL). Show the desktop version (1440px) and the mobile version (390px) side by side.
- Use the uploaded logo as-is (its red is #F73E40). UI accent is #DD6461.
- Hero: Dr. Khalid Jamal Al-Attar (dr-khalid, transparent cutout) large on the
  end side, breaking out of a soft #FBE9E8 arch shape. Floating white card over
  his shoulder: "د. خالد جمال العطار · B.D.S". Headline on the start side, WhatsApp
  (green) + Call buttons, 3 trust badges including "مختبر أسنان داخل العيادة".
  Faint tooth-stroke watermark from the logo behind the hero.
- Doctors section: Dr. Khalid large, Dr. Karrar Abdulhadi (د. كرار عبد الهادي) and Dr. Ali Al-Aboudi (د. علي العبودي, dr-ali) smaller,
  all on identical arch backdrops, heads aligned to the same height.
- Include every homepage section from the structure. Use placeholder boxes
  labelled "clinic photo", "lab photo", "before", "after" where I haven't uploaded images yet.
- Coral is for accents only, never a large background. Warm white page,
  one dark #22303C section for the in-house lab.
- Fonts: Readex Pro for headings, IBM Plex Sans Arabic for body text.
- Mobile: sticky bottom bar with WhatsApp + Call.
```

Follow-ups to send after the first version:
- "Now show the English (LTR) version of the same page."
- "Design the /reviews page: rating summary, filter chips, review cards, and the write-a-review form with star selector and success state."
- "Design the mobile /admin screen for approving reviews."

---

## Content still needed from the Instagram material
- [ ] Services list (Arabic + English names, one line each)
- [ ] Specialties and years of experience for all three
- [ ] Headline / slogan the clinic uses
- [ ] Phone, WhatsApp number, address, Google Maps link, working hours
- [ ] Doctor's consent for each before/after case being published
