// Eola Eyes Growth Analysis — interactivity + smoothness layer
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    /* ── Mobile nav toggle ─────────────────────────────── */
    const navToggle = $('.nav-toggle');
    const navLinks = $('.nav-links');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
      });
    }

    /* ── Active nav highlight (fallback if HTML doesn't set it) ── */
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });

    /* ── Smooth anchor jumps ───────────────────────────── */
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const id = this.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        }
      });
    });

    if (reduce) {
      // Skip animations entirely, reveal everything
      $$('[data-reveal]').forEach(el => el.classList.add('revealed'));
      return;
    }

    /* ── Scroll-reveal with grid stagger ───────────────── */
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger immediate children if this is a grid
          const children = $$('.glass-card, .stat-card, .swot-card, .persona-card, .hypothesis-card', entry.target);
          if (children.length > 1 && children.length <= 12) {
            children.forEach((child, i) => {
              child.style.transitionDelay = `${i * 80}ms`;
              child.classList.add('reveal-stagger');
            });
            requestAnimationFrame(() => {
              entry.target.classList.add('revealed');
              children.forEach(c => c.classList.add('reveal-show'));
            });
          } else {
            requestAnimationFrame(() => entry.target.classList.add('revealed'));
          }
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    $$('[data-reveal]').forEach(el => revealObserver.observe(el));

    // Auto-decorate any direct .glass-card / .stat-card / .swot-card children of an
    // unmarked .section so they still cascade.
    $$('.section, .stats-grid, .grid-2, .grid-3, .grid-4, .swot-grid').forEach(grid => {
      if (!grid.hasAttribute('data-reveal')) {
        grid.setAttribute('data-reveal', '');
        revealObserver.observe(grid);
      }
    });

    /* ── Nav shrink + shadow on scroll ──────────────────── */
    const nav = $('.nav');
    if (nav) {
      let ticking = false;
      const onScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            nav.classList.toggle('nav--scrolled', window.scrollY > 24);
            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* ── Aurora gentle parallax ─────────────────────────── */
    const blobs = $$('.aurora-blob');
    if (blobs.length) {
      let ticking2 = false;
      window.addEventListener('scroll', () => {
        if (!ticking2) {
          requestAnimationFrame(() => {
            const y = window.scrollY;
            blobs.forEach((b, i) => {
              const speed = (i + 1) * 0.04;
              b.style.setProperty('--aurora-shift', `${y * speed}px`);
            });
            ticking2 = false;
          });
          ticking2 = true;
        }
      }, { passive: true });
    }

    /* ── Page mount fade-in ─────────────────────────────── */
    document.body.classList.add('page-mounted');
  });
})();
