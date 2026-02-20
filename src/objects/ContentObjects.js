/**
 * ContentObjects — creates all the CSS3D content for a realm.
 */

export class ContentObjects {
    constructor(engine) {
        this.engine = engine;
        this.objects = [];
    }

    /**
     * Spawn all content objects for a realm definition.
     */
    spawnAll(realmData) {
        this._spawnPhotos(realmData.photos);
        this._spawnUserPhotos(realmData.id);
        if (realmData.realmPhotos) {
            this._spawnRealmPhotos(realmData.realmPhotos, realmData.neonColor);
        }
        this._spawnMusicPlayer(realmData.music);
        this._spawnNeonSigns(realmData.thoughts, realmData.neonColor);
        this._spawnProjectShelf(realmData.projects);
        this._spawnGifts(realmData.gifts || [], realmData.id);
        this._spawnSavedMessages(realmData.id);
        if (realmData.timeCapsule) {
            this._spawnTimeCapsule(realmData.timeCapsule, realmData.neonColor);
        }
        this._initCenterStage();
    }

    applyFrame(frameClass) {
        this.objects.forEach(obj => {
            // CSS3D objects are HTMLElements
            if (obj instanceof HTMLElement) {
                if (obj.classList.contains('css3d-user-photo') || obj.classList.contains('css3d-photo-frame')) {
                    // Remove old frame classes
                    Array.from(obj.classList).forEach(cls => {
                        if (cls.startsWith('frame-') && cls !== 'frame-polaroid') { // Keep default if needed? Or just wipe
                            obj.classList.remove(cls);
                        }
                    });
                    if (frameClass) obj.classList.add(frameClass);
                }
            }
        });
    }

    /**
     * Spawn user-uploaded photos with their chosen frame styles.
     */
    _spawnUserPhotos(realmId) {
        const saved = localStorage.getItem(`realm-photos-${realmId}`);
        if (!saved) return;

        const photos = JSON.parse(saved);

        // Position user photos at different spots from the default ones
        const positions = [
            { lon: 70, lat: 10 },
            { lon: 150, lat: 5 },
            { lon: -90, lat: 15 },
            { lon: -150, lat: 0 },
            { lon: 30, lat: -10 },
            { lon: -20, lat: 20 }
        ];

        photos.forEach((photo, i) => {
            if (i >= positions.length) return;

            const el = document.createElement('div');
            el.className = `css3d-user-photo frame-${photo.frame || 'polaroid'}`;

            const imgEl = document.createElement('img');
            imgEl.src = photo.dataUrl;
            imgEl.alt = photo.caption || 'Photo';
            el.appendChild(imgEl);

            if (photo.caption) {
                const cap = document.createElement('div');
                cap.className = 'user-photo-caption';
                cap.textContent = photo.caption;
                el.appendChild(cap);
            }

            const pos = positions[i];
            this.engine.addCSS3DObject(el, pos.lon, pos.lat, 375);
            this.objects.push(el);
        });
    }

    _spawnPhotos(photos) {
        const positions = [
            { lon: -55, lat: 30 },
            { lon: -25, lat: 35 },
            { lon: 5, lat: 30 }
        ];

        photos.forEach((photo, i) => {
            if (i >= positions.length) return;

            const el = document.createElement('div');
            el.className = 'css3d-photo-frame';
            el.dataset.arrangeType = 'photo';
            el.dataset.arrangeLabel = `📷 ${photo.caption}`;

            const canvas = document.createElement('canvas');
            canvas.width = 280;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');

            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, photo.color || '#7c3aed');
            grad.addColorStop(1, this._shiftColor(photo.color || '#7c3aed', 40));
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.globalAlpha = 0.15;
            for (let x = 0; x < canvas.width; x += 20) {
                for (let y = 0; y < canvas.height; y += 20) {
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = '#fff';
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;

            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(photo.caption, canvas.width / 2, canvas.height - 20);

            const img = document.createElement('img');
            img.src = canvas.toDataURL();
            el.appendChild(img);

            const caption = document.createElement('div');
            caption.className = 'caption';
            caption.textContent = photo.caption;
            el.appendChild(caption);

            const pos = positions[i];
            this.engine.addCSS3DObject(el, pos.lon, pos.lat, 380);
            this.objects.push(el);
        });
    }

    _spawnMusicPlayer(music) {
        const el = document.createElement('div');
        el.className = 'css3d-music-player';
        el.dataset.arrangeType = 'music';
        el.dataset.arrangeLabel = `🎵 ${music.title} — ${music.artist}`;

        const record = document.createElement('div');
        record.className = `music-record ${music.playing ? 'spinning' : ''}`;
        el.appendChild(record);

        const info = document.createElement('div');
        info.className = 'music-info';

        const title = document.createElement('div');
        title.className = 'music-title';
        title.textContent = music.title;
        info.appendChild(title);

        const artist = document.createElement('div');
        artist.className = 'music-artist';
        artist.textContent = music.artist;
        info.appendChild(artist);

        if (music.playing) {
            const bars = document.createElement('div');
            bars.className = 'music-bars';
            for (let i = 0; i < 7; i++) {
                const bar = document.createElement('div');
                bar.className = 'bar';
                bars.appendChild(bar);
            }
            info.appendChild(bars);
        }

        el.appendChild(info);

        this.engine.addCSS3DObject(el, 120, 30, 390);
        this.objects.push(el);
    }

    _spawnNeonSigns(thoughts, neonColor) {
        const positions = [
            { lon: 50, lat: 35 },
            { lon: 170, lat: 30 },
            { lon: -120, lat: 35 }
        ];

        thoughts.forEach((text, i) => {
            if (i >= positions.length) return;

            const el = document.createElement('div');
            el.className = 'css3d-neon-sign';
            el.dataset.arrangeType = 'neon';
            el.dataset.arrangeLabel = `💡 ${text.substring(0, 30)}`;
            el.textContent = text;
            el.style.color = neonColor;
            el.style.textShadow = `
                0 0 7px ${neonColor},
                0 0 10px ${neonColor},
                0 0 21px ${neonColor},
                0 0 42px ${neonColor}
            `;
            el.style.animationDelay = `${Math.random() * 3}s`;

            const pos = positions[i];
            this.engine.addCSS3DObject(el, pos.lon, pos.lat, 390);
            this.objects.push(el);
        });
    }

    _spawnProjectShelf(projects) {
        const positions = [
            { lon: -160, lat: -25 },
            { lon: -140, lat: -25 },
            { lon: -180, lat: -25 }
        ];

        projects.forEach((project, i) => {
            if (i >= positions.length) return;

            const el = document.createElement('div');
            el.className = 'css3d-project-card';
            el.dataset.arrangeType = 'project';
            el.dataset.arrangeLabel = `${project.icon} ${project.name}`;

            const icon = document.createElement('div');
            icon.className = 'project-icon';
            icon.textContent = project.icon;
            el.appendChild(icon);

            const name = document.createElement('div');
            name.className = 'project-name';
            name.textContent = project.name;
            el.appendChild(name);

            const desc = document.createElement('div');
            desc.className = 'project-desc';
            desc.textContent = project.desc;
            el.appendChild(desc);

            el.addEventListener('click', () => {
                if (project.link && project.link !== '#') {
                    window.open(project.link, '_blank');
                }
            });

            const pos = positions[i];
            this.engine.addCSS3DObject(el, pos.lon, pos.lat, 370);
            this.objects.push(el);
        });
    }

    _spawnGifts(gifts, realmId) {
        const storedGifts = this._loadGifts(realmId);
        const allGifts = [...gifts, ...storedGifts];

        allGifts.forEach((gift) => {
            const el = document.createElement('div');
            el.className = 'css3d-gift';
            el.textContent = gift.emoji;
            el.style.animationDelay = `${Math.random() * 3}s`;

            const lon = gift.lon || (Math.random() * 360 - 180);
            const lat = gift.lat || (Math.random() * 30 - 15);
            this.engine.addCSS3DObject(el, lon, lat, 350 + Math.random() * 50);
            this.objects.push(el);
        });
    }

    /**
     * Spawn saved visitor text messages as floating neon signs.
     */
    _spawnSavedMessages(realmId) {
        const key = `realm-messages-${realmId}`;
        const messages = JSON.parse(localStorage.getItem(key) || '[]');

        messages.forEach((msg, i) => {
            this._createMessageElement(msg, i);
        });
    }

    /**
     * Add a text message from a visitor as a floating neon sign in 3D space.
     */
    addTextMessage(message, realmId) {
        const key = `realm-messages-${realmId}`;
        const messages = JSON.parse(localStorage.getItem(key) || '[]');
        const index = messages.length - 1;

        this._createMessageElement(message, index);
    }

    _createMessageElement(message, index) {
        const el = document.createElement('div');
        el.className = 'css3d-visitor-message';
        el.style.setProperty('--msg-color', message.color);

        el.innerHTML = `
            <div class="visitor-msg-author">${this._escapeHtml(message.author)}</div>
            <div class="visitor-msg-text">${this._escapeHtml(message.text)}</div>
        `;

        // Distribute messages around the room at varied positions
        const lon = (index * 47 + 25) % 360 - 180;
        const lat = Math.sin(index * 1.7) * 15;
        const distance = 360 + (index % 3) * 15;

        this.engine.addCSS3DObject(el, lon, lat, distance);
        this.objects.push(el);
    }

    addGift(emoji, realmId) {
        const gift = {
            emoji,
            lon: Math.random() * 360 - 180,
            lat: Math.random() * 30 - 15
        };

        const el = document.createElement('div');
        el.className = 'css3d-gift';
        el.textContent = emoji;
        el.style.animationDelay = '0s';

        this.engine.addCSS3DObject(el, gift.lon, gift.lat, 350 + Math.random() * 50);
        this.objects.push(el);

        this._saveGift(gift, realmId);
    }

    _saveGift(gift, realmId) {
        const key = `realm-gifts-${realmId}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(gift);
        localStorage.setItem(key, JSON.stringify(existing));
    }

    _loadGifts(realmId) {
        if (!realmId) return [];
        const key = `realm-gifts-${realmId}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    /**
     * Spawn realm photos with varied frame styles distributed around the room.
     */
    _spawnRealmPhotos(realmPhotos, neonColor) {
        const count = realmPhotos.length;
        const radius = 370;

        realmPhotos.forEach((photo, i) => {
            // Distribute photos around the equator band to keep clear of music/neon (higher up)
            const angle = (i / count) * 360 - 180;
            const lat = (i % 2 === 0 ? -5 : 5) + Math.sin(i * 0.7) * 5;
            const distance = radius + (i % 2) * 20;

            const el = document.createElement('div');
            el.className = `css3d-realm-photo frame-${photo.frame || 'polaroid'}`;
            el.dataset.arrangeType = 'realm-photo';
            el.dataset.arrangeLabel = `🖼️ ${photo.caption}`;
            el.setAttribute('data-caption', photo.caption);
            el.setAttribute('data-frame', photo.frame || 'polaroid');

            // Frame-specific wrapper
            const frameWrap = document.createElement('div');
            frameWrap.className = 'realm-photo-frame-wrap';

            const img = document.createElement('img');
            img.src = photo.src;
            img.alt = photo.caption;
            img.loading = 'lazy';
            frameWrap.appendChild(img);

            // Caption strip
            const cap = document.createElement('div');
            cap.className = 'realm-photo-caption';
            cap.textContent = photo.caption;
            frameWrap.appendChild(cap);

            el.appendChild(frameWrap);

            // Add click handler for center stage
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this._showCenterStage(photo.src, photo.caption, photo.frame, neonColor);
            });

            this.engine.addCSS3DObject(el, angle, lat, distance);
            this.objects.push(el);
        });
    }

    /**
     * Initialize the center-stage overlay for focused photo viewing.
     */
    _initCenterStage() {
        // Don't double-init
        if (document.getElementById('center-stage-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'center-stage-overlay';
        overlay.className = 'center-stage-overlay';
        overlay.innerHTML = `
            <div class="center-stage-backdrop"></div>
            <div class="center-stage-content">
                <div class="center-stage-photo-wrap">
                    <img class="center-stage-img" src="" alt="" />
                </div>
                <div class="center-stage-info">
                    <div class="center-stage-frame-label"></div>
                    <div class="center-stage-caption"></div>
                    <div class="center-stage-close">✕ CLOSE</div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Close on backdrop click
        overlay.querySelector('.center-stage-backdrop').addEventListener('click', () => {
            this._hideCenterStage();
        });

        // Close on button click
        overlay.querySelector('.center-stage-close').addEventListener('click', () => {
            this._hideCenterStage();
        });

        // Close on Escape
        this._centerStageEscHandler = (e) => {
            if (e.key === 'Escape') this._hideCenterStage();
        };
        document.addEventListener('keydown', this._centerStageEscHandler);
    }

    _showCenterStage(src, caption, frame, neonColor) {
        const overlay = document.getElementById('center-stage-overlay');
        if (!overlay) return;

        const img = overlay.querySelector('.center-stage-img');
        img.src = src;
        img.alt = caption;

        const capEl = overlay.querySelector('.center-stage-caption');
        capEl.textContent = caption;

        const frameLabel = overlay.querySelector('.center-stage-frame-label');
        const frameNames = {
            polaroid: '📸 Polaroid',
            vintage: '🎞️ Vintage',
            neon: '💜 Neon',
            holographic: '🌈 Holographic',
            minimal: '◻️ Minimal',
            pixel: '👾 Pixel'
        };
        frameLabel.textContent = frameNames[frame] || '📸 Photo';

        // Set accent color
        overlay.style.setProperty('--cs-accent', neonColor || '#00f0ff');

        // Trigger open
        overlay.classList.add('active');
    }

    _hideCenterStage() {
        const overlay = document.getElementById('center-stage-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Spawn a time-capsule zone — locked content that unlocks on a future date.
     */
    _spawnTimeCapsule(capsule, neonColor) {
        const now = new Date();
        const unlockDate = new Date(capsule.unlockDate + 'T00:00:00');
        const isUnlocked = now >= unlockDate;

        const el = document.createElement('div');
        el.className = `css3d-time-capsule ${isUnlocked ? 'unlocked' : 'locked'}`;
        el.dataset.arrangeType = 'timecapsule';
        el.dataset.arrangeLabel = `🔒 ${capsule.title}`;
        el.style.setProperty('--capsule-color', neonColor || '#00f0ff');

        // Countdown logic
        let countdownStr = '';
        if (!isUnlocked) {
            const diff = unlockDate - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            countdownStr = `${days}d ${hours}h remaining`;
        }

        el.innerHTML = `
            <div class="tc-glow"></div>
            <div class="tc-icon">${isUnlocked ? '🔓' : '🔒'}</div>
            <div class="tc-title">${this._escapeHtml(capsule.title)}</div>
            <div class="tc-hint">${isUnlocked ? this._escapeHtml(capsule.content) : this._escapeHtml(capsule.hint)}</div>
            ${!isUnlocked ? `<div class="tc-countdown">${countdownStr}</div>` : ''}
            <div class="tc-date">${unlockDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            ${isUnlocked ? '<div class="tc-unlocked-badge">✦ UNLOCKED ✦</div>' : '<div class="tc-locked-badge">◈ SEALED ◈</div>'}
        `;

        // Position it prominently
        this.engine.addCSS3DObject(el, -80, -15, 360);
        this.objects.push(el);

        // Live countdown update for locked capsules
        if (!isUnlocked) {
            const countdownEl = el.querySelector('.tc-countdown');
            if (countdownEl) {
                setInterval(() => {
                    const remaining = unlockDate - new Date();
                    if (remaining <= 0) {
                        el.classList.remove('locked');
                        el.classList.add('unlocked');
                        el.querySelector('.tc-icon').textContent = '🔓';
                        el.querySelector('.tc-hint').textContent = capsule.content;
                        countdownEl.remove();
                        const badge = el.querySelector('.tc-locked-badge');
                        if (badge) { badge.textContent = '✦ UNLOCKED ✦'; badge.className = 'tc-unlocked-badge'; }
                    } else {
                        const d = Math.floor(remaining / (1000 * 60 * 60 * 24));
                        const h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                        countdownEl.textContent = `${d}d ${h}h ${m}m remaining`;
                    }
                }, 60000);
            }
        }
    }

    /**
     * Apply a dynamic environment overlay to the realm based on weather.
     * Called from main.js after weather is fetched.
     */
    applyDynamicEnvironment(weatherCondition, neonColor) {
        // Create a full-screen overlay for environmental effects
        let overlay = document.getElementById('dynamic-env-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'dynamic-env-overlay';
            overlay.className = 'dynamic-env-overlay';
            document.body.appendChild(overlay);
        }

        // Clear previous effects
        overlay.className = 'dynamic-env-overlay';
        overlay.innerHTML = '';

        switch (weatherCondition) {
            case 'rain':
            case 'thunderstorm':
                overlay.classList.add('env-rain');
                // Add rain droplet elements on the "glass"
                for (let i = 0; i < 30; i++) {
                    const drop = document.createElement('div');
                    drop.className = 'rain-drop';
                    drop.style.left = `${Math.random() * 100}%`;
                    drop.style.top = `${Math.random() * 100}%`;
                    drop.style.animationDelay = `${Math.random() * 4}s`;
                    drop.style.animationDuration = `${2 + Math.random() * 3}s`;
                    overlay.appendChild(drop);
                }
                break;

            case 'night_clear':
                overlay.classList.add('env-night');
                // Boost neon glow on signs
                document.querySelectorAll('.css3d-neon-sign').forEach(sign => {
                    sign.classList.add('neon-night-boost');
                });
                break;

            case 'snow':
                overlay.classList.add('env-snow');
                break;

            case 'clouds':
                overlay.classList.add('env-cloudy');
                break;

            default:
                overlay.classList.add('env-clear');
                break;
        }
    }

    _shiftColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, ((num >> 16) & 0xff) + amount);
        const g = Math.min(255, ((num >> 8) & 0xff) + amount);
        const b = Math.min(255, (num & 0xff) + amount);
        return `rgb(${r}, ${g}, ${b})`;
    }
}
