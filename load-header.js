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
    fetch(base + 'header.html?v=' + Date.now(), { cache: 'no-store' })
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

                // Bounce animation — scale up to 1.25× then spring back
                var toggleBtn = this;
                toggleBtn.classList.remove('is-bouncing');
                void toggleBtn.offsetWidth;
                toggleBtn.classList.add('is-bouncing');
                setTimeout(function () {
                    toggleBtn.classList.remove('is-bouncing');
                }, 450);
            });
        });

        /* ── B. Header scroll — add .scrolled class ─────────── */
        var header = document.getElementById('main-header');
        if (header) {
            window.addEventListener('scroll', function () {
                header.classList.toggle('scrolled', window.scrollY > 50);
            }, { passive: true });
        }

        /* ── C. Mobile Mercury Drawer ────────────────────────────── */
        var hamburger = document.getElementById('hamburger-menu');
        var drawer    = document.getElementById('mobile-drawer');
        var backdrop  = document.getElementById('mobile-drawer-backdrop');
        var closeBtn  = document.getElementById('mobile-drawer-close');
        var pill      = document.getElementById('mdr-pill');
        var gooZone   = document.getElementById('mdr-goo-zone');
        var savedScrollY = 0;

        function openDrawer() {
            if (!drawer) return;
            savedScrollY = window.scrollY || window.pageYOffset;
            document.body.style.top = '-' + savedScrollY + 'px';
            document.body.classList.add('nav-open');
            drawer.classList.add('mdr-open');
            drawer.removeAttribute('aria-hidden');
            backdrop.classList.add('mdr-backdrop-on');
            if (hamburger) hamburger.classList.add('is-active');
        }

        function closeDrawer() {
            if (!drawer) return;
            drawer.classList.remove('mdr-open');
            drawer.setAttribute('aria-hidden', 'true');
            backdrop.classList.remove('mdr-backdrop-on');
            if (hamburger) hamburger.classList.remove('is-active');
            // close all open sub-menus
            drawer.querySelectorAll('.mdr-item.mdr-sub-open').forEach(function(item) {
                var toggle = item.querySelector('.mdr-btn');
                var sub = item.querySelector('.mdr-submenu');
                item.classList.remove('mdr-sub-open');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
                if (sub) { sub.classList.remove('mdr-sub-open'); sub.setAttribute('aria-hidden', 'true'); }
            });
            setTimeout(function () {
                document.body.classList.remove('nav-open');
                document.body.style.top = '';
                window.scrollTo(0, savedScrollY);
            }, 420);
        }

        if (hamburger) {
            hamburger.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                drawer && drawer.classList.contains('mdr-open') ? closeDrawer() : openDrawer();
            });
        }
        if (closeBtn)  closeBtn.addEventListener('click', closeDrawer);
        if (backdrop)  backdrop.addEventListener('click', closeDrawer);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawer && drawer.classList.contains('mdr-open')) closeDrawer();
        });

        /* Mercury pill positioning */
        function movePill(item) {
            if (!pill || !gooZone) return;
            var btn      = item.querySelector('.mdr-btn');
            if (!btn) return;
            var zoneRect = gooZone.getBoundingClientRect();
            var btnRect  = btn.getBoundingClientRect();
            var top      = btnRect.top - zoneRect.top;
            pill.style.top     = top + 'px';
            pill.style.height  = btnRect.height + 'px';
            pill.style.opacity = '1';
        }

        /* Active-state management */
        var mdrItems = drawer ? drawer.querySelectorAll('.mdr-item') : [];

        function setMdrActive(id) {
            mdrItems.forEach(function (item) {
                var isThis = item.dataset.mdrId === id;
                item.classList.toggle('mdr-active', isThis);
                if (isThis) movePill(item);
            });
        }

        /* Determine initial active page */
        var dpath   = window.location.pathname;
        var dActive = 'home';
        var dpkg    = /\/(gear-well-cleaning|oxidation-correction|preservation-consultation|flightline-standard|flightline-elite|flightline-command)\.html/;
        if      (/\/about\.html/.test(dpath))    dActive = 'about';
        else if (dpkg.test(dpath))               dActive = 'packages';
        else if (/\/services\//.test(dpath))     dActive = 'services';

        /* Set initial pill position after DOM paints */
        setTimeout(function () { setMdrActive(dActive); }, 60);

        /* Wire up nav item clicks */
        mdrItems.forEach(function (item) {
            var id     = item.dataset.mdrId;
            var hasSub = item.classList.contains('mdr-has-sub');
            var btn    = item.querySelector('.mdr-btn');
            var sub    = hasSub ? item.querySelector('.mdr-submenu') : null;

            if (!btn) return;

            btn.addEventListener('click', function (e) {
                if (hasSub) {
                    e.preventDefault();
                    var isNowOpen = !item.classList.contains('mdr-sub-open');

                    /* close all other open subs */
                    mdrItems.forEach(function (other) {
                        if (other === item || !other.classList.contains('mdr-has-sub')) return;
                        var oSub = other.querySelector('.mdr-submenu');
                        var oBtn = other.querySelector('.mdr-btn');
                        other.classList.remove('mdr-sub-open');
                        if (oBtn)  oBtn.setAttribute('aria-expanded', 'false');
                        if (oSub)  { oSub.classList.remove('mdr-sub-open'); oSub.setAttribute('aria-hidden', 'true'); }
                    });

                    item.classList.toggle('mdr-sub-open', isNowOpen);
                    btn.setAttribute('aria-expanded', isNowOpen ? 'true' : 'false');
                    if (sub) {
                        sub.classList.toggle('mdr-sub-open', isNowOpen);
                        sub.setAttribute('aria-hidden', isNowOpen ? 'false' : 'true');
                    }
                }
                setMdrActive(id);
            });

            /* Close drawer when a sub-link is tapped */
            if (sub) {
                sub.querySelectorAll('a').forEach(function (link) {
                    link.addEventListener('click', function () {
                        document.body.classList.remove('nav-open');
                        document.body.style.top = '';
                        drawer.classList.remove('mdr-open');
                        drawer.setAttribute('aria-hidden', 'true');
                        backdrop.classList.remove('mdr-backdrop-on');
                    });
                });
            } else if (btn.tagName === 'A') {
                btn.addEventListener('click', function () {
                    if (window.innerWidth <= 768) {
                        document.body.classList.remove('nav-open');
                        document.body.style.top = '';
                        drawer.classList.remove('mdr-open');
                        drawer.setAttribute('aria-hidden', 'true');
                        backdrop.classList.remove('mdr-backdrop-on');
                    }
                });
            }
        });

        /* Recalculate pill on resize (orientation change, etc.) */
        window.addEventListener('resize', function () {
            var active = drawer ? drawer.querySelector('.mdr-item.mdr-active') : null;
            if (active) movePill(active);
        });

        /* ── D. Dock — active state & indicator ──────────────────── */
        var dockItems  = document.querySelectorAll('.dock-item[data-dock-id]');
        var indicator  = document.getElementById('dock-indicator');
        var pillWrap   = document.querySelector('.dock-pill-wrap');

        // Determine initial active item from current URL
        var path      = window.location.pathname;
        var currentId = 'home';
        var packagePages = /\/(gear-well-cleaning|oxidation-correction|preservation-consultation|flightline-standard|flightline-elite|flightline-command)\.html/;
        if (/\/about\.html/.test(path))         currentId = 'about';
        else if (packagePages.test(path))        currentId = 'packages';
        else if (/\/services\//.test(path))      currentId = 'services';

        function updateIndicator() {
            if (!indicator || !pillWrap) return;
            var active = document.querySelector('.dock-item.active');
            if (!active) { indicator.style.opacity = '0'; return; }
            indicator.style.opacity = '1';
            var pr   = pillWrap.getBoundingClientRect();
            var ir   = active.getBoundingClientRect();
            var indW = 62;
            var left = (ir.left - pr.left) + (ir.width - indW) / 2;
            indicator.style.left = left + 'px';
        }

        function setActive(id) {
            if (id === currentId && document.querySelector('.dock-item.active')) return;
            currentId = id;
            dockItems.forEach(function (item) {
                item.classList.toggle('active', item.dataset.dockId === id);
            });
            updateIndicator();
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

        // Position indicator once layout has settled
        setTimeout(updateIndicator, 100);
        window.addEventListener('resize', updateIndicator);

        /* ── G. Magnetic icon pull (desktop only) ────────────── */
        if (window.innerWidth > 768) {
            dockItems.forEach(function (item) {
                var btn  = item.querySelector('.dock-btn, .theme-toggle');
                if (!btn) return;
                var icons = item.querySelectorAll('.theme-icon-dark, .theme-icon-light');
                var icon = icons.length ? null : (item.querySelector('.dock-btn > i'));

                btn.addEventListener('mousemove', function (e) {
                    var r  = btn.getBoundingClientRect();
                    var dx = (e.clientX - (r.left + r.width  / 2)) * 0.35;
                    var dy = (e.clientY - (r.top  + r.height / 2)) * 0.35;
                    if (icon) {
                        icon.style.setProperty('--dock-mx', dx.toFixed(2) + 'px');
                        icon.style.setProperty('--dock-my', dy.toFixed(2) + 'px');
                    }
                    icons.forEach(function (ic) {
                        ic.style.setProperty('--dock-mx', dx.toFixed(2) + 'px');
                        ic.style.setProperty('--dock-my', dy.toFixed(2) + 'px');
                    });
                });
                btn.addEventListener('mouseleave', function () {
                    if (icon) {
                        icon.style.setProperty('--dock-mx', '0px');
                        icon.style.setProperty('--dock-my', '0px');
                    }
                    icons.forEach(function (ic) {
                        ic.style.setProperty('--dock-mx', '0px');
                        ic.style.setProperty('--dock-my', '0px');
                    });
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
