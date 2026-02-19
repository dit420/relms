/**
 * CameraController — handles drag-to-pan, touch, gyroscope, pinch-to-zoom, and VR stereo.
 */
import * as THREE from 'three';

export class CameraController {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        // Spherical coordinates
        this.lon = 0;
        this.lat = 0;
        this.targetLon = 0;
        this.targetLat = 0;

        // Drag state
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartLon = 0;
        this.dragStartLat = 0;

        // Momentum
        this.velocityX = 0;
        this.velocityY = 0;
        this.lastMoveX = 0;
        this.lastMoveY = 0;
        this.lastMoveTime = 0;

        // Damping
        this.damping = 0.92;
        this.dragSpeed = 0.2;
        this.autoRotateSpeed = 0.02;
        this.autoRotate = true;

        // FOV zoom
        this.targetFOV = 75;
        this.minFOV = 40;
        this.maxFOV = 100;

        // Pinch-to-zoom
        this.pinchStartDistance = 0;
        this.pinchStartFOV = 75;
        this.activePointers = new Map();

        // Gyro
        this.gyroEnabled = false;
        this.gyroAlpha = 0;
        this.gyroBeta = 0;
        this.gyroGamma = 0;
        this.gyroOffsetAlpha = null; // Used to set initial forward direction
        this.screenOrientation = 0;

        // Mobile detection
        this.isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || ('ontouchstart' in window);

        this._bindEvents();

        // Auto-enable gyro on mobile
        if (this.isMobile) {
            this._tryEnableGyro();
        }
    }

    _bindEvents() {
        const el = this.domElement;

        // Pointer events (handles both mouse and touch)
        el.addEventListener('pointerdown', (e) => this._onPointerDown(e));
        el.addEventListener('pointermove', (e) => this._onPointerMove(e));
        el.addEventListener('pointerup', (e) => this._onPointerUp(e));
        el.addEventListener('pointercancel', (e) => this._onPointerUp(e));

        // Wheel zoom
        el.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });

        // Gyroscope
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => this._onDeviceOrientation(e));
        }

        // Track screen orientation for gyro correction
        if (window.screen && window.screen.orientation) {
            window.screen.orientation.addEventListener('change', () => {
                this.screenOrientation = window.screen.orientation.angle || 0;
            });
            this.screenOrientation = window.screen.orientation.angle || 0;
        } else {
            window.addEventListener('orientationchange', () => {
                this.screenOrientation = window.orientation || 0;
            });
            this.screenOrientation = window.orientation || 0;
        }
    }

    _onPointerDown(e) {
        this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (this.activePointers.size === 1) {
            // Single finger = drag
            this.isDragging = true;
            this.autoRotate = false;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.dragStartLon = this.targetLon;
            this.dragStartLat = this.targetLat;
            this.velocityX = 0;
            this.velocityY = 0;
            this.lastMoveTime = performance.now();
            this.domElement.style.cursor = 'grabbing';
        } else if (this.activePointers.size === 2) {
            // Two fingers = pinch-to-zoom
            this.isDragging = false;
            const pts = [...this.activePointers.values()];
            this.pinchStartDistance = this._pointerDistance(pts[0], pts[1]);
            this.pinchStartFOV = this.targetFOV;
        }
    }

    _onPointerMove(e) {
        this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (this.activePointers.size === 2) {
            // Pinch-to-zoom
            const pts = [...this.activePointers.values()];
            const dist = this._pointerDistance(pts[0], pts[1]);
            const scale = this.pinchStartDistance / dist;
            this.targetFOV = Math.max(this.minFOV, Math.min(this.maxFOV, this.pinchStartFOV * scale));
            return;
        }

        if (!this.isDragging) return;

        const now = performance.now();
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;

        this.targetLon = this.dragStartLon - dx * this.dragSpeed;
        this.targetLat = this.dragStartLat + dy * this.dragSpeed;
        this.targetLat = Math.max(-85, Math.min(85, this.targetLat));

        // Track velocity for momentum
        const dt = now - this.lastMoveTime;
        if (dt > 0) {
            this.velocityX = (e.clientX - this.lastMoveX) / dt * 8;
            this.velocityY = (e.clientY - this.lastMoveY) / dt * 8;
        }

        this.lastMoveX = e.clientX;
        this.lastMoveY = e.clientY;
        this.lastMoveTime = now;
    }

    _onPointerUp(e) {
        this.activePointers.delete(e.pointerId);
        if (this.activePointers.size === 0) {
            this.isDragging = false;
            this.domElement.style.cursor = 'grab';
        }
    }

    _pointerDistance(p1, p2) {
        return Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }

    _onWheel(e) {
        e.preventDefault();
        this.targetFOV += e.deltaY * 0.05;
        this.targetFOV = Math.max(this.minFOV, Math.min(this.maxFOV, this.targetFOV));
    }

    _onDeviceOrientation(e) {
        if (!this.gyroEnabled) return;

        const alpha = e.alpha || 0; // compass (0-360)
        const beta = e.beta || 0;   // front-back tilt (-180 to 180)
        const gamma = e.gamma || 0; // left-right tilt (-90 to 90)

        // Set the initial direction offset on first reading
        if (this.gyroOffsetAlpha === null) {
            this.gyroOffsetAlpha = alpha;
        }

        this.gyroAlpha = alpha;
        this.gyroBeta = beta;
        this.gyroGamma = gamma;
    }

    /**
     * Try to auto-enable gyroscope. On iOS 13+, this needs a user gesture.
     */
    _tryEnableGyro() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ — can't auto-enable, need a tap. We'll add a button later.
            this.needsGyroPermission = true;
        } else {
            // Android, older iOS — just enable
            this.gyroEnabled = true;
        }
    }

    /**
     * Enable gyroscope (call from a user gesture on iOS).
     */
    enableGyro() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission().then(response => {
                this.gyroEnabled = (response === 'granted');
                this.needsGyroPermission = !this.gyroEnabled;
            }).catch(() => {
                this.gyroEnabled = false;
            });
        } else {
            this.gyroEnabled = true;
        }
    }

    /**
     * Toggle gyro on/off.
     */
    toggleGyro() {
        if (this.gyroEnabled) {
            this.gyroEnabled = false;
            this.gyroOffsetAlpha = null;
        } else {
            this.enableGyro();
        }
        return this.gyroEnabled;
    }

    update() {
        if (!this.isDragging && !this.gyroEnabled) {
            // Apply momentum
            this.targetLon -= this.velocityX;
            this.targetLat += this.velocityY;
            this.targetLat = Math.max(-85, Math.min(85, this.targetLat));

            // Dampen velocity
            this.velocityX *= this.damping;
            this.velocityY *= this.damping;

            // Auto-rotate when idle
            if (this.autoRotate && Math.abs(this.velocityX) < 0.01) {
                this.targetLon += this.autoRotateSpeed;
            }
        }

        // Smooth interpolation
        this.lon += (this.targetLon - this.lon) * 0.1;
        this.lat += (this.targetLat - this.lat) * 0.1;

        // Convert to radians
        const phi = THREE.MathUtils.degToRad(90 - this.lat);
        const theta = THREE.MathUtils.degToRad(this.lon);

        // Gyro override — proper device orientation mapping
        if (this.gyroEnabled && this.gyroAlpha !== 0) {
            const orient = THREE.MathUtils.degToRad(this.screenOrientation);
            let alpha = THREE.MathUtils.degToRad(this.gyroAlpha - (this.gyroOffsetAlpha || 0));
            let beta = THREE.MathUtils.degToRad(this.gyroBeta);
            let gamma = THREE.MathUtils.degToRad(this.gyroGamma);

            // Apply screen orientation correction
            // Phone held in portrait: beta controls up/down, alpha controls left/right
            const cosOrient = Math.cos(orient);
            const sinOrient = Math.sin(orient);

            // Build quaternion from device orientation
            const euler = new THREE.Euler();
            const qDevice = new THREE.Quaternion();
            const qScreen = new THREE.Quaternion();

            // Device orientation to rotation
            euler.set(beta, alpha, -gamma, 'YXZ');
            qDevice.setFromEuler(euler);

            // Adjust for screen orientation
            qScreen.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -orient);
            qDevice.multiply(qScreen);

            // Apply to camera
            this.camera.quaternion.copy(qDevice);
        } else {
            this.camera.lookAt(
                500 * Math.sin(phi) * Math.cos(theta),
                500 * Math.cos(phi),
                500 * Math.sin(phi) * Math.sin(theta)
            );
        }

        // Smooth FOV
        this.camera.fov += (this.targetFOV - this.camera.fov) * 0.1;
        this.camera.updateProjectionMatrix();
    }

    dispose() {
        // Cleanup pointers
        this.activePointers.clear();
    }
}
