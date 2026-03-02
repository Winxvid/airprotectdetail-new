/**
 * load-footer.js
 * Dynamically loads the shared footer.html into every page.
 *
 * Usage — add this right before </body> in every page:
 *   <div id="footer-placeholder"></div>
 *   <script src="load-footer.js"></script>          ← root pages
 *   <script src="../load-footer.js"></script>        ← service pages
 *
 * The script auto-detects the page depth by checking its own <script> src
 * and replaces {{BASE}} placeholders in footer.html with the correct path.
 */
(function () {
    // Find the script tag that loaded this file
    const scripts = document.querySelectorAll('script[src*="load-footer"]');
    const scriptTag = scripts[scripts.length - 1];
    const src = scriptTag.getAttribute('src');

    // Derive the base path from how this script was referenced
    // e.g. "../load-footer.js" → base is "../"
    //      "load-footer.js"    → base is ""
    const base = src.substring(0, src.lastIndexOf('/') + 1);

    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;

    fetch(base + 'footer.html')
        .then(function (res) { return res.text(); })
        .then(function (html) {
            // Replace the {{BASE}} token with the correct relative path
            html = html.replace(/\{\{BASE\}\}/g, base);
            placeholder.innerHTML = html;

            // Kick-start the footer video (autoplay can be blocked until in DOM)
            var vid = placeholder.querySelector('video');
            if (vid) vid.play().catch(function () { /* autoplay blocked, ignore */ });
        })
        .catch(function (err) {
            console.error('Failed to load footer:', err);
        });
})();
