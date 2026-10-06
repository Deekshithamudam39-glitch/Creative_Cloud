(function () {
    'use strict';

    /* ============================================
       MAGNETIC HEADING
       ============================================ */
    function initMagneticHeading() {
        const heading = document.querySelector('.hero-headline');
        if (!heading) return;
        if (window.matchMedia('(hover: none)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .hero-headline .mag-letter {
                display: inline-block;
                font: inherit;
                line-height: inherit;
                letter-spacing: inherit;
                color: inherit;
                vertical-align: baseline;
                transform-origin: 50% 50%;
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
                white-space: pre;
            }
        `;
        document.head.appendChild(styleEl);

        const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT, null, false);
        const nodes = [];
        let n;
        while ((n = walker.nextNode())) {
            if (n.parentElement && n.parentElement.closest('.hero-badge-inline')) continue;
            if (!n.textContent.length) continue;
            nodes.push(n);
        }

        nodes.forEach(node => {
            const text = node.textContent;
            const frag = document.createDocumentFragment();
            for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                if (ch === ' ' || ch === '\n' || ch === '\t') {
                    frag.appendChild(document.createTextNode(' '));
                } else {
                    const span = document.createElement('span');
                    span.className = 'mag-letter';
                    span.textContent = ch;
                    frag.appendChild(span);
                }
            }
            if (node.parentNode) node.parentNode.replaceChild(frag, node);
        });

        const letters = Array.from(heading.querySelectorAll('.mag-letter'));
        if (!letters.length) return;

        const state = letters.map(el => ({ el, cx: 0, cy: 0 }));
        let cached = false;

        function cache() {
            const hr = heading.getBoundingClientRect();
            state.forEach(s => {
                const saved = s.el.style.transform;
                s.el.style.transform = '';
                const r = s.el.getBoundingClientRect();
                s.cx = r.left + r.width / 2 - hr.left;
                s.cy = r.top + r.height / 2 - hr.top;
                s.el.style.transform = saved;
            });
            cached = true;
        }

        setTimeout(cache, 0);
        setTimeout(cache, 300);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(cache);
        window.addEventListener('load', cache);
        let rzT;
        window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(cache, 150); });

        let mx = -9999, my = -9999;
        let intensity = 0;
        let targetIntensity = 0;
        let rafId = null;
        let running = false;

        const RADIUS = 200, PULL = 0.18, ROT = 0.05, STRETCH = 0.16, SQUASH = 0.05, GLOW = 1.4;

        function tick() {
            intensity += (targetIntensity - intensity) * 0.12;

            if (intensity < 0.001 && targetIntensity === 0) {
                state.forEach(s => { s.el.style.transform = ''; s.el.style.textShadow = ''; });
                running = false;
                rafId = null;
                return;
            }

            for (const s of state) {
                const dx = mx - s.cx;
                const dy = my - s.cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const fall = dist >= RADIUS ? 0 : (1 - dist / RADIUS);
                const power = fall * fall * intensity;

                if (power < 0.002) {
                    s.el.style.transform = '';
                    s.el.style.textShadow = '';
                    continue;
                }

                const tx = dx * power * PULL;
                const ty = dy * power * PULL;
                const rot = dx * power * ROT;
                const sx = 1 + power * STRETCH;
                const sy = 1 - power * SQUASH;

                s.el.style.transform =
                    `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) ` +
                    `rotate(${rot.toFixed(2)}deg) ` +
                    `scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;

                const glow = power * GLOW;
                s.el.style.textShadow = glow > 0.05
                    ? `0 0 ${(glow * 16).toFixed(1)}px rgba(192, 90, 50, ${(glow * 0.6).toFixed(2)})`
                    : '';
            }
            rafId = requestAnimationFrame(tick);
        }

        function start() { if (!running) { running = true; rafId = requestAnimationFrame(tick); } }

        function setMouse(e) {
            const hr = heading.getBoundingClientRect();
            mx = e.clientX - hr.left;
            my = e.clientY - hr.top;
        }

        heading.addEventListener('mouseenter', (e) => { if (!cached) cache(); setMouse(e); targetIntensity = 1; start(); });
        heading.addEventListener('mousemove', (e) => { setMouse(e); start(); });
        heading.addEventListener('mouseleave', () => { targetIntensity = 0; mx = -9999; my = -9999; start(); });
    }

    /* ============================================
       REVEAL ON SCROLL (SLOW + CINEMATIC)
       ============================================ */
    function initReveal() {
        const revealEls = document.querySelectorAll('.reveal');
        if ('IntersectionObserver' in window && revealEls.length) {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => entry.target.classList.add('active'), i * 150);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
            revealEls.forEach(el => obs.observe(el));
        } else {
            revealEls.forEach(el => el.classList.add('active'));
        }
    }

    /* ============================================
       NAVBAR
       ============================================ */
    const navbar = document.getElementById('navbar');
    function onScroll() { if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* MOBILE MENU */
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => { e.stopPropagation(); navLinks.classList.toggle('open'); });
        navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('open')));
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && e.target !== menuToggle) {
                navLinks.classList.remove('open');
            }
        });
    }

    /* ============================================
       PORTFOLIO — FILTER + RAIL NAV
       ============================================ */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    const rail = document.getElementById('portfolioRail');
    const railPrev = document.getElementById('railPrev');
    const railNext = document.getElementById('railNext');

    if (filterBtns.length && portfolioCards.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;

                portfolioCards.forEach(card => {
                    const match = filter === 'all' || card.dataset.category === filter;
                    card.classList.toggle('hidden', !match);
                });

                if (rail) rail.scrollTo({ left: 0, behavior: 'smooth' });
                updateRailButtons();
            });
        });
    }

    function updateRailButtons() {
        if (!rail || !railPrev || !railNext) return;
        const max = rail.scrollWidth - rail.clientWidth;
        railPrev.classList.toggle('is-hidden', rail.scrollLeft <= 8);
        railNext.classList.toggle('is-hidden', rail.scrollLeft >= max - 8);
    }

    if (rail && railPrev && railNext) {
        const step = () => Math.max(rail.clientWidth * 0.7, 260);
        railPrev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
        railNext.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
        rail.addEventListener('scroll', updateRailButtons, { passive: true });
        window.addEventListener('resize', updateRailButtons);
        updateRailButtons();
    }

    // Drag-to-scroll
    if (rail) {
        let isDown = false;
        let startX = 0;
        let startScroll = 0;

        rail.addEventListener('mousedown', (e) => {
            isDown = true;
            rail.style.cursor = 'grabbing';
            startX = e.pageX;
            startScroll = rail.scrollLeft;
        });
        window.addEventListener('mouseup', () => {
            isDown = false;
            rail.style.cursor = '';
        });
        window.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            rail.scrollLeft = startScroll - (e.pageX - startX);
        });
    }

    /* ============================================
       PROJECT MODAL
       ============================================ */
    const projectModal = document.getElementById('projectModal');
    const pmBackdrop = document.getElementById('pmBackdrop');
    const pmClose = document.getElementById('pmClose');
    const pmImage = document.getElementById('pmImage');
    const pmCat = document.getElementById('pmCat');
    const pmTitle = document.getElementById('pmTitle');
    const pmClient = document.getElementById('pmClient');
    const pmDesc = document.getElementById('pmDesc');

    function openProjectModal(card) {
        if (!projectModal) return;
        pmImage.src = card.dataset.img || '';
        pmImage.alt = card.dataset.title || 'Project';
        pmCat.textContent = card.dataset.catLabel || 'Project';
        pmTitle.textContent = card.dataset.title || 'Untitled';
        pmClient.textContent = card.dataset.client || '';
        pmDesc.textContent = card.dataset.desc || '';
        projectModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeProjectModal() {
        if (!projectModal) return;
        projectModal.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    portfolioCards.forEach(card => {
        card.addEventListener('click', () => openProjectModal(card));
    });

    if (pmClose) pmClose.addEventListener('click', closeProjectModal);
    if (pmBackdrop) pmBackdrop.addEventListener('click', closeProjectModal);
    document.querySelectorAll('.pm-close-btn').forEach(btn => btn.addEventListener('click', closeProjectModal));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal && projectModal.classList.contains('is-open')) {
            closeProjectModal();
        }
    });

    /* ============================================
       SMOOTH SCROLL
       ============================================ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#' || id.length < 2) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const navH = navbar ? navbar.offsetHeight : 0;
            const top = target.getBoundingClientRect().top + window.pageYOffset - navH - 20;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ACTIVE NAV LINK */
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');
    if (sections.length && navAnchors.length) {
        function updateActive() {
            const pos = window.scrollY + 150;
            let current = '';
            sections.forEach(section => {
                if (pos >= section.offsetTop && pos < section.offsetTop + section.offsetHeight) current = section.id;
            });
            navAnchors.forEach(a => {
                const href = a.getAttribute('href');
                if (href && href.indexOf('#') === 0) a.classList.toggle('active', href === '#' + current);
            });
        }
        window.addEventListener('scroll', updateActive, { passive: true });
        updateActive();
    }

    /* ============================================
       VAMSHI — 3D TILT
       ============================================ */
    function initVamshi3DTilt() {
        const tiltEls = document.querySelectorAll('[data-tilt]');
        if (!tiltEls.length) return;
        if (window.matchMedia('(hover: none)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        tiltEls.forEach(el => {
            const maxTilt = parseFloat(el.dataset.tiltMax) || 12;
            let rx = 0, ry = 0, tx = 0, ty = 0;
            let rafId = null;
            let hovering = false;

            function tick() {
                rx += (tx - rx) * 0.15;
                ry += (ty - ry) * 0.15;
                el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
                if (Math.abs(tx - rx) > 0.01 || Math.abs(ty - ry) > 0.01 || hovering) {
                    rafId = requestAnimationFrame(tick);
                } else {
                    rafId = null;
                }
            }

            el.addEventListener('mouseenter', () => { hovering = true; });
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;
                tx = (0.5 - py) * maxTilt * 2;
                ty = (px - 0.5) * maxTilt * 2;
                if (!rafId) rafId = requestAnimationFrame(tick);
            });
            el.addEventListener('mouseleave', () => {
                hovering = false; tx = 0; ty = 0;
                if (!rafId) rafId = requestAnimationFrame(tick);
            });
        });
    }

    /* ============================================
       VAMSHI — COUNT-UP
       ============================================ */
    function initCountUp() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        function animate(el) {
            if (el.dataset.animated === 'true') return;
            el.dataset.animated = 'true';
            const target = parseInt(el.dataset.count, 10) || 0;
            const suffix = el.dataset.suffix || '';
            const duration = 1800;
            const start = performance.now();
            function frame(now) {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(eased * target) + suffix;
                if (p < 1) requestAnimationFrame(frame);
            }
            requestAnimationFrame(frame);
        }

        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) { animate(entry.target); obs.unobserve(entry.target); }
                });
            }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
            counters.forEach(el => obs.observe(el));
        }

        setTimeout(() => {
            counters.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) animate(el);
            });
        }, 2000);
    }

    /* ============================================
       VAMSHI — SKILL BARS
       ============================================ */
    function initSkillBars() {
        const fills = document.querySelectorAll('.vs-skill-fill');
        if (!fills.length) return;

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const pct = el.dataset.fill || 0;
                    el.style.setProperty('--fill-width', pct + '%');
                    requestAnimationFrame(() => el.classList.add('is-filled'));
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.4 });
        fills.forEach(el => obs.observe(el));

        const pctEls = document.querySelectorAll('.vs-skill-pct');
        const pctObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target, 10);
                    const start = performance.now();
                    const duration = 1600;
                    function frame(now) {
                        const p = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - p, 3);
                        el.textContent = Math.round(eased * target) + '%';
                        if (p < 1) requestAnimationFrame(frame);
                    }
                    requestAnimationFrame(frame);
                    pctObs.unobserve(el);
                }
            });
        }, { threshold: 0.4 });
        pctEls.forEach(el => pctObs.observe(el));
    }

    /* ============================================
       VAMSHI — PARALLAX ORBS
       ============================================ */
    function initVamshiParallax() {
        const section = document.querySelector('.vamshi-section');
        if (!section) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const orbs = section.querySelectorAll('.vs-bg-orb');
        if (!orbs.length) return;
        let ticking = false;

        function update() {
            const rect = section.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const vc = window.innerHeight / 2;
            const offset = (center - vc) / window.innerHeight;
            orbs.forEach((orb, i) => {
                const speed = i === 0 ? 60 : -50;
                orb.style.transform = `translateY(${(offset * speed).toFixed(1)}px)`;
            });
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
        update();
    }

    /* ============================================
       VAMSHI — BEFORE / AFTER SLIDER
       ============================================ */
    function initBeforeAfter() {
        const slider = document.getElementById('vsBA');
        const afterEl = document.getElementById('vsBAAfter');
        const handle = document.getElementById('vsBAHandle');
        if (!slider || !afterEl || !handle) return;

        let isDragging = false;
        let currentPos = 50;

        function setPos(percent) {
            currentPos = Math.max(0, Math.min(100, percent));
            afterEl.style.clipPath = `inset(0 ${100 - currentPos}% 0 0)`;
            handle.style.left = currentPos + '%';
        }

        function getPercent(clientX) {
            const rect = slider.getBoundingClientRect();
            return ((clientX - rect.left) / rect.width) * 100;
        }

        slider.addEventListener('mousedown', (e) => { isDragging = true; setPos(getPercent(e.clientX)); });
        window.addEventListener('mousemove', (e) => { if (!isDragging) return; setPos(getPercent(e.clientX)); });
        window.addEventListener('mouseup', () => { isDragging = false; });

        slider.addEventListener('touchstart', (e) => { isDragging = true; setPos(getPercent(e.touches[0].clientX)); }, { passive: true });
        slider.addEventListener('touchmove', (e) => { if (!isDragging) return; setPos(getPercent(e.touches[0].clientX)); }, { passive: true });
        window.addEventListener('touchend', () => { isDragging = false; });

        setPos(50);

        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const start = 50, end = 72, duration = 1400;
                        const t0 = performance.now();
                        function frame(now) {
                            const p = Math.min((now - t0) / duration, 1);
                            const eased = 1 - Math.pow(1 - p, 3);
                            setPos(start + (end - start) * eased);
                            if (p < 1) requestAnimationFrame(frame);
                        }
                        requestAnimationFrame(frame);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });
            obs.observe(slider);
        }
    }

    /* ============================================
       VAMSHI — TIMELINE PROGRESS
       ============================================ */
    function initTimelineProgress() {
        const timeline = document.querySelector('.vs-timeline');
        const line = timeline ? timeline.querySelector('.vs-tl-line') : null;
        if (!timeline || !line) return;

        function update() {
            const rect = timeline.getBoundingClientRect();
            const vh = window.innerHeight;
            const start = vh * 0.85;
            const end = vh * 0.15;
            const total = rect.height;
            const scrolled = start - rect.top;
            const progress = Math.max(0, Math.min(1, scrolled / (total - (start - end))));
            line.style.setProperty('--line-fill', (progress * 100) + '%');
        }

        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    /* ============================================
       INIT
       ============================================ */
    function init() {
        initMagneticHeading();
        initReveal();
        initVamshi3DTilt();
        initCountUp();
        initSkillBars();
        initVamshiParallax();
        initBeforeAfter();
        initTimelineProgress();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();