document.addEventListener("DOMContentLoaded", function () {
    const servicesSection = document.getElementById("services");
    if (!servicesSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add class to trigger CSS transitions
                servicesSection.classList.add("animate-active");
                // Stop observing once triggered (run once)
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.25, // Trigger when 25% of the section is visible
        rootMargin: "0px 0px -100px 0px" // Slight offset so it triggers a bit later
    });

    observer.observe(servicesSection);
});
