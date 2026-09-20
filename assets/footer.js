/* Shared VICO site footer. Drop-in usage on any page:
 *   <link rel="stylesheet" href="{path-to}/ds/footer.css" />
 *   <div id="site-footer"></div>
 *   <script src="{path-to}/assets/footer.js"></script>
 * The asset paths below resolve relative to this script's own folder; page
 * links are root-relative so the footer works from any page depth.
 */
(function () {
  "use strict";
  var mount = document.getElementById("site-footer");
  if (!mount) return;

  var base = new URL(".", document.currentScript.src).href;
  var ORDER_URL = "https://tabitisrael.co.il/tabit-order?siteName=vico&step=enter";
  var EN = /^en\b/i.test(document.documentElement.lang);
  var P = EN ? "/en" : "";
  var S = EN ? {
    label: "VICO details", kosher: "Kosher ✦ Herzliya", nav: "Footer navigation", menu: "Menu", order: "Takeaway",
    club: "Club", insta: "Instagram", address: "17 Even Ezra St., Herzliya", hours: "Sun–Thu 12:00–23:00",
    a11y: "Accessibility statement", privacy: "Privacy policy", terms: "Club terms", jobs: "Work with us"
  } : {
    label: "פרטי VICO", kosher: "כשר ✦ הרצליה", nav: "ניווט תחתון", menu: "תפריט", order: "איסוף עצמי",
    club: "מועדון", insta: "אינסטגרם", address: "אבן עזרא 17, הרצליה", hours: "א׳–ה׳ 12:00–23:00",
    a11y: "הצהרת נגישות", privacy: "מדיניות פרטיות", terms: "תקנון המועדון", jobs: "עובדים איתנו"
  };

  mount.outerHTML =
    '<footer class="footer" aria-label="' + S.label + '" data-loc="footer">' +
      '<div class="footer__inner">' +
        '<div class="footer__brand">' +
          '<img class="footer__mark" src="' + base + 'favicon-cream-on-green.svg" alt="VICO" />' +
          '<div class="footer__meta">' +
            '<div dir="ltr">Pizza · Pasta · Wine</div>' +
            '<div>' + S.kosher + '</div>' +
          '</div>' +
        '</div>' +
        '<nav class="footer__links" aria-label="' + S.nav + '">' +
          '<a href="' + P + '/menu/">' + S.menu + '</a>' +
          '<a href="' + ORDER_URL + '" target="_blank" rel="noopener">' + S.order + '</a>' +
          '<a href="' + P + '/#vico-signup">' + S.club + '</a>' +
          '<a href="https://www.instagram.com/vico.restaurant" target="_blank" rel="noopener">' + S.insta + '</a>' +
        '</nav>' +
        '<div class="footer__contact">' +
          '<div class="footer__contact-row">' +
            '<a href="https://maps.app.goo.gl/E5HKvH8AC47fy9RW8" target="_blank" rel="noopener">' + S.address + '</a>' +
            '<span class="footer__sep" aria-hidden="true">✦</span>' +
            '<span>' + S.hours + '</span>' +
            '<span class="footer__sep" aria-hidden="true">✦</span>' +
            '<a dir="ltr" href="tel:+97298615866">09-861-5866</a>' +
          '</div>' +
        '</div>' +
        '<div class="footer__legal">' +
          '<a href="' + base + 'vico-accessibility-statement.pdf" target="_blank" rel="noopener">' + S.a11y + '</a>' +
          '<a href="' + base + 'VICO-privacy-policy.pdf" target="_blank" rel="noopener">' + S.privacy + '</a>' +
          '<a href="' + base + 'VICO_member-club-terms.pdf" target="_blank" rel="noopener">' + S.terms + '</a>' +
          '<a href="' + P + '/jobs/">' + S.jobs + '</a>' +
        '</div>' +
      '</div>' +
    '</footer>';
})();
