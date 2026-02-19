/**
 * CameraController — handles drag-to-pan, touch, gyroscope, and zoom.
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

        // Gyro
        this.gyroEnabled = false;
        this.gyroAlpha = 0;
        this.gyroBeta = 0;
        this.gyroGamma = 0;

        this._bindEvents();
    }

    _bindEvents() {
        const el = this.domElement;

        // Mouse
        el.addEventListener('pointerdown', (e) => this._onPointerDown(e));
        el.addEventListener('pointermove', (e) => this._onPointerMove(e));
        el.addEventListener('pointerup', (e) => this._onPointerUp(e));
        el.addEventListener('pointerleave', (e) => this._onPointerUp(e));

        // Wheel zoom
        el.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });

        // Touch zoom (pinch) handled via pointer events

        // Gyroscope
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => this._onDeviceOrientation(e));
        }
    }

    _onPointerDown(e) {
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
    }

    _onPointerMove(e) {
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

    _onPointerUp() {
        this.isDragging = false;
        this.domElement.style.cursor = 'grab';
    }

    _onWheel(e) {
        e.preventDefault();
        this.targetFOV += e.deltaY * 0.05;
        this.targetFOV = Math.max(this.minFOV, Math.min(this.maxFOV, this.targetFOV));
    }

    _onDeviceOrientation(e) {
        if (!this.gyroEnabled) return;
        this.gyroAlpha = e.alpha || 0;
        this.gyroBeta = e.beta || 0;
        this.gyroGamma = e.gamma || 0;
    }

    enableGyro() {
        this.gyroEnabled = true;
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission().then(response => {
                if (response !== 'granted') this.gyroEnabled = false;
            });
        }
    }

    update() {
        if (!this.isDragging) {
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

        // Gyro override
        if (this.gyroEnabled) {
            const gyroPhi = THREE.MathUtils.degToRad(90 - this.gyroBeta);
            const gyroTheta = THREE.MathUtils.degToRad(this.gyroAlpha + this.gyroGamma);
            this.camera.lookAt(
                500 * Math.sin(gyroPhi) * Math.cos(gyroTheta),
                500 * Math.cos(gyroPhi),
                500 * Math.sin(gyroPhi) * Math.sin(gyroTheta)
            );
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
        // Cleanup if needed
    }
}
