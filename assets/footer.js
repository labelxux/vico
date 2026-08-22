/* Shared VICO site footer. Drop-in usage on any page:
 *   <link rel="stylesheet" href="{path-to}/ds/footer.css" />
 *   <div id="site-footer"></div>
 *   <script src="{path-to}/assets/footer.js"></script>
 * The asset paths below resolve relative to this script's own folder, so no
 * per-page configuration is needed regardless of how deep the page sits.
 */
(function () {
  "use strict";
  var mount = document.getElementById("site-footer");
  if (!mount) return;

  var base = new URL(".", document.currentScript.src).href;

  mount.outerHTML =
    '<footer class="footer" aria-label="פרטי VICO">' +
      '<div class="footer__inner">' +
        '<div class="footer__brand">' +
          '<img class="footer__mark" src="' + base + 'favicon-cream-on-green.svg" alt="VICO" />' +
          '<div class="footer__meta">' +
            '<div dir="ltr">kosher כשר ✦ Est 2026 ✦ Pizza · Pasta · Wine</div>' +
            '<a class="footer__address" href="https://maps.app.goo.gl/E5HKvH8AC47fy9RW8" target="_blank" rel="noopener">אבן עזרא 17, הרצליה</a>' +
          '</div>' +
        '</div>' +
        '<div class="footer__links">' +
          '<a href="https://www.instagram.com/vico.restaurant" target="_blank" rel="noopener">עקבו אחרינו</a>' +
          '<a href="https://waze.com/ul?ll=32.1691253,34.8355557&navigate=yes" target="_blank" rel="noopener">איך מגיעים?</a>' +
          '<a href="' + base + 'vico-accessibility-statement.pdf" target="_blank" rel="noopener">הצהרת נגישות</a>' +
          '<a href="' + base + 'VICO-privacy-policy.pdf" target="_blank" rel="noopener">מדיניות פרטיות</a>' +
        '</div>' +
      '</div>' +
    '</footer>';
})();
