/* ── Kenest Cleaning Co. — main.js ──────────────────────────────────────── */

const NAV_HTML = `
<nav id="main-nav">
  <div class="nav-inner">
    <a href="/index.html" class="nav-logo">
      <img src="/logo.png" alt="Kenest Cleaning Co." height="44">
    </a>
    <div class="nav-links">
      <a href="/index.html" class="nav-link" data-page="home">Home</a>
      <div class="nav-dropdown">
        <span class="nav-link" data-page="services">Services</span>
        <div class="dropdown-menu">
          <a href="/commercial.html" class="dropdown-link" data-page="commercial">
            <i class="fa-solid fa-building"></i> Commercial Cleaning
          </a>
          <a href="/post-construction.html" class="dropdown-link" data-page="post-construction">
            <i class="fa-solid fa-helmet-safety"></i> Post-Construction Cleaning
          </a>
        </div>
      </div>
      <a href="/about.html" class="nav-link" data-page="about">About</a>
      <a href="/faq.html" class="nav-link" data-page="faq">FAQ</a>
      <a href="/contact.html" class="nav-link" data-page="contact">Contact</a>
    </div>
    <div class="nav-cta">
      <a href="/quote.html" class="btn-primary">Get a Free Quote</a>
    </div>
    <button class="hamburger" id="hamburger" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="mobile-nav-panel" id="mobile-nav">
    <a href="/index.html" class="mobile-nav-link">Home</a>
    <div class="mobile-nav-link" style="cursor:default;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;padding:8px 16px 4px;">Services</div>
    <div class="mobile-nav-sub">
      <a href="/commercial.html" class="mobile-nav-link">Commercial Cleaning</a>
      <a href="/post-construction.html" class="mobile-nav-link">Post-Construction Cleaning</a>
    </div>
    <a href="/about.html" class="mobile-nav-link">About</a>
    <a href="/faq.html" class="mobile-nav-link">FAQ</a>
    <a href="/contact.html" class="mobile-nav-link">Contact</a>
    <div class="mobile-nav-cta">
      <a href="/quote.html" class="btn-primary">Get a Free Quote</a>
    </div>
  </div>
</nav>
`;

const FOOTER_HTML = `
<footer id="main-footer">
  <div class="footer-top">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <img src="/logo.png" alt="Kenest Cleaning Co." class="footer-logo">
          <p class="footer-tagline">Spotless spaces. Reliable service.</p>
          <div class="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener" class="social-icon" aria-label="Instagram">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener" class="social-icon" aria-label="Facebook">
              <i class="fa-brands fa-facebook-f"></i>
            </a>
          </div>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Services</div>
          <div class="footer-links">
            <a href="/commercial.html" class="footer-link">Commercial Cleaning</a>
            <a href="/post-construction.html" class="footer-link">Post-Construction Cleaning</a>
          </div>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Company</div>
          <div class="footer-links">
            <a href="/about.html" class="footer-link">About</a>
            <a href="/faq.html" class="footer-link">FAQ</a>
            <a href="/contact.html" class="footer-link">Contact</a>
            <a href="/quote.html" class="footer-link">Get a Quote</a>
          </div>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Contact</div>
          <div class="footer-contact-line">
            <i class="fa-solid fa-phone"></i>
            <a href="tel:3143256533" class="footer-link">(314) 325-6533</a>
          </div>
          <div class="footer-contact-line">
            <i class="fa-solid fa-envelope"></i>
            <a href="mailto:kenestcleaning@gmail.com" class="footer-link">kenestcleaning@gmail.com</a>
          </div>
          <div class="footer-contact-line">
            <i class="fa-solid fa-clock"></i>
            <span>Mon–Sat: 7am–7pm</span>
          </div>
          <div class="footer-contact-line">
            <i class="fa-solid fa-location-dot"></i>
            <span>St. Louis, MO Metro Area</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container">
      <div class="footer-bottom-inner">
        <span class="footer-copyright">© 2026 Kenest Cleaning Co. LLC. All rights reserved.</span>
        <span class="footer-badge">Licensed, Bonded &amp; Insured | St. Louis, MO</span>
      </div>
    </div>
  </div>
</footer>
`;

/* ── Init Nav ─────────────────────────────────────────────────────────────── */
function initNav() {
  const placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) return;
  placeholder.innerHTML = NAV_HTML;

  // Scroll shadow
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  // Active link
  const path = window.location.pathname;
  const links = nav.querySelectorAll('.nav-link, .dropdown-link, .mobile-nav-link');
  links.forEach(link => {
    if (!link.href) return;
    const href = new URL(link.href, window.location.origin).pathname;
    const isHome = (href === '/index.html' || href === '/') && (path === '/' || path === '/index.html');
    const isMatch = href !== '/index.html' && href !== '/' && path.includes(href.replace('.html', '').replace('/', ''));
    if (isHome || isMatch) {
      link.classList.add('active');
    }
  });
}

/* ── Init Footer ──────────────────────────────────────────────────────────── */
function initFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;
  placeholder.innerHTML = FOOTER_HTML;
}

/* ── Init Animations ──────────────────────────────────────────────────────── */
function initAnimations() {
  // Stagger children
  document.querySelectorAll('.stagger-children').forEach(parent => {
    const children = Array.from(parent.children);
    children.forEach((child, i) => {
      child.classList.add('fade-up');
      const delay = Math.min(i * 0.1, 0.5);
      child.style.transitionDelay = `${delay}s`;
    });
  });

  // IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // Hero stat cards
  const statCards = document.querySelectorAll('.hero-stat-card');
  if (statCards.length) {
    statCards.forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), 400 + i * 200);
    });
  }
}

/* ── Init FAQ ─────────────────────────────────────────────────────────────── */
function initFaq() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      items.forEach(i => {
        i.classList.remove('open');
        const a = i.querySelector('.faq-answer');
        if (a) a.style.maxHeight = '0';
      });
      // Open clicked
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ── Init Forms ───────────────────────────────────────────────────────────── */
function initForms() {
  // Quote form
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = quoteForm.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending...';

      try {
        const data = Object.fromEntries(new FormData(quoteForm));
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await res.json();
        if (json.success) {
          quoteForm.style.display = 'none';
          const success = document.getElementById('quoteSuccess');
          if (success) { success.style.display = 'block'; success.classList.add('visible'); }
        } else {
          btn.disabled = false;
          btn.textContent = 'Send Quote Request';
          alert('Something went wrong. Please try again or call us directly.');
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'Send Quote Request';
        alert('Something went wrong. Please try again or call us directly.');
      }
    });
  }

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending...';

      try {
        const data = Object.fromEntries(new FormData(contactForm));
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await res.json();
        if (json.success) {
          contactForm.style.display = 'none';
          const success = document.getElementById('contactSuccess');
          if (success) { success.style.display = 'block'; success.classList.add('visible'); }
        } else {
          btn.disabled = false;
          btn.textContent = 'Send Message';
          alert('Something went wrong. Please try again or call us directly.');
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'Send Message';
        alert('Something went wrong. Please try again or call us directly.');
      }
    });
  }
}

/* ── Init Mobile CTA ──────────────────────────────────────────────────────── */
function initMobileCTA() {
  if (window.innerWidth >= 768) return;
  const btn = document.createElement('a');
  btn.href = 'tel:3143256533';
  btn.className = 'mobile-float-cta';
  btn.innerHTML = '<i class="fa-solid fa-phone"></i> &nbsp;Call Now';
  document.body.appendChild(btn);
}

/* ── Boot ─────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFooter();
  initAnimations();
  initFaq();
  initForms();
  initMobileCTA();
});
