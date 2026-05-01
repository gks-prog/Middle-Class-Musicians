// script.js

// === WEB AUDIO API FOR PREMIUM SFX ===
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) { audioCtx = new AudioContext(); }
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
}

function playHoverSound() {
    if (!audioCtx || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.04);
    gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
}

function playClickSound() {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

// === CANVAS WAVEFORM SIMULATION ===
class WaveformVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.bars = 60;
        this.isPlaying = false;
        this.data = new Array(this.bars).fill(0);
        this.targetData = new Array(this.bars).fill(0);
        this.animationId = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
        this.draw();
    }

    play() {
        this.isPlaying = true;
        this.animate();
    }

    pause() {
        this.isPlaying = false;
        // Smoothly return to 0
        this.targetData.fill(2); 
    }

    animate() {
        if (this.isPlaying) {
            // Generate random target heights to simulate audio
            for (let i = 0; i < this.bars; i++) {
                if (Math.random() > 0.8) {
                    this.targetData[i] = Math.random() * this.canvas.height * 0.8 + 2;
                }
            }
        }

        // Interpolate current data towards target data
        let allZero = true;
        for (let i = 0; i < this.bars; i++) {
            this.data[i] += (this.targetData[i] - this.data[i]) * 0.15;
            if (this.data[i] > 3) allZero = false;
        }

        this.draw();

        if (this.isPlaying || !allZero) {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const barWidth = (this.canvas.width / this.bars) - 2;
        
        this.ctx.fillStyle = '#ffffff';
        
        for (let i = 0; i < this.bars; i++) {
            const x = i * (barWidth + 2);
            const height = Math.max(2, this.data[i]);
            const y = (this.canvas.height - height) / 2; // Center vertically
            
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, barWidth, height, 2);
            this.ctx.fill();
        }
    }
}

let waveform;

// === YOUTUBE IFRAME API LOGIC ===
let ytPlayer;
let currentVideoId = null;
let isPlayingGlobal = false;

function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('yt-player-container', {
        height: '0', width: '0',
        playerVars: { 'autoplay': 1, 'controls': 0, 'showinfo': 0, 'rel': 0, 'modestbranding': 1, 'origin': window.location.origin },
        events: { 'onStateChange': onPlayerStateChange }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlayingGlobal = true;
        updateUIState(currentVideoId, true);
        if(waveform) waveform.play();
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        isPlayingGlobal = false;
        updateUIState(currentVideoId, false);
        if(waveform) waveform.pause();
    }
}

function togglePlayPause(videoId, title, artist, cover) {
    if (!ytPlayer || !ytPlayer.loadVideoById) return;

    const globalPlayer = document.getElementById('global-player');
    
    if (currentVideoId === videoId) {
        if (isPlayingGlobal) {
            ytPlayer.pauseVideo();
        } else {
            ytPlayer.playVideo();
        }
    } else {
        currentVideoId = videoId;
        ytPlayer.loadVideoById(videoId);
        
        // Update Global Player Info
        document.getElementById('player-title').innerText = title;
        document.getElementById('player-artist').innerText = artist;
        document.getElementById('player-cover').src = cover;
        globalPlayer.classList.remove('hidden');
        
        updateUIState(null, false);
    }
}

function updateUIState(activeVideoId, isPlaying) {
    // Update Portfolio Triggers
    const allTriggers = document.querySelectorAll('.track-trigger');
    allTriggers.forEach(trigger => {
        const vid = trigger.getAttribute('data-vid');
        const playIcon = trigger.querySelector('.icon-play');
        const pauseIcon = trigger.querySelector('.icon-pause');
        
        if (vid === activeVideoId && isPlaying) {
            trigger.classList.add('is-playing');
            if(playIcon) playIcon.style.display = 'none';
            if(pauseIcon) pauseIcon.style.display = 'block';
        } else {
            trigger.classList.remove('is-playing');
            if(playIcon) playIcon.style.display = 'block';
            if(pauseIcon) pauseIcon.style.display = 'none';
        }
    });

    // Update Global Player Button
    const globalPlayBtn = document.getElementById('player-play-btn');
    const gPlayIcon = globalPlayBtn.querySelector('.icon-play');
    const gPauseIcon = globalPlayBtn.querySelector('.icon-pause');
    
    if(isPlaying) {
        gPlayIcon.style.display = 'none';
        gPauseIcon.style.display = 'block';
    } else {
        gPlayIcon.style.display = 'block';
        gPauseIcon.style.display = 'none';
    }
}


window.addEventListener('load', () => {
    
    waveform = new WaveformVisualizer('waveform-canvas');

    // 1. Cinematic Loader
    const loader = document.getElementById('cinematic-loader');
    setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => { loader.remove(); }, 1200); 
    }, 2200);

    // 2. Initialize Lenis
    const lenis = new Lenis({
        duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        smooth: true, smoothTouch: false, 
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // 3. Audio Triggers & Global Controls
    const trackTriggers = document.querySelectorAll('.track-trigger');
    trackTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            if(e.target.closest('.direct-link')) return; // Ignore link clicks
            playClickSound();
            const vid = trigger.getAttribute('data-vid');
            const title = trigger.getAttribute('data-title');
            const artist = trigger.getAttribute('data-artist');
            const cover = trigger.getAttribute('data-cover');
            togglePlayPause(vid, title, artist, cover);
        });
    });

    document.getElementById('player-play-btn').addEventListener('click', () => {
        if(currentVideoId) togglePlayPause(currentVideoId);
    });

    document.getElementById('player-close-btn').addEventListener('click', () => {
        document.getElementById('global-player').classList.add('hidden');
        if(isPlayingGlobal && ytPlayer) ytPlayer.pauseVideo();
    });

    // 4. SFX Initialization
    document.body.addEventListener('click', initAudio, { once: true });
    document.body.addEventListener('touchstart', initAudio, { once: true });
    document.querySelectorAll('.sfx-hover').forEach(el => el.addEventListener('mouseenter', playHoverSound));
    document.querySelectorAll('.sfx-click').forEach(el => el.addEventListener('click', playClickSound));

    // 5. Custom Cursor
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouchDevice && cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            cursorDot.style.left = `${e.clientX}px`;
            cursorDot.style.top = `${e.clientY}px`;
            cursorOutline.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 500, fill: "forwards" });
        });
    }

    // 6. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    let isMenuOpen = false;

    if (hamburger && mobileMenu) {
        const toggleMenu = () => {
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) {
                mobileMenu.classList.add('active');
                gsap.to('.hamburger .line-1', { rotation: 45, y: 3.5, duration: 0.3 });
                gsap.to('.hamburger .line-2', { rotation: -45, y: -3.5, duration: 0.3 });
                lenis.stop();
            } else {
                mobileMenu.classList.remove('active');
                gsap.to('.hamburger .line-1', { rotation: 0, y: 0, duration: 0.3 });
                gsap.to('.hamburger .line-2', { rotation: 0, y: 0, duration: 0.3 });
                lenis.start();
            }
        };
        hamburger.addEventListener('click', toggleMenu);
        document.querySelectorAll('.mobile-link, .mobile-link-btn').forEach(l => l.addEventListener('click', toggleMenu));
    }

    // 7. GSAP Animations
    gsap.registerPlugin(ScrollTrigger);
    let mm = gsap.matchMedia();

    mm.add({ isDesktop: "(min-width: 769px)", isMobile: "(max-width: 768px)" }, (context) => {
        let { isMobile } = context.conditions;
        
        const heroTl = gsap.timeline({ delay: 2.4 });
        heroTl.from(".navbar", { y: -20, opacity: 0, duration: 1.2, ease: "expo.out" })
              .to(".reveal-text", { y: "0%", duration: 1.5, stagger: 0.15, ease: "expo.out" }, "-=0.8")
              .from(".reveal-fade", { y: 20, opacity: 0, duration: 1.5, stagger: 0.2, ease: "power3.out" }, "-=1.0")
              .to(".floating-wa", { scale: 1, opacity: 1, duration: 1.2, ease: "back.out(1.5)" }, "-=1.0");

        gsap.to(".parallax-img", {
            yPercent: isMobile ? 10 : 20, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });

        document.querySelectorAll('.gsap-fade-up').forEach((el) => {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
                y: isMobile ? 40 : 60, opacity: 0, duration: 1.2, ease: "power3.out"
            });
        });
    });
});
