/**
 * Giulia Pomposelli Portfolio - Interactive & Visual Live-Editor Logic
 * Features:
 * - Visual Live Edit Mode: Click directly on texts to edit, click on images to replace them
 * - Visual Color Studio: Interactive palette builder with live sliders, 30+ visual color swatches & full themes
 * - Local Image Upload: Choose images directly from your computer via FileReader (base64)
 * - Card Management: Add new project cards or delete existing cards
 * - Auto-persistence: Saves content and colors in browser LocalStorage
 * - Export: Download updated index.html with all edits and custom colors baked in permanently
 * - Light/Dark Theme Switcher with LocalStorage persistence
 * - Copy Email to Clipboard with Toast Notification
 * - Accessible Mobile Navigation
 * - Active Navigation Highlight via IntersectionObserver
 * - Client-side Contact Form Validation & Feedback
 * - Resume Download Simulation for Giulia Pomposelli
 */

// --- Global Edit State ---
let isEditing = false;
let currentImageTarget = null;
let activeTargetVar = '--bg-primary';

// Default Color Palette
const defaultColors = {
  '--bg-primary': '#fcfcfb',
  '--bg-header': '#fcfcfb',
  '--bg-hero': '#fcfcfb',
  '--bg-projects': '#fcfcfb',
  '--bg-card': '#ffffff',
  '--bg-about': '#fcfcfb',
  '--bg-contact': '#fcfcfb',
  '--bg-footer': '#f4f4f2',
  '--accent-highlight': '#2457f5'
};

// Current Active Colors
let currentColors = { ...defaultColors };

// Full Theme Presets
const themePresets = {
  sand: {
    '--bg-primary': '#fbf8f3',
    '--bg-header': '#fbf8f3',
    '--bg-hero': '#f7f2ea',
    '--bg-projects': '#fbf8f3',
    '--bg-card': '#ffffff',
    '--bg-about': '#f7f2ea',
    '--bg-contact': '#fbf8f3',
    '--bg-footer': '#efe8dd',
    '--accent-highlight': '#96603a'
  },
  sage: {
    '--bg-primary': '#f7faf7',
    '--bg-header': '#f7faf7',
    '--bg-hero': '#edf4ed',
    '--bg-projects': '#f7faf7',
    '--bg-card': '#ffffff',
    '--bg-about': '#edf4ed',
    '--bg-contact': '#f7faf7',
    '--bg-footer': '#e1ece1',
    '--accent-highlight': '#2d6a4f'
  },
  minimal: {
    '--bg-primary': '#ffffff',
    '--bg-header': '#ffffff',
    '--bg-hero': '#fafafa',
    '--bg-projects': '#ffffff',
    '--bg-card': '#f8f8f8',
    '--bg-about': '#fafafa',
    '--bg-contact': '#ffffff',
    '--bg-footer': '#f4f4f4',
    '--accent-highlight': '#141413'
  },
  peach: {
    '--bg-primary': '#fffaf6',
    '--bg-header': '#fffaf6',
    '--bg-hero': '#fcf1e8',
    '--bg-projects': '#fffaf6',
    '--bg-card': '#ffffff',
    '--bg-about': '#fcf1e8',
    '--bg-contact': '#fffaf6',
    '--bg-footer': '#f6e4d5',
    '--accent-highlight': '#c85a32'
  },
  slate: {
    '--bg-primary': '#f6f8fa',
    '--bg-header': '#f6f8fa',
    '--bg-hero': '#edf1f5',
    '--bg-projects': '#f6f8fa',
    '--bg-card': '#ffffff',
    '--bg-about': '#edf1f5',
    '--bg-contact': '#f6f8fa',
    '--bg-footer': '#e2e7ec',
    '--accent-highlight': '#2563eb'
  }
};

// --- DOM Initializer ---
document.addEventListener('DOMContentLoaded', () => {
  restoreSavedColors();
  restoreSavedContent();
  initThemeToggle();
  initMobileMenu();
  initCopyEmail();
  initContactForm();
  initResumeDownload();
  initActiveNavObserver();
  initLiveEditor();
  initVisualColorStudio();
  initProjectLightbox();
});

/* ==========================================================================
   0. Content & Color Restoration from LocalStorage
   ========================================================================= */
function restoreSavedContent() {
  const savedMain = localStorage.getItem('giulia_portfolio_saved_main');
  const mainContent = document.getElementById('main-content');
  if (savedMain && mainContent) {
    mainContent.innerHTML = savedMain;
  }
}

function restoreSavedColors() {
  const savedColors = localStorage.getItem('giulia_portfolio_colors');
  if (savedColors) {
    try {
      const parsed = JSON.parse(savedColors);
      currentColors = { ...defaultColors, ...parsed };
      applyLiveThemeStyles(currentColors);
    } catch (e) {
      console.error('Errore nel ripristino colori:', e);
    }
  } else {
    applyLiveThemeStyles(currentColors);
  }
}

function applyLiveThemeStyles(colors) {
  let styleTag = document.getElementById('live-theme-styles');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'live-theme-styles';
    document.head.appendChild(styleTag);
  }

  styleTag.innerHTML = `
    body { background-color: ${colors['--bg-primary']} !important; }
    .site-header { background-color: ${colors['--bg-header']} !important; }
    .hero-section { background-color: ${colors['--bg-hero']} !important; }
    .projects-section { background-color: ${colors['--bg-projects']} !important; }
    .project-card { background-color: ${colors['--bg-card']} !important; }
    .about-section { background-color: ${colors['--bg-about']} !important; }
    .contact-section { background-color: ${colors['--bg-contact']} !important; }
    .site-footer { background-color: ${colors['--bg-footer']} !important; }
    .btn-primary, .nav-link.cta-button, .logo-mark { background-color: ${colors['--accent-highlight']} !important; }
  `;

  // Also set on root element
  Object.entries(colors).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
}

/* ==========================================================================
   1. Visual Color Studio (Palette & Color Picker dal Vivo)
   ========================================================================== */
function initVisualColorStudio() {
  const openColorsBtn = document.getElementById('open-colors-btn');
  const closeStudioBtn = document.getElementById('close-studio-btn');
  const studioModal = document.getElementById('color-studio-modal');
  const saveStudioBtn = document.getElementById('save-studio-btn');
  const resetAllColorsBtn = document.getElementById('reset-all-colors-btn');

  const sectionPills = document.querySelectorAll('.section-pill');
  const activeTargetName = document.getElementById('active-target-name');
  const currentColorCircle = document.getElementById('current-color-circle');
  const colorHexInput = document.getElementById('color-hex-input');

  const sliderHue = document.getElementById('slider-hue');
  const sliderLightness = document.getElementById('slider-lightness');
  const sliderSaturation = document.getElementById('slider-saturation');

  const swatchDots = document.querySelectorAll('.swatch-dot');
  const themePresetBtns = document.querySelectorAll('.theme-preset-btn');

  if (!openColorsBtn || !studioModal) return;

  // Open Studio Modal
  openColorsBtn.addEventListener('click', () => {
    studioModal.style.display = 'flex';
    syncStudioControls(activeTargetVar);
  });

  // Close Studio Modal
  closeStudioBtn.addEventListener('click', () => {
    studioModal.style.display = 'none';
  });

  studioModal.addEventListener('click', (e) => {
    if (e.target === studioModal) {
      studioModal.style.display = 'none';
    }
  });

  // Select Section to Style
  sectionPills.forEach(pill => {
    pill.addEventListener('click', () => {
      sectionPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      activeTargetVar = pill.getAttribute('data-target');
      activeTargetName.textContent = pill.textContent.trim();

      syncStudioControls(activeTargetVar);

      // Scroll smoothly to that section on the page so user sees it
      highlightSectionInView(activeTargetVar);
    });
  });

  // Sliders Change Event
  function updateColorFromSliders() {
    const h = parseInt(sliderHue.value);
    const l = parseInt(sliderLightness.value);
    const s = parseInt(sliderSaturation.value);

    const hex = hslToHex(h, s, l);
    currentColorCircle.style.backgroundColor = hex;
    colorHexInput.value = hex;

    // Apply color instantly!
    currentColors[activeTargetVar] = hex;
    applyLiveThemeStyles(currentColors);
  }

  sliderHue.addEventListener('input', updateColorFromSliders);
  sliderLightness.addEventListener('input', updateColorFromSliders);
  sliderSaturation.addEventListener('input', updateColorFromSliders);

  // Direct Hex Input
  colorHexInput.addEventListener('input', (e) => {
    let hex = e.target.value.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;

    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      currentColorCircle.style.backgroundColor = hex;
      currentColors[activeTargetVar] = hex;
      applyLiveThemeStyles(currentColors);

      // Sync sliders
      const hsl = hexToHsl(hex);
      sliderHue.value = hsl.h;
      sliderSaturation.value = hsl.s;
      sliderLightness.value = hsl.l;
    }
  });

  // Swatch Dot Click (1-Click Color Swatch)
  swatchDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.getAttribute('data-color');
      if (!color) return;

      currentColorCircle.style.backgroundColor = color;
      colorHexInput.value = color;

      currentColors[activeTargetVar] = color;
      applyLiveThemeStyles(currentColors);

      // Sync sliders
      const hsl = hexToHsl(color);
      sliderHue.value = hsl.h;
      sliderSaturation.value = hsl.s;
      sliderLightness.value = hsl.l;

      showToast(`Colore ${color} applicato a ${activeTargetName.textContent}! 🎨`);
    });
  });

  // Full Theme Preset Click
  themePresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const themeKey = btn.getAttribute('data-theme');
      const preset = themePresets[themeKey];
      if (!preset) return;

      currentColors = { ...preset };
      applyLiveThemeStyles(currentColors);
      syncStudioControls(activeTargetVar);

      showToast(`Tavolozza completa "${btn.textContent.trim()}" applicata! ✨`);
    });
  });

  // Save Palette Button
  saveStudioBtn.addEventListener('click', () => {
    localStorage.setItem('giulia_portfolio_colors', JSON.stringify(currentColors));
    studioModal.style.display = 'none';
    showToast('Tavolozza colori salvata con successo nel browser! 💾');
  });

  // Reset Colors to Default
  resetAllColorsBtn.addEventListener('click', () => {
    if (confirm('Vuoi ripristinare i colori di sfondo originali di tutte le sezioni?')) {
      currentColors = { ...defaultColors };
      applyLiveThemeStyles(currentColors);
      localStorage.removeItem('giulia_portfolio_colors');
      syncStudioControls(activeTargetVar);
      showToast('Colori originali ripristinati.');
    }
  });
}

function syncStudioControls(targetVar) {
  const currentColorCircle = document.getElementById('current-color-circle');
  const colorHexInput = document.getElementById('color-hex-input');
  const sliderHue = document.getElementById('slider-hue');
  const sliderLightness = document.getElementById('slider-lightness');
  const sliderSaturation = document.getElementById('slider-saturation');

  const hex = currentColors[targetVar] || '#fcfcfb';
  currentColorCircle.style.backgroundColor = hex;
  colorHexInput.value = hex;

  const hsl = hexToHsl(hex);
  sliderHue.value = hsl.h;
  sliderSaturation.value = hsl.s;
  sliderLightness.value = hsl.l;
}

function highlightSectionInView(targetVar) {
  const map = {
    '--bg-header': document.getElementById('header'),
    '--bg-hero': document.getElementById('hero'),
    '--bg-projects': document.getElementById('projects'),
    '--bg-card': document.querySelector('.project-card'),
    '--bg-about': document.getElementById('about'),
    '--bg-contact': document.getElementById('contact'),
    '--bg-footer': document.querySelector('.site-footer')
  };

  const element = map[targetVar];
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* Color Math Helpers: HSL to HEX and HEX to HSL */
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex) {
  hex = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = Math.round(h * 60);
  }
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/* ==========================================================================
   2. Live Editor Engine (Modifica Visuale Testi & Immagini)
   ========================================================================== */
function initLiveEditor() {
  const toggleEditBtn = document.getElementById('toggle-edit-btn');
  const editPanel = document.getElementById('edit-panel');
  const closeEditBtn = document.getElementById('close-edit-btn');
  const saveContentBtn = document.getElementById('save-content-btn');
  const exportHtmlBtn = document.getElementById('export-html-btn');
  const addProjectBtn = document.getElementById('add-project-btn');
  const resetDefaultBtn = document.getElementById('reset-default-btn');
  const imageFileInput = document.getElementById('image-file-input');

  if (!toggleEditBtn || !editPanel) return;

  // Toggle Edit Mode ON
  toggleEditBtn.addEventListener('click', () => {
    enableEditMode();
  });

  // Close Edit Mode
  closeEditBtn.addEventListener('click', () => {
    disableEditMode();
  });

  // Save Content to Browser Storage
  saveContentBtn.addEventListener('click', () => {
    saveContentToStorage();
    localStorage.setItem('giulia_portfolio_colors', JSON.stringify(currentColors));
  });

  // Export Clean HTML File
  exportHtmlBtn.addEventListener('click', () => {
    exportCleanHtmlFile();
  });

  // Add New Project Card
  addProjectBtn.addEventListener('click', () => {
    addNewProjectCard();
  });

  // Reset to Original Content
  resetDefaultBtn.addEventListener('click', () => {
    if (confirm('Sei sicura di voler ripristinare il sito originale? Tutte le modifiche non esportate andranno perse.')) {
      localStorage.removeItem('giulia_portfolio_saved_main');
      localStorage.removeItem('giulia_portfolio_colors');
      window.location.reload();
    }
  });

  // Handle Image File Selection
  imageFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !currentImageTarget) return;

    if (!file.type.startsWith('image/')) {
      showToast('Per favore seleziona un file immagine valido (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;

      const existingImg = currentImageTarget.querySelector('img');
      if (existingImg) {
        existingImg.src = dataUrl;
      } else {
        const placeholderContent = currentImageTarget.querySelector('.media-placeholder-content');
        if (placeholderContent) {
          placeholderContent.remove();
        }
        const newImg = document.createElement('img');
        newImg.src = dataUrl;
        newImg.alt = 'Immagine Progetto';
        newImg.loading = 'lazy';
        currentImageTarget.classList.remove('placeholder-media');
        currentImageTarget.prepend(newImg);
      }

      showToast('Immagine aggiornata con successo! 📸');
      imageFileInput.value = '';
    };

    reader.readAsDataURL(file);
  });
}

function enableEditMode() {
  isEditing = true;
  document.body.classList.add('is-editing');

  document.getElementById('toggle-edit-btn').style.display = 'none';
  document.getElementById('edit-panel').style.display = 'flex';

  setEditableAttributes(true);
  attachImageOverlays();
  attachCardDeleteButtons();

  document.addEventListener('click', preventLinkNavigationInEdit, true);
  showToast('Modalità Modifica attiva! Clicca sui testi per scrivere e sulle immagini per sostituirle ✏️');
}

function disableEditMode() {
  isEditing = false;
  document.body.classList.remove('is-editing');

  document.getElementById('toggle-edit-btn').style.display = 'flex';
  document.getElementById('edit-panel').style.display = 'none';

  const studioModal = document.getElementById('color-studio-modal');
  if (studioModal) studioModal.style.display = 'none';

  setEditableAttributes(false);
  removeTemporaryOverlays();

  document.removeEventListener('click', preventLinkNavigationInEdit, true);
  showToast('Sei uscita dalla modalità di modifica.');
}

function preventLinkNavigationInEdit(e) {
  if (!isEditing) return;
  const link = e.target.closest('a');
  if (link && !link.closest('#edit-toolbar-container') && !link.closest('#color-studio-modal')) {
    e.preventDefault();
  }
}

function setEditableAttributes(enable) {
  const editableSelectors = [
    '.hero-title',
    '.hero-subtitle',
    '.pill-label',
    '.location-pill',
    '.section-subtitle',
    '.section-title',
    '.section-desc',
    '.project-title',
    '.project-summary',
    '.project-metric',
    '.tag',
    '.editorial-quote',
    '.about-paragraph',
    '.value-item strong',
    '.value-item p',
    '.badge-text',
    '.method-val',
    '#designer-email',
    '.footer-copy',
    '.footer-logo',
    '.logo-text'
  ];

  editableSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (enable) {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');
      } else {
        el.removeAttribute('contenteditable');
        el.removeAttribute('spellcheck');
      }
    });
  });
}

function attachImageOverlays() {
  removeTemporaryOverlays();

  const imageTargets = [
    ...document.querySelectorAll('.project-media'),
    document.querySelector('.about-image-wrapper')
  ].filter(Boolean);

  imageTargets.forEach(target => {
    const overlay = document.createElement('div');
    overlay.className = 'media-change-overlay';
    overlay.innerHTML = `
      <button type="button" class="media-change-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        Cambia Immagine
      </button>
    `;

    overlay.querySelector('.media-change-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      currentImageTarget = target;
      document.getElementById('image-file-input').click();
    });

    target.appendChild(overlay);
  });
}

function attachCardDeleteButtons() {
  document.querySelectorAll('.project-card').forEach(card => {
    if (!card.querySelector('.card-delete-btn')) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'card-delete-btn';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.title = 'Elimina questa scheda progetto';
      deleteBtn.type = 'button';

      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (confirm('Vuoi davvero eliminare questa scheda progetto?')) {
          card.style.transform = 'scale(0.85)';
          card.style.opacity = '0';
          card.style.transition = 'all 0.3s ease';
          setTimeout(() => card.remove(), 300);
          showToast('Scheda eliminata! 🗑️');
        }
      });

      card.prepend(deleteBtn);
    }
  });
}

function removeTemporaryOverlays() {
  document.querySelectorAll('.media-change-overlay').forEach(el => el.remove());
  document.querySelectorAll('.card-delete-btn').forEach(el => el.remove());
}

function addNewProjectCard() {
  const container = document.getElementById('projects-container');
  if (!container) return;

  const newCard = document.createElement('article');
  newCard.className = 'project-card';
  newCard.innerHTML = `
    <div class="project-media placeholder-media">
      <div class="media-placeholder-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        <span>Inserisci qui l'immagine del progetto</span>
      </div>
    </div>
    <div class="project-info">
      <div class="project-tags">
        <span class="tag">UI/UX Design</span>
        <span class="tag">Nuovo</span>
      </div>
      <h3 class="project-title">Titolo del Tuo Nuovo Progetto</h3>
      <p class="project-summary">
        Inserisci qui una breve descrizione degli obiettivi, del target e delle soluzioni di design adottate.
      </p>
      <div class="project-footer">
        <span class="project-metric">Anno / Categoria</span>
        <span class="project-arrow">&rarr;</span>
      </div>
    </div>
  `;

  container.appendChild(newCard);

  if (isEditing) {
    setEditableAttributes(true);
    attachImageOverlays();
    attachCardDeleteButtons();
  }

  newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast('Nuova scheda progetto aggiunta! ➕');
}

function saveContentToStorage() {
  removeTemporaryOverlays();
  setEditableAttributes(false);

  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    localStorage.setItem('giulia_portfolio_saved_main', mainContent.innerHTML);
  }

  if (isEditing) {
    setEditableAttributes(true);
    attachImageOverlays();
    attachCardDeleteButtons();
  }

  initContactForm();
  initResumeDownload();
  initCopyEmail();

  showToast('Modifiche salvate con successo nel browser! 💾');
}

function exportCleanHtmlFile() {
  const htmlClone = document.documentElement.cloneNode(true);

  // Remove editing state artifacts from clone
  htmlClone.classList.remove('is-editing');
  htmlClone.querySelectorAll('.media-change-overlay').forEach(el => el.remove());
  htmlClone.querySelectorAll('.card-delete-btn').forEach(el => el.remove());
  htmlClone.querySelectorAll('[contenteditable]').forEach(el => {
    el.removeAttribute('contenteditable');
    el.removeAttribute('spellcheck');
  });

  const cloneEditPanel = htmlClone.querySelector('#edit-panel');
  if (cloneEditPanel) cloneEditPanel.style.display = 'none';

  const cloneToggleBtn = htmlClone.querySelector('#toggle-edit-btn');
  if (cloneToggleBtn) cloneToggleBtn.style.display = 'flex';

  const cloneStudioModal = htmlClone.querySelector('#color-studio-modal');
  if (cloneStudioModal) cloneStudioModal.style.display = 'none';

  const cloneLightbox = htmlClone.querySelector('#image-lightbox');
  if (cloneLightbox) cloneLightbox.style.display = 'none';

  // Inject current colors into clean inline <style> block in <head>
  let existingStyle = htmlClone.querySelector('#live-theme-styles');
  if (!existingStyle) {
    existingStyle = document.createElement('style');
    existingStyle.id = 'live-theme-styles';
    const head = htmlClone.querySelector('head');
    if (head) head.appendChild(existingStyle);
  }

  existingStyle.innerHTML = `
    body { background-color: ${currentColors['--bg-primary']} !important; }
    .site-header { background-color: ${currentColors['--bg-header']} !important; }
    .hero-section { background-color: ${currentColors['--bg-hero']} !important; }
    .projects-section { background-color: ${currentColors['--bg-projects']} !important; }
    .project-card { background-color: ${currentColors['--bg-card']} !important; }
    .about-section { background-color: ${currentColors['--bg-about']} !important; }
    .contact-section { background-color: ${currentColors['--bg-contact']} !important; }
    .site-footer { background-color: ${currentColors['--bg-footer']} !important; }
    .btn-primary, .nav-link.cta-button, .logo-mark { background-color: ${currentColors['--accent-highlight']} !important; }
  `;

  const fullHtml = '<!DOCTYPE html>\n' + htmlClone.outerHTML;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'index.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('File index.html scaricato con i tuoi colori personalizzati! 📥');
}

/* ==========================================================================
   2b. Project Image Lightbox / Fullscreen Viewer
   ========================================================================== */
function initProjectLightbox() {
  const lightbox = document.getElementById('image-lightbox');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxTags = document.getElementById('lightbox-tags');

  if (!lightbox) return;

  function closeLightbox() {
    lightbox.style.display = 'none';
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-dialog') || e.target.classList.contains('lightbox-image-box')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.display === 'flex') {
      closeLightbox();
    }
  });

  // Event Delegation for clicking project cards
  document.addEventListener('click', (e) => {
    // If in edit mode, do NOT open lightbox so editing is easy
    if (isEditing) return;

    // Check if clicked inside a project card
    const card = e.target.closest('.project-card');
    if (!card) return;

    // Don't trigger if clicked a button or link inside card
    if (e.target.closest('button') || e.target.closest('a')) return;

    const img = card.querySelector('.project-media img');
    if (!img || !img.src) {
      showToast('Nessuna immagine presente. Clicca su "Modifica Sito" per caricarne una!');
      return;
    }

    const titleEl = card.querySelector('.project-title');
    const descEl = card.querySelector('.project-summary');
    const tagEls = card.querySelectorAll('.tag');

    lightboxImg.src = img.src;
    lightboxImg.alt = titleEl ? titleEl.textContent.trim() : 'Progetto';
    lightboxTitle.textContent = titleEl ? titleEl.textContent.trim() : '';
    lightboxDesc.textContent = descEl ? descEl.textContent.trim() : '';

    lightboxTags.innerHTML = '';
    tagEls.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tag.textContent.trim();
      lightboxTags.appendChild(span);
    });

    lightbox.style.display = 'flex';
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
}

/* ==========================================================================
   3. Theme Toggle (Light / Dark)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const body = document.body;
  if (!themeToggleBtn) return;

  const savedTheme = localStorage.getItem('theme-preference');
  if (savedTheme === 'dark') {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
  } else if (savedTheme === 'light') {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
  }

  themeToggleBtn.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      localStorage.setItem('theme-preference', 'light');
      showToast('Tema Chiaro attivato');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      localStorage.setItem('theme-preference', 'dark');
      showToast('Tema Scuro attivato');
    }
  });
}

/* ==========================================================================
   4. Mobile Navigation Menu
   ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (!menuToggle || !navMenu) return;

  const navLinks = navMenu.querySelectorAll('.nav-link');

  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   5. Copy Email to Clipboard
   ========================================================================== */
function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  const emailElem = document.getElementById('designer-email');
  if (!copyBtn || !emailElem) return;

  const newCopyBtn = copyBtn.cloneNode(true);
  copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);

  newCopyBtn.addEventListener('click', async () => {
    const emailText = document.getElementById('designer-email').textContent.trim();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(emailText);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = emailText;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      showToast('Indirizzo email copiato negli appunti! 📋');
    } catch (err) {
      showToast('Email: ' + emailText);
    }
  });
}

/* ==========================================================================
   6. Contact Form Validation & Submission
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  const nameInput = newForm.querySelector('#name');
  const emailInput = newForm.querySelector('#email');
  const messageInput = newForm.querySelector('#message');
  const submitBtn = newForm.querySelector('#submit-btn');
  const feedback = newForm.querySelector('#form-feedback');

  const nameError = newForm.querySelector('#name-error');
  const emailError = newForm.querySelector('#email-error');
  const messageError = newForm.querySelector('#message-error');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  newForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    nameError.style.display = 'none';
    emailError.style.display = 'none';
    messageError.style.display = 'none';
    feedback.style.display = 'none';

    if (!nameInput.value.trim()) {
      nameError.textContent = 'Inserisci il tuo nome.';
      nameError.style.display = 'block';
      isValid = false;
    }

    if (!emailInput.value.trim()) {
      emailError.textContent = 'Inserisci un indirizzo email.';
      emailError.style.display = 'block';
      isValid = false;
    } else if (!validateEmail(emailInput.value.trim())) {
      emailError.textContent = 'Inserisci un indirizzo email valido.';
      emailError.style.display = 'block';
      isValid = false;
    }

    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      messageError.textContent = 'Inserisci un messaggio di almeno 10 caratteri.';
      messageError.style.display = 'block';
      isValid = false;
    }

    if (!isValid) return;

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>Invio in corso...</span>`;
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
      newForm.reset();

      feedback.className = 'form-feedback success';
      feedback.textContent = 'Grazie per il messaggio! Ti risponderò al più presto.';
      feedback.style.display = 'block';

      showToast('Messaggio inviato con successo! 🎉');
    }, 900);
  });
}

/* ==========================================================================
   7. Resume Download Simulation
   ========================================================================== */
function initResumeDownload() {
  const downloadBtn = document.getElementById('download-cv-btn');
  if (!downloadBtn) return;

  const newDownloadBtn = downloadBtn.cloneNode(true);
  downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);

  newDownloadBtn.addEventListener('click', () => {
    const resumeContent = `GIULIA POMPOSELLI - UI/UX & PRODUCT DESIGNER
Milano, Italia | giulia.pomposelli@example.com

PROFILO PROFESSIONALE:
UI/UX & Product Designer specializzata nella creazione di esperienze digitali intuitive, design systems scalabili e interfacce editoriali moderne.

COMPETENZE:
- User Experience (UX Research, Personas, User Journeys, Usability Testing)
- User Interface (UI Design, Visual Hierarchy, Design Systems, Typography)
- Prototipazione rapida & interattiva (Figma, FigJam, Miro)
- Conoscenza linee guida di accessibilità (WCAG)

Disponibile per progetti freelance, consulenze e collaborazioni continuative.
`;

    const blob = new Blob([resumeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Giulia_Pomposelli_CV.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Download CV avviato con successo! 📄');
  });
}

/* ==========================================================================
   8. Active Navigation Highlighting on Scroll
   ========================================================================== */
function initActiveNavObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link:not(.cta-button)');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px'
  });

  sections.forEach(sec => observer.observe(sec));
}

/* ==========================================================================
   9. Toast Utility
   ========================================================================== */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
