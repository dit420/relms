/**
 * VisitorPresence — simulates visitors as floating orbs in the realm.
 */

import { VISITORS } from '../data/realms.js';

export class VisitorPresence {
    constructor(engine) {
        this.engine = engine;
        this.visitors = [];
    }

    spawn() {
        const positions = [
            { lon: 80, lat: 0 },
            { lon: -90, lat: 10 },
            { lon: 200, lat: -5 }
        ];

        VISITORS.forEach((visitor, i) => {
            if (i >= positions.length) return;

            const el = document.createElement('div');
            el.className = 'css3d-visitor-orb';
            el.textContent = visitor.emoji;
            el.style.animationDelay = `${i * 1.5}s`;

            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = `${visitor.name} is here`;
            el.appendChild(tooltip);

            const pos = positions[i];
            this.engine.addCSS3DObject(el, pos.lon, pos.lat, 300);
            this.visitors.push(el);
        });
    }
}
