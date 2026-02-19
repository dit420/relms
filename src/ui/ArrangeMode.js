/**
 * ArrangeMode — 2D equirectangular projection overlay.
 * Unwraps the 360° sphere into a flat plane where elements
 * can be dragged and repositioned.
 */

export class ArrangeMode {
    constructor(engine, realmId) {
        this.engine = engine;
        this.realmId = realmId;
        this.isOpen = false;
        this.miniatures = [];       // { mini, cssObj, origLon, origLat }
        this.dragTarget = null;
        this.dragOffset = { x: 0, y: 0 };

        // Bound handlers
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;

        // Pause 3D interaction
        this.engine.container.style.display = 'none';

        // Create fullscreen overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'arrange-overlay';
        this.overlay.id = 'arrange-overlay';

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'arrange-toolbar';
        toolbar.innerHTML = `
            <div class="arrange-toolbar-left">
                <span class="arrange-toolbar-icon">🗺️</span>
                <h3 class="arrange-toolbar-title">ARRANGE MODE</h3>
                <span class="arrange-toolbar-hint">Drag elements to reposition them in 3D space</span>
            </div>
            <div class="arrange-toolbar-actions">
                <button class="arrange-btn arrange-btn-reset" id="arrange-reset">↺ Reset</button>
                <button class="arrange-btn arrange-btn-cancel" id="arrange-cancel">✕ Cancel</button>
                <button class="arrange-btn arrange-btn-apply" id="arrange-apply">✓ Apply</button>
            </div>
        `;
        this.overlay.appendChild(toolbar);

        // The plane container
        const planeWrap = document.createElement('div');
        planeWrap.className = 'arrange-plane-wrap';

        // The equirectangular plane
        const plane = document.createElement('div');
        plane.className = 'arrange-plane';
        plane.id = 'arrange-plane';

        // Draw panorama as background
        if (this.engine.panoCanvas) {
            plane.style.backgroundImage = `url(${this.engine.panoCanvas.toDataURL()})`;
        }

        // Grid overlay
        const grid = document.createElement('div');
        grid.className = 'arrange-grid';
        plane.appendChild(grid);

        // Axis labels
        const labels = [
            { text: '-180°', x: 0, y: 50 },
            { text: '-90°', x: 25, y: 50 },
            { text: '0°', x: 50, y: 50 },
            { text: '90°', x: 75, y: 50 },
            { text: '180°', x: 100, y: 50 },
            { text: '90° N', x: 50, y: 0 },
            { text: '0° EQ', x: 50, y: 50 },
            { text: '90° S', x: 50, y: 100 },
        ];
        labels.forEach(l => {
            const lbl = document.createElement('div');
            lbl.className = 'arrange-axis-label';
            lbl.textContent = l.text;
            lbl.style.left = `${l.x}%`;
            lbl.style.top = `${l.y}%`;
            plane.appendChild(lbl);
        });

        planeWrap.appendChild(plane);
        this.overlay.appendChild(planeWrap);
        document.body.appendChild(this.overlay);

        this.plane = plane;
        this.planeRect = null; // Will compute on first use

        // Project CSS3D objects onto the plane
        this._projectAllObjects();

        // Bind toolbar events
        this.overlay.querySelector('#arrange-apply').addEventListener('click', () => this._applyChanges());
        this.overlay.querySelector('#arrange-cancel').addEventListener('click', () => this._cancel());
        this.overlay.querySelector('#arrange-reset').addEventListener('click', () => this._resetPositions());

        // Drag events on the plane
        plane.addEventListener('pointerdown', this._onPointerDown);
        plane.addEventListener('pointermove', this._onPointerMove);
        plane.addEventListener('pointerup', this._onPointerUp);
        plane.addEventListener('pointerleave', this._onPointerUp);

        // Animate in
        requestAnimationFrame(() => this.overlay.classList.add('open'));
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;

        // Show 3D scene again
        this.engine.container.style.display = '';

        // Clean up
        if (this.overlay) {
            this.overlay.classList.remove('open');
            setTimeout(() => {
                this.overlay.remove();
                this.overlay = null;
            }, 300);
        }

        this.miniatures = [];
        this.plane = null;
    }

    // --- Projection ---

    _getPlaneRect() {
        if (!this.planeRect || this.planeRect.width === 0) {
            this.planeRect = this.plane.getBoundingClientRect();
        }
        return this.planeRect;
    }

    /**
     * Convert spherical (lon, lat) to 2D plane pixel coordinates.
     * lon: -180 to 180 → x: 0 to planeWidth
     * lat: -90 to 90 → y: planeHeight to 0 (inverted: north is top)
     */
    _sphereToPlane(lon, lat) {
        const rect = this._getPlaneRect();
        const x = ((parseFloat(lon) + 180) / 360) * rect.width;
        const y = ((90 - parseFloat(lat)) / 180) * rect.height;
        return { x, y };
    }

    /**
     * Convert 2D plane pixel coordinates back to spherical (lon, lat).
     */
    _planeToSphere(px, py) {
        const rect = this._getPlaneRect();
        const lon = (px / rect.width) * 360 - 180;
        const lat = 90 - (py / rect.height) * 180;
        return { lon, lat };
    }

    /**
     * Project all CSS3D objects onto the 2D plane as draggable miniatures.
     */
    _projectAllObjects() {
        this.miniatures = [];

        this.engine.cssObjects.forEach(cssObj => {
            const el = cssObj.element;
            // Skip elements without arrange data (like gifts or visitor orbs)
            if (!el.dataset.arrangeType) return;

            const lon = parseFloat(el.dataset.lon);
            const lat = parseFloat(el.dataset.lat);
            const pos = this._sphereToPlane(lon, lat);

            const mini = this._createMiniature(el, pos);
            this.plane.appendChild(mini);

            this.miniatures.push({
                mini,
                cssObj,
                origLon: lon,
                origLat: lat,
                currentLon: lon,
                currentLat: lat
            });
        });
    }

    /**
     * Create a draggable miniature for a CSS3D element.
     */
    _createMiniature(el, pos) {
        const type = el.dataset.arrangeType || 'unknown';
        const label = el.dataset.arrangeLabel || type;

        const mini = document.createElement('div');
        mini.className = `arrange-item arrange-item-${type}`;
        mini.dataset.arrangeType = type;

        // Type-specific icon colors
        const typeColors = {
            'photo': '#ff9f43',
            'music': '#ee5a24',
            'neon': '#00f0ff',
            'project': '#7c3aed',
            'realm-photo': '#ff6b81',
            'timecapsule': '#ffd32a',
            'gift': '#26de81',
            'message': '#45aaf2'
        };
        const borderColor = typeColors[type] || '#ffffff';
        mini.style.setProperty('--item-color', borderColor);

        // Content
        const icon = document.createElement('div');
        icon.className = 'arrange-item-icon';

        // For realm photos, show a tiny thumbnail
        const img = el.querySelector('img');
        if (img && (type === 'realm-photo' || type === 'photo')) {
            const thumb = document.createElement('img');
            thumb.src = img.src;
            thumb.className = 'arrange-item-thumb';
            icon.appendChild(thumb);
        } else {
            icon.textContent = label.charAt(0) || '◆';
        }
        mini.appendChild(icon);

        const text = document.createElement('div');
        text.className = 'arrange-item-label';
        text.textContent = label;
        mini.appendChild(text);

        // Position (relative to plane, using percentages for responsiveness)
        const rect = this._getPlaneRect();
        const pctX = (pos.x / rect.width) * 100;
        const pctY = (pos.y / rect.height) * 100;
        mini.style.left = `${pctX}%`;
        mini.style.top = `${pctY}%`;

        return mini;
    }

    // --- Drag & Drop ---

    _onPointerDown(e) {
        const item = e.target.closest('.arrange-item');
        if (!item) return;

        e.preventDefault();
        this.dragTarget = item;
        item.classList.add('dragging');
        item.setPointerCapture(e.pointerId);

        const rect = this._getPlaneRect();
        const itemLeft = (parseFloat(item.style.left) / 100) * rect.width;
        const itemTop = (parseFloat(item.style.top) / 100) * rect.height;

        this.dragOffset.x = e.clientX - rect.left - itemLeft;
        this.dragOffset.y = e.clientY - rect.top - itemTop;
    }

    _onPointerMove(e) {
        if (!this.dragTarget) return;
        e.preventDefault();

        const rect = this._getPlaneRect();
        let px = e.clientX - rect.left - this.dragOffset.x;
        let py = e.clientY - rect.top - this.dragOffset.y;

        // Clamp to plane
        px = Math.max(0, Math.min(rect.width, px));
        py = Math.max(0, Math.min(rect.height, py));

        // Update position as percentage
        const pctX = (px / rect.width) * 100;
        const pctY = (py / rect.height) * 100;
        this.dragTarget.style.left = `${pctX}%`;
        this.dragTarget.style.top = `${pctY}%`;

        // Update stored coordinates for this miniature
        const miniData = this.miniatures.find(m => m.mini === this.dragTarget);
        if (miniData) {
            const sphere = this._planeToSphere(px, py);
            miniData.currentLon = sphere.lon;
            miniData.currentLat = sphere.lat;
        }

        // Show coordinate tooltip
        const sphere = this._planeToSphere(px, py);
        this.dragTarget.title = `lon: ${sphere.lon.toFixed(1)}°  lat: ${sphere.lat.toFixed(1)}°`;
    }

    _onPointerUp(e) {
        if (!this.dragTarget) return;
        this.dragTarget.classList.remove('dragging');
        this.dragTarget = null;
    }

    // --- Actions ---

    _applyChanges() {
        // Apply new positions to 3D scene
        this.miniatures.forEach(m => {
            if (m.currentLon !== m.origLon || m.currentLat !== m.origLat) {
                this.engine.repositionCSS3DObject(m.cssObj, m.currentLon, m.currentLat);
            }
        });

        // Save layout
        this._saveLayout();

        this.close();
    }

    _cancel() {
        this.close();
    }

    _resetPositions() {
        // Move all miniatures back to their original positions
        this.miniatures.forEach(m => {
            m.currentLon = m.origLon;
            m.currentLat = m.origLat;

            const pos = this._sphereToPlane(m.origLon, m.origLat);
            const rect = this._getPlaneRect();
            m.mini.style.left = `${(pos.x / rect.width) * 100}%`;
            m.mini.style.top = `${(pos.y / rect.height) * 100}%`;
        });

        // Clear saved layout
        localStorage.removeItem(`realm-layout-${this.realmId}`);
    }

    // --- Persistence ---

    _saveLayout() {
        const layout = {};
        this.miniatures.forEach(m => {
            const el = m.cssObj.element;
            const key = `${el.dataset.arrangeType}_${el.dataset.arrangeLabel}`;
            layout[key] = { lon: m.currentLon, lat: m.currentLat };
        });
        localStorage.setItem(`realm-layout-${this.realmId}`, JSON.stringify(layout));
    }

    /**
     * Load and apply saved layout. Called from main.js after content is spawned.
     */
    static loadAndApplyLayout(engine, realmId) {
        const saved = localStorage.getItem(`realm-layout-${realmId}`);
        if (!saved) return;

        try {
            const layout = JSON.parse(saved);

            engine.cssObjects.forEach(cssObj => {
                const el = cssObj.element;
                if (!el.dataset.arrangeType) return;

                const key = `${el.dataset.arrangeType}_${el.dataset.arrangeLabel}`;
                const pos = layout[key];
                if (pos) {
                    engine.repositionCSS3DObject(cssObj, pos.lon, pos.lat);
                }
            });
        } catch (e) {
            console.warn('Failed to load layout:', e);
        }
    }
}
