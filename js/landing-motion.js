// LANDING MOTION: animaciones ligeras sincronizadas con la frecuencia de la pantalla.
// Solo usa opacity y transform, propiedades que el navegador puede componer sin
// recalcular el diseño en cada cuadro (incluidas pantallas de 120 Hz).
(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const startMotion = () => {
    if (prefersReducedMotion.matches || document.documentElement.classList.contains('motion-ready')) return;

    const items = [...document.querySelectorAll('[data-reveal]')];
    if (!items.length) return;

    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const item = entry.target;
        const step = Math.min(Number(item.dataset.revealDelay) || 0, 5);
        item.style.setProperty('--reveal-delay', `${step * 55}ms`);

        // Separar la lectura del observador de la escritura da una entrada
        // consistente, sin saltos, incluso cuando la página abre en 120 Hz.
        requestAnimationFrame(() => item.classList.add('is-visible'));
        observer.unobserve(item);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    items.forEach(item => observer.observe(item));
  };

  startMotion();
  prefersReducedMotion.addEventListener?.('change', event => {
    if (event.matches) document.documentElement.classList.remove('motion-ready');
    else startMotion();
  });

  // Menú móvil desplegable en la cabecera de la portada
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    const closeNav = () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
      const next = !navLinks.classList.contains('is-open');
      navLinks.classList.toggle('is-open', next);
      navToggle.setAttribute('aria-expanded', String(next));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('pointerdown', e => {
      if (!navLinks.classList.contains('is-open')) return;
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        closeNav();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeNav();
    });
  }
})();
