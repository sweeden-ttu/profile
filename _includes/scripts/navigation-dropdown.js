/**
 * Navigation Dropdown Script
 * ===========================
 * Handles dropdown menu interactions and mobile menu toggle
 * Implements keyboard navigation and ARIA attribute updates
 */

(function() {
  'use strict';
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
  
  function initNavigation() {
    const navigation = document.querySelector('.navigation--dropdown');
    if (!navigation) return;
    
    const toggle = navigation.querySelector('.navigation__toggle');
    const menu = navigation.querySelector('.navigation__list');
    const dropdownButtons = navigation.querySelectorAll('.navigation__link--dropdown');
    
    // Mobile menu toggle
    if (toggle && menu) {
      toggle.addEventListener('click', function() {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        menu.setAttribute('aria-hidden', isExpanded);
        
        // Prevent body scroll when menu is open on mobile
        if (!isExpanded) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', function(event) {
        if (!navigation.contains(event.target) && toggle.getAttribute('aria-expanded') === 'true') {
          toggle.setAttribute('aria-expanded', 'false');
          menu.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      });
      
      // Close menu on escape key
      document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          toggle.setAttribute('aria-expanded', 'false');
          menu.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
          toggle.focus();
        }
      });
    }
    
    // Dropdown menu interactions
    dropdownButtons.forEach(function(button) {
      const dropdown = button.nextElementSibling;
      if (!dropdown || !dropdown.classList.contains('navigation__dropdown')) return;
      
      // Toggle dropdown on click (mobile)
      button.addEventListener('click', function(event) {
        if (window.innerWidth < 768) {
          event.preventDefault();
          const isExpanded = button.getAttribute('aria-expanded') === 'true';
          button.setAttribute('aria-expanded', !isExpanded);
        }
      });
      
      // Keyboard navigation
      button.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (window.innerWidth < 768) {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', !isExpanded);
          } else {
            // On desktop, open dropdown and focus first link
            const firstLink = dropdown.querySelector('.navigation__dropdown-link');
            if (firstLink) {
              firstLink.focus();
            }
          }
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          const firstLink = dropdown.querySelector('.navigation__dropdown-link');
          if (firstLink) {
            firstLink.focus();
          }
        }
      });
      
      // Close dropdown when focus leaves
      dropdown.addEventListener('focusout', function(event) {
        // Check if focus moved outside dropdown
        if (!dropdown.contains(event.relatedTarget) && 
            event.relatedTarget !== button) {
          button.setAttribute('aria-expanded', 'false');
        }
      });
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        // Reset mobile menu state on resize to desktop
        if (window.innerWidth >= 768) {
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            menu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
          }
          // Close all dropdowns
          dropdownButtons.forEach(function(button) {
            button.setAttribute('aria-expanded', 'false');
          });
        }
      }, 250);
    });
  }
})();
