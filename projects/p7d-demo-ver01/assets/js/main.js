/* Navegación de la demo: no usa dependencias ni servicios externos. */
(function () {
  'use strict';
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-navigation');
  const dropdown = document.querySelector('.nav-dropdown');
  const dropdownButton = document.querySelector('.nav-dropdown-toggle');

  function closeDropdown() {
    if (!dropdown || !dropdownButton) return;
    dropdown.classList.remove('is-open');
    dropdownButton.setAttribute('aria-expanded', 'false');
  }

  function closeMenu() {
    if (!menuButton || !nav) return;
    nav.classList.remove('nav-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
    closeDropdown();
  }

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      nav.classList.toggle('nav-open', open);
      if (!open) closeDropdown();
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  }
  if (dropdown && dropdownButton) {
    dropdownButton.addEventListener('click', () => {
      const open = dropdownButton.getAttribute('aria-expanded') !== 'true';
      dropdown.classList.toggle('is-open', open);
      dropdownButton.setAttribute('aria-expanded', String(open));
    });
  }
  document.addEventListener('click', (event) => {
    if (dropdown && !dropdown.contains(event.target)) closeDropdown();
    if (header && !header.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      if (menuButton && window.matchMedia('(max-width: 860px)').matches) menuButton.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860 && nav && nav.classList.contains('nav-open')) closeMenu();
  });
  document.querySelectorAll('[data-current-year]').forEach(node => {
    node.textContent = String(new Date().getFullYear());
  });
})();
