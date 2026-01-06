// Smooth Scroll Utilities for JantaReport

/**
 * Smooth scroll to element
 * @param {string|HTMLElement} target - CSS selector or element
 * @param {number} offset - Offset from top (default: 0)
 */
function smoothScrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

/**
 * Smooth scroll to top
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * Smooth scroll within container
 * @param {HTMLElement} container - Scrollable container
 * @param {number} scrollAmount - Amount to scroll
 * @param {string} direction - 'vertical' or 'horizontal'
 */
function smoothScrollContainer(container, scrollAmount, direction = 'vertical') {
    if (!container) return;

    const scrollOptions = {
        behavior: 'smooth'
    };

    if (direction === 'vertical') {
        scrollOptions.top = container.scrollTop + scrollAmount;
    } else {
        scrollOptions.left = container.scrollLeft + scrollAmount;
    }

    container.scrollTo(scrollOptions);
}

/**
 * Add smooth scroll to all anchor links
 */
function initSmoothScrollLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                smoothScrollTo(target, 80); // 80px offset for fixed headers
            }
        });
    });
}

/**
 * Smooth scroll reveal on scroll
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initSmoothScrollLinks();
        initScrollReveal();
    });
} else {
    initSmoothScrollLinks();
    initScrollReveal();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { smoothScrollTo, scrollToTop, smoothScrollContainer, initSmoothScrollLinks, initScrollReveal };
}
