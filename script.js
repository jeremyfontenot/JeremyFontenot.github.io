const SITE_CONFIG = {
    label: 'Identity Focus',
    title: 'Jeremy Fontenot | Cloud-First IT Professional | Microsoft 365, Entra ID, Intune',
    tagline: 'Cloud-First IT Professional Designing Secure Microsoft 365 Environments',
    robots: 'index, follow'
};

document.title = SITE_CONFIG.title;

const robotsMeta = document.querySelector('meta[name="robots"]');
if (robotsMeta) {
    robotsMeta.setAttribute('content', SITE_CONFIG.robots);
}

const heroTagline = document.querySelector('.hero-tagline');
if (heroTagline) {
    heroTagline.textContent = SITE_CONFIG.tagline;
}

// Respect reduced-motion preferences while keeping smooth navigation for most users.
const smoothBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function onAnchorClick(e) {
        const targetSelector = this.getAttribute('href');
        if (!targetSelector || targetSelector === '#') {
            return;
        }

        const target = document.querySelector(targetSelector);
        if (!target) {
            return;
        }

        e.preventDefault();
        target.scrollIntoView({
            behavior: smoothBehavior,
            block: 'start'
        });

        history.replaceState(null, '', targetSelector);
    });
});

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const messageField = document.getElementById('message');

        const name = nameField ? nameField.value.trim() : '';
        const email = emailField ? emailField.value.trim() : '';
        const message = messageField ? messageField.value.trim() : '';

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (name.length < 2) {
            formStatus.textContent = 'Please enter a valid name (at least 2 characters).';
            formStatus.classList.add('is-error');
            nameField?.focus();
            return;
        }

        if (!emailPattern.test(email)) {
            formStatus.textContent = 'Please enter a valid email address.';
            formStatus.classList.add('is-error');
            emailField?.focus();
            return;
        }

        if (message.length < 20) {
            formStatus.textContent = 'Please include more detail in your message (minimum 20 characters).';
            formStatus.classList.add('is-error');
            messageField?.focus();
            return;
        }

        const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
        window.location.href = `mailto:jeremy@jeremyfontenot.online?subject=${subject}&body=${body}`;

        formStatus.textContent = 'Thank you. Your email client should open with your message pre-filled.';
        formStatus.classList.remove('is-error');
        contactForm.reset();
    });
}

window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) {
        nav.style.background = window.scrollY > 50 ? 'rgba(15, 23, 42, 0.98)' : 'rgba(11, 16, 32, 0.84)';
    }
}, { passive: true });
