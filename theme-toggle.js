/**
 * theme-toggle.js
 * Lightweight dark/light mode toggle.
 * Persists preference in localStorage and applies instantly on load.
 *
 * Usage — add this before </body> on every page:
 *   <script src="theme-toggle.js"></script>          ← root pages
 *   <script src="../theme-toggle.js"></script>        ← service pages
 */
(function () {
    var STORAGE_KEY = 'ap_theme';

    // Apply saved theme immediately (prevents flash of wrong theme)
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }

    // Wait for DOM before wiring up the toggle button(s)
    function init() {
        var toggles = document.querySelectorAll('.theme-toggle');
        if (!toggles.length) return;

        toggles.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var current = document.documentElement.getAttribute('data-theme');
                var next = current === 'light' ? 'dark' : 'light';

                if (next === 'dark') {
                    document.documentElement.removeAttribute('data-theme');
                } else {
                    document.documentElement.setAttribute('data-theme', next);
                }

                localStorage.setItem(STORAGE_KEY, next);

                // Update icon inside all toggles
                document.querySelectorAll('.theme-toggle-thumb i').forEach(function (icon) {
                    icon.className = next === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
                });
            });
        });

        // Set correct icon on load
        var isLight = document.documentElement.getAttribute('data-theme') === 'light';
        document.querySelectorAll('.theme-toggle-thumb i').forEach(function (icon) {
            icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
