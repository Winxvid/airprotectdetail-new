const { motion, useScroll, useTransform } = window.Motion;
const { useRef } = React;

const EXTERIOR_SERVICES = [
    { id: 'ext-1', label: 'Dry Wash', href: 'dry-wash.html', side: 'left' },
    { id: 'ext-2', label: 'Wet Wash', href: 'wet-wash.html', side: 'left' },
    { id: 'ext-3', label: 'Exterior Wax', href: 'exterior-wax.html', side: 'left' },
    { id: 'ext-4', label: 'Brightwork Polishing', href: 'brightwork-polishing.html', side: 'left' },
    { id: 'ext-5', label: 'Protective Coatings', href: 'protective-coatings.html', side: 'right' },
    { id: 'ext-6', label: 'Window Restoration & Polishing', href: 'window-restoration.html', side: 'right' },
    { id: 'ext-7', label: 'De-Ice Boot Refurbishment', href: 'de-ice-boot.html', side: 'right' },
    { id: 'ext-8', label: 'Paint Revitalization', href: 'paint-revitalization.html', side: 'right' },
];

function ExteriorServicesScroll() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // --- Animation Logic ---
    // 0.0 - 0.3: Plane flies in from right (100% -> 0%)
    const planeX = useTransform(scrollYProgress, [0.1, 0.35], ['100%', '0%']);
    const planeOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

    // 0.35 - 0.7: Sequence fade in of labels
    // We map each label's opacity to a specific scroll range
    const getLabelOpacity = (index) => {
        const start = 0.35 + (index * 0.04); // Stagger by 0.04 scroll units
        const end = start + 0.05;
        return useTransform(scrollYProgress, [start, end], [0, 1]);
    };

    const getLabelY = (index) => {
        const start = 0.35 + (index * 0.04);
        const end = start + 0.05;
        return useTransform(scrollYProgress, [start, end], [20, 0]);
    };

    return React.createElement('div', { ref: containerRef, className: "relative h-[250vh]" }, // Tall container for scroll space
        React.createElement('div', { className: "sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden" },
            
            // Section Title (Static/Fades in)
            React.createElement(motion.div, { 
                style: { opacity: useTransform(scrollYProgress, [0.1, 0.2], [0, 1]) },
                className: "absolute top-[10%] w-full text-center z-10 px-4"
            },
                React.createElement('h2', { 
                    style: { background: 'linear-gradient(135deg, var(--clr-primary, #b08d27), var(--clr-text, #fff))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25))', fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: '0 0 1rem', fontWeight: '900', lineHeight: '1.15', textTransform: 'uppercase', fontFamily: '"Inter", sans-serif' } 
                }, "EXTERIOR PRESERVATION"),
                React.createElement('p', { 
                    style: { maxWidth: '800px', margin: '0 auto', color: 'var(--clr-text-muted, #abb8c3)', fontSize: '1.1rem', lineHeight: '1.6' }
                }, "At AirProtect, we specialize in delivering premium exterior detailing services tailored for aviation enthusiasts and aircraft owners.")
            ),

            // Interactive Plane Area
            React.createElement('div', { className: "relative w-full max-w-[1200px] h-[600px] flex items-center justify-center mt-20" },
                
                // Plane Image
                React.createElement(motion.img, {
                    src: "plane_exterior_top.png",
                    alt: "Aircraft Exterior",
                    style: { x: planeX, opacity: planeOpacity },
                    className: "absolute w-full h-full object-contain z-0 max-w-[90%] md:max-w-[70%]"
                }),

                // Hotspot Labels
                EXTERIOR_SERVICES.map((service, index) => {
                    const isLeft = service.side === 'left';
                    return React.createElement(motion.a, {
                        key: service.id,
                        href: service.href,
                        style: { opacity: getLabelOpacity(index), y: getLabelY(index) },
                        className: `absolute bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-900 px-4 py-2 rounded shadow-lg hover:text-[#d4af37] hover:border-[#d4af37] transition-colors duration-300 text-sm font-medium z-10 whitespace-nowrap hidden md:block`,
                        // Positioning styles (hardcoded relative positions based on the image layout)
                        // These positions are estimates based on the "hotspot-left/right" classes in CSS
                        style: {
                            opacity: getLabelOpacity(index),
                            y: getLabelY(index),
                            ...(isLeft ? { right: '55%', textAlign: 'right' } : { left: '55%', textAlign: 'left' }),
                            top: `${20 + (index * 10)}%` // Rough spacing
                        }
                    }, service.label);
                })
            )
        )
    );
}

// Render the component
const exteriorRoot = ReactDOM.createRoot(document.getElementById('exterior-services-root'));
exteriorRoot.render(React.createElement(ExteriorServicesScroll));
