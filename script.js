// --------- MOUSE POSITION TRACKING ---------
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let normalizedMouseX = 0;
let normalizedMouseY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    normalizedMouseX = (e.clientX - window.innerWidth / 2);
    normalizedMouseY = (e.clientY - window.innerHeight / 2);
});

function applyHoverHitTest() {
    // Robust hit-testing to force hover states when native CSS hover is blocked by scroll transforms
    document.querySelectorAll('.project-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
            if (!card.classList.contains('is-hovered')) card.classList.add('is-hovered');
        } else {
            if (card.classList.contains('is-hovered')) card.classList.remove('is-hovered');
        }
    });

    requestAnimationFrame(applyHoverHitTest);
}
applyHoverHitTest();

// Guarantee hover checks update native CSS during passive scrolls
window.addEventListener('scroll', () => {
    document.querySelectorAll('.project-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
            if (!card.classList.contains('is-hovered')) card.classList.add('is-hovered');
        } else {
            if (card.classList.contains('is-hovered')) card.classList.remove('is-hovered');
        }
    });
});

// --------- INITIALIZATION & DOM READY ---------
window.addEventListener('DOMContentLoaded', () => {

    // --------- NAVIGATION LOGIC ---------
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // --------- THREE.JS SCENE: GYROSCOPE MULTILAYER DATA GLOBE ---------
    const canvas = document.getElementById('bg-canvas');
    // Ensure transparent background via alpha: true
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 24; // Moved slightly back to fit larger structures

    // The holding group allows all elements to breathe visually together
    const threeGroup = new THREE.Group();
    scene.add(threeGroup);

    // Initial default colors & opacities
    let accentColorHex = 0xFF4444;
    let darkGlobeOpacity = 0.18;
    let darkOuterOpacity = 0.08;
    let darkRingsOpacity = 0.15;
    let particleOpacity = 0.5;

    // 1. Inner Globe Wireframe
    const innerGlobeGeo = new THREE.IcosahedronGeometry(7, 2);
    const innerGlobeMat = new THREE.MeshBasicMaterial({
        color: accentColorHex,
        wireframe: true,
        transparent: true,
        opacity: darkGlobeOpacity
    });
    const innerGlobe = new THREE.Mesh(innerGlobeGeo, innerGlobeMat);
    threeGroup.add(innerGlobe);

    // 2. Outer Globe (Gyroscope effect opposite rotation)
    const outerGlobeGeo = new THREE.IcosahedronGeometry(8.5, 2);
    const outerGlobeMat = new THREE.MeshBasicMaterial({
        color: accentColorHex,
        wireframe: true,
        transparent: true,
        opacity: darkOuterOpacity
    });
    const outerGlobe = new THREE.Mesh(outerGlobeGeo, outerGlobeMat);
    threeGroup.add(outerGlobe);

    // 3. Glowing Orbital Rings
    const ringGeo = new THREE.TorusGeometry(10, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
        color: accentColorHex,
        transparent: true,
        opacity: darkRingsOpacity,
        blending: THREE.AdditiveBlending
    });

    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    threeGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 3;
    ring2.rotation.x = Math.PI / 4;
    threeGroup.add(ring2);

    const ring3 = new THREE.Mesh(ringGeo, ringMat);
    ring3.rotation.y = -Math.PI / 3;
    ring3.rotation.x = Math.PI / 8;
    threeGroup.add(ring3);

    // 4. Dual Particle Layers
    // Inner Tight Cluster
    const innerPartGeo = new THREE.BufferGeometry();
    const innerPartPos = new Float32Array(300 * 3);
    for (let i = 0; i < 300 * 3; i++) {
        innerPartPos[i] = (Math.random() - 0.5) * 15; // Tight spread around globe
    }
    innerPartGeo.setAttribute('position', new THREE.BufferAttribute(innerPartPos, 3));
    const innerPartMat = new THREE.PointsMaterial({
        size: 0.12, color: accentColorHex, transparent: true, opacity: particleOpacity, blending: THREE.AdditiveBlending
    });
    const innerPartMesh = new THREE.Points(innerPartGeo, innerPartMat);
    threeGroup.add(innerPartMesh);

    // Outer Sparse Field
    const outerPartGeo = new THREE.BufferGeometry();
    const outerPartPos = new Float32Array(300 * 3);
    for (let i = 0; i < 300 * 3; i++) {
        outerPartPos[i] = (Math.random() - 0.5) * 50; // Vast sparse spread
    }
    outerPartGeo.setAttribute('position', new THREE.BufferAttribute(outerPartPos, 3));
    const outerPartMat = new THREE.PointsMaterial({
        size: 0.08, color: accentColorHex, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending
    });
    const outerPartMesh = new THREE.Points(outerPartGeo, outerPartMat);
    threeGroup.add(outerPartMesh);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();

    function animate3D() {
        requestAnimationFrame(animate3D);
        const elapsedTime = clock.getElapsedTime();

        // Object rotations
        // Inner globe slow forward
        innerGlobe.rotation.y += 0.0012;
        innerGlobe.rotation.x += 0.0006;

        // Outer globe slower backward (gyroscope effect)
        outerGlobe.rotation.y -= 0.0006;
        outerGlobe.rotation.x -= 0.0003;

        // Orbital rings very slow rotation
        ring1.rotation.y += 0.002;
        ring2.rotation.z += 0.001;
        ring3.rotation.x -= 0.0015;

        // Particles rotate independently
        innerPartMesh.rotation.y = -elapsedTime * 0.012;
        outerPartMesh.rotation.y = elapsedTime * 0.005;

        // Global Breathing Scale (6s period) applies to the entire group
        const sineWave = Math.sin(elapsedTime * (Math.PI / 3));
        const breathingScale = 1 + sineWave * 0.03;
        threeGroup.scale.set(breathingScale, breathingScale, breathingScale);

        // Subdued mouse parallax applied strictly to group wrapper
        const targetRotX = normalizedMouseY * 0.0003;
        const targetRotY = normalizedMouseX * 0.0003;

        threeGroup.rotation.y += 0.05 * (targetRotY - threeGroup.rotation.y);
        threeGroup.rotation.x += 0.05 * (targetRotX - threeGroup.rotation.x);

        renderer.render(scene, camera);
    }
    animate3D();

    // --------- THEME TOGGLE LOGIC ---------
    const themeBtn = document.getElementById('theme-toggle');

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');

        const isLightMode = document.body.classList.contains('light-mode');

        if (isLightMode) {
            // Setup Red Scheme for Light Mode
            innerGlobeMat.color.setHex(0xD32F2F);
            outerGlobeMat.color.setHex(0xD32F2F);
            ringMat.color.setHex(0xD32F2F);
            innerPartMat.color.setHex(0xD32F2F);
            outerPartMat.color.setHex(0xD32F2F);

            // Adjust to lower opacity for bright background
            innerGlobeMat.opacity = 0.10;
            outerGlobeMat.opacity = 0.05;
        } else {
            // Revert Blue Scheme for Dark Mode
            innerGlobeMat.color.setHex(0xFF4444);
            outerGlobeMat.color.setHex(0xFF4444);
            ringMat.color.setHex(0xFF4444);
            innerPartMat.color.setHex(0xFF4444);
            outerPartMat.color.setHex(0xFF4444);

            // Restore visibility
            innerGlobeMat.opacity = darkGlobeOpacity;
            outerGlobeMat.opacity = darkOuterOpacity;
        }
    });

    // --------- GSAP ANIMATIONS  ---------
    gsap.registerPlugin(ScrollTrigger);

    // Initial Load Sequence
    const initSequence = () => {
        const tl = gsap.timeline();

        tl.to('#loader', {
            opacity: 0,
            duration: 0.8,
            delay: 0.2,
            ease: "power2.out",
            onComplete: () => document.getElementById('loader').style.display = 'none'
        });

        // 1. Hero Name Split & Fall
        const heroTitle = document.getElementById('hero-title');
        if (heroTitle) {
            const titleText = heroTitle.innerText;
            heroTitle.innerHTML = '';

            titleText.split('').forEach(char => {
                let span = document.createElement('span');
                span.className = 'char';
                span.innerHTML = char === ' ' ? '&nbsp;' : char;
                heroTitle.appendChild(span);
            });

            tl.fromTo('.char',
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.04, ease: "power3.out" },
                "-=0.2"
            );
        }

        // Accent line below name
        tl.to('.hero-accent-line', {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
        }, "-=0.3");

        // 2. Typewriter Effect
        const targetText = "Strategy & Operations focused engineer building systems through data and process optimization.";
        const taglineElem = document.getElementById('hero-tagline');
        if (taglineElem) {
            targetText.split('').forEach(char => {
                let span = document.createElement('span');
                span.innerHTML = char === ' ' ? '&nbsp;' : char;
                taglineElem.appendChild(span);
            });

            const typeCursor = document.createElement('span');
            typeCursor.className = 'type-cursor';
            taglineElem.appendChild(typeCursor);

            tl.to('#hero-tagline span:not(.type-cursor)', {
                opacity: 1,
                duration: 0.01,
                stagger: 0.03,
                ease: "none",
                onComplete: () => typeCursor.classList.add('finished') // Stop blink
            }, "+=0.1");
        }

        // 3. Hero Buttons Fade/Slide up
        tl.fromTo('.cta-container .btn',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: "power2.out" }
        )
            // Scroll down chevron
            .to('.scroll-down', { opacity: 1, duration: 1 }, "-=0.2");
    };

    // Ensure things render briefly before starting
    setTimeout(initSequence, 100);

    // Section Scroll Reveals
    const sections = document.querySelectorAll('section:not(.hero)');
    sections.forEach(section => {
        const title = section.querySelector('.section-title');

        if (title) {
            // Section titles slide from left
            gsap.fromTo(title,
                { opacity: 0, x: -30 },
                {
                    scrollTrigger: { trigger: section, start: "top 80%" },
                    opacity: 1, x: 0, duration: 0.9, ease: "power2.out"
                }
            );
        }
    });

    // About Text Word Stagger
    const aboutText = document.querySelector('.about-text p');
    if (aboutText) {
        const words = aboutText.innerText.split(' ');
        aboutText.innerHTML = '';
        words.forEach(word => {
            let span = document.createElement('span');
            span.className = 'word';
            span.innerHTML = word + '&nbsp;';
            aboutText.appendChild(span);
        });

        gsap.fromTo('.word',
            { opacity: 0, y: 20 },
            {
                scrollTrigger: { trigger: '#about', start: "top 75%" },
                opacity: 1, y: 0, duration: 0.6, stagger: 0.03, ease: "power2.out"
            }
        );
    }

    // Skills Categories Stagger Fade Up
    gsap.fromTo('.skill-category-block',
        { opacity: 0, y: 25 },
        {
            scrollTrigger: { trigger: '#skills', start: "top 78%" },
            opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out"
        }
    );

    // Projects Uniform Slides
    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.fromTo(card,
            { opacity: 0, y: 50 },
            {
                scrollTrigger: { trigger: card, start: "top 85%" },
                opacity: 1, y: 0, duration: 1.0, ease: "power2.out",
                onComplete: () => {
                    card.style.transform = '';
                    card.style.opacity = '1';
                    card.style.pointerEvents = 'auto';
                    ScrollTrigger.refresh();
                    card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                    card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                    card.style.transition = 'none';
                    card.offsetHeight;
                    card.style.transition = '';
                }
            }
        );
    });

    // Contact Area Soft Reveal
    gsap.fromTo('.contact-content',
        { opacity: 0, y: 20 },
        {
            scrollTrigger: { trigger: '#contact', start: "top 80%" },
            opacity: 1, y: 0, duration: 0.8, ease: "power2.out"
        }
    );

    // --------- ACTIVE NAV HIGHLIGHT ---------
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';

        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').includes(current) && current !== 'home') {
                item.classList.add('active');
            }
        });

        if (scrollY < window.innerHeight / 2) {
            navItems.forEach(item => item.classList.remove('active'));
        }
    });

});
