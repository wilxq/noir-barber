/**
 * NOIR BARBER — Animations Module (Stage 1 + Stage 2 + Stage 3)
 * Управляет последовательным появлением первого экрана,
 * единым деликатным параллаксом для Hero и последующих секций,
 * а также появлением элементов при прокрутке с соблюдением prefers-reduced-motion.
 */
(function initAnimationsNamespace(global) {
  'use strict';

  const NOIR = (global.NOIR = global.NOIR || {});

  const Animations = {
    observer: null,
    reducedMotion: false,
    heroParallaxTargets: [],
    scrollParallaxTargets: [],
    rafPending: false,

    init() {
      this.reducedMotion = global.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (this.reducedMotion) {
        this.revealAllImmediately();
        return;
      }

      document.documentElement.classList.add('js-motion-ready');
      this.initHeroEntrance();
      this.setupRevealObserver();
      this.initParallax();
    },

    initHeroEntrance() {
      // Двойной rAF гарантирует корректный старт CSS-переходов после первой отрисовки
      global.requestAnimationFrame(() => {
        global.requestAnimationFrame(() => {
          document.documentElement.classList.add('is-hero-loaded');
        });
      });
    },

    initParallax() {
      const isFinePointer = global.matchMedia('(pointer: fine)').matches;
      if (!isFinePointer) return;

      this.heroParallaxTargets = Array.from(document.querySelectorAll('[data-parallax]'));
      this.scrollParallaxTargets = Array.from(document.querySelectorAll('[data-parallax-scroll]'));

      if (!this.heroParallaxTargets.length && !this.scrollParallaxTargets.length) return;

      const updateParallax = () => {
        this.rafPending = false;

        if (global.innerWidth <= 992) {
          this.heroParallaxTargets.forEach((el) => {
            el.style.transform = '';
          });
          this.scrollParallaxTargets.forEach((el) => {
            el.style.transform = '';
          });
          return;
        }

        const scrollY = global.scrollY;
        const viewportH = global.innerHeight || 1;

        // 1. Hero parallax (в пределах первого экрана)
        if (scrollY <= viewportH * 1.4) {
          this.heroParallaxTargets.forEach((el) => {
            const speed = parseFloat(el.getAttribute('data-parallax')) || 0.08;
            const offset = Math.min(scrollY * speed, 64);
            el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
          });
        }

        // 2. Viewport-relative subtle parallax для изображений в последующих секциях
        this.scrollParallaxTargets.forEach((el) => {
          const container = el.parentElement;
          if (!container) return;

          const rect = container.getBoundingClientRect();
          if (rect.bottom < -80 || rect.top > viewportH + 80) return;

          const speed = parseFloat(el.getAttribute('data-parallax-scroll')) || 0.06;
          const progress = (rect.top + rect.height * 0.5 - viewportH * 0.5) / viewportH;
          const maxShift = 30;
          const offset = Math.max(-maxShift, Math.min(maxShift, progress * viewportH * speed * -1));
          el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
        });
      };

      const onScroll = () => {
        if (this.rafPending) return;
        this.rafPending = true;
        global.requestAnimationFrame(updateParallax);
      };

      updateParallax();
      global.addEventListener('scroll', onScroll, { passive: true });
      global.addEventListener('resize', onScroll, { passive: true });
    },

    setupRevealObserver() {
      const elements = document.querySelectorAll('[data-reveal]');
      if (!elements.length) return;

      if (!('IntersectionObserver' in global)) {
        this.revealAllImmediately();
        return;
      }

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-revealed');
            this.observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.14,
          rootMargin: '0px 0px -6% 0px',
        }
      );

      elements.forEach((el) => this.observer.observe(el));
    },

    revealAllImmediately() {
      document.documentElement.classList.add('is-hero-loaded');
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        el.classList.add('is-revealed');
      });
    },

    refresh() {
      if (this.observer) {
        this.observer.disconnect();
      }
      this.setupRevealObserver();
    },
  };

  NOIR.Animations = Animations;
})(window);
