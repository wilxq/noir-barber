/**
 * NOIR BARBER — Navigation Module (Stage 1 + Stage 2 + Stage 3 ScrollSpy)
 * Управляет состоянием шапки при скролле, мобильным полноэкранным меню,
 * автоматической подсветкой активной секции и плавной прокруткой по якорям.
 */
(function initNavigationNamespace(global) {
  'use strict';

  const NOIR = (global.NOIR = global.NOIR || {});

  const Navigation = {
    header: null,
    menuToggle: null,
    mobileDrawer: null,
    navLinks: [],
    sectionObserver: null,
    scrollThreshold: 24,
    isMenuOpen: false,

    init() {
      this.header = document.querySelector('[data-header]');
      this.menuToggle = document.querySelector('[data-menu-toggle]');
      this.mobileDrawer = document.querySelector('[data-mobile-drawer]');
      this.navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));

      this.bindHeaderScroll();
      this.bindMobileDrawer();
      this.bindSmoothAnchors();
      this.bindSectionSpy();
    },

    bindHeaderScroll() {
      if (!this.header) return;

      const updateHeaderState = () => {
        const isScrolled = global.scrollY > this.scrollThreshold;
        this.header.classList.toggle('is-scrolled', isScrolled);
      };

      updateHeaderState();
      global.addEventListener('scroll', updateHeaderState, { passive: true });
    },

    bindMobileDrawer() {
      if (!this.menuToggle || !this.mobileDrawer) return;

      this.menuToggle.addEventListener('click', () => {
        this.toggleMenu();
      });

      this.mobileDrawer.addEventListener('click', (event) => {
        if (event.target.closest('[data-mobile-link]')) {
          this.closeMenu();
        }
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.isMenuOpen) {
          this.closeMenu();
          this.menuToggle.focus();
        }
      });

      global.addEventListener('resize', () => {
        if (global.innerWidth > 992 && this.isMenuOpen) {
          this.closeMenu();
        }
      });
    },

    toggleMenu() {
      if (this.isMenuOpen) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    },

    openMenu() {
      this.isMenuOpen = true;
      this.mobileDrawer.classList.add('is-open');
      this.mobileDrawer.setAttribute('aria-hidden', 'false');
      this.menuToggle.setAttribute('aria-expanded', 'true');
      this.menuToggle.setAttribute('aria-label', 'Закрыть меню навигации');
      document.body.classList.add('is-locked');
    },

    closeMenu() {
      if (!this.isMenuOpen) return;
      this.isMenuOpen = false;
      this.mobileDrawer.classList.remove('is-open');
      this.mobileDrawer.setAttribute('aria-hidden', 'true');
      this.menuToggle.setAttribute('aria-expanded', 'false');
      this.menuToggle.setAttribute('aria-label', 'Открыть меню навигации');
      document.body.classList.remove('is-locked');
    },

    setActiveLink(hash) {
      if (!this.navLinks.length) return;
      this.navLinks.forEach((link) => {
        const isMatch = link.getAttribute('href') === hash;
        link.classList.toggle('is-active', isMatch);
      });
    },

    bindSectionSpy() {
      if (!('IntersectionObserver' in global) || !this.navLinks.length) return;

      const sections = Array.from(document.querySelectorAll('main section[id]'));
      if (!sections.length) return;

      this.sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute('id');
            if (id) {
              this.setActiveLink(`#${id}`);
            }
          });
        },
        {
          rootMargin: '-38% 0px -48% 0px',
          threshold: 0,
        }
      );

      sections.forEach((section) => this.sectionObserver.observe(section));
    },

    bindSmoothAnchors() {
      const reducedMotion = global.matchMedia('(prefers-reduced-motion: reduce)').matches;

      document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const targetEl = document.querySelector(targetId);
        if (!targetEl) {
          // Секции следующих этапов ещё не добавлены в DOM — предотвращаем скачок URL
          event.preventDefault();
          return;
        }

        event.preventDefault();
        if (this.isMenuOpen) {
          this.closeMenu();
        }

        const headerOffset = this.header ? this.header.offsetHeight : 0;
        const targetTop = targetEl.getBoundingClientRect().top + global.scrollY - headerOffset;

        global.scrollTo({
          top: Math.max(0, targetTop),
          behavior: reducedMotion ? 'auto' : 'smooth',
        });

        this.setActiveLink(targetId);
      });
    },
  };

  NOIR.Navigation = Navigation;
})(window);
