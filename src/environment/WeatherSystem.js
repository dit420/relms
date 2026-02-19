/**
 * WeatherSystem — fetches real weather and applies visual effects.
 */

export class WeatherSystem {
    constructor(engine) {
        this.engine = engine;
        this.currentWeather = null;
        this.particleSystem = null;
    }

    /**
     * Fetch weather for a city and apply effects.
     * Falls back to simulated weather if API unavailable.
     */
    async init(city) {
        try {
            const weather = await this._fetchWeather(city);
            this.currentWeather = weather;
            this._applyWeather(weather);
            return weather;
        } catch (e) {
            // Fallback: simulate based on time
            const hour = new Date().getHours();
            const isNight = hour < 6 || hour > 19;
            const simulated = {
                condition: isNight ? 'night_clear' : 'clear',
                temp: isNight ? 18 : 28,
                icon: isNight ? '🌙' : '☀️',
                label: isNight ? 'Clear Night' : 'Clear'
            };
            this.currentWeather = simulated;
            this._applyWeather(simulated);
            return simulated;
        }
    }

    async _fetchWeather(city) {
        // Using wttr.in — no API key needed
        const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();

        const current = data.current_condition[0];
        const temp = parseInt(current.temp_C);
        const code = parseInt(current.weatherCode);
        const hour = new Date().getHours();
        const isNight = hour < 6 || hour > 19;

        let condition = 'clear';
        let icon = '☀️';
        let label = 'Clear';

        if (code >= 200 && code < 300) {
            condition = 'thunderstorm'; icon = '⛈️'; label = 'Stormy';
        } else if (code >= 300 && code < 600 || [266, 293, 296, 299, 302, 305, 308].includes(code)) {
            condition = 'rain'; icon = '🌧️'; label = 'Rainy';
        } else if (code >= 600 && code < 700 || [323, 326, 329, 332, 335, 338].includes(code)) {
            condition = 'snow'; icon = '❄️'; label = 'Snowy';
        } else if ([119, 122].includes(code)) {
            condition = 'clouds'; icon = '☁️'; label = 'Cloudy';
        } else if (isNight) {
            condition = 'night_clear'; icon = '🌙'; label = 'Clear Night';
        }

        return { condition, temp, icon, label };
    }

    _applyWeather(weather) {
        const { condition } = weather;

        switch (condition) {
            case 'rain':
                this.particleSystem = this.engine.addParticleSystem({
                    count: this.engine.isMobile ? 500 : 2000,
                    color: 0x4488cc,
                    size: 1.5,
                    area: { x: 600, y: 500, z: 600 },
                    velocity: { x: 0.3, y: -4, z: 0 },
                    opacity: 0.4,
                    type: 'rain'
                });
                this.engine.setSceneTint(0x223344, 0.15);
                break;

            case 'snow':
                this.particleSystem = this.engine.addParticleSystem({
                    count: this.engine.isMobile ? 300 : 800,
                    color: 0xffffff,
                    size: 3,
                    area: { x: 600, y: 500, z: 600 },
                    velocity: { x: 0, y: -0.8, z: 0 },
                    opacity: 0.7,
                    type: 'snow'
                });
                this.engine.setSceneTint(0xccddff, 0.1);
                break;

            case 'thunderstorm':
                this.particleSystem = this.engine.addParticleSystem({
                    count: this.engine.isMobile ? 800 : 3000,
                    color: 0x4466aa,
                    size: 1.5,
                    area: { x: 600, y: 500, z: 600 },
                    velocity: { x: 1, y: -6, z: 0.5 },
                    opacity: 0.5,
                    type: 'rain'
                });
                this.engine.setSceneTint(0x111133, 0.25);
                // Lightning flashes
                this.engine.onAnimate((elapsed) => {
                    if (Math.random() < 0.002) {
                        this.engine.mainLight.intensity = 10;
                        setTimeout(() => { this.engine.mainLight.intensity = 1.5; }, 100);
                    }
                });
                break;

            case 'night_clear':
                this.engine.setSceneTint(0x0a0a2e, 0.2);
                // Add subtle starfield particles
                this.engine.addParticleSystem({
                    count: this.engine.isMobile ? 100 : 300,
                    color: 0xffffff,
                    size: 1.5,
                    area: { x: 800, y: 400, z: 800 },
                    velocity: { x: 0, y: 0, z: 0 },
                    opacity: 0.5,
                    type: 'stars'
                });
                break;

            case 'clouds':
                this.engine.setSceneTint(0x334455, 0.12);
                break;

            case 'clear':
            default:
                this.engine.setSceneTint(0xffeedd, 0.05);
                break;
        }
    }

    getDisplayInfo() {
        if (!this.currentWeather) return { icon: '🌍', temp: '--', label: 'Loading...' };
        return {
            icon: this.currentWeather.icon,
            temp: `${this.currentWeather.temp}°C`,
            label: this.currentWeather.label
        };
    }
}
