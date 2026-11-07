/**
 * EMLENotes (إيملي نوتس) — Interactive UI Controller
 * Handles:
 *  - Sticky header elevation
 *  - Accessible mobile navigation drawer + dropdown toggles
 *  - 3D Coverflow carousels with keyboard, touch swipe, and dot navigation
 *  - Accessible Lightbox modal (Esc key, backdrop click, focus restoration)
 *  - Portfolio / Solutions category filtering
 *  - Demo request & contact form submission handler
 */

(function () {
  'use strict';

  const coverflowStates = {};
  let lastFocusedElement = null;

  /* --------------------------------------------------------------------------
   * 1. Header Scroll & Mobile Menu
   * -------------------------------------------------------------------------- */
  function refineNavigation() {
    const mainNav = document.querySelector('.main-nav');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const headerActions = document.querySelector('.header-actions');

    // Keep the main navigation focused on a B2B visitor's decision path:
    // company → solutions → proof → future vision → contact CTA.
    if (mainNav) {
      mainNav.querySelectorAll(':scope > a.nav-link').forEach((link) => {
        if (link.getAttribute('href') === 'index.html' ||
            link.getAttribute('href') === 'attendance.html' ||
            link.getAttribute('href') === 'contact.html') {
          link.remove();
        }
      });

      const projectsLink = mainNav.querySelector(':scope > a[href="projects.html"]');
      if (projectsLink) projectsLink.textContent = 'مشروعاتنا وأثرنا';

      const roadmapLink = mainNav.querySelector(':scope > a[href="roadmap.html"]');
      if (roadmapLink) roadmapLink.textContent = 'رؤيتنا القادمة';

      const solutionsToggle = mainNav.querySelector('.nav-dropdown-toggle');
      if (solutionsToggle) {
        const labelNode = Array.from(solutionsToggle.childNodes)
          .find((node) => node.nodeType === Node.TEXT_NODE);
        if (labelNode) labelNode.nodeValue = 'حلولنا ';
      }
    }

    if (headerActions) {
      const redundantProjectsButton = headerActions.querySelector('a[href="projects.html"]');
      if (redundantProjectsButton) redundantProjectsButton.remove();
    }

    if (mobileDrawer) {
      mobileDrawer.querySelectorAll('.mobile-nav-link').forEach((link) => {
        if (link.getAttribute('href') === 'index.html' ||
            link.getAttribute('href') === 'attendance.html' ||
            link.getAttribute('href') === 'contact.html') {
          link.remove();
        }
      });

      const solutionsLink = mobileDrawer.querySelector('.mobile-nav-link[href="solutions.html"]');
      if (solutionsLink) solutionsLink.textContent = 'حلولنا';

      const projectsLink = mobileDrawer.querySelector('.mobile-nav-link[href="projects.html"]');
      if (projectsLink) projectsLink.textContent = 'مشروعاتنا وأثرنا';

      const roadmapLink = mobileDrawer.querySelector('.mobile-nav-link[href="roadmap.html"]');
      if (roadmapLink) roadmapLink.textContent = 'رؤيتنا القادمة';
    }
  }

  function initNavigation() {
    refineNavigation();
    const header = document.querySelector('.site-header');
    const mobileBtn = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    if (header) {
      const onScroll = () => {
        if (window.scrollY > 12) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (mobileBtn && mobileDrawer) {
      mobileBtn.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('is-open');
        mobileBtn.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      mobileDrawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('is-open');
          mobileBtn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }

    dropdowns.forEach((dropdown) => {
      const btn = dropdown.querySelector('.nav-dropdown-toggle');
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(isOpen));
      });
    });

    document.addEventListener('click', () => {
      dropdowns.forEach((d) => {
        d.classList.remove('is-open');
        const b = d.querySelector('.nav-dropdown-toggle');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 2. 3D Coverflow Showcases
   * -------------------------------------------------------------------------- */
  function initCoverflow(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const slides = Array.from(container.querySelectorAll('.coverflow-slide'));
    if (slides.length === 0) return;

    coverflowStates[containerId] = {
      activeIndex: 0,
      slides: slides
    };

    slides.forEach((slide, idx) => {
      slide.setAttribute('tabindex', '0');
      slide.setAttribute('role', 'button');
      const img = slide.querySelector('img');
      if (img && img.alt) {
        slide.setAttribute('aria-label', img.alt);
      }
      slide.addEventListener('click', () => jumpToSlide(containerId, idx));
      slide.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          jumpToSlide(containerId, idx);
        }
      });
    });

    const dotsContainer = document.getElementById('dots-' + containerId);
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'coverflow-dot' + (idx === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'انتقل إلى الشاشة رقم ' + (idx + 1));
        dot.addEventListener('click', () => jumpToSlide(containerId, idx));
        dotsContainer.appendChild(dot);
      });
    }

    // Touch swipe support
    let touchStartX = 0;
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 40) {
        moveCoverflow(containerId, diff > 0 ? -1 : 1);
      }
    }, { passive: true });

    renderCoverflow(containerId);
  }

  function renderCoverflow(containerId) {
    const state = coverflowStates[containerId];
    if (!state) return;

    const active = state.activeIndex;
    const slides = state.slides;
    const len = slides.length;

    slides.forEach((slide, idx) => {
      slide.classList.remove('active-center', 'active-left', 'active-right');

      if (idx === active) {
        slide.classList.add('active-center');
        const img = slide.querySelector('img');
        const captionElement = document.getElementById('caption-' + containerId);
        if (captionElement && img) {
          captionElement.textContent = img.alt || '';
        }
      } else if (idx === (active - 1 + len) % len) {
        slide.classList.add('active-left');
      } else if (idx === (active + 1) % len) {
        slide.classList.add('active-right');
      }
    });

    const dotsContainer = document.getElementById('dots-' + containerId);
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.coverflow-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === active);
      });
    }
  }

  function moveCoverflow(containerId, direction) {
    const state = coverflowStates[containerId];
    if (!state) return;
    const len = state.slides.length;
    state.activeIndex = (state.activeIndex + direction + len) % len;
    renderCoverflow(containerId);
  }

  function jumpToSlide(containerId, slideIndex) {
    const state = coverflowStates[containerId];
    if (!state) return;

    if (state.activeIndex === slideIndex) {
      const slide = state.slides[slideIndex];
      const img = slide.querySelector('img');
      if (img) {
        openLightbox(img.src, img.alt);
      }
    } else {
      state.activeIndex = slideIndex;
      renderCoverflow(containerId);
    }
  }

  /* --------------------------------------------------------------------------
   * 3. Accessible Lightbox Modal
   * -------------------------------------------------------------------------- */
  function openLightbox(src, alt) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    const closeBtn = modal ? modal.querySelector('.lightbox-close') : null;

    if (!modal || !img) return;

    lastFocusedElement = document.activeElement;
    img.src = src;
    img.alt = alt || '';
    if (caption) caption.textContent = alt || '';

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal || !modal.classList.contains('active')) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  function initLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });

    const closeBtn = modal.querySelector('.lightbox-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeLightbox);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 4. Category Filter Tabs (Projects / Solutions)
   * -------------------------------------------------------------------------- */
  function initFilterTabs() {
    const tabGroups = document.querySelectorAll('[data-filter-group]');
    tabGroups.forEach((group) => {
      const targetId = group.getAttribute('data-filter-group');
      const container = document.getElementById(targetId);
      if (!container) return;

      const buttons = group.querySelectorAll('.filter-tab');
      const items = container.querySelectorAll('[data-category]');

      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const filter = btn.getAttribute('data-filter');
          buttons.forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');

          items.forEach((item) => {
            const cats = (item.getAttribute('data-category') || '').split(' ');
            if (filter === 'all' || cats.includes(filter)) {
              item.style.display = '';
            } else {
              item.style.display = 'none';
            }
          });
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 5. Contact & Demo Request Form
   * -------------------------------------------------------------------------- */
  function initContactForms() {
    const forms = document.querySelectorAll('[data-contact-form]');
    forms.forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const feedback = form.querySelector('.form-feedback');
        const submitBtn = form.querySelector('button[type="submit"]');

        const formData = new FormData(form);
        const name = formData.get('name') || '';
        const org = formData.get('organization') || '';
        const solution = formData.get('solution') || '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'تم استلام طلبك بنجاح ✓';
        }

        if (feedback) {
          feedback.textContent = `شكراً لك ${name}${org ? ' (' + org + ')' : ''}! تم تسجيل طلبك بخصوص "${solution || 'حلول إيملي نوتس'}" وسيتواصل معك فريق الشراكات المؤسسية خلال ساعات العمل.`;
          feedback.classList.add('is-visible');
        }
      });
    });
  }

  // Expose helpers for inline handlers if any remain
  window.moveCoverflow = moveCoverflow;
  window.jumpToSlide = jumpToSlide;
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;

  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCoverflow('coverflow-hosting');
    initCoverflow('coverflow-qbank');
    initCoverflow('coverflow-attendance');
    initLightbox();
    initFilterTabs();
    initContactForms();

    document.querySelectorAll('[data-coverflow-prev]').forEach((btn) => {
      btn.addEventListener('click', () => moveCoverflow(btn.getAttribute('data-coverflow-prev'), -1));
    });
    document.querySelectorAll('[data-coverflow-next]').forEach((btn) => {
      btn.addEventListener('click', () => moveCoverflow(btn.getAttribute('data-coverflow-next'), 1));
    });
  });
})();
