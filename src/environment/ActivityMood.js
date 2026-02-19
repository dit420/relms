/**
 * ActivityMood — changes the realm's visual energy based on user activity.
 */

export class ActivityMood {
    constructor(engine) {
        this.engine = engine;
        this.currentActivity = null;
        this.matrixChars = [];
    }

    apply(activity) {
        this.currentActivity = activity;

        switch (activity) {
            case 'coding':
                this._applyCodingMood();
                break;
            case 'listening':
                this._applyListeningMood();
                break;
            case 'workout':
                this._applyWorkoutMood();
                break;
            case 'sleeping':
                this._applySleepingMood();
                break;
            default:
                break;
        }
    }

    _applyCodingMood() {
        // Matrix-style code rain
        this.engine.addParticleSystem({
            count: this.engine.isMobile ? 150 : 500,
            color: 0x39ff14,
            size: 2.5,
            area: { x: 400, y: 400, z: 400 },
            velocity: { x: 0, y: -1.5, z: 0 },
            opacity: 0.3,
            type: 'code'
        });

        // Subtle green tint
        this.engine.setSceneTint(0x003300, 0.08);

        // Pulsing light
        this.engine.onAnimate((elapsed) => {
            const pulse = Math.sin(elapsed * 2) * 0.3 + 1.2;
            this.engine.mainLight.color.setHSL(0.33, 0.8, 0.5);
            this.engine.mainLight.intensity = pulse;
        });
    }

    _applyListeningMood() {
        // Room edges pulse with color
        this.engine.onAnimate((elapsed) => {
            const hue = (elapsed * 0.05) % 1;
            const pulse = Math.sin(elapsed * 4) * 0.15 + 0.85;
            this.engine.mainLight.color.setHSL(hue, 0.7, 0.5);
            this.engine.mainLight.intensity = pulse * 2;
        });

        // Ambient particles that pulse
        this.engine.addParticleSystem({
            count: this.engine.isMobile ? 100 : 200,
            color: 0xff2d95,
            size: 4,
            area: { x: 500, y: 300, z: 500 },
            velocity: { x: 0, y: 0.2, z: 0 },
            opacity: 0.2,
            type: 'ambient'
        });
    }

    _applyWorkoutMood() {
        // Bright, energetic bursts
        this.engine.addParticleSystem({
            count: this.engine.isMobile ? 200 : 400,
            color: 0xff6b2b,
            size: 3,
            area: { x: 400, y: 400, z: 400 },
            velocity: { x: 0, y: 1, z: 0 },
            opacity: 0.4,
            type: 'burst'
        });

        this.engine.setSceneTint(0xff4400, 0.06);

        this.engine.onAnimate((elapsed) => {
            const pulse = Math.sin(elapsed * 6) * 0.5 + 1.5;
            this.engine.mainLight.intensity = pulse;
            this.engine.mainLight.color.setHSL(0.06, 0.9, 0.5);
        });
    }

    _applySleepingMood() {
        // Dim, slow ambient
        this.engine.setSceneTint(0x0a0a2e, 0.3);

        // Floating dust motes
        this.engine.addParticleSystem({
            count: this.engine.isMobile ? 50 : 100,
            color: 0x8888ff,
            size: 2,
            area: { x: 400, y: 200, z: 400 },
            velocity: { x: 0, y: 0.1, z: 0 },
            opacity: 0.15,
            type: 'ambient'
        });

        this.engine.mainLight.intensity = 0.5;
    }
}
