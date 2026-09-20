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
  var EN = /^en\b/i.test(document.documentElement.lang);
  var P = EN ? "/en" : "";
  var S = EN ? {
    menu: "Menu", order: "Takeaway", about: "About", bar: "The Bar", club: "Club", contact: "Contact",
    orderBtn: "Order Takeaway", orderNow: "Order now", menuShort: "Menu", nav: "Main navigation",
    mobileNav: "Mobile navigation", openNav: "Open navigation", quick: "Quick actions", home: "VICO — home",
    lang: "עברית", langTitle: "עברית", langHref: location.pathname.replace(/^\/en(\/|$)/, "/") + location.hash
  } : {
    menu: "תפריט", order: "איסוף עצמי", about: "אצלנו", bar: "הבר", club: "מועדון", contact: "צור קשר",
    orderBtn: "הזמן Takeaway", orderNow: "הזמינו עכשיו", menuShort: "תפריט", nav: "ניווט ראשי",
    mobileNav: "ניווט נייד", openNav: "פתיחת ניווט", quick: "פעולות מהירות", home: "VICO — לעמוד הבית",
    lang: "EN", langTitle: "English", langHref: "/en" + location.pathname + location.hash
  };
  var LINKS = [
    { href: P + "/menu/", label: S.menu },
    { href: ORDER_URL, label: S.order, external: true, noIcon: true },
    { href: P + "/#vico-atmosphere", label: S.about },
    { href: P + "/#vico-bar", label: S.bar },
    { href: P + "/#vico-signup", label: S.club },
    { href: P + "/#vico-visit", label: S.contact }
  ];

  var EXT_ICON = '<svg class="ext-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>';

  function linkHtml(l, extraClass) {
    var cls = extraClass ? ' class="' + extraClass + '"' : "";
    var target = l.external ? ' target="_blank" rel="noopener"' : "";
    return '<a' + cls + ' href="' + l.href + '"' + target + '>' + l.label + (l.external && !l.noIcon ? EXT_ICON : "") + '</a>';
  }

  mount.outerHTML =
    '<header class="site-header site-header--' + variant + '" data-header data-loc="header">' +
      '<a class="site-header__logo-link" href="' + (P || "/") + '" aria-label="' + S.home + '">' +
        '<img class="site-header__logo" src="' + base + 'logo-clean-color.svg" alt="VICO" />' +
      '</a>' +
      '<nav class="site-header__nav" aria-label="' + S.nav + '">' +
        LINKS.map(function (l) { return linkHtml(l); }).join("") +
        '<a class="site-header__lang" href="' + S.langHref + '" lang="' + (EN ? "he" : "en") + '" title="' + S.langTitle + '" data-track="lang_switch">' + S.lang + '</a>' +
      '</nav>' +
      '<div class="site-header__actions">' +
        '<a class="btn btn--primary btn--md site-header__order-btn" href="' + ORDER_URL + '" target="_blank" rel="noopener">' + S.orderBtn + '</a>' +
        '<button type="button" class="site-header__burger" aria-label="' + S.openNav + '" aria-expanded="false" data-burger>' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</div>' +
    '</header>' +
    '<nav class="site-header__drawer" data-drawer hidden aria-label="' + S.mobileNav + '" data-loc="drawer">' +
      LINKS.map(function (l) { return linkHtml(l); }).join("") +
      '<a class="site-header__lang" href="' + S.langHref + '" lang="' + (EN ? "he" : "en") + '" data-track="lang_switch">' + S.lang + '</a>' +
    '</nav>' +
    '<div class="site-mobilebar" aria-label="' + S.quick + '" data-loc="mobilebar">' +
      '<a class="btn btn--primary btn--md site-mobilebar__order" href="' + ORDER_URL + '" target="_blank" rel="noopener">' + S.orderNow + '</a>' +
      '<a class="btn btn--secondary btn--md site-mobilebar__menu" href="' + P + '/menu/">' + S.menuShort + '</a>' +
    '</div>';

  document.body.classList.add("has-mobilebar");

  // On pages with a full-screen hero, keep the mobile bar hidden until the
  // visitor scrolls past it — the hero already carries the same two CTAs.
  function watchHero() {
    var hero = document.querySelector(".hero");
    var mobilebar = document.querySelector(".site-mobilebar");
    if (!hero || !mobilebar || !("IntersectionObserver" in window)) return;
    mobilebar.classList.add("is-hidden");
    new IntersectionObserver(function (entries) {
      mobilebar.classList.toggle("is-hidden", entries[0].isIntersecting);
    }, { rootMargin: "0px 0px -40% 0px" }).observe(hero);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchHero);
  else watchHero();

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
