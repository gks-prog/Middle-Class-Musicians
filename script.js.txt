gsap.registerPlugin(ScrollTrigger);

/* LOADER ANIMATION */
window.addEventListener("load", () => {
  const tl = gsap.timeline();

  tl.to(".loader-text", {
    opacity: 1,
    duration: 1,
    ease: "power2.out"
  });

  tl.to(".loader-text", {
    opacity: 0,
    duration: 0.8,
    delay: 0.5
  });

  tl.to(".loader", {
    opacity: 0,
    duration: 1,
    ease: "power2.out",
    onComplete: () => {
      document.querySelector(".loader").style.display = "none";
    }
  });
});

/* HERO */
gsap.to(".hero-title", {
  y: 0,
  opacity: 1,
  duration: 1,
  delay: 2,
  ease: "power3.out"
});

gsap.to(".hero-sub", {
  y: 0,
  opacity: 1,
  delay: 2.3,
  duration: 1,
  ease: "power3.out"
});

gsap.to(".hero-img", {
  scale: 1,
  opacity: 1,
  duration: 1.8,
  delay: 2,
  ease: "power2.out"
});

/* SCROLL */
gsap.utils.toArray(".section").forEach(section => {
  gsap.to(section, {
    scrollTrigger: {
      trigger: section,
      start: "top 85%",
    },
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power2.out"
  });
});

/* PARALLAX */
if (window.innerWidth > 768) {
  gsap.to(".hero-img", {
    y: 60,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });
}

/* SMOOTH SCROLL */
document.querySelector(".scroll-indicator").addEventListener("click", () => {
  gsap.to(window, {
    scrollTo: window.innerHeight,
    duration: 1,
    ease: "power2.inOut"
  });
});