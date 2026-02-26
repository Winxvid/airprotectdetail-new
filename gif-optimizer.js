/**
 * GIF Optimizer
 * Conditionally loads and plays GIFs when they are in the viewport to improve performance.
 */
document.addEventListener('DOMContentLoaded', () => {
    const gifContainers = document.querySelectorAll('.gif-container');

    if ('IntersectionObserver' in window) {
        const gifObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                const container = entry.target;
                const isHero = container.classList.contains('service-hero');

                if (entry.isIntersecting) {
                    // When visible, set the background or src back to the GIF
                    if (isHero) {
                        const gifUrl = container.getAttribute('data-gif-url');
                        if (gifUrl) {
                            container.style.backgroundImage = `url('${gifUrl}')`;
                        }
                    } else {
                        const img = container.querySelector('img');
                        if (img && img.getAttribute('data-gif-src')) {
                            img.src = img.getAttribute('data-gif-src');
                        }
                    }
                } else {
                    // When not visible, replace with a static placeholder color or empty to save memory
                    // Optional: If we had static thumbnails, we'd use them here.
                    // For now, we'll just let the browser handle it, the hardware acceleration hints 
                    // already help significantly. 
                    // A more aggressive approach would be:
                    // if (isHero) container.style.backgroundImage = 'none';
                    // else if (img) img.src = '';
                }
            });
        }, {
            rootMargin: '100px', // Start loading slightly before it comes into view
            threshold: 0.01
        });

        gifContainers.forEach(container => {
            gifObserver.observe(container);

            // Setup data attributes for the observer
            if (container.classList.contains('service-hero')) {
                const style = container.getAttribute('style');
                const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (match) {
                    container.setAttribute('data-gif-url', match[1]);
                    // Optional: start with background: none; if you want to be very aggressive
                }
            } else {
                const img = container.querySelector('img');
                if (img) {
                    img.setAttribute('data-gif-src', img.src);
                }
            }
        });
    }
});
