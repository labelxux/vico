# VICO — Accessibility Checklist (SI 5568 Part 1 / WCAG 2.0 AA)

**Last run:** 2026-09-22 · Findings referenced as F-xx are in [AUDIT.md](AUDIT.md).

Status key: ✅ Pass (verified) · ❌ Fail · ⏳ Manual test still required · ➖ Not applicable · 🔒 Third party (outside this repo)

"Verified" means checked in Chromium on a local copy of this branch with axe-core 4.10 and scripted DOM, keyboard and contrast checks. Screen-reader and cross-browser checks are listed separately and are **not** yet done.

---

## 1. Automated

| Check | `/` | `/menu/` | `/jobs/` | `/accessibility/` | `/en/*` |
|---|---|---|---|---|---|
| axe WCAG 2.0 A/AA + best-practice: 0 violations | ✅ (was 40) | ✅ (was 62) | ✅ | ✅ | ✅ |
| Playwright + @axe-core/playwright suite (`npm run test:a11y`) | ⏳ written, not yet run: Node isn't installed on the dev machine. Runs in CI on push/PR (`.github/workflows/a11y.yml`) |||||
| Pa11y (`npm run pa11y`, WCAG2AA, axe + HTML_CodeSniffer) | ⏳ first run in CI (non-blocking until baselined) |||||
| Lighthouse accessibility ≥ 0.95 (`npm run lighthouse`) | ⏳ first run in CI (non-blocking until baselined) |||||
| eslint-plugin-jsx-a11y | ➖ no React/JSX in this project |||||

## 2. Document & semantics

- ✅ `<html lang="he" dir="rtl">` on Hebrew pages, `lang="en" dir="ltr"` on `/en/`
- ✅ Unique, descriptive `<title>` per route
- ✅ Exactly one H1 per page, inside `<main id="main-content">` (F-03)
- ✅ Heading levels never skip; dish and cocktail names are headings; beers moved to H4 (F-08)
- ✅ Landmarks: `header`, labelled `nav` (main / mobile / quick actions / menu categories / footer), `main`, `footer` (F-03, F-16)
- ✅ Buttons are `<button>`, navigation is `<a>`; no clickable `div`/`span`
- ✅ Language of parts: English/Italian phrases carry `lang` (F-12)

## 3. Keyboard

- ✅ Skip link "דלג לתוכן הראשי" is the first Tab stop, visible on focus, and moves focus into `<main>` (F-04)
- ✅ No positive `tabindex`
- ✅ Visible focus ring on every interactive element: tomato-ink on light surfaces, cream on dark ones (F-10)
- ✅ Hidden mobile action bar is `inert` / `visibility:hidden`, so it can't be focused while invisible (F-06)
- ✅ Mobile drawer: `aria-expanded` + `aria-controls`; Esc closes it and returns focus to the button (F-11)
- ✅ Gallery pause/play button reachable and operable with Enter/Space (F-05)
- ✅ Instagram grid collapsed to one tab stop (the handle link) (F-09)
- ✅ Menu category links: real anchors to unique IDs; active one exposed with `aria-current` (F-14)
- ⏳ Full manual keyboard pass: Tab / Shift+Tab through every page in Chrome, Firefox, Safari; confirm no traps and logical order

## 4. Images & links

- ✅ Every `<img>` has `alt`; none are filenames; decorative images `alt=""`
- ✅ Dish-card images now `alt=""` (the name and description are already in the same link) (F-09)
- ✅ Map card has a descriptive link name; logo link "VICO — לעמוד הבית"
- ✅ Icon-only controls named: burger ("פתיחת ניווט"), language toggle ("English"/"עברית")
- ✅ `tel:` "הזמנת מקום" now says it's a phone call; decorative arrows hidden from AT
- ✅ Links that open a new window announce "(נפתח בחלון חדש)" / "(opens in a new tab)"
- ✅ Accessibility-statement link: real `<a href="/accessibility/">` in the footer, keyboard reachable, **also present without JavaScript** (F-15)

## 5. Menu page

- ✅ Dish names, descriptions and prices are real text
- ✅ Wine prices are a `<table>` with `<caption>`, `th scope="col"` (כוס/בקבוק), `th scope="row"` (wine), `scope="rowgroup"` (לבן/אדום/רוזה); empty glass cells say "לא מוגש בכוס" (F-07)
- ✅ Jumping to a category doesn't hide its heading under the sticky bars (`scroll-padding-top`)
- ⏳ Screen reader: table navigation (Ctrl+Alt+arrows in NVDA, rotor in VoiceOver) announces "wine, glass, price"

## 6. Contrast & visual

- ✅ All text ≥ 4.5:1. New tokens `--tomato-ink #C9363A` and `--sage-ink #59726B` for text and button fills; original colours kept for decoration (F-01)
- ✅ Hover states: link hover uses tomato-ink (4.6:1 on cream); button hover darkens further
- ✅ Focus ring visible on every surface
- ✅ Text over hero photo ≥ 4.5:1 at 375px and 1024px, measured from image pixels under the scrim (F-02)
- ✅ No information by colour alone (active category also has `aria-current`; "Coming soon" is text)
- ⏳ Re-check hero contrast at 400% zoom (the scrim stretches with the taller hero) and in Safari

## 7. Zoom / reflow

- ✅ 200% (640×400): no horizontal scroll; header collapses to the burger; sticky bars released on short viewports
- ✅ 400% (320×256): no horizontal scroll, no clipped text; hero copy clears the overlay header; header/category nav/mobile bar don't pin (F-13)
- ✅ Dish descriptions no longer truncated on narrow screens (F-13)
- ⏳ Real browser zoom (Ctrl/⌘ +) in Chrome, Firefox, Safari, and iOS text size at maximum

## 8. Motion

- ✅ Gallery has a pause button; `prefers-reduced-motion` stops it and makes it manually scrollable (F-05)
- ✅ Hero drift now plays once for 5s instead of looping forever
- ✅ Global `prefers-reduced-motion` rule removes all CSS animation and transitions

## 9. Screen readers — ⏳ all manual

| | NVDA + Chrome | NVDA + Firefox | VoiceOver + Safari (iPhone) |
|---|---|---|---|
| Page title announced | ⏳ | ⏳ | ⏳ |
| Skip link announced and works | ⏳ | ⏳ | ⏳ |
| Landmarks list (D / rotor) | ⏳ | ⏳ | ⏳ |
| Headings list (H / rotor): 1 H1, sections, dishes | ⏳ | ⏳ | ⏳ |
| Every link has a clear name; new-window note heard | ⏳ | ⏳ | ⏳ |
| Dish name → price → description read in order | ⏳ | ⏳ | ⏳ |
| Wine table: glass/bottle headers announced with each price | ⏳ | ⏳ | ⏳ |
| Decorative images silent | ⏳ | ⏳ | ⏳ |
| Mobile drawer: expanded/collapsed state, Esc | ⏳ | ⏳ | ⏳ (VoiceOver: two-finger scrub) |
| Gallery pause button | ⏳ | ⏳ | ⏳ |
| English phrases pronounced in English | ⏳ | ⏳ | ⏳ |

## 10. PDFs — ⏳ document-accessibility check required (SI 5568 Part 2)

The HTML audit does **not** cover these. Check with PAC 2024 and Acrobat's accessibility checker. The best fix is to re-export from Google Docs with the document language set to Hebrew and a title set, or to replace each PDF with an HTML page.

| Check | Accessibility statement `assets/vico-accessibility-statement.pdf` | Club terms `assets/VICO_member-club-terms.pdf` | Privacy policy `assets/VICO-privacy-policy.pdf` |
|---|---|---|---|
| Tagged PDF | present (unverified) | present (unverified) | present (unverified) |
| Document language = he-IL | ❌ `/Lang (en)` | ❌ `/Lang (en)` | ❌ `/Lang (en)` |
| Title set and shown in the title bar | ❌ blank | ❌ "Member Club" | ❌ none |
| Reading order / bidi of mixed text | ❌ text layer shows `ltd.vico.www`, `,17`, `)…(` | ⏳ | ⏳ |
| Headings tagged | ⏳ | ⏳ | ⏳ |
| Lists tagged | ⏳ | ⏳ | ⏳ |
| Links tagged and named | ⏳ | ⏳ | ⏳ |
| Real text (not image-only) | ✅ | ⏳ | ⏳ |
| Contrast | ⏳ | ⏳ | ⏳ |
| PAC / Acrobat checker clean | ⏳ | ⏳ | ⏳ |

## 11. Third-party flows (Tabit) — 🔒 manual; not modified

Record the result, date, browser/AT and a screenshot for each item. Report blockers to Tabit. The statement page already offers phone help (09-861-5866) as an alternative.

### Takeaway ordering — `tabitisrael.co.il/tabit-order?siteName=vico`
- ⏳ Reachable and completable with keyboard only (menu → item → modifiers → cart → checkout)
- ⏳ Focus always visible; no traps in item/modifier dialogs; Esc closes dialogs and focus returns
- ⏳ Every field has a visible label and a programmatic label (name, phone, email, pickup time, notes)
- ⏳ Required fields indicated in text, not colour alone
- ⏳ Error messages are text, next to the field, and announced (`aria-live`/focus moved)
- ⏳ OTP / SMS code: labelled input, enough time or a way to extend it, resend control reachable
- ⏳ Checkboxes (terms, marketing consent): real checkboxes, labelled, not pre-checked for marketing
- ⏳ Payment step reachable (don't submit a real payment during testing)
- ⏳ Language `he`, `dir=rtl`; contrast; 200% zoom
- ⏳ NVDA + Chrome, VoiceOver + iPhone Safari end to end
- Blockers found: _none recorded yet_

### Club signup — `customer-profile.tabit.cloud/…`
- ⏳ Keyboard only, start to finish
- ⏳ Field labels (name, phone, birthday, anniversary, email)
- ⏳ Date inputs usable by keyboard and screen reader
- ⏳ Errors announced and described in text
- ⏳ OTP flow as above
- ⏳ Consent checkboxes labelled, linked terms/privacy reachable, marketing not pre-checked
- ⏳ Success confirmation announced
- ⏳ NVDA + Chrome, VoiceOver + iPhone Safari
- Blockers found: _none recorded yet_

### Other external links
- ⏳ Google Maps, Waze, Instagram, WhatsApp open correctly from the keyboard (the external sites themselves are out of scope)

## 12. Accessibility statement

- ✅ HTML page at `/accessibility/`, linked from every footer; the August PDF is kept and linked from it
- ✅ Doesn't claim full compliance. It says the site is being brought in line with SI 5568 / WCAG 2.0 AA, that an audit was done and fixes made, and that manual testing is ongoing
- ⏳ **After** sections 9–11 pass: update the wording to state conformance with SI 5568 Part 1, WCAG 2.0, level AA, name the test date and tools/AT used, and re-export or retire the PDF
- ⏳ Business owner to confirm the physical-access details and contact details (copied from the August PDF)
