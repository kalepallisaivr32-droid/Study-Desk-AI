/* =====================================================
   app.js – Shared utilities for Study Desk AI
   ===================================================== */

'use strict';

// ── Navbar scroll effect ──────────────────────────────
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.style.boxShadow = '0 4px 24px rgba(37,99,235,.14)';
    } else {
      navbar.style.boxShadow = '0 2px 20px rgba(37,99,235,.06)';
    }
  }, { passive: true });
})();

// ── Hamburger menu ────────────────────────────────────
(function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    // animate spans
    const spans = btn.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close on nav-link click
  menu.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      const spans = btn.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
})();

// ── Smooth scroll for anchor links ───────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Intersection Observer – reveal on scroll ─────────
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();

// ── Toast notification ────────────────────────────────
window.showToast = function showToast(message, type = 'error') {
  // Remove any existing
  document.querySelectorAll('.error-toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'error-toast';
  if (type === 'success') {
    toast.style.background = 'var(--success)';
    toast.style.boxShadow  = '0 8px 32px rgba(16,185,129,.4)';
  }
  toast.innerHTML = `
    <span>${type === 'error' ? '⚠️' : '✅'}</span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};
