/* ===========================================================
   Case study pages — nav, scroll-reveal, lightbox.
   (Self-contained so the main page's main.js is untouched.)
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Copyright year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav ---------- */
  const nav = document.getElementById('nav');
  const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const closeMenu = () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  const navDropdown = document.getElementById('navDropdown');
  const navDropdownBtn = document.getElementById('navDropdownBtn');
  if (navDropdown && navDropdownBtn) {
    navDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navDropdown.classList.toggle('open');
      navDropdownBtn.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', (e) => {
      if (!navDropdown.contains(e.target)) {
        navDropdown.classList.remove('open');
        navDropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- In-page anchors: leave room for the fixed nav ---------- */
  const NAV_OFFSET = 70;
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- Scroll-reveal ---------- */
  const revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Lightbox (groups images by data-gallery) ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentImages = [];
  let currentIndex = 0;

  const renderLightbox = () => {
    const item = currentImages[currentIndex];
    lightboxImg.classList.remove('loaded');
    lightboxImg.onload = () => lightboxImg.classList.add('loaded');
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
    const single = currentImages.length <= 1;
    lightboxPrev.disabled = single;
    lightboxNext.disabled = single;
  };

  const openLightbox = (images, start) => {
    currentImages = images;
    currentIndex = start;
    renderLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const step = (dir) => {
    if (currentImages.length <= 1) return;
    currentIndex = (currentIndex + dir + currentImages.length) % currentImages.length;
    renderLightbox();
  };

  const groups = {};
  document.querySelectorAll('a[data-gallery]').forEach((link) => {
    const key = link.dataset.gallery;
    const img = link.querySelector('img');
    (groups[key] = groups[key] || []).push({
      link,
      src: link.getAttribute('href'),
      alt: img ? img.alt : '',
    });
  });

  Object.values(groups).forEach((items) => {
    const images = items.map(({ src, alt }) => ({ src, alt }));
    items.forEach(({ link }, i) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(images, i);
      });
    });
  });

  /* ---------- Annotated screens: hovering a note highlights its pin ---------- */
  document.querySelectorAll('.cs-annot').forEach((block) => {
    const pins = Array.from(block.querySelectorAll('.cs-pin'));
    block.querySelectorAll('.cs-note').forEach((note) => {
      const pin = pins.find((p) => p.dataset.n === note.dataset.n);
      if (!pin) return;
      const on = () => pin.classList.add('is-active');
      const off = () => pin.classList.remove('is-active');
      note.addEventListener('mouseenter', on);
      note.addEventListener('mouseleave', off);
    });
  });

  /* ---------- Before / after compare slider ---------- */
  document.querySelectorAll('.cs-compare').forEach((box) => {
    const range = box.querySelector('input[type="range"]');
    if (!range) return;
    const update = () => box.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', update);
    update();
  });

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => step(-1));
  lightboxNext.addEventListener('click', () => step(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navDropdown) navDropdown.classList.remove('open');
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
});
