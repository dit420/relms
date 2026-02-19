/**
 * VRMode — Stereo side-by-side VR mode for cardboard/headset viewers.
 *
 * Creates a split-screen stereoscopic view by rendering the scene twice
 * with a slight camera offset to simulate binocular vision. Locks screen
 * orientation to landscape and goes fullscreen.
 */
import * as THREE from 'three';

export class VRMode {
    constructor(engine) {
        this.engine = engine;
        this.isActive = false;
        this.stereoCamera = null;
        this.eyeSeparation = 0.6; // IPD in world units
        this.originalSize = { w: 0, h: 0 };
    }

    /**
     * Enter VR stereo mode.
     */
    async enter() {
        if (this.isActive) return;
        this.isActive = true;

        // Try fullscreen
        try {
            const el = document.documentElement;
            if (el.requestFullscreen) await el.requestFullscreen();
            else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        } catch (e) {
            console.warn('Fullscreen request failed:', e);
        }

        // Lock to landscape
        try {
            if (screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock('landscape');
            }
        } catch (e) {
            // Orientation lock not supported on all browsers
        }

        // Enable gyro so head tracking works
        if (this.engine.cameraController && !this.engine.cameraController.gyroEnabled) {
            this.engine.cameraController.enableGyro();
        }

        // Store original renderer size
        this.originalSize.w = this.engine.renderer.domElement.width;
        this.originalSize.h = this.engine.renderer.domElement.height;

        // Create VR overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'vr-overlay';
        this.overlay.id = 'vr-overlay';
        this.overlay.innerHTML = `
            <canvas id="vr-canvas" class="vr-canvas"></canvas>
            <div class="vr-divider"></div>
            <button class="vr-exit-btn" id="vr-exit">✕ EXIT VR</button>
        `;
        document.body.appendChild(this.overlay);

        // Setup stereo canvas
        this.vrCanvas = this.overlay.querySelector('#vr-canvas');
        this.vrCtx = this.vrCanvas.getContext('2d');

        this.overlay.querySelector('#vr-exit').addEventListener('click', () => this.exit());

        // Start render loop
        this._resizeCanvas();
        window.addEventListener('resize', this._resizeBound = () => this._resizeCanvas());
        this._renderLoop();

        requestAnimationFrame(() => this.overlay.classList.add('active'));
    }

    _resizeCanvas() {
        if (!this.vrCanvas) return;
        this.vrCanvas.width = window.innerWidth;
        this.vrCanvas.height = window.innerHeight;
    }

    /**
     * Render stereo — draw the WebGL canvas twice side-by-side with offset.
     */
    _renderLoop() {
        if (!this.isActive) return;

        const ctx = this.vrCtx;
        const w = this.vrCanvas.width;
        const h = this.vrCanvas.height;
        const halfW = w / 2;

        const renderer = this.engine.renderer;
        const camera = this.engine.camera;
        const scene = this.engine.scene;

        // Save original camera state
        const origPos = camera.position.clone();
        const origQuat = camera.quaternion.clone();
        const origFov = camera.fov;

        // Narrow FOV slightly for VR
        camera.fov = 90;
        camera.aspect = halfW / h;
        camera.updateProjectionMatrix();

        // Eye offset vector (right direction in camera space)
        const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        const offset = rightVec.multiplyScalar(this.eyeSeparation / 2);

        // --- LEFT EYE ---
        camera.position.copy(origPos).sub(offset);
        renderer.setSize(halfW, h, false);
        renderer.render(scene, camera);
        ctx.drawImage(renderer.domElement, 0, 0, halfW, h, 0, 0, halfW, h);

        // --- RIGHT EYE ---
        camera.position.copy(origPos).add(offset);
        renderer.render(scene, camera);
        ctx.drawImage(renderer.domElement, 0, 0, halfW, h, halfW, 0, halfW, h);

        // Restore camera
        camera.position.copy(origPos);
        camera.quaternion.copy(origQuat);
        camera.fov = origFov;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        // Also render CSS3D (hidden behind VR overlay, but keeps state updated)
        if (this.engine.cssRenderer) {
            this.engine.cssRenderer.render(this.engine.cssScene, camera);
        }

        this._rafId = requestAnimationFrame(() => this._renderLoop());
    }

    /**
     * Exit VR mode.
     */
    exit() {
        if (!this.isActive) return;
        this.isActive = false;

        if (this._rafId) cancelAnimationFrame(this._rafId);

        // Exit fullscreen
        try {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        } catch (e) { }

        // Unlock orientation
        try {
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        } catch (e) { }

        // Restore renderer size
        if (this.engine.renderer) {
            this.engine.renderer.setSize(window.innerWidth, window.innerHeight);
            this.engine.camera.aspect = window.innerWidth / window.innerHeight;
            this.engine.camera.updateProjectionMatrix();
        }

        // Remove overlay
        if (this.overlay) {
            this.overlay.classList.remove('active');
            setTimeout(() => this.overlay.remove(), 300);
        }

        window.removeEventListener('resize', this._resizeBound);
    }
}
