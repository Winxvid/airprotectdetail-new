document.addEventListener('DOMContentLoaded', () => {
    // --- Hero Image Sequence Scroller ---
    const canvas = document.getElementById('hero-canvas');
    const heroSection = document.getElementById('hero');

    if (canvas && heroSection) {
        const context = canvas.getContext('2d');
        const frameCount = 300;

        // Match frames to the filenames in hero-sequence folder
        const currentFrame = index => (
            `assets/ezgif-frame-${index.toString().padStart(3, '0')}.png`
        );

        const images = [];
        const airprotectHero = {
            frame: 0
        };

        // Preload images
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            images.push(img);
        }

        const render = () => {
            const img = images[airprotectHero.frame];
            if (img && img.complete) {
                // Handle canvas sizing and aspect ratio
                const canvasAspect = canvas.width / canvas.height;
                const imgAspect = img.width / img.height;
                let drawWidth, drawHeight, offsetX, offsetY;

                // Adaptive fitting logic: 
                // In landscape (Desktop): use 'cover' to fill space.
                // In portrait (Mobile): use 'contain' to ensure sides aren't cropped.
                const isMobile = window.innerWidth <= 768;

                if (isMobile) {
                    // Force contain for mobile to avoid side cropping
                    if (canvasAspect > imgAspect) {
                        drawHeight = canvas.height * 0.4; // Slightly smaller to accommodate dual reflection
                        drawWidth = drawHeight * imgAspect;
                    } else {
                        drawWidth = canvas.width;
                        drawHeight = canvas.width / imgAspect;
                    }

                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = (canvas.height - drawHeight) / 2; // Center main content vertically

                    context.clearRect(0, 0, canvas.width, canvas.height);

                    // 1. Draw Original Image (Centered)
                    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

                    // 2. Draw Bottom Mirror Reflection
                    context.save();
                    context.translate(0, (offsetY + drawHeight) * 2);
                    context.scale(1, -1);
                    context.filter = 'blur(12px)';
                    context.globalAlpha = 0.25;
                    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                    context.restore();

                    // 3. Draw Top Mirror Reflection
                    context.save();
                    context.translate(0, offsetY * 2);
                    context.scale(1, -1);
                    context.filter = 'blur(12px)';
                    context.globalAlpha = 0.25;
                    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                    context.restore();

                    // 4. Gradient Masks for seamless blending
                    // Top Shadow/Fade
                    const topFade = context.createLinearGradient(0, 0, 0, offsetY);
                    topFade.addColorStop(0, 'rgba(9, 17, 27, 1)');
                    topFade.addColorStop(1, 'rgba(9, 17, 27, 0)');
                    context.fillStyle = topFade;
                    context.fillRect(0, 0, canvas.width, offsetY);

                    // Bottom Shadow/Fade
                    const bottomFade = context.createLinearGradient(0, offsetY + drawHeight, 0, canvas.height);
                    bottomFade.addColorStop(0, 'rgba(9, 17, 27, 0)');
                    bottomFade.addColorStop(1, 'rgba(9, 17, 27, 1)');
                    context.fillStyle = bottomFade;
                    context.fillRect(0, offsetY + drawHeight, canvas.width, canvas.height - (offsetY + drawHeight));

                } else {
                    // Standard cover logic for desktop
                    if (canvasAspect > imgAspect) {
                        drawWidth = canvas.width;
                        drawHeight = canvas.width / imgAspect;
                    } else {
                        drawHeight = canvas.height;
                        drawWidth = canvas.height * imgAspect;
                    }
                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = (canvas.height - drawHeight) / 2;

                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                }

                // Overlay a global dark tint to maintain text readability
                context.fillStyle = 'rgba(9, 17, 27, 0.4)';
                context.fillRect(0, 0, canvas.width, canvas.height);
            }
        };

        const updateCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render();
        };

        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();

        // Elements for sequential reveal
        const line1 = document.getElementById('hero-line-1');
        const line2 = document.getElementById('hero-line-2');
        const line3 = document.getElementById('hero-line-3');
        const btns = document.getElementById('hero-btns-container');

        // Scroll listener to update frames and sequential reveals
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const scrollHeight = heroSection.offsetHeight - window.innerHeight;

            // Only calculate if we are within the hero section's scroll range
            if (scrollTop <= heroSection.offsetTop + scrollHeight) {
                const scrollFraction = Math.max(0, Math.min(1, scrollTop / scrollHeight));

                // Update Image Frame
                const frameIndex = Math.min(
                    frameCount - 1,
                    Math.floor(scrollFraction * frameCount)
                );

                if (airprotectHero.frame !== frameIndex) {
                    airprotectHero.frame = frameIndex;
                    requestAnimationFrame(render);
                }

                // Sequential Reveals
                if (scrollFraction >= 0.05) line1?.classList.add('revealed'); else line1?.classList.remove('revealed');
                if (scrollFraction >= 0.25) line2?.classList.add('revealed'); else line2?.classList.remove('revealed');
                if (scrollFraction >= 0.45) line3?.classList.add('revealed'); else line3?.classList.remove('revealed');
                if (scrollFraction >= 0.65) btns?.classList.add('revealed'); else btns?.classList.remove('revealed');
            }
        });

        // Initial render
        if (images[0].complete) {
            render();
        } else {
            images[0].onload = render;
        }
    }
    // --- End Hero Image Sequence ---

    const header = document.getElementById('main-header');

    // Header scroll background
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Back to top logic
    const backToTop = document.createElement('div');
    backToTop.id = 'back-to-top';
    backToTop.innerHTML = '↑';
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Intersection Observer for scroll reveals
    const revealElements = document.querySelectorAll('.service-card, .package-card, .location-item, .contact-container > div');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Staggered delay based on index (simplified)
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, index % 3 * 100);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });

    // Form submission mock
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'Request Sent!';
            btn.style.background = '#00d084';
            form.reset();
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = '';
            }, 3000);
        });
    }
});
