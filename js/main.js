/* ===========================================================
   Hannah Pelingon — Portfolio JS
   Nav scroll state, mobile menu, scroll-reveal, active link,
   contact form validation.
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Copyright year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav: background on scroll ---------- */
  const nav = document.getElementById('nav');

  const updateNavBackground = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', updateNavBackground, { passive: true });
  updateNavBackground();

  /* ---------- Mobile menu toggle ---------- */
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

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  /* ---------- "Project" dropdown ---------- */
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

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navDropdown.classList.remove('open');
        navDropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('[data-nav]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navAnchors.forEach((a) => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );
  sections.forEach((section) => sectionObserver.observe(section));

  /* ---------- Scroll-reveal ---------- */
  const revealTargets = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // small stagger for elements revealed together
          setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  const validators = {
    name: (v) => v.trim().length > 1 || 'Please enter your name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email.',
    message: (v) => v.trim().length > 5 || 'Message is a little short.',
  };

  const setFieldError = (field, message) => {
    const row = field.closest('.form-row');
    const errorEl = row.querySelector('.form-error');
    row.classList.toggle('invalid', Boolean(message));
    errorEl.textContent = message || '';
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    Object.keys(validators).forEach((fieldName) => {
      const field = form.elements[fieldName];
      const result = validators[fieldName](field.value);
      if (result !== true) {
        setFieldError(field, result);
        isValid = false;
      } else {
        setFieldError(field, '');
      }
    });

    if (!isValid) {
      status.textContent = 'Please fix the highlighted fields.';
      return;
    }

    // No backend wired up yet — this simply confirms the form works.
    // Swap this block for a fetch() to your form endpoint (e.g. Formspree,
    // Netlify Forms, or your own API) when you're ready to go live.
    status.textContent = `Thanks! I'll get back to you soon.`;
    form.reset();
    Object.values(form.elements).forEach((el) => {
      if (el.closest) {
        const row = el.closest('.form-row');
        if (row) row.classList.remove('invalid');
      }
    });
  });

  // Clear individual field errors as the user types
  Object.keys(validators).forEach((fieldName) => {
    const field = form.elements[fieldName];
    field.addEventListener('input', () => setFieldError(field, ''));
  });

  /* ---------- Lightbox (image carousel popup) ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentImages = [];
  let currentIndex = 0;

  const renderLightbox = () => {
    const item = currentImages[currentIndex];
    lightboxImg.classList.remove('loaded');
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxImg.onload = () => lightboxImg.classList.add('loaded');
    lightboxCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
    const single = currentImages.length <= 1;
    lightboxPrev.disabled = single;
    lightboxNext.disabled = single;
  };

  const openLightbox = (images, startIndex) => {
    currentImages = images;
    currentIndex = startIndex;
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

  const showPrev = () => {
    if (currentImages.length <= 1) return;
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    renderLightbox();
  };

  const showNext = () => {
    if (currentImages.length <= 1) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    renderLightbox();
  };

  // Group images by their enclosing .project-media block, so each
  // project's carousel only cycles through that project's own images.
  document.querySelectorAll('.project-media').forEach((mediaGroup) => {
    const links = Array.from(mediaGroup.querySelectorAll('a'));
    if (!links.length) return;

    const images = links.map((link) => {
      const img = link.querySelector('img');
      return { src: link.getAttribute('href'), alt: img ? img.alt : '' };
    });

    links.forEach((link, i) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(images, i);
      });
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

});
