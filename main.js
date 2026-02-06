document.addEventListener('DOMContentLoaded', () => {
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
