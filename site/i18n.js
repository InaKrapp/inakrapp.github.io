/*
 * i18n flag switcher for Ina Krapp's website
 * ----------------------------------------------------------------
 * Architecture: ONE Quarto project, built by `quarto render` into docs/.
 *   - English pages live at the site root        ( /, /blog/..., /papers )
 *   - German  pages live under a /de/ section     ( /de/, /de/blog/... )
 *     (the site has one global English navbar; on /de/ pages we rewrite its
 *      labels and links to their German counterparts, see translateNav())
 *
 * The slide decks (revealjs) and the blog posts are NOT translated.
 *     Across languages the targetUrl() switcher therefore maps:
 *       - blog index <-> blog index
 *       - a blog post <-> its counterpart post (same file name)
 *       - papers <-> papers
 *       - presentations listing <-> counterpart listing
 *       - a slide deck <-> the counterpart PRESENTATIONS LISTING (a deck has
 *         no own page in the other language; its entry is in the listing)
 *
 * This script is injected verbatim into every HTML page (see _quarto.yml
 * format::html::include-after). On each page it:
 *   1. Injects a flag button into the navbar -> click to switch language.
 *   2. Rewrites the German section's navbar menu (labels + hrefs) EN->DE.
 *   3. Remembers the chosen language in localStorage("inaKrappLang").
 *   4. Auto-redirects once: on the English HOME page, if the visitor has no
 *      saved choice yet and the browser language is German, go to /de/.
 *
 * Paths are root-absolute (/de/..., /blog/...) because the site is served
 * from the domain root (username.github.io).
 *
 * Keep this file and the copy inlined in _quarto.yml in sync.
 */
(function () {
  var PREF = "inaKrappLang";
  // The project has a single (English) navbar, so on German pages we rewrite
  // both the label and the href of each nav item to its German counterpart.
  var DE_LINKS = {
    "Home": { text: "Startseite", href: "/de/index.html" },
    "Papers": { text: "Publikationen", href: "/de/papers/index.html" },
    "Presentations": { text: "Vorträge", href: "/de/presentations/index.html" },
    "Blog": { text: "Blog", href: "/de/blog/index.html" }
  };

  function readPref() { try { return localStorage.getItem(PREF) || ""; } catch (e) { return ""; } }
  function savePref(l) { try { localStorage.setItem(PREF, l); } catch (e) {} }
  function onGermanSite() { return /\/de\//.test(location.pathname); }

  function targetUrl() {
    var p = location.pathname;

    // ---- German page -> English counterpart --------------------------------
    if (onGermanSite(p)) {
      // index.html is normalized away, so a blog "index" maps to the index.
      p = p.replace(/index\.html(?=\/|$)/, "");
      var en = p.replace(/^\/de/, "").replace(/\/+$/, "");
      if (en === "") return "/index.html";
      if (en.indexOf("/blog") === 0) {
        var post = en.slice("/blog".length);          // e.g. "/Wisp.html"
        if (post) return "/blog" + post;              // post not translated -> /blog/Wisp.html
        return "/blog/index.html";
      }
      if (en.indexOf("/papers") === 0) return "/papers/index.html";
      if (en.slice(0, 14) === "/presentations") return "/presentations.html";
      return "/index.html";
    }

    // ---- English page -> German counterpart --------------------------------
    // A bare folder (e.g. /blog/) resolves on the server to its index page.
    if (p.slice(-1) === "/" && p !== "/") p = p + "index.html";

    // The presentations LISTING and its slide decks both map to the German
    // presentations LISTING (listings link back to the English decks, so the
    // visitor never lands on a 404).
    if (p.indexOf("/presentations") === 0) return "/de/presentations/index.html";

    var de = "/de" + p;
    if (de === "/de" || de === "/de/") return "/de/index.html";
    // Blog posts are not translated, so they keep their file name on /de/.
    if (/^\/de\/blog\/[^/]+$/.test(de)) {
      if (!/\.html$/.test(de)) de += ".html";
      return de;
    }
    // "pages"/"folders": index.html, trailing slash, or plain name.
    if (/\.html$/.test(de)) return de;
    if (de.slice(-1) === "/") return de;
    return de + "/index.html";
  }

  function flagIcon(kind) {
    if (kind === "de") {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" class="i18n-flag-svg" role="img" aria-label="Deutsch">'
        + '<rect width="5" height="3" fill="#000"/><rect width="5" height="2" y="1" fill="#DD0000"/><rect width="5" height="1" y="2" fill="#FFCE00"/></svg>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" class="i18n-flag-svg" role="img" aria-label="English" preserveAspectRatio="xMidYMid slice">'
      + '<rect width="60" height="30" fill="#012169"/>'
      + '<path d="M0,0 60,30 M60,0 0,30" stroke="#FFFFFF" stroke-width="6"/>'
      + '<path d="M0,0 60,30 M60,0 0,30" stroke="#C8102E" stroke-width="2"/>'
      + '<path d="M30,0 V30 M0,15 H60" stroke="#FFFFFF" stroke-width="10"/>'
      + '<path d="M30,0 V30 M0,15 H60" stroke="#C8102E" stroke-width="6"/></svg>';
  }

  function injectFlag() {
    if (document.getElementById("i18n-flag")) return;
    var navbar = document.querySelector(".navbar");
    if (!navbar) return;
    var onDE = onGermanSite(location.pathname);
    var link = document.createElement("a");
    link.id = "i18n-flag";
    link.className = "nav-link i18n-flag";
    link.href = targetUrl();
    link.title = onDE ? "Switch to English" : "Zum Deutschen wechseln";
    link.setAttribute("aria-label", link.title);
    link.innerHTML = flagIcon(onDE ? "gb" : "de") + '<span class="i18n-flag-txt">' + (onDE ? "EN" : "DE") + "</span>";
    link.addEventListener("click", function (e) { e.preventDefault(); savePref(onDE ? "en" : "de"); location.href = targetUrl(); });
    var tools = navbar.querySelector(".quarto-navbar-tools")
      || navbar.querySelector(".navbar-collapse")
      || navbar.querySelector(".navbar-container");
    if (tools) tools.appendChild(link);
  }

  function translateNav() {
    if (!onGermanSite(location.pathname)) return;
    // Re-point each nav item (label + href) to its German counterpart so the
    // menu stays inside /de/. Quarto only ships one global (English) navbar.
    document.querySelectorAll(".navbar .menu-text").forEach(function (el) {
      var t = el.textContent.trim();
      var map = DE_LINKS[t];
      if (!map) return;
      el.textContent = map.text;
      var link = el.closest("a");
      if (link) link.setAttribute("href", map.href);
    });
    // Re-point the brand/home link to the German home.
    var brand = document.querySelector(".navbar .navbar-brand");
    if (brand) brand.setAttribute("href", "/de/index.html");
  }

  function autoRedirect() {
    if (onGermanSite(location.pathname)) return;
    if (readPref()) return;
    var browser = (navigator.language || "").toLowerCase();
    if (browser.indexOf("de") !== 0) return;
    var atHome = location.pathname.replace(/index\.html(?=\/|$)/, "").replace(/\/+$/, "") === "";
    if (atHome) { savePref("de"); location.href = "/de/index.html"; }
  }

  function boot() { injectFlag(); translateNav(); autoRedirect(); }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); } else { boot(); }
})();
