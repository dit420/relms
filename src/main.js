/**
 * Realms — Main Application Entry Point.
 * Ties together the landing page, 360° engine, content objects,
 * environment systems, and interaction features.
 */

import './styles/main.css';
import { REALMS } from './data/realms.js';
import { RealmEngine } from './engine/RealmEngine.js';
import { WeatherSystem } from './environment/WeatherSystem.js';
import { ActivityMood } from './environment/ActivityMood.js';
import { ContentObjects } from './objects/ContentObjects.js';
import { VisitorPresence } from './interactions/VisitorPresence.js';
import { InteractionPanel } from './interactions/InteractionPanel.js';
import { HUD } from './ui/HUD.js';
import { LandingPage } from './ui/LandingPage.js';
import { EditPanel } from './ui/EditPanel.js';
import { ArrangeMode } from './ui/ArrangeMode.js';
import { VRMode } from './engine/VRMode.js';

class App {
    constructor() {
        this.app = document.getElementById('app');
        this.engine = null;
        this.currentRealm = null;

        this._showLanding();
    }

    _showLanding() {
        const landing = new LandingPage((realm) => this._enterRealm(realm));
        this.app.appendChild(landing.element);
        this.landingPage = landing;
    }

    async _enterRealm(realmData) {
        this.currentRealm = realmData;

        // Show loading
        const loader = document.createElement('div');
        loader.className = 'loading-indicator';
        loader.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">Entering ${realmData.owner}'s Realm...</div>
    `;
        this.app.appendChild(loader);

        // Create realm container
        const container = document.createElement('div');
        container.className = 'realm-container';
        container.id = 'realm-container';
        this.app.appendChild(container);

        try {
            // Initialize engine
            this.engine = new RealmEngine(container);

            // Determine time of day for the realm's timezone
            const isNight = this._isNightAtTimezone(realmData.timezone);

            // Create panorama
            this.engine.createPanoramaSphere(realmData.panoramaColor, isNight);

            // Initialize weather (with timeout so it doesn't block)
            const weatherSystem = new WeatherSystem(this.engine);
            let weather;
            try {
                const weatherPromise = weatherSystem.init(realmData.city);
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 5000)
                );
                weather = await Promise.race([weatherPromise, timeoutPromise]);
            } catch {
                weather = { icon: '🌍', temp: '--', label: 'Unknown' };
            }

            // Apply activity mood
            const activityMood = new ActivityMood(this.engine);
            activityMood.apply(realmData.activity);

            // Spawn content objects
            const contentObjects = new ContentObjects(this.engine);
            contentObjects.spawnAll(realmData);

            // Spawn visitor presence
            const visitorPresence = new VisitorPresence(this.engine);
            visitorPresence.spawn();

            // Apply dynamic environment overlay based on real-world weather
            if (weather && weather.condition) {
                contentObjects.applyDynamicEnvironment(weather.condition, realmData.neonColor);
            }

            // Load saved layout positions
            ArrangeMode.loadAndApplyLayout(this.engine, realmData.id);

            // Create HUD
            const hud = new HUD();
            this.app.appendChild(hud.element);
            hud.updateProfile(realmData);
            hud.updateWeather(weatherSystem.getDisplayInfo());

            // Create interaction panel (for visitors)
            const interactionPanel = new InteractionPanel(contentObjects, realmData.id);
            this.app.appendChild(interactionPanel.element);

            // Wire up HUD buttons
            hud.onInteract(() => interactionPanel.toggle());
            hud.onBack(() => this._exitRealm());

            // Owner edit panel — show edit button for owner's realm and custom realms
            if (realmData.id === 'coder-realm' || realmData.isCustom) {
                hud.showEditButton();

                const editPanel = new EditPanel(realmData, (updatedData) => {
                    // Re-enter the realm to apply changes
                    this._exitRealm();
                    setTimeout(() => {
                        // Merge saved edits and re-enter
                        const saved = localStorage.getItem(`realm-edits-${updatedData.id}`);
                        if (saved) {
                            const edits = JSON.parse(saved);
                            const realmRef = REALMS.find(r => r.id === updatedData.id);
                            if (realmRef) {
                                if (edits.thoughts) realmRef.thoughts = edits.thoughts;
                                if (edits.music) Object.assign(realmRef.music, edits.music);
                                if (edits.activity) realmRef.activity = edits.activity;
                                if (edits.activityLabel) realmRef.activityLabel = edits.activityLabel;
                                if (edits.neonColor) realmRef.neonColor = edits.neonColor;
                            }
                        }
                        this._enterRealm(updatedData);
                    }, 1000);
                });
                this.app.appendChild(editPanel.element);
                hud.onEdit(() => editPanel.toggle());
                this.editPanel = editPanel;
            }

            // Arrange mode — for owners and custom realms
            if (realmData.id === 'coder-realm' || realmData.isCustom || true) {
                hud.showArrangeButton();
                const arrangeMode = new ArrangeMode(this.engine, realmData.id);
                hud.onArrange(() => arrangeMode.open());
                this.arrangeMode = arrangeMode;
            }

            // Particle toggle
            hud.setParticlesActive(this.engine.particlesEnabled);
            hud.onParticles(() => {
                const active = this.engine.toggleParticles();
                hud.setParticlesActive(active);
            });

            // Gyro toggle
            const cc = this.engine.cameraController;
            hud.setGyroActive(cc.gyroEnabled);
            hud.onGyro(() => {
                cc.toggleGyro();
                hud.setGyroActive(cc.gyroEnabled);
            });

            // VR mode
            const vrMode = new VRMode(this.engine);
            hud.onVR(() => vrMode.enter());
            this.vrMode = vrMode;

            // Store references for cleanup
            this.hud = hud;
            this.interactionPanel = interactionPanel;
            this.realmContainer = container;

            // Start engine
            this.engine.start();

            // Transition: remove loader, show realm
            setTimeout(() => {
                loader.remove();
                container.classList.add('active');
                hud.show();
            }, 600);
        } catch (err) {
            console.error('Failed to enter realm:', err);
            loader.innerHTML = `
                <div class="loading-text" style="color: #ff4757;">
                    Failed to load realm: ${err.message}<br>
                    <small style="color: #8888aa;">Check browser console for details</small>
                </div>
            `;
        }
    }

    _exitRealm() {
        // Transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'transition-overlay';
        const ring = document.createElement('div');
        ring.className = 'transition-ring';
        overlay.appendChild(ring);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => ring.classList.add('expand'));

        setTimeout(() => {
            // Cleanup realm
            if (this.engine) {
                this.engine.dispose();
                this.engine = null;
            }
            if (this.realmContainer) this.realmContainer.remove();
            if (this.hud) this.hud.element.remove();
            if (this.interactionPanel) this.interactionPanel.element.remove();
            // Clean up dynamic overlays
            const envOverlay = document.getElementById('dynamic-env-overlay');
            if (envOverlay) envOverlay.remove();
            const csOverlay = document.getElementById('center-stage-overlay');
            if (csOverlay) csOverlay.remove();
            if (this.editPanel) {
                this.editPanel.element.remove();
                this.editPanel = null;
            }
            if (this.arrangeMode) {
                this.arrangeMode.close();
                this.arrangeMode = null;
            }
            if (this.vrMode) {
                this.vrMode.exit();
                this.vrMode = null;
            }

            // Re-show landing
            this._showLanding();

            // Fade out overlay
            setTimeout(() => {
                ring.classList.add('fade');
                setTimeout(() => overlay.remove(), 600);
            }, 200);
        }, 800);
    }

    _isNightAtTimezone(timezone) {
        try {
            const now = new Date();
            const options = { timeZone: timezone, hour: 'numeric', hour12: false };
            const hour = parseInt(new Intl.DateTimeFormat('en-US', options).format(now));
            return hour < 6 || hour >= 19;
        } catch {
            const hour = new Date().getHours();
            return hour < 6 || hour >= 19;
        }
    }
}

// Boot
new App();
