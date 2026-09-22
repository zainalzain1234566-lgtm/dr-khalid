# Design brief — /review page (Dr. Khalid Al-Attar Dental Clinic)

Extend the existing homepage design system (same tokens, fonts, RTL Arabic, calm motion). Design mobile (390px) + desktop (1440px).

## Page: `/review` — "قيّم تجربتك"
Single-column form, one card on warm `--bg`, reachable from the homepage Reviews section "اكتب تقييمك" button.

Fields, in order:
1. **Choose doctor** (required) — 3 selectable doctor cards with photo + name + role (radio behaviour, selected = brand-500 ring):
   - د. خالد جمال العطار — /doctors/dr-khalid.webp
   - د. كرار عبد الهادي — /doctors/dr-karrar.webp
   - د. علي العبودي — /doctors/dr-ali.webp
2. **Rating** (required) — 5 large tappable stars (`--warning` fill), label under them changes per value (1 سيئ … 5 ممتاز).
3. **Case / treatment** (required) — dropdown: زراعة الأسنان، تقويم الأسنان، التقويم الشفاف، ابتسامة المشاهير، حشوات تجميلية، تنظيف الأسنان بتقنية GBT، الأشعة الثلاثية، تركيبات المختبر.
4. **Description** (optional) — textarea, placeholder "احكِ لنا عن تجربتك…", 2000 char limit with counter.
5. **Submit** — primary pill button (brand-500, h-52px), full width on mobile.

States to design: empty, filled, field error (missing doctor/stars/case), submitting (button spinner), success (thank-you screen with back-to-home link), network error.

Constraints: Tailwind v4 tokens from `web/app/globals.css`; accessible (real radios/select under the hood, focus rings, 44px targets); no new fonts or icons libs.
