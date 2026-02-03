/**
 * Coursework Filter Script
 * ========================
 * Handles term filtering for coursework section
 * Implements accessible tab panel pattern
 */

(function() {
  'use strict';
  
  function initCourseworkFilter() {
    const section = document.querySelector('.coursework-section');
    if (!section) return;
    
    const filters = section.querySelectorAll('.coursework-filter');
    const panels = section.querySelectorAll('.coursework-grid');
    
    if (filters.length === 0 || panels.length === 0) return;
    
    // Handle filter button clicks
    filters.forEach(function(filter) {
      filter.addEventListener('click', function() {
        const filterValue = this.getAttribute('data-filter');
        
        // Update active state
        filters.forEach(function(f) {
          f.classList.remove('coursework-filter--active');
          f.setAttribute('aria-selected', 'false');
        });
        this.classList.add('coursework-filter--active');
        this.setAttribute('aria-selected', 'true');
        
        // Show/hide panels
        panels.forEach(function(panel) {
          const panelId = panel.getAttribute('id');
          const expectedId = 'filter-' + filterValue;
          
          if (panelId === expectedId || (filterValue === 'all' && panelId.startsWith('filter-'))) {
            panel.removeAttribute('hidden');
            panel.setAttribute('aria-hidden', 'false');
          } else if (filterValue === 'all') {
            // Show all panels when "all" is selected
            panel.removeAttribute('hidden');
            panel.setAttribute('aria-hidden', 'false');
          } else {
            panel.setAttribute('hidden', '');
            panel.setAttribute('aria-hidden', 'true');
          }
        });
        
        // Smooth scroll to content
        const content = section.querySelector('.coursework-section__content');
        if (content) {
          content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
      
      // Keyboard navigation
      filter.addEventListener('keydown', function(event) {
        let targetFilter = null;
        
        switch(event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            targetFilter = this.previousElementSibling;
            if (!targetFilter || !targetFilter.classList.contains('coursework-filter')) {
              targetFilter = filters[filters.length - 1];
            }
            break;
          case 'ArrowRight':
            event.preventDefault();
            targetFilter = this.nextElementSibling;
            if (!targetFilter || !targetFilter.classList.contains('coursework-filter')) {
              targetFilter = filters[0];
            }
            break;
          case 'Home':
            event.preventDefault();
            targetFilter = filters[0];
            break;
          case 'End':
            event.preventDefault();
            targetFilter = filters[filters.length - 1];
            break;
        }
        
        if (targetFilter) {
          targetFilter.focus();
          targetFilter.click();
        }
      });
    });
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCourseworkFilter);
  } else {
    initCourseworkFilter();
  }
})();
