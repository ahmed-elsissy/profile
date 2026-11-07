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
  let projectGallery = [];
  let projectGalleryIndex = 0;

  /* --------------------------------------------------------------------------
   * 1. Header Scroll & Mobile Menu
   * -------------------------------------------------------------------------- */
  function refineNavigation() {
    const mainNav = document.querySelector('.main-nav');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const headerActions = document.querySelector('.header-actions');

    // Keep the main navigation focused on the essentials:
    // home → solutions → company, with contact as the sole CTA.
    if (mainNav) {
      mainNav.querySelectorAll(':scope > a.nav-link').forEach((link) => {
        if (link.getAttribute('href') === 'attendance.html' ||
            link.getAttribute('href') === 'roadmap.html' ||
            link.getAttribute('href') === 'contact.html') {
          link.remove();
        }
      });

      const solutionsToggle = mainNav.querySelector('.nav-dropdown-toggle');
      if (solutionsToggle) {
        const labelNode = Array.from(solutionsToggle.childNodes)
          .find((node) => node.nodeType === Node.TEXT_NODE);
        if (labelNode) labelNode.nodeValue = 'حلولنا ';
      }

      const aboutLink = mainNav.querySelector(':scope > a[href="about.html"]');
      if (aboutLink) mainNav.appendChild(aboutLink);

      const solutionsMenu = mainNav.querySelector('.nav-dropdown-menu');
      if (solutionsMenu) {
        const directSolutions = [
          ['platform.html', 'المنصة التعليمية'],
          ['governance.html', 'منظومة الحوكمة التعليمية'],
          ['learning-paths.html', 'المسارات التعليمية']
        ];
        directSolutions.forEach(([href, label]) => {
          if (!mainNav.querySelector(`:scope > a[href="${href}"]`)) {
            const link = document.createElement('a');
            link.href = href;
            link.className = 'nav-link';
            link.textContent = label;
            mainNav.insertBefore(link, solutionsMenu.parentElement);
          }
        });
        const toggle = solutionsMenu.parentElement.querySelector('.nav-dropdown-toggle');
        if (toggle) {
          const labelNode = Array.from(toggle.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
          if (labelNode) labelNode.nodeValue = 'تحت التطوير ';
        }
        solutionsMenu.innerHTML = `
          <a href="ai-education.html" class="dropdown-item" role="menuitem"><span class="dropdown-item-title">التعليم الطبي بالذكاء الاصطناعي <span class="status-badge status-badge--dev">قيد التطوير</span></span><span class="dropdown-item-sub">مساعد دراسي ومحتوى تعليمي ذكي</span></a>
          <a href="virtual-medical.html" class="dropdown-item" role="menuitem"><span class="dropdown-item-title">التعليم الطبي الافتراضي <span class="status-badge status-badge--dev">قيد التطوير</span></span><span class="dropdown-item-sub">محاكاة وتدريب سريري غامر</span></a>`;
        const hosting = solutionsMenu.querySelector('a[href="solutions.html#hosting"]');
        const attendance = solutionsMenu.querySelector('a[href="attendance.html"]');
        const qbank = solutionsMenu.querySelector('a[href="solutions.html#qbank"]');
        const production = solutionsMenu.querySelector('a[href="solutions.html#production"]');
        const cme = solutionsMenu.querySelector('a[href="solutions.html#cme-governance"]');
        const ai = solutionsMenu.querySelector('a[href="solutions.html#ai"]');

        if (cme) cme.remove();
        if (attendance) {
          const title = attendance.querySelector('.dropdown-item-title');
          if (title && title.firstChild) title.firstChild.nodeValue = 'منظومة الحضور الإلكتروني والحوكمة التعليمية ';
        }
        if (qbank) {
          const title = qbank.querySelector('.dropdown-item-title');
          if (title && title.firstChild) title.firstChild.nodeValue = 'بنوك الأسئلة الطبية ';
        }

      }
    }

    if (headerActions) {
      const redundantProjectsButton = headerActions.querySelector('a[href="projects.html"]');
      if (redundantProjectsButton) redundantProjectsButton.remove();
      const contactButton = headerActions.querySelector('a[href="contact.html"]');
      if (contactButton) {
        contactButton.href = 'index.html#contact';
        contactButton.textContent = 'تواصل معنا';
      }
    }

    if (mobileDrawer) {
      mobileDrawer.querySelectorAll('.mobile-nav-link').forEach((link) => {
        if (link.getAttribute('href') === 'attendance.html' ||
            link.getAttribute('href') === 'roadmap.html' ||
            link.getAttribute('href') === 'contact.html') {
          link.remove();
        }
      });

      const solutionsLink = mobileDrawer.querySelector('.mobile-nav-link[href="solutions.html"]');
      if (solutionsLink) solutionsLink.remove();

      const mobileAnchor = mobileDrawer.querySelector('.mobile-sublinks');
      [['platform.html', 'المنصة التعليمية'], ['governance.html', 'منظومة الحوكمة التعليمية'], ['learning-paths.html', 'المسارات التعليمية'], ['ai-education.html', 'تحت التطوير: الذكاء الاصطناعي'], ['virtual-medical.html', 'تحت التطوير: التعليم الطبي الافتراضي']].forEach(([href, label]) => {
        if (mobileAnchor && !mobileDrawer.querySelector(`a[href="${href}"]`)) {
          const link = document.createElement('a');
          link.href = href;
          link.className = 'mobile-nav-link';
          link.textContent = label;
          mobileDrawer.insertBefore(link, mobileAnchor);
        }
      });

      const aboutLink = mobileDrawer.querySelector('.mobile-nav-link[href="about.html"]');
      if (aboutLink) mobileDrawer.insertBefore(aboutLink, mobileDrawer.querySelector('[style]'));

      const mobileHosting = mobileDrawer.querySelector('.mobile-sublinks a[href="solutions.html#hosting"]');
      const mobileAttendance = mobileDrawer.querySelector('.mobile-sublinks a[href="attendance.html"]');
      const mobileCme = mobileDrawer.querySelector('.mobile-sublinks a[href="solutions.html#cme-governance"]');
      if (mobileHosting) mobileHosting.textContent = 'منصة الاستضافة التعليمية';
      if (mobileAttendance) {
        mobileAttendance.textContent = 'منظومة الحضور الإلكتروني والحوكمة التعليمية';
        const qbank = document.createElement('a');
        qbank.href = 'solutions.html#qbank';
        qbank.textContent = 'بنوك الأسئلة الطبية';
        mobileAttendance.insertAdjacentElement('afterend', qbank);
      }
      if (mobileCme) mobileCme.remove();

      const contactButton = mobileDrawer.querySelector('.mobile-menu-cta, .btn[href="contact.html"]');
      if (contactButton) {
        contactButton.href = 'index.html#contact';
        contactButton.textContent = 'تواصل معنا';
      }
    }
  }

  function initSolutionDetailPage() {
    const page = window.location.pathname.split('/').pop();
    const configs = {
      'platform.html': { title: 'المنصة التعليمية', sections: ['hosting'] },
      'governance.html': { title: 'منظومة الحوكمة التعليمية', sections: ['attendance'] },
      'learning-paths.html': { title: 'المسارات التعليمية', sections: ['qbank', 'production'] },
      'ai-education.html': { title: 'التعليم الطبي بالذكاء الاصطناعي', sections: ['ai'] },
      'virtual-medical.html': { title: 'التعليم الطبي الافتراضي', sections: [] }
    };
    const config = configs[page];
    if (!config) return;
    document.title = `${config.title} | إيملي نوتس`;
    const heroTitle = document.querySelector('.page-hero .hero-title');
    if (heroTitle) heroTitle.textContent = config.title;
    const legacySolutionIndex = document.querySelector('#main-content > .page-hero + .section--sm');
    if (legacySolutionIndex) legacySolutionIndex.hidden = true;
    document.querySelectorAll('#hosting, #qbank, #attendance, #production, #cme-governance, #ai').forEach((section) => {
      section.hidden = !config.sections.includes(section.id);
    });
    if (page === 'virtual-medical.html') {
      const main = document.getElementById('main-content');
      if (main) main.insertAdjacentHTML('beforeend', `
        <section class="section section--navy"><div class="container"><div class="feature-split"><div><span class="status-badge status-badge--dev">قيد التطوير</span><h2 class="section-title">حرم طبي افتراضي للتدريب الآمن</h2><p class="section-desc">نطوّر بيئة تعليمية غامرة تساعد طلاب الطب والأطباء على التدريب على الحالات والإجراءات في مساحة آمنة وتفاعلية.</p><div class="grid-2"><article class="card card--dark"><h3 class="card-title">محاكاة الحالات</h3><p class="card-text">سيناريوهات سريرية تدعم التعلّم واتخاذ القرار.</p></article><article class="card card--dark"><h3 class="card-title">تعاون الفرق الطبية</h3><p class="card-text">مساحات رقمية مشتركة للتدريب والمناقشة.</p></article></div></div><div class="feature-media"><img src="assets/img/vr-campus.webp" alt="رؤية للتعليم الطبي الافتراضي" width="720" height="720" loading="lazy"></div></div></div></section>`);
    }
  }

  function rewriteLegacyLinks() {
    const routes = {
      'solutions.html#hosting': 'platform.html',
      'solutions.html#qbank': 'learning-paths.html',
      'solutions.html#production': 'learning-paths.html',
      'solutions.html#cme-governance': 'governance.html',
      'solutions.html#ai': 'ai-education.html',
      'solutions.html': 'index.html#solutions',
      'attendance.html': 'governance.html',
      'roadmap.html': 'about.html#roadmap',
      'contact.html': 'index.html#contact'
    };
    document.querySelectorAll('a[href]').forEach((link) => {
      const destination = routes[link.getAttribute('href')];
      if (destination) link.setAttribute('href', destination);
    });
  }

  function initProjectGallery() {
    const groups = {
      'zagazig-attendance': [['assets/img/attendance-checking.webp', 'تطبيق المحاضر — كلية طب الزقازيق'], ['assets/img/attendance-live.webp', 'المتابعة اللحظية'], ['assets/img/attendance-reports.webp', 'تقارير الحوكمة']],
      'zagazig-surgery': [['assets/img/content-production.webp', 'إنتاج المحتوى الطبي'], ['assets/img/app-lessons.webp', 'واجهة الدروس'], ['assets/img/app-videos.webp', 'مكتبة الفيديو']],
      'sharkia-sadat': [['assets/img/hosting-platform.webp', 'منصة البرامج المهنية'], ['assets/img/app-chapters.webp', 'تنظيم المحتوى'], ['assets/img/qbank-main.webp', 'بنوك الأسئلة']],
      'medical-union': [['assets/img/attendance-reports.webp', 'تقارير التشغيل'], ['assets/img/qbank-analytics.webp', 'تحليلات التعلم'], ['assets/img/hosting-platform.webp', 'المنصة الرقمية']],
      'connect-academy': [['assets/img/app-lessons.webp', 'واجهة الدروس'], ['assets/img/qbank-custom.webp', 'جلسات التقييم'], ['assets/img/qbank-history.webp', 'سجل المحاولات']]
    };
    const render = () => {
      const item = projectGallery[projectGalleryIndex];
      if (item) openLightbox(item[0], item[1]);
    };
    Object.entries(groups).forEach(([id, images]) => {
      const card = document.getElementById(id);
      if (!card || card.querySelector('.project-gallery-strip')) return;
      const strip = document.createElement('div');
      strip.className = 'project-gallery-strip';
      strip.style.cssText = 'display:flex;gap:.5rem;overflow:auto;padding-top:1rem;';
      images.forEach(([src, alt], index) => {
        const button = document.createElement('button');
        button.type = 'button'; button.setAttribute('aria-label', `فتح ${alt}`);
        button.style.cssText = 'border:0;border-radius:.65rem;padding:0;min-width:78px;height:58px;overflow:hidden;cursor:pointer;background:#e2e8f0;';
        button.innerHTML = `<img src="${src}" alt="" width="78" height="58" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">`;
        button.addEventListener('click', () => { projectGallery = images; projectGalleryIndex = index; render(); });
        strip.appendChild(button);
      });
      card.appendChild(strip);
    });
    const modal = document.getElementById('lightbox-modal');
    if (modal && !modal.querySelector('.gallery-arrows')) {
      const arrows = document.createElement('div');
      arrows.className = 'gallery-arrows';
      arrows.style.cssText = 'position:absolute;inset-inline:1rem;top:50%;display:flex;justify-content:space-between;pointer-events:none;';
      arrows.innerHTML = '<button type="button" aria-label="السابق" data-gallery-prev style="pointer-events:auto;width:46px;height:46px;border:0;border-radius:50%;font-size:28px;cursor:pointer;">‹</button><button type="button" aria-label="التالي" data-gallery-next style="pointer-events:auto;width:46px;height:46px;border:0;border-radius:50%;font-size:28px;cursor:pointer;">›</button>';
      arrows.querySelector('[data-gallery-prev]').addEventListener('click', () => { if(projectGallery.length){ projectGalleryIndex=(projectGalleryIndex-1+projectGallery.length)%projectGallery.length; render(); }});
      arrows.querySelector('[data-gallery-next]').addEventListener('click', () => { if(projectGallery.length){ projectGalleryIndex=(projectGalleryIndex+1)%projectGallery.length; render(); }});
      modal.appendChild(arrows);
    }
  }

  function renderSharedChrome() {
    if (!document.getElementById('main-content')) return;
    const header = document.querySelector('.site-header');
    const footer = document.querySelector('.site-footer');
    const headerMarkup = `<header class="site-header"><div class="container header-inner"><a href="index.html" class="brand-logo" aria-label="إيملي نوتس — الرئيسية"><img src="assets/img/emle-logo.webp" alt="إيملي نوتس" width="140" height="63"></a><nav class="main-nav" aria-label="التنقل الرئيسي"><a href="index.html" class="nav-link">الرئيسية</a><a href="platform.html" class="nav-link">المنصة التعليمية</a><a href="governance.html" class="nav-link">منظومة الحوكمة التعليمية</a><a href="learning-paths.html" class="nav-link">المسارات التعليمية</a><div class="nav-dropdown"><button type="button" class="nav-link nav-dropdown-toggle" aria-expanded="false" aria-haspopup="true">تحت التطوير <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="nav-dropdown-menu" role="menu"></div></div><a href="projects.html" class="nav-link">سابقة الأعمال</a><a href="about.html" class="nav-link">من نحن</a></nav><div class="header-actions"><a href="index.html#contact" class="btn btn--navy btn--sm">تواصل معنا</a></div><button type="button" id="mobile-menu-toggle" class="mobile-menu-btn" aria-label="فتح القائمة" aria-expanded="false" aria-controls="mobile-drawer"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button></div><div id="mobile-drawer" class="mobile-drawer" aria-label="قائمة الجوال"><a href="index.html" class="mobile-nav-link">الرئيسية</a><div class="mobile-sublinks"></div><a href="about.html" class="mobile-nav-link">من نحن</a><div style="margin-top:1rem"><a href="index.html#contact" class="btn btn--primary">تواصل معنا</a></div></div></header>`;
    const footerMarkup = `<footer class="site-footer" id="site-footer"><div class="container"><div class="footer-grid"><div><a href="index.html" class="footer-brand-logo"><img src="assets/img/emle-logo.webp" alt="إيملي نوتس" width="112" height="40"></a><p class="footer-brand-text">حلول رقمية للتعليم الطبي والحوكمة الأكاديمية، مبنية لتناسب واقع المؤسسات التعليمية.</p></div><div><h2 class="footer-heading">استكشف</h2><div class="footer-links"><a href="platform.html">المنصة التعليمية</a><a href="governance.html">الحوكمة التعليمية</a><a href="learning-paths.html">المسارات التعليمية</a></div></div><div><h2 class="footer-heading">الشركة</h2><div class="footer-links"><a href="projects.html">سابقة الأعمال</a><a href="about.html">من نحن</a><a href="index.html#contact">تواصل معنا</a></div></div><div><h2 class="footer-heading">قانوني</h2><div class="footer-links"><a href="privacy.html">سياسة الخصوصية</a><a href="terms.html">الشروط والأحكام</a><a href="mailto:info@emlenotes.com">info@emlenotes.com</a></div></div></div><div class="footer-bottom"><span>© 2026 جميع الحقوق محفوظة لإيملي نوتس.</span><span>مصر والعالم العربي</span></div></div></footer>`;
    if (header) header.outerHTML = headerMarkup;
    if (footer) footer.outerHTML = footerMarkup;
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
      if (modal.classList.contains('active') && projectGallery.length > 1 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        projectGalleryIndex = e.key === 'ArrowRight'
          ? (projectGalleryIndex - 1 + projectGallery.length) % projectGallery.length
          : (projectGalleryIndex + 1) % projectGallery.length;
        const item = projectGallery[projectGalleryIndex];
        if (item) openLightbox(item[0], item[1]);
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

        const phone = formData.get('phone') || '';
        const email = formData.get('email') || '';
        const message = formData.get('message') || '';
        const subject = `طلب تواصل — ${solution || 'إيملي نوتس'}`;
        const body = `الاسم: ${name}\nالجهة: ${org}\nالهاتف: ${phone}\nالبريد: ${email}\nالحل المطلوب: ${solution}\n\nتفاصيل الاحتياج:\n${message}`;
        if (feedback) {
          feedback.textContent = 'سيُفتح بريدك الآن لإرسال الطلب إلى فريق الشراكات. بعد الإرسال ستصلكم متابعة عبر القناة المناسبة.';
          feedback.classList.add('is-visible');
        }
        window.location.href = `mailto:info@emlenotes.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      });
    });
  }

  // Expose helpers for inline handlers if any remain
  window.moveCoverflow = moveCoverflow;
  window.jumpToSlide = jumpToSlide;
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;

  document.addEventListener('DOMContentLoaded', () => {
    renderSharedChrome();
    initNavigation();
    rewriteLegacyLinks();
    initSolutionDetailPage();
    initProjectGallery();
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
