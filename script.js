// ===== Fade-in on scroll =====
const sections = document.querySelectorAll("section");

const revealSection = () => {
    const triggerBottom = window.innerHeight * 0.85;

    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop < triggerBottom) {
            section.classList.add("visible");
        }
    });
};

window.addEventListener("scroll", revealSection);
window.addEventListener("load", revealSection);

// ===== Neon hover sound (optional later) =====
// You can add audio feedback or other effects here.
const neonElements = document.querySelectorAll(".neon-text");
neonElements.forEach(element => {
    element.addEventListener("mouseenter", () => {
        // Play hover sound or add additional effects here
        // Example: new Audio('hover-sound.mp3').play();
    });
});

// Fade-in on scroll
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
    threshold: 0.2
};

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
    });
}, appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});

