/**
 * EditPanel — Owner's realm customization panel.
 * Allows the owner to edit thoughts, music, activity, realm colors, and photos.
 */

export const FRAME_STYLES = [
  { id: 'polaroid', name: 'Polaroid', icon: '📷' },
  { id: 'neon', name: 'Neon Glow', icon: '💡' },
  { id: 'vintage', name: 'Vintage', icon: '🎞️' },
  { id: 'minimal', name: 'Minimal', icon: '◻️' },
  { id: 'holographic', name: 'Holo', icon: '🌈' },
  { id: 'pixel', name: 'Pixel', icon: '👾' },
];

export class EditPanel {
  constructor(realmData, onUpdate) {
    this.realmData = realmData;
    this.onUpdate = onUpdate;
    this.isOpen = false;
    this.selectedFrame = 'polaroid';

    // Load any saved customizations
    this._loadSaved();

    this._create();
  }

  _loadSaved() {
    const saved = localStorage.getItem(`realm-edits-${this.realmData.id}`);
    if (saved) {
      const edits = JSON.parse(saved);
      if (edits.thoughts) this.realmData.thoughts = edits.thoughts;
      if (edits.music) Object.assign(this.realmData.music, edits.music);
      if (edits.activityLabel) this.realmData.activityLabel = edits.activityLabel;
      if (edits.activity) this.realmData.activity = edits.activity;
      if (edits.neonColor) this.realmData.neonColor = edits.neonColor;
    }

    // Load saved photos
    const savedPhotos = localStorage.getItem(`realm-photos-${this.realmData.id}`);
    if (savedPhotos) {
      this.realmData.userPhotos = JSON.parse(savedPhotos);
    }
    if (!this.realmData.userPhotos) {
      this.realmData.userPhotos = [];
    }
  }

  _save() {
    const edits = {
      thoughts: this.realmData.thoughts,
      music: this.realmData.music,
      activityLabel: this.realmData.activityLabel,
      activity: this.realmData.activity,
      neonColor: this.realmData.neonColor
    };
    localStorage.setItem(`realm-edits-${this.realmData.id}`, JSON.stringify(edits));

    // Save photos separately (they can be large)
    localStorage.setItem(
      `realm-photos-${this.realmData.id}`,
      JSON.stringify(this.realmData.userPhotos)
    );
  }

  _create() {
    const panel = document.createElement('div');
    panel.className = 'edit-panel glass';
    panel.id = 'edit-panel';
    this.element = panel;

    panel.innerHTML = `
      <div class="edit-panel-header">
        <h3>✏️ Edit Your Realm</h3>
        <button class="edit-panel-close" id="edit-close">✕</button>
      </div>

      <div class="edit-panel-body" id="edit-body">
        <!-- Photos -->
        <div class="edit-section">
          <label class="edit-label">📸 Photos</label>
          <div class="edit-photo-gallery" id="edit-photo-gallery">
            ${this._renderPhotoGallery()}
          </div>
          <div class="edit-photo-upload-row">
            <label class="edit-upload-btn" for="photo-upload">
              📁 Add Photo
              <input type="file" id="photo-upload" accept="image/*" hidden />
            </label>
            <div class="edit-frame-picker" id="frame-picker">
              ${FRAME_STYLES.map(f => `
                <button class="frame-pick-btn ${f.id === this.selectedFrame ? 'active' : ''}"
                        data-frame="${f.id}" title="${f.name}">
                  ${f.icon}
                </button>
              `).join('')}
            </div>
          </div>
          <div class="edit-frame-label">
            Frame: <span id="frame-label-text">${FRAME_STYLES.find(f => f.id === this.selectedFrame).name}</span>
          </div>
        </div>

        <!-- Thoughts / Neon Signs -->
        <div class="edit-section">
          <label class="edit-label">💭 Neon Thoughts</label>
          <div class="edit-thoughts" id="edit-thoughts">
            ${this.realmData.thoughts.map((t, i) => `
              <div class="edit-thought-row">
                <input type="text" class="edit-input thought-input" data-index="${i}" value="${t}" placeholder="Write a thought..." />
                <button class="edit-remove-btn" data-index="${i}">✕</button>
              </div>
            `).join('')}
          </div>
          <button class="edit-add-btn" id="add-thought">+ Add Thought</button>
        </div>

        <!-- Music -->
        <div class="edit-section">
          <label class="edit-label">🎵 Now Playing</label>
          <input type="text" class="edit-input" id="edit-music-title" value="${this.realmData.music.title}" placeholder="Song title" />
          <input type="text" class="edit-input" id="edit-music-artist" value="${this.realmData.music.artist}" placeholder="Artist" />
        </div>

        <!-- Activity -->
        <div class="edit-section">
          <label class="edit-label">⚡ Current Activity</label>
          <div class="edit-activity-grid">
            ${[
        { value: 'coding', emoji: '💻', label: 'Coding' },
        { value: 'listening', emoji: '🎧', label: 'Listening' },
        { value: 'workout', emoji: '💪', label: 'Workout' },
        { value: 'sleeping', emoji: '😴', label: 'Sleeping' }
      ].map(a => `
              <button class="edit-activity-btn ${this.realmData.activity === a.value ? 'active' : ''}"
                      data-activity="${a.value}" data-label="${a.label}">
                <span>${a.emoji}</span>
                <small>${a.label}</small>
              </button>
            `).join('')}
          </div>
          <input type="text" class="edit-input" id="edit-activity-label"
                 value="${this.realmData.activityLabel || ''}" placeholder="Custom status text..." />
        </div>

        <!-- Neon Color -->
        <div class="edit-section">
          <label class="edit-label">🌈 Neon Color</label>
          <div class="edit-color-row">
            ${['#00f0ff', '#ff2d95', '#39ff14', '#ffd700', '#7c3aed', '#ff6b2b', '#4d7cff'].map(c => `
              <div class="edit-color-swatch ${this.realmData.neonColor === c ? 'active' : ''}"
                   data-color="${c}"
                   style="background: ${c}; box-shadow: 0 0 10px ${c};">
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Save -->
        <button class="edit-save-btn" id="edit-save">
          💾 Save & Apply Changes
        </button>
      </div>
    `;

    // --- Event binding ---

    // Close
    panel.querySelector('#edit-close').addEventListener('click', () => this.toggle());

    // Photo upload
    panel.querySelector('#photo-upload').addEventListener('change', (e) => this._onPhotoUpload(e));

    // Frame picker
    panel.querySelectorAll('.frame-pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.frame-pick-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedFrame = btn.dataset.frame;
        panel.querySelector('#frame-label-text').textContent =
          FRAME_STYLES.find(f => f.id === this.selectedFrame).name;
      });
    });

    // Add thought
    panel.querySelector('#add-thought').addEventListener('click', () => {
      this.realmData.thoughts.push('');
      this._rebuildThoughts();
    });

    // Activity buttons
    panel.querySelectorAll('.edit-activity-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.edit-activity-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.realmData.activity = btn.dataset.activity;
        const labelInput = panel.querySelector('#edit-activity-label');
        labelInput.value = btn.dataset.label;
        this.realmData.activityLabel = btn.dataset.label;
      });
    });

    // Color swatches
    panel.querySelectorAll('.edit-color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        panel.querySelectorAll('.edit-color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.realmData.neonColor = swatch.dataset.color;
      });
    });

    // Save button
    panel.querySelector('#edit-save').addEventListener('click', () => this._onSave());

    // Bind thought input events
    this._bindThoughtEvents();
  }

  // ========================
  // Photo gallery
  // ========================

  _renderPhotoGallery() {
    if (!this.realmData.userPhotos || this.realmData.userPhotos.length === 0) {
      return '<div class="edit-photos-empty">No photos yet — add some!</div>';
    }
    return this.realmData.userPhotos.map((photo, i) => `
      <div class="edit-photo-thumb" data-index="${i}">
        <img src="${photo.dataUrl}" alt="${photo.caption || 'Photo'}" />
        <div class="edit-photo-frame-badge">${FRAME_STYLES.find(f => f.id === photo.frame)?.icon || '📷'}</div>
        <button class="edit-photo-remove" data-index="${i}">✕</button>
        <input type="text" class="edit-photo-caption" data-index="${i}"
               value="${photo.caption || ''}" placeholder="Caption..." />
      </div>
    `).join('');
  }

  _rebuildPhotoGallery() {
    const gallery = this.element.querySelector('#edit-photo-gallery');
    gallery.innerHTML = this._renderPhotoGallery();
    this._bindPhotoEvents();
  }

  _bindPhotoEvents() {
    // Remove photo
    this.element.querySelectorAll('.edit-photo-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        this.realmData.userPhotos.splice(idx, 1);
        this._rebuildPhotoGallery();
      });
    });

    // Caption edit
    this.element.querySelectorAll('.edit-photo-caption').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.dataset.index);
        this.realmData.userPhotos[idx].caption = input.value;
      });
    });
  }

  _onPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Limit to 6 photos (localStorage limits)
    if (this.realmData.userPhotos.length >= 6) {
      alert('Max 6 photos per realm!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // Resize the image to save localStorage space
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = (h / w) * maxDim; w = maxDim; }
          else { w = (w / h) * maxDim; h = maxDim; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

        this.realmData.userPhotos.push({
          dataUrl,
          caption: '',
          frame: this.selectedFrame,
          addedAt: Date.now()
        });

        this._rebuildPhotoGallery();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Reset the input so the same file can be re-added
    event.target.value = '';
  }

  // ========================
  // Thoughts
  // ========================

  _rebuildThoughts() {
    const container = this.element.querySelector('#edit-thoughts');
    container.innerHTML = this.realmData.thoughts.map((t, i) => `
      <div class="edit-thought-row">
        <input type="text" class="edit-input thought-input" data-index="${i}" value="${t}" placeholder="Write a thought..." />
        <button class="edit-remove-btn" data-index="${i}">✕</button>
      </div>
    `).join('');
    this._bindThoughtEvents();
  }

  _bindThoughtEvents() {
    this.element.querySelectorAll('.thought-input').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.dataset.index);
        this.realmData.thoughts[idx] = input.value;
      });
    });

    this.element.querySelectorAll('.edit-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        this.realmData.thoughts.splice(idx, 1);
        this._rebuildThoughts();
      });
    });
  }

  // ========================
  // Save
  // ========================

  _onSave() {
    this.realmData.music.title = this.element.querySelector('#edit-music-title').value;
    this.realmData.music.artist = this.element.querySelector('#edit-music-artist').value;
    this.realmData.activityLabel = this.element.querySelector('#edit-activity-label').value;

    // Filter empty thoughts
    this.realmData.thoughts = this.realmData.thoughts.filter(t => t.trim() !== '');

    // Save to localStorage
    this._save();

    // Callback to refresh the realm
    if (this.onUpdate) this.onUpdate(this.realmData);

    // Visual feedback
    const btn = this.element.querySelector('#edit-save');
    btn.textContent = '✅ Saved!';
    btn.style.background = 'linear-gradient(135deg, #39ff14, #00cc44)';
    setTimeout(() => {
      btn.textContent = '💾 Save & Apply Changes';
      btn.style.background = '';
    }, 2000);
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.element.classList.toggle('open', this.isOpen);
    if (this.isOpen) {
      this._rebuildPhotoGallery();
    }
  }
}
