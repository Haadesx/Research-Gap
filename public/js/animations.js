/**
 * Animations for Research Gap Identifier application
 * Using Anime.js for smooth, professional, and stunning animations
 */

// Easing functions (Refined for professional feel)
const easeOutExpo = 'cubicBezier(0.16, 1, 0.3, 1)'; // Standard Expo
const easeInOutExpo = 'cubicBezier(0.87, 0, 0.13, 1)';
const gentleElastic = 'cubicBezier(0.68, -0.6, 0.32, 1.6)'; // Subtle bounce
const defaultEasing = easeOutExpo; // Use Expo as default

// Shared Animation Properties (Example)
const fadeInUp = {
    opacity: [0, 1],
    translateY: [20, 0], // Reduced distance
    duration: 800,
    easing: defaultEasing
};

const scaleIn = {
    opacity: [0, 1],
    scale: [0.95, 1],
    duration: 800,
    easing: defaultEasing
};

let mainTimeline;
let particleAnimation;

document.addEventListener('DOMContentLoaded', () => {
    // Define primary RGB for CSS variables (fallback if not set)
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#4a63e7';
    document.documentElement.style.setProperty('--primary-rgb', hexToRgb(primaryColor));

    initializeBaseLayoutAnimations();
    addInteractiveHovers(); // Add hovers after initial layout animation

    // Event listeners
    document.getElementById('analyze-btn')?.addEventListener('click', () => animateTransition('upload-section', 'results-section'));
    document.getElementById('new-analysis-btn')?.addEventListener('click', () => animateTransition('results-section', 'upload-section'));
    // document.getElementById('toggle-chat-btn')?.addEventListener('click', animateChatReveal);

    // Initialize Particles.js if available
    if (window.particlesJS) {
        loadParticlesConfig();
    }
});

/**
 * Converts HEX color to RGB string for CSS variables.
 */
function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    // 3 digits
    if (hex.length == 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];
    // 6 digits
    } else if (hex.length == 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    }
    return `${+r}, ${+g}, ${+b}`;
}

/**
 * Loads Particles.js configuration.
 */
function loadParticlesConfig() {
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 60, // Reduced number
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#cccccc" // Lighter grey particles
            },
            "shape": {
                "type": "circle"
            },
            "opacity": {
                "value": 0.4, // More subtle
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 0.5,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 2, // Smaller particles
                "random": true
            },
            "line_linked": {
                "enable": false, // Disable lines
            },
            "move": {
                "enable": true,
                "speed": 0.8, // Slower movement
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": false // Disable hover interactivity
                },
                "onclick": {
                    "enable": false // Disable click interactivity
                },
                "resize": true
            }
        },
        "retina_detect": true
    }, () => {
        // Fade in particles container after load
        const particlesContainer = document.getElementById('particles-js');
        if (particlesContainer) {
             particleAnimation = anime({ targets: particlesContainer, opacity: [0, 1], duration: 3000, easing: 'linear' });
        }
    });
}

/**
 * Initializes animations for static elements like header, footer.
 */
function initializeBaseLayoutAnimations() {
    mainTimeline = anime.timeline({ easing: defaultEasing, delay: 100 }); // Slight delay

    // Prepare title letters
    const titleElement = document.querySelector('header .animate-title');
    if (titleElement) {
        const titleText = titleElement.textContent;
        titleElement.innerHTML = ''; // Clear existing content
        titleElement.style.opacity = 1;
        [...titleText].forEach(letter => {
            const span = document.createElement('span');
            span.textContent = letter === ' ' ? '\u00A0' : letter; // Use non-breaking space
            span.style.display = 'inline-block'; // Needed for transform
            span.style.opacity = 0;
            span.style.transform = 'translateY(30px)'; // Initial position
            titleElement.appendChild(span);
        });
    }

    // --- Master Entrance Timeline --- 
    mainTimeline
    .add({
        targets: 'header',
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 900,
        easing: 'easeOutCubic' // Keep distinct easing for header block
    })
    .add({
        targets: 'header .animate-title span',
        opacity: [0, 1],
        translateY: [30, 0],
        // rotateX: [-45, 0], // Optional subtle rotation
        duration: 1200,
        easing: 'easeOutExpo',
        delay: anime.stagger(40, { start: 100 }) // Stagger with start delay
    }, '-=600') // Overlap slightly
    .add({
        targets: 'header .animate-subtitle',
        ...fadeInUp,
        duration: 900,
    }, '-=1000') // Overlap more
    .add({
        targets: 'header #auth-container',
        ...fadeInUp,
        duration: 900,
    }, '-=800') // Overlap
    .add({
        targets: 'footer',
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeOutQuad', // Different easing for footer
        duration: 1000
    }, '-=500'); // Overlap with auth container
}

/**
 * Applies subtle transform hover effects.
 * Base visual styles (color, shadow) are handled by CSS.
 */
function addInteractiveHovers() {
    document.querySelectorAll('.btn, .google-login-btn, .result-card, .timeline-marker, #drop-area').forEach(el => {
        let hoverAnimation;
        const baseShadow = getComputedStyle(el).boxShadow; // Get base shadow from CSS

        el.addEventListener('mouseenter', () => {
            if (el.matches(':disabled') || el.matches('.disabled')) return;

            let scale = 1.03;
            let translateZ = 2;
            let duration = 250;
            // Use CSS hover styles for shadow, background etc.

            if (el.classList.contains('result-card') || el.id === 'drop-area') {
                scale = 1.01;
                translateZ = 5;
                duration = 300;
            } else if (el.classList.contains('timeline-marker')) {
                scale = 1.25;
                translateZ = 3;
                duration = 200;
            }

            anime.remove(el); // Remove any existing transform animations
            hoverAnimation = anime({
                targets: el,
                scale: scale,
                translateZ: translateZ,
                duration: duration,
                easing: 'easeOutQuad'
            });
        });

        el.addEventListener('mouseleave', () => {
            if (el.matches(':disabled') || el.matches('.disabled')) return;

            anime.remove(el);
            hoverAnimation = anime({
                targets: el,
                scale: 1,
                translateZ: 0,
                duration: 400, // Slower return
                easing: 'easeOutQuad'
            });
        });
    });
}

/**
 * Animates section transitions using a HYPER REALISTIC camera lens effect.
 */
function animateTransition(fromSectionId, toSectionId) {
    const fromSection = document.getElementById(fromSectionId);
    const toSection = document.getElementById(toSectionId);
    const lensOverlay = document.getElementById('lens-overlay');
    const lensAssembly = lensOverlay?.querySelector('.lens-assembly');
    const lensRings = lensAssembly?.querySelector('.lens-rings');
    const aperture = lensAssembly?.querySelector('.aperture');
    const innerLens = aperture?.querySelector('.inner-lens'); // Target inner lens
    const apertureBlades = aperture?.querySelectorAll('.aperture-blade');
    const lensGlare = aperture?.querySelector('.lens-glare'); // Target glare
    const lensContent = lensAssembly?.querySelector('.lens-content');

    if (!fromSection || !toSection || !lensOverlay || !lensAssembly || !lensRings || !aperture || !innerLens || !apertureBlades || apertureBlades.length === 0 || !lensGlare || !lensContent) {
        console.error("Missing elements for HYPER REALISTIC lens transition v2");
        // Fallback remains the same
        fromSection.classList.add('hidden');
        toSection.classList.remove('hidden');
        if (toSectionId === 'results-section') {
            if (window.animateLoading) animateLoading(false);
        }
        return;
    }

    const isEnteringResults = (toSectionId === 'results-section');
    const transitionDuration = 1800; // Even slower for more detail
    const openCloseDuration = transitionDuration * 0.7;
    const fadeDuration = transitionDuration * 0.3;

    // Reset styles
    lensOverlay.classList.remove('hidden');
    lensOverlay.classList.add('active');
    lensContent.style.opacity = 0;
    lensContent.style.transform = 'translateZ(75px) scale(0.9)'; // Match new CSS
    lensGlare.style.opacity = 0; // Ensure glare starts hidden
    updateProgressBar(0);

    // Stop any existing wobble before starting new timeline
    anime.remove('.lens-rings');

    const tl = anime.timeline({
        easing: 'easeInOutCirc', // Circular easing for smooth mechanical feel
        complete: () => {
            if (!isEnteringResults) {
                lensOverlay.classList.add('hidden');
                lensOverlay.classList.remove('active');
            }
            // Reset transforms and re-apply wobble if needed
            lensAssembly.style.transform = 'rotateX(10deg) rotateY(-15deg) rotateZ(5deg)';
            // anime({ targets: '.lens-rings', /* re-apply wobble animation if desired */ });
        }
    });

    // --- Animation Steps ---

    // 1. Fade in Overlay & Lens Assembly Entrance (More dynamic)
    tl.add({
        targets: lensOverlay,
        opacity: [0, 1],
        duration: fadeDuration * 1.2, // Longer fade
        easing: 'linear'
    })
    .add({
        targets: lensAssembly,
        scale: [0.5, 1],
        rotateX: [60, 10],
        rotateY: [-90, -15],
        rotateZ: [45, 5],
        duration: openCloseDuration * 1.2,
        easing: 'easeOutQuint' // Stronger ease out
    }, 0) // Start simultaneously with overlay fade

    // 2. Rings Settle with more overshoot/bounce
    .add({
        targets: '.lens-rings .ring',
        translateZ: (el, i, total) => {
            const initialZ = (i - total / 2) * 40; // Start further apart
            const finalZ = parseFloat(getComputedStyle(el).transform.split(',')[14] || 0);
            return [initialZ, finalZ];
        },
        opacity: [0.3, 1],
        scale: [1.1, 1], // Add subtle scale bounce
        duration: openCloseDuration * 0.8,
        delay: anime.stagger(60, { start: 150 }),
        easing: 'spring(1, 70, 12, 0)' // Spring physics
    }, `-=${openCloseDuration * 0.9}`)

    // 3. Inner Lens Appears & Aperture Blades Open
    .add({
        targets: innerLens,
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: openCloseDuration * 0.5,
        easing: 'easeOutQuad'
    }, `-=${openCloseDuration * 0.6}`)
    .add({
        targets: apertureBlades,
        rotateZ: (el, i) => `+=${10 + i * 2}`, // More varied rotation
        scaleY: [1, 0.05], // Open wider
        skewX: [0, (el, i) => (i % 2 === 0 ? -5 : 5)], // Add slight skew for realism
        opacity: [1, 0.4],
        duration: openCloseDuration * 1.0,
        delay: anime.stagger(35),
        easing: 'easeInOutExpo'
    }, `-=${openCloseDuration * 0.7}`)

    // 4. Glare Effect Appears (controlled by CSS animation mostly)
    .add({
        targets: lensGlare,
        opacity: [0, 1], // Fade in glare animation
        duration: openCloseDuration * 0.4,
        easing: 'linear'
    }, `-=${openCloseDuration * 0.5}`)

    // 5. Hide Old Section
    .add({
        targets: fromSection,
        opacity: 0,
        duration: 50,
        delay: openCloseDuration * 0.1, // Hide very early
        complete: () => {
            fromSection.classList.add('hidden');
            fromSection.style.cssText = '';
        }
    });

    // --- Branching Logic ---

    if (isEnteringResults) {
        // 6a. Entering Results: Fade In Loading Content
        tl.add({
            targets: lensContent,
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 700,
            easing: 'easeOutQuad',
            delay: 250,
            begin: () => {
                // Start loading animation specifics (like focus breathing)
                if (window.animateLoading) animateLoading(true, 0);
            }
        }, `-=${openCloseDuration * 0.3}`);

    } else {
        // 6b. Exiting Results: Prepare New Section & Close Lens
        tl.add({
            offset: `-=${openCloseDuration * 0.2}`, // Start prep even earlier
            begin: () => {
                toSection.classList.remove('hidden');
                toSection.style.opacity = 0;
            }
        })
        // 7b. Fade Out Glare
        .add({
            targets: lensGlare,
            opacity: [1, 0],
            duration: openCloseDuration * 0.3,
            easing: 'linear'
        }, `+=${transitionDuration * 0.02}`) // Start fade out quickly
        // 8b. Close Aperture Blades
        .add({
            targets: apertureBlades,
            rotateZ: (el, i) => `-=${10 + i * 2}`, // Reverse rotation
            scaleY: [0.05, 1],
            skewX: [ (el, i) => (i % 2 === 0 ? -5 : 5), 0],
            opacity: [0.4, 1],
            duration: openCloseDuration * 1.0,
            delay: anime.stagger(35, { direction: 'reverse' }),
            easing: 'easeInOutExpo'
        }, `+=${transitionDuration * 0.05}`)
        // 9b. Hide Inner Lens
        .add({
            targets: innerLens,
            opacity: [1, 0],
            scale: [1, 0.8],
            duration: openCloseDuration * 0.4,
            easing: 'easeInQuad'
        }, `-=${openCloseDuration * 0.5}`)
        // 10b. Animate Lens Assembly Out
        .add({
            targets: lensAssembly,
            scale: [1, 0.4],
            rotateX: [10, 80],
            rotateY: [-15, -120],
            rotateZ: [5, -60],
            duration: openCloseDuration * 1.3,
            easing: 'easeInQuint'
        }, `-=${openCloseDuration * 0.7}`)
        // 11b. Fade Out Overlay
        .add({
            targets: lensOverlay,
            opacity: [1, 0],
            duration: fadeDuration * 1.2,
            easing: 'linear',
            complete: () => {
                animateSection(toSectionId);
            }
        }, `-=${fadeDuration}`);
    }
}

/**
 * Animate a section's elements with coordinated entrance.
 */
function animateSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Ensure clean slate for section itself
    section.style.opacity = 0;
    section.style.transform = 'translateY(30px)'; // Consistent start pos
    anime.remove(section);

    // Select direct children with animate classes within the section
    const elementsToAnimate = section.querySelectorAll(`:scope > [class*='animate-'], :scope > .upload-container > [class*='animate-'], :scope > .file-list, :scope > .loading, :scope > #results-container, :scope > #chat-container, :scope > .button-container`);

    // Reset animated children
    elementsToAnimate.forEach(el => {
        el.style.opacity = 0;
        if (el.matches('.animate-title') || el.matches('.animate-up, .animate-fade')) {
             el.style.transform = 'translateY(20px)';
        } else if (el.matches('.animate-scale')) {
             el.style.transform = 'scale(0.95)';
        }
        anime.remove(el);
    });

    const tl = anime.timeline({
        easing: defaultEasing,
        duration: 900,
        delay: anime.stagger(100, { start: 100 }) // Stagger elements within the section
    });

    // Animate section container fade-in first (subtle)
    tl.add({
        targets: section,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 700,
        easing: 'easeOutCubic'
    }, 0); // Start immediately

    // Animate child elements with stagger
    tl.add({
        targets: elementsToAnimate,
        opacity: [0, 1],
        translateY: (el) => (el.matches('.animate-title, .animate-up, .animate-fade')) ? [20, 0] : [0, 0],
        scale: (el) => (el.matches('.animate-scale')) ? [0.95, 1] : [1, 1],
        // Use boxShadow variable from CSS if needed, e.g. for result cards on entrance
        // boxShadow: (el) => (el.matches('.result-card')) ? ['var(--box-shadow-sm)', 'var(--box-shadow-md)'] : null,
    }, 150); // Start slightly after section fade-in begins
}

/**
 * Animates a new chat message appearing.
 */
/*
function animateNewMessage(messageElement) {
    if (!messageElement) return;

    anime.remove(messageElement);
    messageElement.style.opacity = 0;
    // Choose entrance based on message type
    const isUser = messageElement.classList.contains('user-message');
    const translateX = isUser ? [50, 0] : [-50, 0];

    anime({
        targets: messageElement,
        opacity: [0, 1],
        translateX: translateX,
        // translateY: [10, 0], // Optional vertical movement
        scale: [0.9, 1], // Subtle scale
        duration: 600,
        easing: gentleElastic // Add a little bounce
    });
}
*/

/**
 * Animates a newly added file item.
 */
function animateFileAdded(fileElement) {
    if (!fileElement) return;
    anime.remove(fileElement);

    // Simple fade and scale-in
    fileElement.style.opacity = 0;
    fileElement.style.transform = 'scale(0.98)';

    anime({
        targets: fileElement,
        opacity: [0, 1],
        scale: [0.98, 1],
        translateY: [10, 0], // Slight drop
        duration: 500,
        easing: defaultEasing
    });

    // Optional: Subtle particle burst effect near the added file
    // This requires more complex logic to position particles correctly
    // createFileParticles(fileElement);
}

/*
function createFileParticles(targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const container = document.body; // Or a closer positioned container
    const particleCount = 5;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'file-particle';
        container.appendChild(particle);

        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        anime({
            targets: particle,
            left: startX,
            top: startY,
            translateX: anime.random(-40, 40),
            translateY: anime.random(-40, 40),
            scale: [1, 0],
            opacity: [0.6, 0],
            duration: anime.random(600, 1000),
            easing: 'easeOutQuad',
            complete: () => { particle.remove(); }
        });
    }
}
*/

/**
 * Manages loading state animations *within* the HYPER REALISTIC lens overlay.
 */
function animateLoading(isLoading, progress = 0) {
    const lensOverlay = document.getElementById('lens-overlay');
    const lensAssembly = lensOverlay?.querySelector('.lens-assembly');
    const lensContent = lensAssembly?.querySelector('.lens-content');
    const innerLens = lensAssembly?.querySelector('.inner-lens');
    const lensGlare = lensAssembly?.querySelector('.lens-glare');
    const apertureBlades = lensAssembly?.querySelectorAll('.aperture-blade');

    // Ensure required elements exist
    if (!lensOverlay || !lensAssembly || !lensContent || !innerLens || !lensGlare || !apertureBlades || apertureBlades.length === 0) {
        console.error("Missing elements for animateLoading v3");
        return;
    }

    // Stop any programmatic JS animations on these elements from previous states
    anime.remove([lensAssembly, innerLens, lensContent, lensGlare]);

    if (isLoading) {
        // Ensure overlay is active (this also triggers the CSS animations)
        lensOverlay.classList.remove('hidden');
        lensOverlay.classList.add('active');
        lensContent.style.opacity = 1; // Ensure content is visible
        lensGlare.style.opacity = 1; // Ensure glare container is visible for CSS animation
        innerLens.style.opacity = 1; // Ensure inner lens is visible
        
        // Assign initial rotations to blades for CSS keyframe reference
        // This is tricky with pure CSS, the JS approach was more robust for this part.
        // Reverting blade twitch to simpler JS animation for now.
        apertureBlades.forEach((blade, i) => {
            const initialRotate = i * 60; // Assuming 6 blades
            anime({
                targets: blade,
                rotateZ: [
                    `${initialRotate}deg`, 
                    `${initialRotate + 0.5}deg`, 
                    `${initialRotate}deg`
                ],
                translateY: [0, -1, 0],
                skewX: [0, 0.5, 0],
                duration: 7000,
                loop: true,
                direction: 'alternate',
                easing: 'easeInOutSine',
                delay: i * 200
            });
        });
        
        // Also animate assembly breathing via JS for more control
        anime({
            targets: lensAssembly,
            scale: [1, 1.01, 1], 
            rotateZ: ['-=0.1', '+=0.2', '-=0.1'], 
            duration: 3000,
            loop: true,
            direction: 'alternate',
            easing: 'easeInOutSine'
        });
        anime({
            targets: innerLens,
            scale: [1, 0.995, 1],
            opacity: [1, 0.95, 1],
             boxShadow: [
                'inset 0 0 15px rgba(0, 0, 0, 0.6), 0 0 5px rgba(255, 255, 255, 0.05)', // Normal
                'inset 0 0 20px rgba(0, 0, 0, 0.7), 0 0 10px rgba(173, 216, 230, 0.6)', // Pulsing
                'inset 0 0 15px rgba(0, 0, 0, 0.6), 0 0 5px rgba(255, 255, 255, 0.05)'  // Normal
            ],
            duration: 3000,
            loop: true,
            direction: 'alternate',
            easing: 'easeInOutSine'
        });

    } else {
        // Analysis finished - Trigger lens closing animation
        // Stop all JS-based loading animations first
        anime.remove([lensAssembly, innerLens, apertureBlades, lensGlare]);
        // Remove active class to stop CSS-based animations
        lensOverlay.classList.remove('active');

        const tlClose = anime.timeline({
            easing: 'easeInOutCirc',
            duration: 1200,
            complete: () => {
                lensOverlay.classList.add('hidden'); // Hide overlay *after* animation
                // Reset styles explicitly after animation
                lensContent.style.opacity = 0;
                lensAssembly.style.transform = 'rotateX(10deg) rotateY(-15deg) rotateZ(5deg)';
                innerLens.style.opacity = 0;
                innerLens.style.transform = '';
                lensGlare.style.opacity = 0;
                apertureBlades.forEach(b => { 
                    const initialRotate = parseInt(b.dataset.initialRotate || 0); // Get initial rotation if stored
                    b.style.transform = `rotate(${initialRotate}deg) translateY(0)`; // Reset to base rotation
                    b.style.opacity = 1; 
                });
                animateSection('results-section');
            }
        });

        // --- Closing Sequence --- 
        // 1. Fade out loading content
        tlClose.add({ targets: lensContent, opacity: [1, 0], scale: [1, 0.9], duration: 400, easing: 'easeInQuad' }, 0);
        // 2. Fade Out Glare
        tlClose.add({ targets: lensGlare, opacity: [anime.get(lensGlare, 'opacity', 'float') || 0.6, 0], duration: 300, easing: 'linear' }, '+=50');
        // 3. Close Aperture Blades
        tlClose.add({ targets: apertureBlades, scaleY: [0.05, 1], skewX: 0, opacity: [0.4, 1], duration: 800, delay: anime.stagger(30, { direction: 'reverse' }), easing: 'easeInOutExpo' }, '+=100');
        // 4. Hide Inner Lens
        tlClose.add({ targets: innerLens, opacity: [1, 0], scale: [1, 0.8], duration: 400, easing: 'easeInQuad' }, '-=400');
        // 5. Animate Lens Assembly Out
        tlClose.add({ targets: lensAssembly, scale: [anime.get(lensAssembly, 'scale'), 0.4], rotateX: [anime.get(lensAssembly, 'rotateX'), 80], rotateY: [anime.get(lensAssembly, 'rotateY'), -120], rotateZ: [anime.get(lensAssembly, 'rotateZ'), -60], opacity: [1, 0], duration: 900, easing: 'easeInQuint' }, '-=300');
        // 6. Fade Out Overlay
        tlClose.add({ targets: lensOverlay, opacity: [1, 0], duration: 500, easing: 'linear' }, '-=400');
    }
}

/**
 * Animates the analysis progress bar inside the lens overlay.
 */
function updateProgressBar(percentage) {
    // Target the progress bar inside the lens overlay
    const progressBar = document.querySelector('#lens-overlay .progress-inner');
    if (progressBar) {
        anime.remove(progressBar);
        anime({
            targets: progressBar,
            width: `${Math.max(0, Math.min(100, percentage))}%`, // Clamp value
            duration: 350,
            easing: 'easeOutQuad'
        });
    }
}

/**
 * Animates the analysis timeline markers appearing.
 */
function animateAnalysisTimeline(results) {
    const timelineContainer = document.querySelector('.analysis-timeline');
    const path = timelineContainer?.querySelector('.timeline-path');
    const markers = timelineContainer?.querySelectorAll('.timeline-marker');

    if (!timelineContainer || !path || !markers || markers.length === 0) return;

    // Ensure container is visible
    timelineContainer.style.opacity = 1;

    const tl = anime.timeline({
        easing: 'easeInOutExpo',
        duration: 1000
    });

    tl.add({
        targets: path,
        scaleX: [0, 1],
        duration: 800
    })
    .add({
        targets: markers,
        scale: [0, 1],
        opacity: [0, 1],
        translateY: ['-50%', '-50%'], // Ensure centered vertically
        duration: 900,
        delay: anime.stagger(120, { start: 200 }) // Stagger markers after path animates
    }, '-=500'); // Overlap with path animation
}

/**
 * Highlights a specific gap item and corresponding timeline marker.
 */
function highlightGap(gapIndex) {
    const items = document.querySelectorAll('.gap-item');
    const markers = document.querySelectorAll('.timeline-marker');

    // Remove previous highlights
    items.forEach(i => i.classList.remove('highlighted'));
    markers.forEach(m => m.classList.remove('active'));

    // Find and highlight target
    const targetItem = document.querySelector(`.gap-item[data-gap-index='${gapIndex}']`);
    const targetMarker = document.querySelector(`.timeline-marker[data-gap-index='${gapIndex}']`);

    if (targetItem) {
        targetItem.classList.add('highlighted');
        // Scroll into view smoothly
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Subtle visual pulse/pop effect
        anime({
            targets: targetItem,
            scale: [1, 1.01, 1], // Quick scale up and down
            duration: 600,
            easing: 'easeInOutQuad'
        });
    }

    if (targetMarker) {
        targetMarker.classList.add('active');
        // Scale effect handled by addInteractiveHovers logic or specific CSS
        anime({
            targets: targetMarker,
            scale: [1, 1.4, 1], // Pulse marker
            duration: 600,
            easing: 'easeInOutQuad'
        });
    }
}

// Expose functions needed globally (if using modules, export them)
window.animateLoading = animateLoading;
window.updateProgressBar = updateProgressBar;
// window.animateNewMessage = animateNewMessage; // Comment out if removed
window.animateFileAdded = animateFileAdded;
window.animateAnalysisTimeline = animateAnalysisTimeline;
window.highlightGap = highlightGap;
window.animateSection = animateSection; // Expose if needed by main.js
window.animateTransition = animateTransition; // Expose for section changes 