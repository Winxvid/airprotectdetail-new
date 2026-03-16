(function() {
    const { motion, useScroll, useTransform } = window.Motion;
    const { useRef, useEffect, useState } = React;

    const INTERIOR_SERVICES = [
        { id: 'int-1', label: 'Interior Cleaning & Detail', href: 'services/interior-cleaning.html', side: 'left' },
        { id: 'int-2', label: 'Leather Conditioning', href: 'services/leather-conditioning.html', side: 'left' },
        { id: 'int-3', label: 'Stain Removal', href: 'services/stain-removal.html', side: 'left' },
        { id: 'int-4', label: 'Lavatory & Galley Sanitation', href: 'services/lavatory-sanitation.html', side: 'right' },
        { id: 'int-5', label: 'Carpet & Upholstery Extraction', href: 'services/carpet-extraction.html', side: 'right' },
        { id: 'int-6', label: 'Wood & Trim Polishing', href: 'services/wood-polishing.html', side: 'right' },
        { id: 'int-7', label: 'Dry Cleaning Carpet & Upholstery', href: 'services/dry-cleaning.html', side: 'right' },
    ];

    // Scroll timeline (scrollYProgress 0–1 over 650vh):
    // 0.00 – 0.08 : title fades in
    // 0.00 – 0.12 : title rises from bottom to center
    // 0.12 – 0.20 : title locked at center
    // 0.20 – 0.30 : title fades out upward   ← image simultaneously fades in
    // 0.22 – 0.34 : image fades in
    // 0.34 – ~0.74: 8 tags stagger in
    // 0.74 – 0.84 : hold — everything visible
    // 0.84 – 0.96 : image + tags fade out

    function ServiceTag({ service, scrollYProgress, start, end }) {
        const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
        const y       = useTransform(scrollYProgress, [start, end], [20, 0]);
        return React.createElement(motion.a, {
            id: service.id,
            href: service.href,
            className: `hotspot-label hotspot-${service.side}`,
            style: {
                opacity,
                y,
                position: 'absolute',
                zIndex: 20,
                textDecoration: 'none',
                pointerEvents: 'auto'
            }
        }, service.label);
    }

    function InteriorServicesScroll() {
        const containerRef = useRef(null);
        const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

        useEffect(() => {
            const handleResize = () => setIsMobile(window.innerWidth <= 992);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);

        const { scrollYProgress } = useScroll({
            target: containerRef,
            offset: ["start start", "end end"]
        });

        // --- Title: rises from bottom → center → locks → fades out upward ---
        const titleY       = useTransform(scrollYProgress, [0, 0.12, 0.20, 0.30], ['40vh', '0vh', '0vh', '-20vh']);
        const titleOpacity = useTransform(scrollYProgress, [0, 0.08, 0.20, 0.30], [0, 1, 1, 0]);

        // --- Image: fades in as title exits ---
        const imgOpacity = useTransform(scrollYProgress, [0.22, 0.34, 0.84, 0.96], [0, 1, 1, 0]);

        // --- Tags group exit ---
        const tagsGroupOpacity = useTransform(scrollYProgress, [0.84, 0.96], [1, 0]);

        // Last tag finishes at 0.34 + (7 × 0.048) + 0.06 = 0.736 → hold 0.736–0.84 → fade 0.84–0.96
        const SEQUENCE_START = 0.34;
        const SEQUENCE_GAP   = 0.048;

        if (isMobile) return null;

        return React.createElement('div', {
            ref: containerRef,
            style: { height: '650vh', position: 'relative' }
        },
            React.createElement('div', {
                style: {
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }
            },
                // Title overlay — centered, parallaxes up as image reveals
                React.createElement(motion.div, {
                    style: {
                        y: titleY,
                        opacity: titleOpacity,
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center',
                        padding: '0 1rem',
                        pointerEvents: 'none',
                        zIndex: 20
                    }
                },
                    React.createElement('h2', {
                        style: {
                            background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-text))',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))',
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            lineHeight: '1.15',
                            margin: '0 0 1rem'
                        }
                    }, 'INTERIOR SERVICES'),
                    React.createElement('p', {
                        style: {
                            maxWidth: '750px',
                            margin: '0 auto',
                            color: 'var(--clr-text-muted)',
                            fontSize: '1rem',
                            lineHeight: '1.7'
                        }
                    }, 'At AirProtect, we excel in providing top-tier interior detailing services designed specifically for aircraft owners and aviation enthusiasts. Our expert team uses cutting-edge techniques and premium products to ensure your aircraft\'s interior is meticulously cleaned and maintained.')
                ),

                // Image + hotspot scene — fixed 600px container matching exterior
                React.createElement('div', {
                    className: "services-interactive",
                    style: {
                        width: '100%',
                        maxWidth: '1200px',
                        height: '600px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }
                },
                    React.createElement(motion.img, {
                        src: "assets/Interior_Services.png",
                        alt: "Aircraft Interior",
                        className: "plane-visual",
                        style: {
                            opacity: imgOpacity,
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            zIndex: 10
                        }
                    }),
                    React.createElement(motion.div, {
                        style: {
                            opacity: tagsGroupOpacity,
                            position: 'absolute',
                            inset: 0,
                            pointerEvents: 'none'
                        }
                    },
                        INTERIOR_SERVICES.map((service, index) => {
                            const start = SEQUENCE_START + (index * SEQUENCE_GAP);
                            const end   = start + 0.06;
                            return React.createElement(ServiceTag, {
                                key: service.id,
                                service,
                                scrollYProgress,
                                start,
                                end
                            });
                        })
                    )
                )
            )
        );
    }

    const rootElement = document.getElementById('interior-scroll-root');
    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(React.createElement(InteriorServicesScroll));
    }
})();
