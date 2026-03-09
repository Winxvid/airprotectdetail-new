(function() {
    const { motion, useScroll, useTransform } = window.Motion;
    const { useRef, useEffect, useState } = React;

    const EXTERIOR_SERVICES = [
        { id: 'ext-1', label: 'Dry Wash', href: 'services/dry-wash.html', side: 'left' },
        { id: 'ext-2', label: 'Wet Wash', href: 'services/wet-wash.html', side: 'left' },
        { id: 'ext-3', label: 'Exterior Wax', href: 'services/exterior-wax.html', side: 'left' },
        { id: 'ext-4', label: 'Brightwork Polishing', href: 'services/brightwork-polishing.html', side: 'left' },
        { id: 'ext-5', label: 'Protective Coatings', href: 'services/protective-coatings.html', side: 'right' },
        { id: 'ext-6', label: 'Window Restoration & Polishing', href: 'services/window-restoration.html', side: 'right' },
        { id: 'ext-7', label: 'De-Ice Boot Refurbishment', href: 'services/de-ice-boot.html', side: 'right' },
        { id: 'ext-8', label: 'Paint Revitalization', href: 'services/paint-revitalization.html', side: 'right' },
    ];

    // Scroll timeline (scrollYProgress 0–1 over 500vh):
    // 0.00 – 0.18 : plane fades in + flies in from right
    // 0.22 – 0.72 : 8 service tags stagger in
    // 0.72 – 0.88 : hold — all visible
    // 0.88 – 0.97 : plane exits left + fades out
    // 0.88 – 0.98 : tag group fades out

    function ExteriorServicesScroll() {
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

        // --- Title: rises from bottom → center → locks → fades out upward as plane comes in ---
        const titleY       = useTransform(scrollYProgress, [0, 0.10, 0.17, 0.26], ['40vh', '0vh', '0vh', '-20vh']);
        const titleOpacity = useTransform(scrollYProgress, [0, 0.08, 0.17, 0.26], [0, 1, 1, 0]);

        // --- Plane: enters as title exits, then exits at end ---
        const planeX       = useTransform(scrollYProgress, [0.20, 0.34, 0.84, 0.96], ['60%', '0%', '0%', '-70%']);
        const planeOpacity = useTransform(scrollYProgress, [0.20, 0.32, 0.84, 0.96], [0, 1, 1, 0]);

        // --- Tags group exit (fades with plane) ---
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
                // Title overlay — centered on sticky container, parallaxes up as plane reveals
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
                    }, 'EXTERIOR PRESERVATION'),
                    React.createElement('p', {
                        style: {
                            maxWidth: '750px',
                            margin: '0 auto',
                            color: 'var(--clr-text-muted)',
                            fontSize: '1rem',
                            lineHeight: '1.7'
                        }
                    }, 'At AirProtect, we specialize in delivering premium exterior detailing services tailored for aviation enthusiasts and aircraft owners. Our skilled team utilizes industry-leading products and state-of-the-art equipment to ensure every detail of your aircraft receives the care it deserves.')
                ),
                // Plane + hotspot scene — same fixed 600px container as interior
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
                        src: "assets/Exterior_Services.png",
                        alt: "Aircraft Exterior",
                        className: "plane-visual",
                        style: {
                            x: planeX,
                            opacity: planeOpacity,
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
                        EXTERIOR_SERVICES.map((service, index) => {
                            const start   = SEQUENCE_START + (index * SEQUENCE_GAP);
                            const end     = start + 0.06;
                            const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
                            const y       = useTransform(scrollYProgress, [start, end], [20, 0]);
                            return React.createElement(motion.a, {
                                key: service.id,
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
                        })
                    )
                )
            )
        );
    }

    const rootElement = document.getElementById('exterior-scroll-root');
    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(React.createElement(ExteriorServicesScroll));
    }
})();
