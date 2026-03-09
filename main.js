document.addEventListener('DOMContentLoaded', () => {
    // --- Hero Scroll Animations ---
    const heroSection = document.getElementById('hero');

    if (heroSection) {
        const line1 = document.getElementById('hero-line-1');
        const line2 = document.getElementById('hero-line-2');
        const line3 = document.getElementById('hero-line-3');
        const btns = document.getElementById('hero-btns-container');

        // --- Throttled Scroll Listener ---
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollTop = window.scrollY;
                    const scrollHeight = heroSection.offsetHeight - window.innerHeight;

                    if (scrollTop <= heroSection.offsetTop + scrollHeight) {
                        const scrollFraction = Math.max(0, Math.min(1, scrollTop / scrollHeight));

                        if (scrollFraction >= 0.05) line1?.classList.add('revealed'); else line1?.classList.remove('revealed');
                        if (scrollFraction >= 0.25) line2?.classList.add('revealed'); else line2?.classList.remove('revealed');
                        if (scrollFraction >= 0.45) line3?.classList.add('revealed'); else line3?.classList.remove('revealed');
                        if (scrollFraction >= 0.65) btns?.classList.add('revealed'); else btns?.classList.remove('revealed');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    // --- End Hero Scroll Animations ---

    // Header scroll — load-header.js handles this now; keep as null-safe fallback
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

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

    // Web3Forms Form Submission
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = 'Sending...';
            btn.style.pointerEvents = 'none';

            const formData = new FormData(form);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.success) {
                    btn.innerText = 'Request Sent!';
                    btn.style.background = '#00d084';
                    form.reset();
                } else {
                    btn.innerText = 'Error Sending';
                    btn.style.background = '#e74c3c';
                    console.log(result);
                }
            } catch (error) {
                btn.innerText = 'Error Sending';
                btn.style.background = '#e74c3c';
                console.log(error);
            }

            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = '';
                btn.style.pointerEvents = 'currentColor';
            }, 4000);
        });
    }
});
