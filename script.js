(function () {
    'use strict';

    /* =========================================================
       CREATIVE CLOUD — CLEAN SCRIPT
       Matches the current HTML structure
       ========================================================= */


    /* =========================================================
       1. REVEAL ON SCROLL
       ========================================================= */

    function initReveal() {
        const elements = document.querySelectorAll('.reveal');

        if (!elements.length) return;

        if (!('IntersectionObserver' in window)) {
            elements.forEach(el => el.classList.add('active'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('active');
                    }, index * 100);

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        elements.forEach(el => observer.observe(el));
    }


    /* =========================================================
       2. NAVBAR
       ========================================================= */

    function initNavbar() {
        const navbar = document.getElementById('navbar');
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');

        if (!navbar) return;

        function updateNavbar() {
            navbar.classList.toggle(
                'scrolled',
                window.scrollY > 40
            );
        }

        window.addEventListener(
            'scroll',
            updateNavbar,
            { passive: true }
        );

        updateNavbar();


        /* Mobile menu */

        if (menuToggle && navLinks) {

            menuToggle.addEventListener('click', function (event) {
                event.stopPropagation();

                const isOpen =
                    navLinks.classList.toggle('open');

                menuToggle.setAttribute(
                    'aria-expanded',
                    String(isOpen)
                );
            });


            /* Close menu after clicking a link */

            navLinks.querySelectorAll('a').forEach(link => {

                link.addEventListener('click', function () {
                    navLinks.classList.remove('open');

                    menuToggle.setAttribute(
                        'aria-expanded',
                        'false'
                    );
                });

            });


            /* Close menu when clicking outside */

            document.addEventListener('click', function (event) {

                if (
                    navLinks.classList.contains('open') &&
                    !navLinks.contains(event.target) &&
                    !menuToggle.contains(event.target)
                ) {
                    navLinks.classList.remove('open');

                    menuToggle.setAttribute(
                        'aria-expanded',
                        'false'
                    );
                }

            });

        }
    }


    /* =========================================================
       3. PORTFOLIO FILTERS
       ========================================================= */

    function initPortfolioFilters() {

        const filterButtons =
            document.querySelectorAll('.filter-btn');

        const cards =
            document.querySelectorAll('.portfolio-card');

        const rail =
            document.getElementById('portfolioRail');

        if (!filterButtons.length || !cards.length) {
            return;
        }


        filterButtons.forEach(button => {

            button.addEventListener('click', function () {

                /* Active button */

                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                });

                button.classList.add('active');


                /* Current filter */

                const filter =
                    button.dataset.filter || 'all';


                /* Show / hide cards */

                cards.forEach(card => {

                    const category =
                        card.dataset.category || '';

                    const shouldShow =
                        filter === 'all' ||
                        category === filter;

                    card.classList.toggle(
                        'hidden',
                        !shouldShow
                    );

                });


                /* Return rail to beginning */

                if (rail) {
                    rail.scrollTo({
                        left: 0,
                        behavior: 'smooth'
                    });
                }


                updateRailButtons();

            });

        });

    }


    /* =========================================================
       4. PORTFOLIO HORIZONTAL RAIL
       ========================================================= */

    function updateRailButtons() {

        const rail =
            document.getElementById('portfolioRail');

        const previous =
            document.getElementById('railPrev');

        const next =
            document.getElementById('railNext');

        if (!rail || !previous || !next) {
            return;
        }

        const maxScroll =
            Math.max(
                0,
                rail.scrollWidth - rail.clientWidth
            );


        previous.classList.toggle(
            'is-hidden',
            rail.scrollLeft <= 8
        );

        next.classList.toggle(
            'is-hidden',
            rail.scrollLeft >= maxScroll - 8
        );

    }


    function initPortfolioRail() {

        const rail =
            document.getElementById('portfolioRail');

        const previous =
            document.getElementById('railPrev');

        const next =
            document.getElementById('railNext');

        if (!rail) return;


        /* Previous */

        if (previous) {

            previous.addEventListener(
                'click',
                function () {

                    const amount =
                        Math.max(
                            rail.clientWidth * 0.7,
                            260
                        );

                    rail.scrollBy({
                        left: -amount,
                        behavior: 'smooth'
                    });

                }
            );

        }


        /* Next */

        if (next) {

            next.addEventListener(
                'click',
                function () {

                    const amount =
                        Math.max(
                            rail.clientWidth * 0.7,
                            260
                        );

                    rail.scrollBy({
                        left: amount,
                        behavior: 'smooth'
                    });

                }
            );

        }


        /* Scroll */

        rail.addEventListener(
            'scroll',
            updateRailButtons,
            { passive: true }
        );


        window.addEventListener(
            'resize',
            updateRailButtons
        );


        updateRailButtons();


        /* =====================================================
           Desktop drag-to-scroll
           ===================================================== */

        let dragging = false;
        let startX = 0;
        let startScroll = 0;

        rail.addEventListener('mousedown', function (event) {

            dragging = true;

            startX = event.pageX;
            startScroll = rail.scrollLeft;

            rail.style.cursor = 'grabbing';

        });


        window.addEventListener('mouseup', function () {

            dragging = false;

            rail.style.cursor = '';

        });


        window.addEventListener('mousemove', function (event) {

            if (!dragging) return;

            event.preventDefault();

            const distance =
                event.pageX - startX;

            rail.scrollLeft =
                startScroll - distance;

        });

    }


    /* =========================================================
       5. PROJECT MODAL
       ========================================================= */

    function initProjectModal() {

        const modal =
            document.getElementById('projectModal');

        const backdrop =
            document.getElementById('pmBackdrop');

        const closeButton =
            document.getElementById('pmClose');

        const image =
            document.getElementById('pmImage');

        const category =
            document.getElementById('pmCat');

        const title =
            document.getElementById('pmTitle');

        const client =
            document.getElementById('pmClient');

        const description =
            document.getElementById('pmDesc');

        const cards =
            document.querySelectorAll('.portfolio-card');

        if (!modal || !cards.length) {
            return;
        }


        let lastFocusedElement = null;


        /* Open modal */

        function openModal(card) {

            lastFocusedElement =
                document.activeElement;


            if (image) {
                image.src =
                    card.dataset.img || '';

                image.alt =
                    card.dataset.title ||
                    'Project';
            }


            if (category) {
                category.textContent =
                    card.dataset.catLabel ||
                    'Project';
            }


            if (title) {
                title.textContent =
                    card.dataset.title ||
                    'Untitled Project';
            }


            if (client) {
                client.textContent =
                    card.dataset.client ||
                    '';
            }


            if (description) {
                description.textContent =
                    card.dataset.desc ||
                    '';
            }


            modal.classList.add('is-open');

            document.body.style.overflow = 'hidden';


            /* Move focus to close button */

            if (closeButton) {
                setTimeout(() => {
                    closeButton.focus();
                }, 50);
            }

        }


        /* Close modal */

        function closeModal() {

            modal.classList.remove('is-open');

            document.body.style.overflow = '';


            if (image) {
                image.removeAttribute('src');
            }


            if (
                lastFocusedElement &&
                typeof lastFocusedElement.focus === 'function'
            ) {
                lastFocusedElement.focus();
            }

        }


        /* Portfolio cards */

        cards.forEach(card => {

            card.addEventListener(
                'click',
                function (event) {

                    /*
                     Prevent accidental modal opening
                     when clicking an actual link/button
                     inside a card.
                    */

                    const clickedLink =
                        event.target.closest('a');

                    if (clickedLink) {
                        return;
                    }

                    openModal(card);

                }
            );

        });


        /* Close button */

        if (closeButton) {
            closeButton.addEventListener(
                'click',
                closeModal
            );
        }


        /* Backdrop */

        if (backdrop) {
            backdrop.addEventListener(
                'click',
                closeModal
            );
        }


        /* Other close buttons */

        document
            .querySelectorAll('.pm-close-btn')
            .forEach(button => {

                button.addEventListener(
                    'click',
                    closeModal
                );

            });


        /* Escape key */

        document.addEventListener(
            'keydown',
            function (event) {

                if (
                    event.key === 'Escape' &&
                    modal.classList.contains('is-open')
                ) {
                    closeModal();
                }

            }
        );

    }


    /* =========================================================
       6. SMOOTH SCROLL
       ========================================================= */

    function initSmoothScroll() {

        const navbar =
            document.getElementById('navbar');

        document
            .querySelectorAll('a[href^="#"]')
            .forEach(anchor => {

                anchor.addEventListener(
                    'click',
                    function (event) {

                        const id =
                            this.getAttribute('href');

                        if (
                            !id ||
                            id === '#' ||
                            id.length < 2
                        ) {
                            return;
                        }


                        const target =
                            document.querySelector(id);

                        if (!target) {
                            return;
                        }


                        event.preventDefault();


                        const navHeight =
                            navbar ?
                            navbar.offsetHeight :
                            0;


                        const position =
                            target.getBoundingClientRect().top +
                            window.pageYOffset -
                            navHeight -
                            20;


                        window.scrollTo({
                            top: position,
                            behavior: 'smooth'
                        });

                    }
                );

            });

    }


    /* =========================================================
       7. ACTIVE NAVIGATION LINK
       ========================================================= */

    function initActiveNavigation() {

        const sections =
            document.querySelectorAll(
                'section[id]'
            );

        const links =
            document.querySelectorAll(
                '.nav-links a'
            );

        if (!sections.length || !links.length) {
            return;
        }


        function updateActiveLink() {

            const position =
                window.scrollY + 150;

            let currentSection = '';


            sections.forEach(section => {

                const top =
                    section.offsetTop;

                const bottom =
                    top + section.offsetHeight;

                if (
                    position >= top &&
                    position < bottom
                ) {
                    currentSection =
                        section.id;
                }

            });


            links.forEach(link => {

                const href =
                    link.getAttribute('href');

                link.classList.toggle(
                    'active',
                    href === '#' + currentSection
                );

            });

        }


        window.addEventListener(
            'scroll',
            updateActiveLink,
            { passive: true }
        );

        window.addEventListener(
            'resize',
            updateActiveLink
        );

        updateActiveLink();

    }


    /* =========================================================
       8. MAGNETIC HERO HEADING
       ========================================================= */

    function initMagneticHeading() {

        const heading =
            document.querySelector('.hero-headline');

        if (!heading) return;


        if (
            window.matchMedia('(hover: none)').matches ||
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches
        ) {
            return;
        }


        const walker =
            document.createTreeWalker(
                heading,
                NodeFilter.SHOW_TEXT
            );


        const textNodes = [];

        let node;

        while (
            (node = walker.nextNode())
        ) {

            if (
                node.parentElement &&
                node.parentElement.closest(
                    '.hero-badge-inline'
                )
            ) {
                continue;
            }

            if (node.textContent.trim()) {
                textNodes.push(node);
            }

        }


        /* Convert characters into spans */

        textNodes.forEach(node => {

            const text =
                node.textContent;

            const fragment =
                document.createDocumentFragment();


            for (
                let i = 0;
                i < text.length;
                i++
            ) {

                const char =
                    text[i];


                if (
                    char === ' ' ||
                    char === '\n' ||
                    char === '\t'
                ) {

                    fragment.appendChild(
                        document.createTextNode(' ')
                    );

                } else {

                    const span =
                        document.createElement('span');

                    span.className =
                        'mag-letter';

                    span.textContent =
                        char;

                    fragment.appendChild(span);

                }

            }


            if (node.parentNode) {
                node.parentNode.replaceChild(
                    fragment,
                    node
                );
            }

        });


        const letters =
            Array.from(
                heading.querySelectorAll(
                    '.mag-letter'
                )
            );


        if (!letters.length) return;


        const style =
            document.createElement('style');

        style.textContent = `
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

        document.head.appendChild(style);


        const state =
            letters.map(letter => ({
                el: letter,
                cx: 0,
                cy: 0
            }));


        function cachePositions() {

            const headingRect =
                heading.getBoundingClientRect();


            state.forEach(item => {

                const previous =
                    item.el.style.transform;

                item.el.style.transform =
                    '';

                const rect =
                    item.el.getBoundingClientRect();


                item.cx =
                    rect.left +
                    rect.width / 2 -
                    headingRect.left;

                item.cy =
                    rect.top +
                    rect.height / 2 -
                    headingRect.top;


                item.el.style.transform =
                    previous;

            });

        }


        cachePositions();

        setTimeout(cachePositions, 300);


        if (
            document.fonts &&
            document.fonts.ready
        ) {
            document.fonts.ready.then(
                cachePositions
            );
        }


        window.addEventListener(
            'resize',
            cachePositions
        );


        let mouseX = -9999;
        let mouseY = -9999;

        let intensity = 0;
        let targetIntensity = 0;

        let animationFrame = null;


        const radius = 200;


        function animate() {

            intensity +=
                (
                    targetIntensity -
                    intensity
                ) * 0.12;


            if (
                intensity < 0.001 &&
                targetIntensity === 0
            ) {

                state.forEach(item => {

                    item.el.style.transform =
                        '';

                    item.el.style.textShadow =
                        '';

                });

                animationFrame = null;

                return;

            }


            state.forEach(item => {

                const dx =
                    mouseX - item.cx;

                const dy =
                    mouseY - item.cy;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                const fall =
                    distance >= radius
                    ? 0
                    : 1 - distance / radius;


                const power =
                    fall *
                    fall *
                    intensity;


                if (power < 0.002) {

                    item.el.style.transform =
                        '';

                    item.el.style.textShadow =
                        '';

                    return;

                }


                const tx =
                    dx * power * 0.18;

                const ty =
                    dy * power * 0.18;

                const rotation =
                    dx * power * 0.05;

                const scaleX =
                    1 + power * 0.16;

                const scaleY =
                    1 - power * 0.05;


                item.el.style.transform =
                    `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) ` +
                    `rotate(${rotation.toFixed(2)}deg) ` +
                    `scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;


                const glow =
                    power * 1.4;


                item.el.style.textShadow =
                    glow > 0.05
                    ? `0 0 ${(glow * 16).toFixed(1)}px rgba(192,90,50,${(glow * 0.6).toFixed(2)})`
                    : '';

            });


            animationFrame =
                requestAnimationFrame(animate);

        }


        function startAnimation() {

            if (!animationFrame) {
                animationFrame =
                    requestAnimationFrame(
                        animate
                    );
            }

        }


        function updateMouse(event) {

            const rect =
                heading.getBoundingClientRect();

            mouseX =
                event.clientX -
                rect.left;

            mouseY =
                event.clientY -
                rect.top;

        }


        heading.addEventListener(
            'mouseenter',
            function (event) {

                updateMouse(event);

                targetIntensity = 1;

                startAnimation();

            }
        );


        heading.addEventListener(
            'mousemove',
            function (event) {

                updateMouse(event);

                startAnimation();

            }
        );


        heading.addEventListener(
            'mouseleave',
            function () {

                targetIntensity = 0;

                mouseX = -9999;
                mouseY = -9999;

                startAnimation();

            }
        );

    }


    /* =========================================================
       9. 3D TILT
       ========================================================= */

    function initTilt() {

        const elements =
            document.querySelectorAll(
                '[data-tilt]'
            );

        if (!elements.length) return;


        if (
            window.matchMedia('(hover: none)').matches ||
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches
        ) {
            return;
        }


        elements.forEach(element => {

            const maxTilt =
                parseFloat(
                    element.dataset.tiltMax
                ) || 12;


            let targetX = 0;
            let targetY = 0;

            let currentX = 0;
            let currentY = 0;

            let frame = null;


            function animate() {

                currentX +=
                    (targetX - currentX) *
                    0.15;

                currentY +=
                    (targetY - currentY) *
                    0.15;


                element.style.transform =
                    `rotateX(${currentX.toFixed(2)}deg) ` +
                    `rotateY(${currentY.toFixed(2)}deg)`;


                if (
                    Math.abs(targetX - currentX) > 0.01 ||
                    Math.abs(targetY - currentY) > 0.01
                ) {

                    frame =
                        requestAnimationFrame(
                            animate
                        );

                } else {

                    frame = null;

                }

            }


            element.addEventListener(
                'mousemove',
                function (event) {

                    const rect =
                        element.getBoundingClientRect();


                    const x =
                        (event.clientX - rect.left) /
                        rect.width;


                    const y =
                        (event.clientY - rect.top) /
                        rect.height;


                    targetX =
                        (0.5 - y) *
                        maxTilt *
                        2;


                    targetY =
                        (x - 0.5) *
                        maxTilt *
                        2;


                    if (!frame) {
                        frame =
                            requestAnimationFrame(
                                animate
                            );
                    }

                }
            );


            element.addEventListener(
                'mouseleave',
                function () {

                    targetX = 0;
                    targetY = 0;


                    if (!frame) {
                        frame =
                            requestAnimationFrame(
                                animate
                            );
                    }

                }
            );

        });

    }


    /* =========================================================
       10. COUNT-UP NUMBERS
       ========================================================= */

    function initCountUp() {

        const counters =
            document.querySelectorAll(
                '[data-count]'
            );

        if (!counters.length) return;


        function animateCounter(element) {

            if (
                element.dataset.animated === 'true'
            ) {
                return;
            }


            element.dataset.animated =
                'true';


            const target =
                parseFloat(
                    element.dataset.count
                ) || 0;


            const suffix =
                element.dataset.suffix || '';


            const decimal =
                !Number.isInteger(target);


            const duration = 1800;

            const startTime =
                performance.now();


            function frame(now) {

                const progress =
                    Math.min(
                        (now - startTime) /
                        duration,
                        1
                    );


                const eased =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );


                const value =
                    eased * target;


                element.textContent =
                    (
                        decimal
                        ? value.toFixed(1)
                        : Math.round(value)
                    ) + suffix;


                if (progress < 1) {
                    requestAnimationFrame(frame);
                }

            }


            requestAnimationFrame(frame);

        }


        if ('IntersectionObserver' in window) {

            const observer =
                new IntersectionObserver(
                    entries => {

                        entries.forEach(entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                animateCounter(
                                    entry.target
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        });

                    },
                    {
                        threshold: 0.2
                    }
                );


            counters.forEach(
                counter =>
                    observer.observe(counter)
            );

        } else {

            counters.forEach(
                animateCounter
            );

        }

    }


    /* =========================================================
       11. SKILL BARS
       ========================================================= */

    function initSkillBars() {

        const fills =
            document.querySelectorAll(
                '.vs-skill-fill'
            );

        const percentages =
            document.querySelectorAll(
                '.vs-skill-pct'
            );


        /* Skill bars */

        if (
            fills.length &&
            'IntersectionObserver' in window
        ) {

            const observer =
                new IntersectionObserver(
                    entries => {

                        entries.forEach(entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                const fill =
                                    entry.target;


                                const value =
                                    fill.dataset.fill ||
                                    0;


                                fill.style.setProperty(
                                    '--fill-width',
                                    value + '%'
                                );


                                requestAnimationFrame(
                                    () => {
                                        fill.classList.add(
                                            'is-filled'
                                        );
                                    }
                                );


                                observer.unobserve(
                                    fill
                                );

                            }

                        });

                    },
                    {
                        threshold: 0.4
                    }
                );


            fills.forEach(
                fill =>
                    observer.observe(fill)
            );

        } else {

            fills.forEach(fill => {

                const value =
                    fill.dataset.fill || 0;

                fill.style.setProperty(
                    '--fill-width',
                    value + '%'
                );

                fill.classList.add(
                    'is-filled'
                );

            });

        }


        /* Percentage numbers */

        if (
            percentages.length &&
            'IntersectionObserver' in window
        ) {

            const observer =
                new IntersectionObserver(
                    entries => {

                        entries.forEach(entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                const element =
                                    entry.target;


                                const target =
                                    parseInt(
                                        element.dataset.target,
                                        10
                                    ) || 0;


                                const start =
                                    performance.now();


                                const duration =
                                    1600;


                                function animate(now) {

                                    const progress =
                                        Math.min(
                                            (now - start) /
                                            duration,
                                            1
                                        );


                                    const eased =
                                        1 -
                                        Math.pow(
                                            1 - progress,
                                            3
                                        );


                                    element.textContent =
                                        Math.round(
                                            eased *
                                            target
                                        ) + '%';


                                    if (
                                        progress < 1
                                    ) {
                                        requestAnimationFrame(
                                            animate
                                        );
                                    }

                                }


                                requestAnimationFrame(
                                    animate
                                );


                                observer.unobserve(
                                    element
                                );

                            }

                        });

                    },
                    {
                        threshold: 0.4
                    }
                );


            percentages.forEach(
                percentage =>
                    observer.observe(percentage)
            );

        }

    }


    /* =========================================================
       12. FOUNDER SECTION PARALLAX
       ========================================================= */

    function initFounderParallax() {

        const section =
            document.querySelector(
                '.vamshi-section'
            );

        if (!section) return;


        const orbs =
            section.querySelectorAll(
                '.vs-bg-orb'
            );

        if (!orbs.length) return;


        if (
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches
        ) {
            return;
        }


        let ticking = false;


        function update() {

            const rect =
                section.getBoundingClientRect();


            const sectionCenter =
                rect.top +
                rect.height / 2;


            const viewportCenter =
                window.innerHeight / 2;


            const offset =
                (
                    sectionCenter -
                    viewportCenter
                ) /
                window.innerHeight;


            orbs.forEach((orb, index) => {

                const speed =
                    index === 0
                    ? 60
                    : -50;


                orb.style.transform =
                    `translateY(${(
                        offset * speed
                    ).toFixed(1)}px)`;

            });


            ticking = false;

        }


        window.addEventListener(
            'scroll',
            function () {

                if (!ticking) {

                    requestAnimationFrame(
                        update
                    );

                    ticking = true;

                }

            },
            { passive: true }
        );


        update();

    }


    /* =========================================================
       13. TIMELINE PROGRESS
       ========================================================= */

    function initTimelineProgress() {

        const timeline =
            document.querySelector(
                '.vs-timeline'
            );

        if (!timeline) return;


        const line =
            timeline.querySelector(
                '.vs-tl-line'
            );

        if (!line) return;


        function update() {

            const rect =
                timeline.getBoundingClientRect();


            const viewportHeight =
                window.innerHeight;


            const start =
                viewportHeight * 0.85;

            const end =
                viewportHeight * 0.15;


            const scrolled =
                start - rect.top;


            const denominator =
                rect.height -
                (start - end);


            if (denominator <= 0) {
                return;
            }


            const progress =
                Math.max(
                    0,
                    Math.min(
                        1,
                        scrolled / denominator
                    )
                );


            line.style.setProperty(
                '--line-fill',
                (progress * 100) + '%'
            );

        }


        window.addEventListener(
            'scroll',
            update,
            { passive: true }
        );

        window.addEventListener(
            'resize',
            update
        );

        update();

    }


    /* =========================================================
       14. BEFORE / AFTER
       
       Optional:
       Only runs if your HTML contains #vsBA.
       ========================================================= */

    function initBeforeAfter() {

        const container =
            document.getElementById('vsBA');

        const after =
            document.getElementById('vsBAAfter');

        const handle =
            document.getElementById('vsBAHandle');


        if (
            !container ||
            !after ||
            !handle
        ) {
            return;
        }


        let dragging = false;


        function update(clientX) {

            const rect =
                container.getBoundingClientRect();


            let percentage =
                (
                    (clientX - rect.left) /
                    rect.width
                ) * 100;


            percentage =
                Math.max(
                    0,
                    Math.min(
                        100,
                        percentage
                    )
                );


            after.style.width =
                percentage + '%';


            handle.style.left =
                percentage + '%';

        }


        function pointerDown(event) {

            dragging = true;

            container.setPointerCapture?.(
                event.pointerId
            );

            update(event.clientX);

        }


        function pointerMove(event) {

            if (!dragging) return;

            update(event.clientX);

        }


        function pointerUp() {

            dragging = false;

        }


        container.addEventListener(
            'pointerdown',
            pointerDown
        );

        container.addEventListener(
            'pointermove',
            pointerMove
        );

        container.addEventListener(
            'pointerup',
            pointerUp
        );

        container.addEventListener(
            'pointercancel',
            pointerUp
        );

    }


    /* =========================================================
       15. INSTAGRAM FLOATING BUTTON
       
       No JS is actually required for it.
       This check is only here so the element is valid.
       ========================================================= */

    function initInstagramButton() {

        const instagram =
            document.querySelector(
                '.instagram-float'
            );

        if (!instagram) return;

        /*
         * Nothing else required.
         * The link works directly through HTML.
         */

    }


    /* =========================================================
       16. INITIALIZE EVERYTHING
       ========================================================= */

    function init() {

        initReveal();

        initNavbar();

        initPortfolioFilters();

        initPortfolioRail();

        initProjectModal();

        initSmoothScroll();

        initActiveNavigation();

        initMagneticHeading();

        initTilt();

        initCountUp();

        initSkillBars();

        initFounderParallax();

        initTimelineProgress();

        initBeforeAfter();

        initInstagramButton();

    }


    /* =========================================================
       START
       ========================================================= */

    if (
        document.readyState === 'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            init
        );

    } else {

        init();

    }

})();