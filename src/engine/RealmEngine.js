/**
 * RealmEngine — the core 360° scene manager.
 * Renders a procedural panoramic sphere and manages CSS3D overlays.
 */
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { CameraController } from './CameraController.js';

export class RealmEngine {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.cssScene = new THREE.Scene();
        this.cssObjects = [];
        this.clock = new THREE.Clock();
        this.particles = [];
        this.animationCallbacks = [];
        this._animFrameId = null;
        this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        this.particlesEnabled = true;

        this._initCamera();
        this._initRenderers();
        this._initLighting();

        this.cameraController = new CameraController(this.camera, this.container);
        this.container.style.cursor = 'grab';

        this._onResize = this._onResize.bind(this);
        window.addEventListener('resize', this._onResize);
    }

    _initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        this.camera.position.set(0, 0, 0);
    }

    _initRenderers() {
        // WebGL renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);

        // CSS3D renderer (overlay)
        this.cssRenderer = new CSS3DRenderer();
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        this.cssRenderer.domElement.style.position = 'absolute';
        this.cssRenderer.domElement.style.top = '0';
        this.cssRenderer.domElement.style.left = '0';
        this.cssRenderer.domElement.style.pointerEvents = 'none';
        this.container.appendChild(this.cssRenderer.domElement);

        // Allow pointer events on individual CSS3D elements
        this.cssRenderer.domElement.style.zIndex = '1';
    }

    _initLighting() {
        const ambient = new THREE.AmbientLight(0x404060, 0.5);
        this.scene.add(ambient);

        this.mainLight = new THREE.PointLight(0x7c3aed, 1.5, 800);
        this.mainLight.position.set(0, 100, 0);
        this.scene.add(this.mainLight);
    }

    /**
     * Create a procedural 360° panoramic sphere with a gradient + stars.
     */
    createPanoramaSphere(colorConfig, isNight = false) {
        const { h, s, l } = colorConfig;

        // Optimize resolution for mobile
        const width = this.isMobile ? 1024 : 2048;
        const height = this.isMobile ? 512 : 1024;

        // Create canvas-based texture for the panorama
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (isNight) {
            gradient.addColorStop(0, `hsl(${h}, ${s}%, ${Math.max(l - 3, 2)}%)`);
            gradient.addColorStop(0.3, `hsl(${h + 10}, ${s - 10}%, ${l}%)`);
            gradient.addColorStop(0.5, `hsl(${h}, ${s}%, ${l + 3}%)`);
            gradient.addColorStop(0.7, `hsl(${h - 10}, ${s - 5}%, ${l + 5}%)`);
            gradient.addColorStop(1, `hsl(${h}, ${s - 20}%, ${l + 8}%)`);
        } else {
            gradient.addColorStop(0, `hsl(${h}, ${s - 20}%, ${l + 20}%)`);
            gradient.addColorStop(0.3, `hsl(${h + 10}, ${s}%, ${l + 15}%)`);
            gradient.addColorStop(0.5, `hsl(${h}, ${s}%, ${l + 10}%)`);
            gradient.addColorStop(0.7, `hsl(${h - 10}, ${s - 5}%, ${l + 5}%)`);
            gradient.addColorStop(1, `hsl(${h}, ${s - 10}%, ${l + 2}%)`);
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars (at night)
        if (isNight) {
            const starCount = this.isMobile ? 150 : 400;
            for (let i = 0; i < starCount; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height * 0.5;
                const size = Math.random() * 2 + 0.5;
                const brightness = Math.random() * 0.8 + 0.2;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                ctx.fill();
            }
        }

        // Subtle grid lines (room feel)
        ctx.strokeStyle = `rgba(255, 255, 255, 0.02)`;
        ctx.lineWidth = 1;
        const gridSize = this.isMobile ? 32 : 64;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Neon glow spots
        const numGlows = this.isMobile ? 3 : 6;
        for (let i = 0; i < numGlows; i++) {
            const gx = Math.random() * canvas.width;
            const gy = canvas.height * 0.4 + Math.random() * canvas.height * 0.3;
            const gr = 60 + Math.random() * 100;
            const gColor = isNight
                ? `hsla(${h + Math.random() * 60 - 30}, ${s}%, 50%, 0.08)`
                : `hsla(${h + Math.random() * 60 - 30}, ${s - 20}%, 40%, 0.05)`;
            const gGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
            gGrad.addColorStop(0, gColor);
            gGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = gGrad;
            ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;

        const geometry = new THREE.SphereGeometry(500, this.isMobile ? 32 : 64, this.isMobile ? 16 : 32);
        // NO SCALING - Use BackSide instead for better mobile compatibility
        // geometry.scale(-1, 1, 1); 

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        });
        this.panoramaMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.panoramaMesh);

        // Store for dynamic updates
        this.panoCanvas = canvas;
        this.panoCtx = ctx;
        this.panoTexture = texture;
    }

    /**
     * Add a CSS3D object at a position in spherical coordinates.
     */
    addCSS3DObject(element, lon, lat, distance = 400) {
        // Store spherical coords as data attributes for arrange mode
        element.dataset.lon = lon;
        element.dataset.lat = lat;
        element.dataset.distance = distance;

        const phi = THREE.MathUtils.degToRad(90 - lat);
        const theta = THREE.MathUtils.degToRad(lon);

        const x = distance * Math.sin(phi) * Math.cos(theta);
        const y = distance * Math.cos(phi);
        const z = distance * Math.sin(phi) * Math.sin(theta);

        const obj = new CSS3DObject(element);
        obj.position.set(x, y, z);

        // Face the center
        obj.lookAt(0, y * 0.5, 0);

        // Scale down for 3D space
        const scale = 0.5;
        obj.scale.set(scale, scale, scale);

        // Enable pointer events on the element itself
        element.style.pointerEvents = 'auto';

        this.cssScene.add(obj);
        this.cssObjects.push(obj);
        return obj;
    }

    /**
     * Reposition an existing CSS3D object to new spherical coordinates.
     */
    repositionCSS3DObject(cssObj, newLon, newLat) {
        const element = cssObj.element;
        const distance = parseFloat(element.dataset.distance) || 400;

        // Update stored coords
        element.dataset.lon = newLon;
        element.dataset.lat = newLat;

        const phi = THREE.MathUtils.degToRad(90 - newLat);
        const theta = THREE.MathUtils.degToRad(newLon);

        const x = distance * Math.sin(phi) * Math.cos(theta);
        const y = distance * Math.cos(phi);
        const z = distance * Math.sin(phi) * Math.sin(theta);

        cssObj.position.set(x, y, z);
        cssObj.lookAt(0, y * 0.5, 0);
    }

    /**
     * Add a particle system (rain, snow, code rain, etc.)
     */
    addParticleSystem(config) {
        const {
            count = 1000,
            color = 0x00f0ff,
            size = 2,
            area = { x: 800, y: 600, z: 800 },
            velocity = { x: 0, y: -2, z: 0 },
            opacity = 0.6,
            type = 'rain'
        } = config;

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * area.x;
            positions[i * 3 + 1] = Math.random() * area.y - area.y / 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * area.z;

            velocities[i * 3] = velocity.x + (Math.random() - 0.5) * 0.5;
            velocities[i * 3 + 1] = velocity.y + Math.random() * velocity.y * 0.5;
            velocities[i * 3 + 2] = velocity.z + (Math.random() - 0.5) * 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        let material;
        if (type === 'rain') {
            material = new THREE.PointsMaterial({
                color,
                size,
                transparent: true,
                opacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
        } else if (type === 'snow') {
            material = new THREE.PointsMaterial({
                color: 0xffffff,
                size: size * 2,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
        } else {
            material = new THREE.PointsMaterial({
                color,
                size,
                transparent: true,
                opacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
        }

        const points = new THREE.Points(geometry, material);
        this.scene.add(points);

        this.particles.push({ points, velocities, area, type });
        return points;
    }

    /**
     * Register a callback to be called each frame.
     */
    onAnimate(callback) {
        this.animationCallbacks.push(callback);
    }

    /**
     * Start the render loop.
     */
    start() {
        const animate = () => {
            this._animFrameId = requestAnimationFrame(animate);

            const delta = this.clock.getDelta();
            const elapsed = this.clock.getElapsedTime();

            // Update camera
            this.cameraController.update();
            this.camera.position.set(0, 0, 0); // Enforce stationary observer

            // Update particles
            this._updateParticles(delta);

            // Custom callbacks
            this.animationCallbacks.forEach(cb => cb(elapsed, delta));

            // Render
            this.renderer.render(this.scene, this.camera);
            this.cssRenderer.render(this.cssScene, this.camera);
        };
        animate();
    }



    toggleParticles() {
        this.particlesEnabled = !this.particlesEnabled;
        this.particles.forEach(p => {
            p.points.visible = this.particlesEnabled;
        });
        return this.particlesEnabled;
    }

    _updateParticles(delta) {
        if (!this.particlesEnabled) return;

        // Clamp delta to prevent vertex explosions on lag/tab switch
        const safeDelta = Math.min(delta, 0.1);

        this.particles.forEach(({ points, velocities, area, type }) => {
            const positions = points.geometry.attributes.position.array;
            const count = positions.length / 3;

            for (let i = 0; i < count; i++) {
                positions[i * 3] += velocities[i * 3] * safeDelta * 60;
                positions[i * 3 + 1] += velocities[i * 3 + 1] * safeDelta * 60;
                positions[i * 3 + 2] += velocities[i * 3 + 2] * safeDelta * 60;

                // Reset particle if it falls below
                if (positions[i * 3 + 1] < -area.y / 2) {
                    positions[i * 3 + 1] = area.y / 2;
                    positions[i * 3] = (Math.random() - 0.5) * area.x;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * area.z;
                }

                // Slow horizontal drift for snow
                if (type === 'snow') {
                    positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.05;
                }
            }

            points.geometry.attributes.position.needsUpdate = true;
        });
    }

    _onResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        this.cssRenderer.setSize(w, h);
    }

    /**
     * Set the overall scene tint (time of day / activity mood).
     */
    setSceneTint(color, intensity = 0.3) {
        if (!this.tintMesh) {
            const geo = new THREE.SphereGeometry(498, 32, 16);
            geo.scale(-1, 1, 1);
            const mat = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: intensity,
                blending: THREE.NormalBlending,
                depthWrite: false,
                side: THREE.FrontSide
            });
            this.tintMesh = new THREE.Mesh(geo, mat);
            this.scene.add(this.tintMesh);
        } else {
            this.tintMesh.material.color.set(color);
            this.tintMesh.material.opacity = intensity;
        }
    }

    dispose() {
        if (this._animFrameId) cancelAnimationFrame(this._animFrameId);
        window.removeEventListener('resize', this._onResize);

        // Clean up CSS3D objects
        this.cssObjects.forEach(obj => {
            if (obj.element && obj.element.parentNode) {
                obj.element.parentNode.removeChild(obj.element);
            }
            this.cssScene.remove(obj);
        });
        this.cssObjects = [];

        // Clean up particles
        this.particles.forEach(({ points }) => {
            this.scene.remove(points);
            points.geometry.dispose();
            points.material.dispose();
        });
        this.particles = [];

        // Clean up panorama
        if (this.panoramaMesh) {
            this.scene.remove(this.panoramaMesh);
            this.panoramaMesh.geometry.dispose();
            this.panoramaMesh.material.dispose();
            if (this.panoTexture) this.panoTexture.dispose();
        }

        // Clean up tint
        if (this.tintMesh) {
            this.scene.remove(this.tintMesh);
            this.tintMesh.geometry.dispose();
            this.tintMesh.material.dispose();
        }

        // Clean up renderers
        this.renderer.dispose();
        if (this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
        if (this.cssRenderer.domElement.parentNode) {
            this.cssRenderer.domElement.parentNode.removeChild(this.cssRenderer.domElement);
        }

        this.animationCallbacks = [];
        this.cameraController.dispose();
    }
}
