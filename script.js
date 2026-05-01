gsap.registerPlugin(ScrollTrigger);

/* LOADER */
window.addEventListener("load", () => {
  const tl = gsap.timeline();

  tl.to(".loader-text", {opacity:1, duration:1})
    .to(".loader-text", {opacity:0, delay:.5})
    .to(".loader", {
      opacity:0,
      duration:1,
      onComplete:()=>document.querySelector(".loader").style.display="none"
    });
});

/* HERO */
gsap.to(".hero-title",{opacity:1,y:0,duration:1.2,delay:2});
gsap.to(".hero-sub",{opacity:1,y:0,duration:1,delay:2.3});
gsap.to(".hero-img",{opacity:1,scale:1,duration:2,delay:2});

/* SCROLL */
gsap.utils.toArray(".section").forEach(sec=>{
  gsap.to(sec,{
    scrollTrigger:{trigger:sec,start:"top 80%"},
    opacity:1,
    y:0,
    duration:1.2
  });
});

/* PARALLAX */
if(window.innerWidth>768){
  gsap.to(".hero-img",{
    y:80,
    scrollTrigger:{
      trigger:".hero",
      start:"top top",
      end:"bottom top",
      scrub:true
    }
  });
}

/* SCROLL CLICK */
document.querySelector(".scroll-indicator").addEventListener("click",()=>{
  gsap.to(window,{scrollTo:window.innerHeight,duration:1});
});