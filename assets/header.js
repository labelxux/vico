/* Shared VICO site header + mobile order bar. Drop-in usage on any page:
 *   <link rel="stylesheet" href="{path-to}/ds/header.css" />
 *   <div id="site-header" data-variant="overlay"></div>
 *   <script src="{path-to}/assets/header.js"></script>
 * data-variant: "overlay" (transparent, sits on top of a hero image — default)
 *               "solid"   (opaque bar for inner pages with no hero)
 * All links are root-relative ("/", "/menu/", "/#id") so they work from any
 * page depth. Requires the page's own .btn styles (defined per-page).
 */
(function () {
  "use strict";
  var mount = document.getElementById("site-header");
  if (!mount) return;

  var base = new URL(".", document.currentScript.src).href;
  var variant = mount.getAttribute("data-variant") || "overlay";

  var ORDER_URL = "https://tabitisrael.co.il/tabit-order?siteName=vico&step=enter";
  var LINKS = [
    { href: "/menu/", label: "תפריט" },
    { href: ORDER_URL, label: "הזמנות", external: true },
    { href: "/#vico-atmosphere", label: "אצלנו" },
    { href: "/#vico-bar", label: "הבר" },
    { href: "/#vico-signup", label: "מועדון" },
    { href: "/#vico-visit", label: "צור קשר" }
  ];

  var EXT_ICON = '<svg class="ext-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>';

  function linkHtml(l, extraClass) {
    var cls = extraClass ? ' class="' + extraClass + '"' : "";
    var target = l.external ? ' target="_blank" rel="noopener"' : "";
    return '<a' + cls + ' href="' + l.href + '"' + target + '>' + l.label + (l.external ? EXT_ICON : "") + '</a>';
  }

  mount.outerHTML =
    '<header class="site-header site-header--' + variant + '" data-header data-loc="header">' +
      '<a class="site-header__logo-link" href="/" aria-label="VICO — לעמוד הבית">' +
        '<img class="site-header__logo" src="' + base + 'logo-clean-color.svg" alt="VICO" />' +
      '</a>' +
      '<nav class="site-header__nav" aria-label="ניווט ראשי">' +
        LINKS.map(function (l) { return linkHtml(l); }).join("") +
      '</nav>' +
      '<div class="site-header__actions">' +
        '<a class="btn btn--primary btn--md site-header__order-btn" href="' + ORDER_URL + '" target="_blank" rel="noopener">הזמן Takeaway</a>' +
        '<button type="button" class="site-header__burger" aria-label="פתיחת ניווט" aria-expanded="false" data-burger>' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</div>' +
    '</header>' +
    '<nav class="site-header__drawer" data-drawer hidden aria-label="ניווט נייד" data-loc="drawer">' +
      LINKS.map(function (l) { return linkHtml(l); }).join("") +
    '</nav>' +
    '<div class="site-mobilebar" aria-label="פעולות מהירות" data-loc="mobilebar">' +
      '<a class="btn btn--primary btn--md site-mobilebar__order" href="' + ORDER_URL + '" target="_blank" rel="noopener">הזמינו עכשיו</a>' +
      '<a class="btn btn--secondary btn--md site-mobilebar__menu" href="/menu/">תפריט</a>' +
    '</div>';

  document.body.classList.add("has-mobilebar");

  var burger = document.querySelector("[data-burger]");
  var drawer = document.querySelector("[data-drawer]");
  if (burger && drawer) {
    burger.addEventListener("click", function () {
      var open = drawer.hasAttribute("hidden");
      if (open) { drawer.removeAttribute("hidden"); } else { drawer.setAttribute("hidden", ""); }
      burger.setAttribute("aria-expanded", String(open));
      burger.classList.toggle("is-open", open);
    });
    drawer.addEventListener("click", function (ev) {
      if (ev.target.tagName === "A") {
        drawer.setAttribute("hidden", "");
        burger.setAttribute("aria-expanded", "false");
        burger.classList.remove("is-open");
      }
    });
  }
})();
