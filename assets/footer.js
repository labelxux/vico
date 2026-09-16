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
  var EXT_ICON = '<svg class="ext-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>';

  mount.outerHTML =
    '<footer class="footer" aria-label="פרטי VICO">' +
      '<div class="footer__inner">' +
        '<div class="footer__brand">' +
          '<img class="footer__mark" src="' + base + 'favicon-cream-on-green.svg" alt="VICO" />' +
          '<div class="footer__meta">' +
            '<div dir="ltr">Pizza · Pasta · Wine</div>' +
            '<div>כשר ✦ הרצליה</div>' +
          '</div>' +
        '</div>' +
        '<nav class="footer__links" aria-label="ניווט תחתון">' +
          '<a href="/menu/">תפריט</a>' +
          '<a href="' + ORDER_URL + '" target="_blank" rel="noopener">הזמנות' + EXT_ICON + '</a>' +
          '<a href="/#vico-signup">מועדון</a>' +
          '<a href="https://www.instagram.com/vico.restaurant" target="_blank" rel="noopener">אינסטגרם' + EXT_ICON + '</a>' +
        '</nav>' +
        '<div class="footer__contact">' +
          '<div class="footer__contact-row">' +
            '<a href="https://maps.app.goo.gl/E5HKvH8AC47fy9RW8" target="_blank" rel="noopener">אבן עזרא 17, הרצליה</a>' +
            '<a dir="ltr" href="tel:+97298615866">09-861-5866</a>' +
            '<span>א׳–ה׳ 12:00–23:00</span>' +
          '</div>' +
        '</div>' +
        '<div class="footer__legal">' +
          '<a href="' + base + 'vico-accessibility-statement.pdf" target="_blank" rel="noopener">הצהרת נגישות</a>' +
          '<a href="' + base + 'VICO-privacy-policy.pdf" target="_blank" rel="noopener">מדיניות פרטיות</a>' +
          '<a href="' + base + 'VICO_member-club-terms.pdf" target="_blank" rel="noopener">תקנון המועדון</a>' +
          '<a href="/jobs/">עובדים איתנו</a>' +
        '</div>' +
      '</div>' +
    '</footer>';
})();
