/* Shared VICO site header. Drop-in usage on any page:
 *   <link rel="stylesheet" href="{path-to}/ds/header.css" />
 *   <div id="site-header"></div>
 *   <script src="{path-to}/assets/header.js"></script>
 * The asset paths below resolve relative to this script's own folder, so no
 * per-page configuration is needed regardless of how deep the page sits.
 * Requires the page's own .btn styles (defined per-page, same as elsewhere).
 */
(function () {
  "use strict";
  var mount = document.getElementById("site-header");
  if (!mount) return;

  var base = new URL(".", document.currentScript.src).href;

  mount.outerHTML =
    '<div class="site-header">' +
      '<img class="site-header__logo" src="' + base + 'logo-clean-color.svg" alt="VICO" />' +
      '<a class="btn btn--primary btn--md site-header__order-btn" href="https://tabitisrael.co.il/tabit-order?siteName=vico&step=enter" target="_blank" rel="noopener">הזמן Takeaway</a>' +
    '</div>';
})();
