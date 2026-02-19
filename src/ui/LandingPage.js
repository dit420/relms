/**
 * LandingPage — "The Holodeck" portal hub.
 * Immersive 3D-tilt portal cards, parallax grid, futuristic HUD.
 */

import { REALMS } from '../data/realms.js';

// Avatars to pick from
const AVATAR_OPTIONS = ['🧑‍💻', '🎨', '🎮', '🧑‍🚀', '🦊', '🌸', '🔥', '🎵', '🧙', '👑', '🐉', '💀', '🦋', '🌙', '⚡', '🍄'];

const PALETTE_OPTIONS = [
  { name: 'Nebula Purple', h: 260, s: 80, l: 8, bg: 'linear-gradient(135deg, #1a0a3e 0%, #0a1628 50%, #0f0a2e 100%)', accent: '#7c3aed' },
  { name: 'Sakura Pink', h: 340, s: 70, l: 10, bg: 'linear-gradient(135deg, #2e0a1a 0%, #1a0a0f 50%, #2e1a1a 100%)', accent: '#ff2d95' },
  { name: 'Ocean Cyan', h: 195, s: 75, l: 8, bg: 'linear-gradient(135deg, #0a1e2e 0%, #061420 50%, #0a2030 100%)', accent: '#00f0ff' },
  { name: 'Forest Green', h: 140, s: 60, l: 8, bg: 'linear-gradient(135deg, #0a2e12 0%, #081a0e 50%, #0a2e18 100%)', accent: '#39ff14' },
  { name: 'Ember Orange', h: 25, s: 80, l: 10, bg: 'linear-gradient(135deg, #2e1a0a 0%, #1a0f06 50%, #2e1f0a 100%)', accent: '#ff6b2b' },
  { name: 'Midnight Blue', h: 220, s: 70, l: 6, bg: 'linear-gradient(135deg, #0a0f2e 0%, #06091a 50%, #0a102e 100%)', accent: '#4d7cff' },
];

function loadCustomRealms() {
  const saved = localStorage.getItem('custom-realms');
  if (saved) {
    const custom = JSON.parse(saved);
    custom.forEach(cr => {
      if (!REALMS.find(r => r.id === cr.id)) {
        REALMS.push(cr);
      }
    });
  }
}

function saveCustomRealm(realm) {
  const saved = JSON.parse(localStorage.getItem('custom-realms') || '[]');
  saved.push(realm);
  localStorage.setItem('custom-realms', JSON.stringify(saved));
}

const ACTIVITY_ICONS = {
  coding: '⟩_',
  listening: '♫',
  workout: '↑↑',
  sleeping: '◐'
};

const ACTIVITY_LIVE_TEXT = {
  coding: 'Compiling...',
  listening: 'Now playing',
  workout: 'Active session',
  sleeping: 'Do not disturb'
};

export class LandingPage {
  constructor(onSelect) {
    this.onSelect = onSelect;
    this.mouseX = 0;
    this.mouseY = 0;
    loadCustomRealms();
    this.element = this._create();
    this._initParallax();
  }

  _create() {
    const page = document.createElement('div');
    page.className = 'portal-hub';
    page.id = 'landing-page';

    page.innerHTML = `
      <!-- Interactive grid background -->
      <div class="portal-grid" id="portal-grid"></div>

      <!-- Floating ambient orbs -->
      <div class="portal-orbs">
        <div class="portal-orb orb-cyan"></div>
        <div class="portal-orb orb-purple"></div>
        <div class="portal-orb orb-pink"></div>
      </div>

      <!-- HUD Navigation -->
      <nav class="portal-nav">
        <div class="portal-nav-left">
          <div class="portal-logo-icon">◆</div>
          <h1 class="portal-logo">REALMS</h1>
        </div>
        <div class="portal-nav-right">
          <span class="portal-nav-link">DISCOVER</span>
          <span class="portal-nav-link">MAP VIEW</span>
          <span class="portal-nav-link portal-nav-link-active">ENTER</span>
        </div>
      </nav>

      <!-- Main viewport -->
      <main class="portal-viewport">
        <div class="portal-header">
          <div class="portal-header-line"></div>
          <h2 class="portal-header-text">SELECT A DIMENSION</h2>
          <div class="portal-header-line"></div>
        </div>
        <p class="portal-subtext">Enter a spatial environment. Interactions are persistent.</p>

        <div class="portal-grid-cards" id="portal-cards">
          ${REALMS.map(realm => this._renderPortal(realm)).join('')}
          ${this._renderCreatePortal()}
        </div>
      </main>

      <!-- Status Bar -->
      <div class="portal-statusbar">
        <span>SYS.STATUS: <span class="status-green">STABLE</span></span>
        <span>RENDER: THREE.JS / WEBGL</span>
        <span>V 1.0.5 SPATIAL</span>
      </div>

      <!-- Create Modal -->
      ${this._renderCreateModal()}
    `;

    this._bindEvents(page);
    return page;
  }

  /**
   * Re-render the portal cards in-place (e.g. after deleting a realm).
   */
  _renderPage() {
    const cardsContainer = this.element.querySelector('#portal-cards');
    if (!cardsContainer) return;
    cardsContainer.innerHTML = `
      ${REALMS.map(realm => this._renderPortal(realm)).join('')}
      ${this._renderCreatePortal()}
    `;
    this._bindEvents(this.element);
  }

  _renderPortal(realm) {
    const activityIcon = ACTIVITY_ICONS[realm.activity] || '✦';
    const liveText = ACTIVITY_LIVE_TEXT[realm.activity] || realm.activityLabel;
    const accentColor = realm.neonColor || '#00f0ff';

    return `
      <div class="portal-card" data-realm="${realm.id}" style="--portal-accent: ${accentColor};">
        <!-- Glow backdrop -->
        <div class="portal-glow" style="background: radial-gradient(ellipse at center, ${accentColor}20, transparent 70%);"></div>

        <!-- The glass surface -->
        <div class="portal-surface">
          <!-- Delete button -->
          <button class="portal-delete-btn" data-delete-realm="${realm.id}" title="Delete Realm">✕</button>
          <!-- Status beacon -->
          <div class="portal-top">
            <div class="portal-beacon">
              <div class="beacon-dot"></div>
              <span class="beacon-text">LIVE</span>
            </div>
            <div class="portal-activity-icon">${activityIcon}</div>
          </div>

          <!-- Center orb — the "window" into the realm -->
          <div class="portal-center">
            <div class="portal-avatar-ring" style="border-color: ${accentColor};">
              <span class="portal-avatar-emoji">${realm.avatar}</span>
            </div>
            <div class="portal-scan-line"></div>
          </div>

          <!-- Bottom info -->
          <div class="portal-bottom">
            <div class="portal-live-activity">
              <span class="portal-live-dot" style="background: ${accentColor};"></span>
              <span class="portal-activity-terminal">${liveText}<span class="cursor">_</span></span>
            </div>
            <h3 class="portal-name">${realm.owner.toUpperCase()}</h3>
            <div class="portal-meta">
              <span class="portal-city">📍 ${realm.city}</span>
              <span class="portal-music">${realm.music.playing ? '♫ ' + realm.music.artist : ''}</span>
            </div>
            ${realm.music.playing ? `
            <div class="portal-waveform">
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
            </div>` : ''}
            <div class="portal-enter-btn">
              <span>ENTER →</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderCreatePortal() {
    return `
      <div class="portal-card portal-card-create" id="create-realm-card">
        <div class="portal-surface portal-surface-create">
          <div class="create-icon-container">
            <div class="create-plus">+</div>
            <div class="create-ring"></div>
          </div>
          <h3 class="portal-name" style="margin-top: 16px;">GENERATE REALM</h3>
          <p class="create-desc">Build your 360° space</p>
        </div>
      </div>
    `;
  }

  _renderCreateModal() {
    return `
      <div class="create-modal-overlay" id="create-modal-overlay">
        <div class="create-modal glass">
          <div class="create-modal-header">
            <h2>◆ GENERATE REALM</h2>
            <button class="create-modal-close" id="create-modal-close">✕</button>
          </div>
          <div class="create-modal-body">
            <div class="create-row">
              <div class="create-field" style="flex:1">
                <label class="edit-label">CALLSIGN</label>
                <input type="text" class="edit-input" id="cr-name" placeholder="Enter your name..." maxlength="20" />
              </div>
            </div>
            <div class="create-field">
              <label class="edit-label">AVATAR</label>
              <div class="create-avatar-grid" id="cr-avatars">
                ${AVATAR_OPTIONS.map((a, i) => `
                  <button class="create-avatar-btn ${i === 0 ? 'active' : ''}" data-avatar="${a}">${a}</button>
                `).join('')}
              </div>
            </div>
            <div class="create-row">
              <div class="create-field" style="flex:1">
                <label class="edit-label">LOCATION (WEATHER)</label>
                <input type="text" class="edit-input" id="cr-city" placeholder="e.g. Mumbai, London..." />
              </div>
              <div class="create-field" style="flex:1">
                <label class="edit-label">ACTIVITY</label>
                <select class="edit-input" id="cr-activity">
                  <option value="coding">⟩_ Coding</option>
                  <option value="listening">♫ Listening</option>
                  <option value="workout">↑↑ Workout</option>
                  <option value="sleeping">◐ Sleeping</option>
                </select>
              </div>
            </div>
            <div class="create-field">
              <label class="edit-label">REALM PALETTE</label>
              <div class="create-palette-grid" id="cr-palettes">
                ${PALETTE_OPTIONS.map((p, i) => `
                  <button class="create-palette-btn ${i === 0 ? 'active' : ''}" data-index="${i}" title="${p.name}"
                          style="background: ${p.bg};">
                    <span class="palette-name">${p.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>
            <div class="create-field">
              <label class="edit-label">NEON ACCENT</label>
              <div class="edit-color-row" id="cr-neon-colors">
                ${['#00f0ff', '#ff2d95', '#39ff14', '#ffd700', '#7c3aed', '#ff6b2b', '#4d7cff'].map((c, i) => `
                  <div class="edit-color-swatch ${i === 0 ? 'active' : ''}"
                       data-color="${c}"
                       style="background: ${c}; box-shadow: 0 0 10px ${c};">
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="create-field">
              <label class="edit-label">FIRST TRANSMISSION</label>
              <input type="text" class="edit-input" id="cr-thought" placeholder="e.g. hello world 🚀" maxlength="60" />
            </div>
            <button class="portal-launch-btn" id="cr-submit">
              <span class="launch-icon">◆</span> LAUNCH REALM
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _bindEvents(page) {
    // Portal card clicks
    page.querySelectorAll('.portal-card:not(.portal-card-create)').forEach(card => {
      card.addEventListener('click', () => {
        const realmId = card.dataset.realm;
        const realm = REALMS.find(r => r.id === realmId);
        if (realm) this._exitAnimation(() => this.onSelect(realm));
      });

      // 3D tilt effect
      card.addEventListener('mousemove', (e) => this._tiltCard(card, e));
      card.addEventListener('mouseleave', () => this._resetTilt(card));
    });

    // Delete realm buttons
    page.querySelectorAll('.portal-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const realmId = btn.dataset.deleteRealm;
        const realm = REALMS.find(r => r.id === realmId);
        if (!realm) return;
        const confirmed = confirm(`Delete ${realm.owner}'s realm? This cannot be undone.`);
        if (!confirmed) return;
        const idx = REALMS.findIndex(r => r.id === realmId);
        if (idx !== -1) REALMS.splice(idx, 1);
        // Also remove custom realm from localStorage
        const custom = JSON.parse(localStorage.getItem('custom-realms') || '[]');
        const filtered = custom.filter(r => r.id !== realmId);
        localStorage.setItem('custom-realms', JSON.stringify(filtered));
        // Re-render
        this._renderPage();
      });
    });

    // Create card
    page.querySelector('#create-realm-card').addEventListener('click', () => {
      page.querySelector('#create-modal-overlay').classList.add('open');
    });

    // Modal events
    page.querySelector('#create-modal-close').addEventListener('click', () => {
      page.querySelector('#create-modal-overlay').classList.remove('open');
    });
    page.querySelector('#create-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'create-modal-overlay') {
        page.querySelector('#create-modal-overlay').classList.remove('open');
      }
    });

    // Avatar selection
    page.querySelectorAll('.create-avatar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        page.querySelectorAll('.create-avatar-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Palette selection
    page.querySelectorAll('.create-palette-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        page.querySelectorAll('.create-palette-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Neon color
    page.querySelectorAll('#cr-neon-colors .edit-color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        page.querySelectorAll('#cr-neon-colors .edit-color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
      });
    });

    // Submit
    page.querySelector('#cr-submit').addEventListener('click', () => this._onCreateRealm(page));
  }

  // ==================
  // 3D Tilt Effect
  // ==================

  _tiltCard(card, e) {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotateY = x * 25;
    const rotateX = y * -25;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

    // Move glow to follow cursor
    const glow = card.querySelector('.portal-glow');
    if (glow) {
      glow.style.transform = `translate(${x * 40}px, ${y * 40}px)`;
      glow.style.opacity = '1';
    }
  }

  _resetTilt(card) {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    const glow = card.querySelector('.portal-glow');
    if (glow) {
      glow.style.transform = 'translate(0, 0)';
      glow.style.opacity = '0.5';
    }
  }

  // ==================
  // Parallax Grid
  // ==================

  _initParallax() {
    const grid = this.element.querySelector('#portal-grid');
    if (!grid) return;

    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      grid.style.backgroundImage = `
        radial-gradient(circle at ${e.clientX}px ${e.clientY}px, rgba(0, 240, 255, 0.06) 0%, transparent 50%),
        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
      `;
      grid.style.backgroundSize = '100% 100%, 50px 50px, 50px 50px';
    });
  }

  // ==================
  // Create Realm
  // ==================

  _onCreateRealm(page) {
    const name = page.querySelector('#cr-name').value.trim();
    if (!name) {
      page.querySelector('#cr-name').style.borderColor = '#ff4757';
      page.querySelector('#cr-name').focus();
      return;
    }

    const avatar = page.querySelector('.create-avatar-btn.active')?.textContent || '🧑‍💻';
    const city = page.querySelector('#cr-city').value.trim() || 'New York';
    const activity = page.querySelector('#cr-activity').value;
    const paletteIdx = parseInt(page.querySelector('.create-palette-btn.active')?.dataset.index || '0');
    const palette = PALETTE_OPTIONS[paletteIdx];
    const neonColor = page.querySelector('#cr-neon-colors .edit-color-swatch.active')?.dataset.color || '#00f0ff';
    const thought = page.querySelector('#cr-thought').value.trim() || `Welcome to ${name}'s realm ✨`;

    const activityLabels = {
      coding: 'Shipping code',
      listening: 'Vibing to music',
      workout: 'Getting fit',
      sleeping: "Catching Z's"
    };

    const realmId = `realm-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const newRealm = {
      id: realmId,
      owner: name,
      avatar,
      city,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      panoramaColor: { h: palette.h, s: palette.s, l: palette.l },
      activity,
      activityLabel: activityLabels[activity] || activity,
      music: { title: 'Lofi Beats', artist: 'ChillHop', playing: true },
      thoughts: [thought],
      photos: [{ src: null, caption: `${name}'s first photo`, color: neonColor }],
      projects: [],
      neonColor,
      gifts: [],
      cardBg: palette.bg,
      isCustom: true
    };

    REALMS.push(newRealm);
    saveCustomRealm(newRealm);
    page.querySelector('#create-modal-overlay').classList.remove('open');
    this._exitAnimation(() => this.onSelect(newRealm));
  }

  // ==================
  // Transitions
  // ==================

  _exitAnimation(callback) {
    const overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    const ring = document.createElement('div');
    ring.className = 'transition-ring';
    overlay.appendChild(ring);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      ring.classList.add('expand');
      this.element.classList.add('exit');
    });

    setTimeout(() => {
      callback();
      setTimeout(() => {
        ring.classList.add('fade');
        setTimeout(() => overlay.remove(), 600);
      }, 400);
    }, 800);
  }

  show() {
    this.element.style.display = '';
    this.element.classList.remove('exit');
  }

  remove() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
