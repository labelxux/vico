/* VICO analytics — GA4 event layer shared by every page.
 * Load after the gtag snippet:  <script src="{path-to}/assets/analytics.js"></script>
 *
 * Every event carries: page, location (header / hero / mobilebar / footer / section id),
 * label (button or link text) and, where relevant, item / category.
 * Manual use:  window.vicoTrack("event_name", { key: value })
 * Debug:       open any page with ?ga_debug=1 and watch GA4 → Admin → DebugView.
 */
(function () {
  "use strict";
  var ORDER_HOST = "tabitisrael.co.il";
  var CLUB_HOST = "customer-profile.tabit.cloud";

  var page = (function () {
    var p = location.pathname.replace(/\/index\.html$/, "");
    if (p === "" || p === "/") return "home";
    return p.replace(/^\/|\/$/g, "");
  })();

  var debug = /[?&]ga_debug=1/.test(location.search);
  try { if (debug) sessionStorage.setItem("vico_ga_debug", "1"); else if (sessionStorage.getItem("vico_ga_debug")) debug = true; } catch (e) {}

  function send(name, params) {
    var data = Object.assign({ page: page, lang: document.documentElement.lang || "he" }, params || {});
    if (debug) data.debug_mode = true;
    try {
      if (typeof window.gtag === "function") window.gtag("event", name, data);
      if (debug && window.console) console.log("[vico-ga]", name, data);
    } catch (e) {}
  }
  window.vicoTrack = send;

  // ---- context helpers ----
  function text(el) {
    var t = (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim();
    return t.slice(0, 80);
  }
  function locationOf(el) {
    var loc = el.closest("[data-loc]");
    if (loc) return loc.getAttribute("data-loc");
    var sec = el.closest("section[id], main[id], nav[id]");
    if (sec) return sec.id.replace(/^vico-/, "");
    return "page";
  }
  function classify(a) {
    var href = a.getAttribute("href") || "";
    var url;
    try { url = new URL(href, location.href); } catch (e) { return null; }
    var host = url.hostname;
    if (host === ORDER_HOST) return "order_click";
    if (host === CLUB_HOST) return "club_join_click";
    if (url.protocol === "tel:") return "phone_click";
    if (host === "wa.me" || host === "api.whatsapp.com") return "whatsapp_click";
    if (/waze\.com$/.test(host)) return "navigate_click";
    if (/maps\.app\.goo\.gl$|google\.com$/.test(host) && /maps/.test(url.href)) return "navigate_click";
    if (/instagram\.com$/.test(host)) return "instagram_click";
    if (/\.pdf$/i.test(url.pathname)) return "document_click";
    if (host === location.hostname) {
      if (/^\/menu\/?$/.test(url.pathname)) return url.hash ? "menu_category_click" : "menu_click";
      if (url.pathname === "/jobs/") return "jobs_click";
      if (url.hash && url.pathname === location.pathname) return "anchor_click";
      return "internal_click";
    }
    return "outbound_click";
  }

  // ---- click tracking (delegated, covers injected header/footer too) ----
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest("a, button");
    if (!a) return;

    var explicit = a.getAttribute("data-track");
    var params = {
      location: locationOf(a),
      label: text(a),
      href: a.getAttribute("href") || undefined
    };

    var dish = a.closest(".dish");
    if (dish) {
      var n = dish.querySelector(".dish__name");
      params.item = n ? text(n) : params.label;
      params.category = ((a.getAttribute("href") || "").split("#")[1]) || undefined;
      return send("dish_click", params);
    }
    var cocktail = a.closest(".cocktail");
    if (cocktail) { var cn = cocktail.querySelector(".cocktail__name"); params.item = cn ? text(cn) : undefined; }

    if (explicit) return send(explicit, params);
    if (a.tagName === "A") {
      var name = classify(a);
      if (!name) return;
      if (name === "menu_category_click" || name === "anchor_click") params.category = (a.getAttribute("href") || "").split("#")[1];
      if (a.closest("nav")) params.nav = true;
      send(name, params);
    } else if (a.hasAttribute("data-burger")) {
      send("nav_open", { location: "header", state: a.getAttribute("aria-expanded") === "true" ? "close" : "open" });
    }
  }, true);

  // ---- section views (once per section per page view, ≥40% visible) ----
  if ("IntersectionObserver" in window) {
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || seen[e.target.id]) return;
        seen[e.target.id] = true;
        var p = { section: e.target.id.replace(/^vico-/, "") };
        var mode = e.target.getAttribute("data-mode");
        if (mode) p.mode = mode;
        send("section_view", p);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll("section[id], main[id]").forEach(function (s) { io.observe(s); });
  }

  // ---- scroll depth 25 / 50 / 75 / 100 ----
  (function () {
    var marks = [25, 50, 75, 100], fired = {};
    function check() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      var pct = Math.round((window.scrollY / max) * 100);
      marks.forEach(function (m) {
        if (pct >= m && !fired[m]) { fired[m] = true; send("scroll_depth", { percent: m }); }
      });
    }
    var t;
    window.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(check, 150); }, { passive: true });
  })();

  // ---- engagement: time on page buckets ----
  [15, 45, 90, 180].forEach(function (s) {
    setTimeout(function () { send("time_on_page", { seconds: s }); }, s * 1000);
  });

  // ---- exit intent: last thing the user was looking at before leaving ----
  var lastSection = null;
  if ("IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) lastSection = e.target.id.replace(/^vico-/, ""); });
    }, { threshold: 0.5 });
    document.querySelectorAll("section[id], main[id]").forEach(function (s) { io2.observe(s); });
  }
  var leaveSent = false;
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "hidden" || leaveSent || !lastSection) return;
    leaveSent = true;
    send("page_leave", { last_section: lastSection });
  });
})();
