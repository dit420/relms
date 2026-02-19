/**
 * InteractionPanel — manages the graffiti, gifts, and text messages panel.
 * Visitors can leave graffiti drawings, drop emoji gifts, and write text messages.
 */

import { GIFTS_CATALOG } from '../data/realms.js';

export class InteractionPanel {
  constructor(contentObjects, realmId) {
    this.contentObjects = contentObjects;
    this.realmId = realmId;
    this.isOpen = false;
    this.activeTab = 'gifts';
    this.graffitiColor = '#ff2d95';
    this.graffitiCanvas = null;
    this.graffitiCtx = null;
    this.isDrawing = false;

    this.element = this._createPanel();
  }

  _createPanel() {
    const panel = document.createElement('div');
    panel.className = 'interaction-panel glass';

    panel.innerHTML = `
      <div class="interaction-panel-header">
        <h3>Leave a Mark ✨</h3>
        <button class="interaction-panel-close" id="panel-close">✕</button>
      </div>
      <div class="interaction-tabs">
        <button class="interaction-tab active" data-tab="gifts">🎁 Gifts</button>
        <button class="interaction-tab" data-tab="messages">💬 Message</button>
        <button class="interaction-tab" data-tab="graffiti">🖌️ Graffiti</button>
      </div>
      <div class="interaction-body" id="interaction-body">
        ${this._renderGiftsTab()}
      </div>
    `;

    // Close button
    panel.querySelector('#panel-close').addEventListener('click', () => this.toggle());

    // Tabs
    panel.querySelectorAll('.interaction-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        panel.querySelectorAll('.interaction-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTab = tab.dataset.tab;
        this._renderBody();
      });
    });

    return panel;
  }

  _renderBody() {
    const body = this.element.querySelector('#interaction-body');
    if (this.activeTab === 'gifts') {
      body.innerHTML = this._renderGiftsTab();
      this._bindGiftEvents();
    } else if (this.activeTab === 'messages') {
      body.innerHTML = this._renderMessagesTab();
      this._bindMessageEvents();
    } else {
      body.innerHTML = this._renderGraffitiTab();
      this._initGraffitiCanvas();
    }
  }

  // ========================
  // GIFTS TAB
  // ========================

  _renderGiftsTab() {
    return `
      <div class="gift-grid">
        ${GIFTS_CATALOG.map(g => `
          <div class="gift-item" data-emoji="${g.emoji}">
            ${g.emoji}
            <span>${g.name}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  _bindGiftEvents() {
    this.element.querySelectorAll('.gift-item').forEach(item => {
      item.addEventListener('click', () => {
        const emoji = item.dataset.emoji;
        this.contentObjects.addGift(emoji, this.realmId);

        item.style.transform = 'scale(1.3)';
        item.style.boxShadow = '0 0 20px var(--color-accent-glow)';
        setTimeout(() => {
          item.style.transform = '';
          item.style.boxShadow = '';
        }, 300);
      });
    });
  }

  // ========================
  // MESSAGES TAB
  // ========================

  _renderMessagesTab() {
    const messages = this._loadMessages();
    return `
      <div class="messages-container">
        <div class="messages-list" id="messages-list">
          ${messages.length === 0
        ? '<div class="messages-empty">No messages yet. Be the first! ✍️</div>'
        : messages.map((m, i) => `
              <div class="message-bubble" style="--msg-color: ${m.color}">
                <span class="message-author">${m.author}</span>
                <span class="message-text">${this._escapeHtml(m.text)}</span>
                <span class="message-time">${this._timeAgo(m.timestamp)}</span>
              </div>
            `).join('')
      }
        </div>

        <div class="message-compose">
          <input type="text" class="edit-input message-author-input" id="msg-author"
                 placeholder="Your name" maxlength="20"
                 value="${localStorage.getItem('realm-visitor-name') || ''}" />
          <div class="message-input-row">
            <input type="text" class="edit-input message-text-input" id="msg-text"
                   placeholder="Write on the wall..." maxlength="100" />
            <button class="message-send-btn" id="msg-send">🚀</button>
          </div>
          <div class="message-color-row">
            ${['#00f0ff', '#ff2d95', '#39ff14', '#ffd700', '#ff6b2b', '#a855f7'].map((c, i) => `
              <div class="graffiti-color ${i === 0 ? 'active' : ''}" data-color="${c}"
                   style="background: ${c}; box-shadow: 0 0 8px ${c};"></div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  _bindMessageEvents() {
    const sendBtn = this.element.querySelector('#msg-send');
    const textInput = this.element.querySelector('#msg-text');
    const authorInput = this.element.querySelector('#msg-author');
    let selectedColor = '#00f0ff';

    // Color selection
    this.element.querySelectorAll('.message-color-row .graffiti-color').forEach(c => {
      c.addEventListener('click', () => {
        this.element.querySelectorAll('.message-color-row .graffiti-color')
          .forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        selectedColor = c.dataset.color;
      });
    });

    const sendMessage = () => {
      const text = textInput.value.trim();
      const author = authorInput.value.trim() || 'Anonymous';
      if (!text) return;

      // Save visitor name
      localStorage.setItem('realm-visitor-name', author);

      const message = {
        text,
        author,
        color: selectedColor,
        timestamp: Date.now()
      };

      // Save to localStorage
      this._saveMessage(message);

      // Add as a neon text in 3D space
      this.contentObjects.addTextMessage(message, this.realmId);

      // Refresh the messages list
      textInput.value = '';
      this._renderBody();

      // Visual feedback
    };

    sendBtn.addEventListener('click', sendMessage);
    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  _saveMessage(message) {
    const key = `realm-messages-${this.realmId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(message);
    // Keep max 20 messages
    if (existing.length > 20) existing.shift();
    localStorage.setItem(key, JSON.stringify(existing));
  }

  _loadMessages() {
    const key = `realm-messages-${this.realmId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  _timeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ========================
  // GRAFFITI TAB
  // ========================

  _renderGraffitiTab() {
    return `
      <div class="graffiti-tools">
        ${['#ff2d95', '#00f0ff', '#39ff14', '#ffd700', '#7c3aed', '#ff6b2b'].map(c => `
          <div class="graffiti-color ${c === this.graffitiColor ? 'active' : ''}"
               data-color="${c}"
               style="background: ${c}; box-shadow: 0 0 8px ${c};">
          </div>
        `).join('')}
        <div class="graffiti-size-controls">
          <button class="graffiti-size-btn active" data-size="4">•</button>
          <button class="graffiti-size-btn" data-size="8">●</button>
          <button class="graffiti-size-btn" data-size="14">⬤</button>
        </div>
      </div>
      <div class="graffiti-canvas-wrapper">
        <canvas id="graffiti-canvas" width="560" height="320"></canvas>
      </div>
      <div class="graffiti-actions">
        <button class="btn-clear" id="graffiti-clear">Clear</button>
        <button class="btn-submit" id="graffiti-submit">Spray! 🎨</button>
      </div>
    `;
  }

  _initGraffitiCanvas() {
    const canvas = this.element.querySelector('#graffiti-canvas');
    if (!canvas) return;

    this.graffitiCanvas = canvas;
    this.graffitiCtx = canvas.getContext('2d');
    let brushSize = 4;

    // Set canvas black background
    this.graffitiCtx.fillStyle = '#111';
    this.graffitiCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Load saved graffiti
    const saved = localStorage.getItem(`realm-graffiti-${this.realmId}`);
    if (saved) {
      const img = new Image();
      img.onload = () => this.graffitiCtx.drawImage(img, 0, 0);
      img.src = saved;
    }

    // Drawing events
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    canvas.addEventListener('pointerdown', (e) => {
      this.isDrawing = true;
      const pos = getPos(e);
      this.graffitiCtx.beginPath();
      this.graffitiCtx.moveTo(pos.x, pos.y);
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!this.isDrawing) return;
      const pos = getPos(e);
      this.graffitiCtx.lineTo(pos.x, pos.y);
      this.graffitiCtx.strokeStyle = this.graffitiColor;
      this.graffitiCtx.lineWidth = brushSize;
      this.graffitiCtx.lineCap = 'round';
      this.graffitiCtx.shadowColor = this.graffitiColor;
      this.graffitiCtx.shadowBlur = brushSize * 2;
      this.graffitiCtx.stroke();
    });

    canvas.addEventListener('pointerup', () => { this.isDrawing = false; });
    canvas.addEventListener('pointerleave', () => { this.isDrawing = false; });

    // Color picker
    this.element.querySelectorAll('.graffiti-tools .graffiti-color').forEach(c => {
      c.addEventListener('click', () => {
        this.element.querySelectorAll('.graffiti-tools .graffiti-color')
          .forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        this.graffitiColor = c.dataset.color;
      });
    });

    // Brush size
    this.element.querySelectorAll('.graffiti-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.element.querySelectorAll('.graffiti-size-btn')
          .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        brushSize = parseInt(btn.dataset.size);
      });
    });

    // Clear
    this.element.querySelector('#graffiti-clear').addEventListener('click', () => {
      this.graffitiCtx.fillStyle = '#111';
      this.graffitiCtx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Submit / save
    this.element.querySelector('#graffiti-submit').addEventListener('click', () => {
      const dataUrl = canvas.toDataURL();
      localStorage.setItem(`realm-graffiti-${this.realmId}`, dataUrl);

      const btn = this.element.querySelector('#graffiti-submit');
      btn.textContent = 'Saved! ✅';
      setTimeout(() => { btn.textContent = 'Spray! 🎨'; }, 1500);
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.element.classList.toggle('open', this.isOpen);
    if (this.isOpen) {
      this._renderBody();
    }
  }
}
