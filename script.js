// script.js

window.addEventListener('load', () => {
    // 1. Cinematic Loader
    const loader = document.getElementById('cinematic-loader');
    
    setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => { loader.remove(); }, 1200); 
    }, 2200);

    // 2. Initialize Smooth Scrolling (Lenis)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        smooth: true,
        smoothTouch: false, // Better native feel on mobile
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // 3. Custom Cursor (Desktop Only)
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouchDevice && cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
        });
    }

    // 4. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-link-btn');
    let isMenuOpen = false;

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) {
                mobileMenu.classList.add('active');
                gsap.to('.hamburger .line-1', { rotation: 45, y: 3.5, duration: 0.3 });
                gsap.to('.hamburger .line-2', { rotation: -45, y: -3.5, duration: 0.3 });
                lenis.stop();
            } else {
                closeMenu();
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        function closeMenu() {
            if (!isMenuOpen) return;
            isMenuOpen = false;
            mobileMenu.classList.remove('active');
            gsap.to('.hamburger .line-1', { rotation: 0, y: 0, duration: 0.3 });
            gsap.to('.hamburger .line-2', { rotation: 0, y: 0, duration: 0.3 });
            lenis.start();
        }
    }

    // 5. GSAP Animations (MatchMedia for Responsive)
    gsap.registerPlugin(ScrollTrigger);
    let mm = gsap.matchMedia();

    mm.add({
        isDesktop: "(min-width: 769px)",
        isMobile: "(max-width: 768px)"
    }, (context) => {
        let { isDesktop, isMobile } = context.conditions;
        
        // Wait for loader delay (~2.4s) before starting hero animations
        const heroTl = gsap.timeline({ delay: 2.4 });

        heroTl.from(".navbar", {
            y: -20, opacity: 0, duration: 1.2, ease: "expo.out"
        })
        .to(".reveal-text", {
            y: "0%", duration: 1.5, stagger: 0.15, ease: "expo.out"
        }, "-=0.8")
        .from(".reveal-fade", {
            y: 20, opacity: 0, duration: 1.5, stagger: 0.2, ease: "power3.out"
        }, "-=1.0")
        .from(".now-playing", {
            y: isMobile ? 20 : 0, x: isMobile ? 0 : -30, opacity: 0, duration: 1.5, ease: "expo.out"
        }, "-=1.2");

        // Parallax Effect
        gsap.to(".parallax-img", {
            yPercent: isMobile ? 10 : 20,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

        // Global Scroll Reveals
        const revealElements = document.querySelectorAll('.gsap-fade-up');
        revealElements.forEach((el) => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 88%",
                    toggleActions: "play none none reverse"
                },
                y: isMobile ? 40 : 60,
                opacity: 0,
                duration: 1.2,
                ease: "power3.out"
            });
        });
    });
});
