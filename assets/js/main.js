// main.js
// Minimal JavaScript for mobile menu and progressive enhancements

(function() {
  'use strict';

  // ============================================================================
  // Mobile Menu Toggle
  // ============================================================================

  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (mobileMenuToggle && siteNav) {
    mobileMenuToggle.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';

      this.setAttribute('aria-expanded', !isExpanded);
      siteNav.classList.toggle('site-nav--open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.site-header')) {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('site-nav--open');
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('site-nav--open');
      }
    });
  }

  // ============================================================================
  // Smooth Scroll Enhancement (if not supported natively)
  // ============================================================================

  if (!('scrollBehavior' in document.documentElement.style)) {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // ============================================================================
  // External Links - Open in New Tab
  // ============================================================================

  const externalLinks = document.querySelectorAll('a[href^="http"]');

  externalLinks.forEach(function(link) {
    const href = link.getAttribute('href');
    const currentDomain = window.location.hostname;

    // Check if link is external
    if (!href.includes(currentDomain)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // ============================================================================
  // Copy Code Button for Code Blocks (optional enhancement)
  // ============================================================================

  const codeBlocks = document.querySelectorAll('pre code');

  codeBlocks.forEach(function(codeBlock) {
    const pre = codeBlock.parentElement;
    const button = document.createElement('button');
    button.className = 'copy-code-btn';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');

    button.addEventListener('click', function() {
      const code = codeBlock.textContent;

      navigator.clipboard.writeText(code).then(function() {
        button.textContent = 'Copied!';
        setTimeout(function() {
          button.textContent = 'Copy';
        }, 2000);
      }).catch(function(err) {
        console.error('Failed to copy:', err);
      });
    });

    pre.style.position = 'relative';
    pre.appendChild(button);
  });

})();
