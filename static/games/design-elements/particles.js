particlesJS("particles-js", {
    particles: {
        number: {
            value: 80,
            density: { enable: true, value_area: 300 }
        },
        color: { value: hexcolor(50, 50 + 5*13, 250-5*13) },
        shape: {
            type: "polygon",
            stroke: { width: 0, color: hexcolor(50, 50 + 9*13, 250-9*13) },
            polygon: { nb_sides: 6 },
            image: { src: "", width: 100, height: 100 }
        },
        opacity: {
            value: 0.5,
            random: false,
            anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false }
        },
        size: {
            value: 2,
            random: true,
            anim: { enable: false, speed: 40, size_min: 0.1, sync: false }
        },
        line_linked: {
            enable: true,
            distance: 120,
            color: hexcolor(50, 50 + 7*13, 250-7*13),
            opacity: 0.80,
            width: 1
        },
        move: {
            enable: true,
            speed: 0.3,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "bounce",
            bounce: true,
            attract: { enable: false, rotateX: 600, rotateY: 1200 }
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "grab" },
            onclick: { enable: true, mode: "bubble" },
            resize: true
        },
        modes: {
            grab: { distance: 200, line_linked: { opacity: 0.6 } },
            bubble: { distance: 150, size: 3, duration: 0.25, opacity: 0.3, speed: 10 },
            repulse: { distance: 200, duration: 0.4 },
            push: { particles_nb: 4 },
            remove: { particles_nb: 2 }
        }
    },
    retina_detect: true
});
