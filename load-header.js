/**
 * load-header.js
 * Dynamically loads the shared header.html into every page,
 * then bootstraps all header JavaScript:
 *   - Theme toggle (re-wires buttons after async injection)
 *   - Header scroll (.scrolled class)
 *   - Hamburger menu + mobile accordions
 *   - Liquid Gold Dock — active state, bubble tracking, scroll-spy
 *
 * Usage — add these two lines right inside <body> on every page:
 *   <div id="header-placeholder"></div>
 *   <script src="load-header.js"></script>          ← root pages
 *   <script src="../load-header.js"></script>        ← service pages
 *
 * The script auto-detects page depth from its own <script> src
 * and replaces {{BASE}} placeholders in header.html accordingly.
 */
(function () {

    /* ── 1. Locate this script tag to derive the base path ─── */
    var scripts = document.querySelectorAll('script[src*="load-header"]');
    var scriptTag = scripts[scripts.length - 1];
    var src = scriptTag.getAttribute('src');
    // e.g. "../load-header.js" → base = "../"   "load-header.js" → base = ""
    var base = src.substring(0, src.lastIndexOf('/') + 1);

    var placeholder = document.getElementById('header-placeholder');
    if (!placeholder) return;

    /* ── 2. Fetch, inject, then init ─────────────────────────── */
    fetch(base + 'header.html')
        .then(function (res) { return res.text(); })
        .then(function (html) {
            html = html.replace(/\{\{BASE\}\}/g, base);
            placeholder.outerHTML = html;        // replace placeholder with real HTML
            initHeader(base);
        })
        .catch(function (err) {
            console.error('[load-header] Failed to load header.html:', err);
        });

    /* ══════════════════════════════════════════════════════════
       initHeader — runs after HTML is in the DOM
    ══════════════════════════════════════════════════════════ */
    function initHeader(base) {

        /* ── A. Re-apply theme & wire toggle buttons ──────────
           theme-toggle.js handles the flash-prevention (sets
           data-theme on <html> synchronously), but the buttons
           aren't in the DOM when it runs (async injection).
           We re-wire them here. ───────────────────────────── */
        var THEME_KEY = 'ap_theme';
        var isLight = document.documentElement.getAttribute('data-theme') === 'light';

        // Correct the icon on the injected button
        document.querySelectorAll('.theme-toggle-thumb i').forEach(function (icon) {
            icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        });

        // Wire click handlers on all toggle buttons on the page
        document.querySelectorAll('.theme-toggle').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var current = document.documentElement.getAttribute('data-theme');
                var next = current === 'light' ? 'dark' : 'light';

                if (next === 'dark') {
                    document.documentElement.removeAttribute('data-theme');
                } else {
                    document.documentElement.setAttribute('data-theme', next);
                }
                localStorage.setItem(THEME_KEY, next);

                // Spin 0→180, swap icon at midpoint, finish 180→360
                document.querySelectorAll('.theme-toggle-thumb i').forEach(function (icon) {
                    icon.classList.remove('is-spinning-out', 'is-spinning-in');
                    void icon.offsetWidth; // force reflow to restart animation
                    icon.classList.add('is-spinning-out');
                    setTimeout(function () {
                        icon.classList.remove('is-spinning-out');
                        icon.className = (next === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon') + ' is-spinning-in';
                        setTimeout(function () { icon.classList.remove('is-spinning-in'); }, 300);
                    }, 200);
                });
            });
        });

        /* ── B. Header scroll — add .scrolled class ─────────── */
        var header = document.getElementById('main-header');
        if (header) {
            window.addEventListener('scroll', function () {
                header.classList.toggle('scrolled', window.scrollY > 50);
            }, { passive: true });
        }

        /* ── C. Hamburger + mobile nav ───────────────────────── */
        var hamburger = document.getElementById('hamburger-menu');
        var nav       = document.getElementById('main-nav');
        var pillWrap  = document.querySelector('.dock-pill-wrap');
        var body      = document.body;
        var animating = false;
        var savedScrollY = 0;

        function openMenu() {
            if (animating || nav.classList.contains('nav-open')) return;
            animating = true;
            // Save scroll position before locking (iOS Safari fix)
            savedScrollY = window.scrollY || window.pageYOffset;
            body.style.top = '-' + savedScrollY + 'px';
            nav.classList.add('nav-open');
            if (pillWrap) pillWrap.classList.add('nav-open');
            hamburger.classList.add('is-active');
            body.classList.add('nav-open');
            setTimeout(function () { animating = false; }, 450);
        }

        function closeMenu() {
            if (animating || !nav.classList.contains('nav-open')) return;
            animating = true;
            nav.classList.remove('nav-open');
            if (pillWrap) pillWrap.classList.remove('nav-open');
            hamburger.classList.remove('is-active');
            document.querySelectorAll('.has-dropdown.open').forEach(function (el) {
                el.classList.remove('open');
            });
            setTimeout(function () {
                body.classList.remove('nav-open');
                body.style.top = '';
                // Restore scroll position (iOS Safari fix)
                window.scrollTo(0, savedScrollY);
                animating = false;
            }, 450);
        }

        hamburger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            nav.classList.contains('nav-open') ? closeMenu() : openMenu();
        });

        // Mobile accordion for Services / Packages dropdowns
        document.querySelectorAll('.has-dropdown > .dropdown-toggle').forEach(function (toggle) {
            toggle.addEventListener('click', function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    var parent = this.closest('.has-dropdown');
                    document.querySelectorAll('.has-dropdown.open').forEach(function (el) {
                        if (el !== parent) el.classList.remove('open');
                    });
                    parent.classList.toggle('open');
                }
            });
        });

        // Close mobile nav when a real link is tapped
        document.querySelectorAll('#main-nav a:not(.dropdown-toggle)').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768) closeMenu();
            });
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (window.innerWidth <= 768 && nav.classList.contains('nav-open')) {
                if (!nav.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeMenu();
        });

        /* ── D. Dock — active state & bubble ─────────────────── */
        var dockItems = document.querySelectorAll('.dock-item[data-dock-id]');
        var bubble    = document.getElementById('dock-liquid-bubble');
        var pillWrap  = document.querySelector('.dock-pill-wrap');

        // Determine initial active item from current URL
        var path      = window.location.pathname;
        var currentId = 'home';
        var packagePages = /\/(gear-well-cleaning|oxidation-correction|preservation-consultation|flightline-standard|flightline-elite|flightline-command)\.html/;
        if (/\/about\.html/.test(path))         currentId = 'about';
        else if (packagePages.test(path))        currentId = 'packages';
        else if (/\/services\//.test(path))      currentId = 'services';

        function updateBubble() {
            if (!bubble || !pillWrap) return;
            var active = document.querySelector('.dock-item.active');
            if (!active) return;
            var pr   = pillWrap.getBoundingClientRect();
            var ir   = active.getBoundingClientRect();
            var bW   = 58;
            var left = (ir.left - pr.left) + (ir.width - bW) / 2;
            bubble.style.left = left + 'px';
        }

        function setActive(id) {
            if (id === currentId && document.querySelector('.dock-item.active')) return;
            currentId = id;
            dockItems.forEach(function (item) {
                item.classList.toggle('active', item.dataset.dockId === id);
            });
            updateBubble();
        }

        // Set initial active state
        setActive(currentId);

        // Wire click-to-activate on dock items (skip theme toggle)
        dockItems.forEach(function (item) {
            var id = item.dataset.dockId;
            if (!id || id === 'theme') return;
            var btn = item.querySelector('.dock-btn');
            if (btn) btn.addEventListener('click', function () { setActive(id); });
        });

        // Position bubble once layout has settled
        setTimeout(updateBubble, 100);
        window.addEventListener('resize', updateBubble);

        /* ── G. Magnetic icon pull (desktop only) ────────────── */
        if (window.innerWidth > 768) {
            dockItems.forEach(function (item) {
                var btn  = item.querySelector('.dock-btn, .theme-toggle');
                if (!btn) return;
                var icon = item.querySelector('.theme-toggle-thumb i') ||
                           item.querySelector('.dock-btn > i');
                if (!icon) return;

                btn.addEventListener('mousemove', function (e) {
                    var r  = btn.getBoundingClientRect();
                    var dx = (e.clientX - (r.left + r.width  / 2)) * 0.35;
                    var dy = (e.clientY - (r.top  + r.height / 2)) * 0.35;
                    icon.style.setProperty('--dock-mx', dx.toFixed(2) + 'px');
                    icon.style.setProperty('--dock-my', dy.toFixed(2) + 'px');
                });
                btn.addEventListener('mouseleave', function () {
                    icon.style.setProperty('--dock-mx', '0px');
                    icon.style.setProperty('--dock-my', '0px');
                });
            });
        }

        /* ── E. Smooth in-page scroll (index.html only) ──────── */
        var onIndex = /\/(index\.html)?$/.test(path);
        if (onIndex) {
            document.querySelectorAll('#main-nav a[href*="index.html#"], #main-nav a[href^="#"]')
                .forEach(function (link) {
                    link.addEventListener('click', function (e) {
                        var href = link.getAttribute('href');
                        var hash = href.indexOf('#');
                        if (hash === -1) return;
                        var targetId = href.substring(hash + 1);
                        var target   = document.getElementById(targetId);
                        if (target) {
                            e.preventDefault();
                            target.scrollIntoView({ behavior: 'smooth' });
                        }
                    });
                });
        }

        /* ── F. Scroll-spy (index.html only) ─────────────────── */
        if (onIndex) {
            var sections = [
                { el: 'hero',          id: 'home'     },
                { el: 'why-choose-us', id: 'home'     },
                { el: 'services',      id: 'services' },
                { el: 'packages',      id: 'packages' },
            ];

            window.addEventListener('scroll', function () {
                var winH      = window.innerHeight;
                var mid       = winH * 0.55;
                var candidate = 'home';

                sections.forEach(function (s) {
                    var el = document.getElementById(s.el);
                    if (el && el.getBoundingClientRect().top < mid) candidate = s.id;
                });

                // Nearing footer → highlight Quote
                var footer = document.getElementById('footer');
                if (footer && footer.getBoundingClientRect().top < winH * 0.8) candidate = 'quote';

                setActive(candidate);
            }, { passive: true });
        }
    }

})();
